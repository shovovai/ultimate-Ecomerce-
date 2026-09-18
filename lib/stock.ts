import "server-only";
import { backendClient } from "@/sanity/lib/backendClient";

// Stock is reserved when an order is created (any payment method) and put back
// when the order is cancelled. Flags on the order make both steps idempotent.

export async function reserveStock(
  orderId: string,
  lines: { productId: string; quantity: number }[]
) {
  const tx = backendClient.transaction();
  for (const line of lines) {
    tx.patch(line.productId, (p) => p.setIfMissing({ stock: 0 }).dec({ stock: line.quantity }));
  }
  tx.patch(orderId, (p) => p.set({ stockReserved: true }));
  await tx.commit();
}

export async function restoreOrderStock(orderId: string) {
  try {
    const order = await backendClient.fetch<{
      stockReserved?: boolean;
      stockRestored?: boolean;
      products?: { quantity?: number; productId?: string }[];
    } | null>(
      `*[_type == "order" && _id == $orderId][0]{
        stockReserved, stockRestored,
        products[]{ quantity, "productId": product._ref }
      }`,
      { orderId }
    );
    if (!order?.stockReserved || order.stockRestored) return;

    const tx = backendClient.transaction();
    for (const item of order.products || []) {
      if (item.productId && item.quantity) {
        tx.patch(item.productId, (p) => p.inc({ stock: item.quantity! }));
      }
    }
    tx.patch(orderId, (p) => p.set({ stockRestored: true }));
    await tx.commit();
  } catch (error) {
    console.error(`Failed to restore stock for order ${orderId}:`, error);
  }
}
