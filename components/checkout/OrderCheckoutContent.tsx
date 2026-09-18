"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Loader2, MapPin, Package, Smartphone, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { image } from "@/sanity/image";
import { formatPrice } from "@/lib/storeConfig";
import { cn } from "@/lib/utils";

interface OrderProduct {
  product: {
    _id: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images?: any[];
    price: number;
  };
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  products: OrderProduct[];
  subtotal: number;
  amountDiscount?: number;
  couponCode?: string;
  tax: number;
  shipping: number;
  totalPrice: number;
  address: { name: string; address: string; city: string; state: string; zip: string };
  status: string;
  paymentStatus: string;
}

const METHODS: Record<string, { label: string; hint: string; icon: LucideIcon }> = {
  sslcommerz: { label: "bKash, Nagad, Rocket & cards", hint: "via SSLCommerz", icon: Smartphone },
  stripe: { label: "Credit / debit card", hint: "via Stripe", icon: CreditCard },
};

// Pay later for an order that was saved but not paid yet
export function OrderCheckoutContent({
  order,
  onlineMethods,
}: {
  order: Order;
  onlineMethods: string[];
}) {
  const methods = onlineMethods.filter((m) => METHODS[m]);
  const [method, setMethod] = useState(methods[0] || "");
  const [busy, setBusy] = useState(false);
  const paid = order.paymentStatus === "paid";

  const pay = async () => {
    if (!method) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/checkout/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start payment");
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start payment");
      setBusy(false);
    }
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
      <section className="rounded-3xl border border-border bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
            <Package className="h-5 w-5 text-clay" /> Order {order.orderNumber}
          </h2>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold capitalize text-ink">
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
        <ul className="divide-y divide-border">
          {order.products?.map((item, i) => (
            <li key={i} className="flex items-center gap-4 py-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                {item.product?.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image(item.product.images[0]).size(160, 160).url()}
                    alt=""
                    className="h-full w-full object-contain p-1.5 mix-blend-multiply"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium text-ink">{item.product?.name}</p>
                <p className="text-sm text-light-color">Qty {item.quantity}</p>
              </div>
              <p className="font-semibold tabular-nums">
                {formatPrice((item.product?.price || 0) * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        {order.address && (
          <p className="mt-5 flex gap-2 rounded-2xl bg-cream p-4 text-sm text-light-color">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
            {[order.address.name, order.address.address, order.address.city, order.address.state, order.address.zip]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </section>

      <aside className="rounded-3xl border border-border bg-white p-6">
        <h2 className="mb-4 font-display text-2xl text-ink">Payment</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {!!order.amountDiscount && (
            <div className="flex justify-between text-sage">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>-{formatPrice(order.amountDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-light-color"><span>Shipping</span><span>{order.shipping ? formatPrice(order.shipping) : "Free"}</span></div>
          {!!order.tax && <div className="flex justify-between text-light-color"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>}
          <div className="flex items-end justify-between border-t border-dashed border-border pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-3xl">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        {paid ? (
          <p className="mt-6 rounded-2xl bg-sage/10 p-4 text-sm font-semibold text-sage">This order is already paid.</p>
        ) : methods.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-sand p-4 text-sm text-light-color">
            Online payment isn&apos;t available right now. You can pay cash on delivery.
          </p>
        ) : (
          <>
            <div className="mt-6 space-y-2">
              {methods.map((m) => {
                const info = METHODS[m];
                return (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left",
                      method === m ? "border-clay bg-clay/5" : "border-border"
                    )}
                  >
                    <info.icon className="h-5 w-5 text-clay" />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{info.label}</span>
                      <span className="block text-xs text-light-color">{info.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={pay}
              disabled={busy || !method}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-clay text-sm font-semibold text-white hover:bg-clay-dark disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Pay {formatPrice(order.totalPrice)}
            </button>
          </>
        )}
        <Link href={`/user/orders/${order._id}`} className="mt-4 block text-center text-sm text-light-color hover:text-ink">
          View order details
        </Link>
      </aside>
    </div>
  );
}
