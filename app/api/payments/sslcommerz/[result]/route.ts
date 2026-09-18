import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { confirmSslCommerzPayment } from "@/lib/sslcommerz";

export const dynamic = "force-dynamic";

// SSLCommerz posts form data to these URLs:
//   success / fail / cancel — the customer's browser is redirected here
//   ipn                     — server-to-server Instant Payment Notification
// Payment is only trusted after re-validating val_id with SSLCommerz.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ result: string }> }
) {
  const { result } = await params;
  const form = await request.formData().catch(() => null);
  const valId = String(form?.get("val_id") || "");
  const orderId = String(form?.get("value_a") || "");

  let paid = false;
  let resolvedOrderId = orderId;
  if (valId && (result === "success" || result === "ipn")) {
    try {
      const r = await confirmSslCommerzPayment(valId);
      paid = r.paid;
      resolvedOrderId = r.orderId || orderId;
    } catch (error) {
      console.error("SSLCommerz confirmation failed:", error);
    }
  }

  if (result === "ipn") {
    return NextResponse.json({ received: true, paid });
  }

  const target = paid
    ? `${brand.url}/success?order_id=${resolvedOrderId}&payment_method=sslcommerz`
    : resolvedOrderId
      ? `${brand.url}/user/orders/${resolvedOrderId}?payment=${result === "cancel" ? "cancelled" : "failed"}`
      : `${brand.url}/user/orders`;

  return NextResponse.redirect(target, 303);
}
