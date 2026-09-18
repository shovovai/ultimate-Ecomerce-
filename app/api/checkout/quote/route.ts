import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PricingError, normalizeCartInput, priceCart } from "@/lib/pricing";
import { availablePaymentMethods } from "@/lib/paymentMethods";

export const dynamic = "force-dynamic";

// POST /api/checkout/quote  { items: [{ productId, quantity }], couponCode? }
// Returns authoritative totals (same maths used when the order is created).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = normalizeCartInput(body.items);
    if (items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    const pricing = await priceCart(items, {
      couponCode: body.couponCode,
      clerkUserId: userId,
      email: user?.primaryEmailAddress?.emailAddress,
    });

    return NextResponse.json({
      success: true,
      pricing: {
        lines: pricing.lines.map(({ productId, name, unitPrice, quantity, lineTotal }) => ({
          productId,
          name,
          unitPrice,
          quantity,
          lineTotal,
        })),
        subtotal: pricing.subtotal,
        businessDiscount: pricing.businessDiscount,
        coupon: pricing.coupon
          ? { code: pricing.coupon.code, amount: pricing.coupon.amount }
          : null,
        couponError: pricing.couponError,
        discountTotal: pricing.discountTotal,
        shipping: pricing.shipping,
        tax: pricing.tax,
        total: pricing.total,
        currency: pricing.currency,
      },
      paymentMethods: availablePaymentMethods(),
    });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Quote failed:", error);
    return NextResponse.json({ error: "Could not calculate totals" }, { status: 500 });
  }
}
