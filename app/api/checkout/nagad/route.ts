import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CheckoutError, loadPayableOrder } from "@/lib/stripeCheckout";
import { createNagadPayment } from "@/lib/nagad";

const clientIp = (req: NextRequest) =>
  (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";

// POST /api/checkout/nagad  { orderId }  → { url } of the Nagad payment page
export async function POST(request: NextRequest) {
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
    const url = await createNagadPayment(order, clientIp(request));
    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Nagad checkout error:", error);
    return NextResponse.json({ error: "Failed to start Nagad payment" }, { status: 500 });
  }
}
