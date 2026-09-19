import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";
import { getMyOrders } from "@/sanity/helpers";
import { backendClient } from "@/sanity/lib/backendClient";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "@/lib/orderStatus";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import {
  PricingError,
  normalizeCartInput,
  priceCart,
} from "@/lib/pricing";
import { reserveStock } from "@/lib/stock";
import { sendAdminNewOrderEmail, sendCustomerOrderEmail } from "@/lib/orderEmails";
import { resolvePaymentOption } from "@/lib/paymentMethods";
import { getPaymentConfig } from "@/lib/paymentConfig";
import { validateManualSubmission } from "@/lib/manualPayment";
import { notifyAdminsOfManualPayment } from "@/lib/orderPayment";
import { rateLimit } from "@/lib/rateLimit";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getMyOrders(userId);

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const str = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

// POST /api/orders
// Body: { items: [{ productId, quantity }], shippingAddress, paymentOptionId, couponCode?,
//         manualPayment?: { senderNumber, transactionId } }
// All amounts are calculated on the server — client-sent totals are ignored.
export const POST = async (request: NextRequest) => {
  const limited = rateLimit(request, "orders", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const items = normalizeCartInput(body.items);
    // "paymentOptionId" e.g. "bkash" or "manual:ab12"; older clients send "paymentMethod"
    const optionId: string = body.paymentOptionId || body.paymentMethod || "";
    const addr = body.shippingAddress || {};

    if (items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const shippingAddress = {
      name: str(addr.name, 100),
      address: str(addr.address, 300),
      city: str(addr.city, 100),
      state: str(addr.state, 100),
      zip: str(addr.zip, 20),
      phone: str(addr.phone, 30),
    };
    if (!shippingAddress.address || !shippingAddress.city) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    const option = await resolvePaymentOption(optionId);
    if (!option) {
      return NextResponse.json(
        { error: "This payment method is not available" },
        { status: 400 }
      );
    }
    const paymentMethod = option.method;

    const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "";
    const userName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || shippingAddress.name || "Customer";

    const pricing = await priceCart(items, {
      couponCode: body.couponCode,
      clerkUserId: userId,
      email: userEmail,
      strictCoupon: Boolean(body.couponCode),
      paymentMethod,
    });

    // COD may be limited to orders under a maximum amount
    if (paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY) {
      const { cod } = await getPaymentConfig();
      if (cod.maxOrderAmount && pricing.total - pricing.paymentFee > cod.maxOrderAmount) {
        return NextResponse.json(
          { error: "Cash on delivery isn't available for this order amount. Please choose another payment method." },
          { status: 400 }
        );
      }
    }

    // Manual (send money) payments: customer provides sender number + TrxID
    let manualPayment: Record<string, unknown> | undefined;
    if (paymentMethod === PAYMENT_METHODS.MANUAL) {
      const check = await validateManualSubmission(option.provider || "other", body.manualPayment || {});
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      manualPayment = {
        accountId: option.id.replace("manual:", ""),
        provider: option.provider,
        accountLabel: option.label,
        accountNumber: option.accountNumber,
        senderNumber: check.senderNumber,
        transactionId: check.transactionId,
        submittedAt: new Date().toISOString(),
      };
    }

    const orderNumber = `WH-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomBytes(2)
      .toString("hex")
      .toUpperCase()}`;

    const createdOrder = await backendClient.create({
      _type: "order",
      orderNumber,
      customerName: userName,
      email: userEmail,
      phone: user.phoneNumbers?.[0]?.phoneNumber || shippingAddress.phone,
      clerkUserId: userId,
      products: pricing.lines.map((line) => ({
        _key: crypto.randomUUID(),
        product: { _type: "reference", _ref: line.productId },
        quantity: line.quantity,
      })),
      subtotal: pricing.subtotal,
      amountDiscount: pricing.discountTotal,
      businessDiscount: pricing.businessDiscount,
      couponCode: pricing.coupon?.code,
      couponDiscount: pricing.coupon?.amount || 0,
      shipping: pricing.shipping,
      tax: pricing.tax,
      paymentFee: pricing.paymentFee,
      totalPrice: pricing.total,
      currency: pricing.currency,
      address: {
        _type: "object",
        name: shippingAddress.name || userName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
      },
      status: ORDER_STATUSES.PENDING,
      orderDate: new Date().toISOString(),
      paymentMethod,
      paymentStatus: manualPayment
        ? PAYMENT_STATUSES.AWAITING_VERIFICATION
        : PAYMENT_STATUSES.PENDING,
      ...(manualPayment && { manualPayment }),
      ...(paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && {
        stripePaymentIntentId: `cod_${orderNumber}`,
      }),
    });

    // Side effects: stock, coupon usage, notifications, emails
    await reserveStock(createdOrder._id, pricing.lines).catch((e) =>
      console.error("Stock reservation failed:", e)
    );
    if (pricing.coupon) {
      await backendClient
        .patch(pricing.coupon._id)
        .setIfMissing({ usedCount: 0 })
        .inc({ usedCount: 1 })
        .commit()
        .catch((e) => console.error("Coupon usage update failed:", e));
    }

    const emailInput = {
      orderId: createdOrder._id,
      orderNumber,
      customerName: userName,
      customerEmail: userEmail,
      paymentMethod,
      pricing,
      address: shippingAddress,
    };
    await Promise.all([
      sendCustomerOrderEmail(emailInput),
      sendAdminNewOrderEmail(emailInput),
      manualPayment
        ? notifyAdminsOfManualPayment({
            orderNumber,
            totalPrice: pricing.total,
            provider: String(manualPayment.provider || ""),
            senderNumber: String(manualPayment.senderNumber),
            transactionId: String(manualPayment.transactionId),
          })
        : Promise.resolve(),
      sendOrderStatusNotification({
        clerkUserId: userId,
        orderNumber,
        orderId: createdOrder._id,
        status: ORDER_STATUSES.PENDING,
      }).catch((e) => console.error("Order notification failed:", e)),
    ]);

    return NextResponse.json({
      success: true,
      order: {
        _id: createdOrder._id,
        orderNumber,
        status: createdOrder.status,
        paymentMethod,
        totalPrice: pricing.total,
        currency: pricing.currency,
      },
      message: "Order created successfully",
    });
  } catch (error: unknown) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
};
