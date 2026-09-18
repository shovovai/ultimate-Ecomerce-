import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  CheckoutError,
  createStripeSessionForOrder,
  loadPayableOrder,
} from "@/lib/stripeCheckout";

// POST /api/checkout/stripe  { orderId }
// Starts a Stripe Checkout session for an existing order owned by the caller.
export const POST = async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await loadPayableOrder(orderId, userId);
    const url = await createStripeSessionForOrder(order);
    return NextResponse.json({ success: true, url, checkoutUrl: url });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start card payment" },
      { status: 500 }
    );
  }
};
