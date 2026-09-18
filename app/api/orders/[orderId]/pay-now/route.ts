import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  CheckoutError,
  createStripeSessionForOrder,
  loadPayableOrder,
} from "@/lib/stripeCheckout";

// Pay an existing (unpaid) order by card. Charges the stored order total.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const order = await loadPayableOrder(orderId, userId);
    const url = await createStripeSessionForOrder(order);
    return NextResponse.json({ success: true, url, checkoutUrl: url });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Payment session creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment session" },
      { status: 500 }
    );
  }
}
