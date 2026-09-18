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
import { availablePaymentMethods } from "@/lib/paymentMethods";

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
// Body: { items: [{ productId, quantity }], shippingAddress, paymentMethod, couponCode? }
// All amounts are calculated on the server — client-sent totals are ignored.
export const POST = async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const items = normalizeCartInput(body.items);
    const paymentMethod = body.paymentMethod;
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

    if (!availablePaymentMethods().includes(paymentMethod)) {
      return NextResponse.json(
        { error: "This payment method is not available" },
        { status: 400 }
      );
    }

    const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "";
    const userName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || shippingAddress.name || "Customer";

    const pricing = await priceCart(items, {
      couponCode: body.couponCode,
      clerkUserId: userId,
      email: userEmail,
      strictCoupon: Boolean(body.couponCode),
    });

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
      paymentStatus: PAYMENT_STATUSES.PENDING,
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
