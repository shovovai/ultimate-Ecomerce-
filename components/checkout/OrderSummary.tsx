"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Loader2, ShieldCheck, TicketPercent, Truck, X } from "lucide-react";
import { formatPrice, storeConfig } from "@/lib/storeConfig";
import type { QuotePricing } from "@/hooks/useCheckoutQuote";
import { cn } from "@/lib/utils";

interface Props {
  pricing: QuotePricing | null;
  loading: boolean;
  error: string | null;
  couponCode: string;
  onCouponChange: (code: string) => void;
  children?: ReactNode;
  className?: string;
}

const Row = ({ label, value, muted, accent }: { label: ReactNode; value: string; muted?: boolean; accent?: boolean }) => (
  <div className={cn("flex items-center justify-between text-sm", muted && "text-light-color", accent && "text-sage")}>
    <span>{label}</span>
    <span className="tabular-nums font-medium">{value}</span>
  </div>
);

export default function OrderSummary({
  pricing,
  loading,
  error,
  couponCode,
  onCouponChange,
  children,
  className,
}: Props) {
  const [input, setInput] = useState(couponCode);
  useEffect(() => setInput(couponCode), [couponCode]);

  const apply = (e: FormEvent) => {
    e.preventDefault();
    onCouponChange(input);
  };

  const freeShipLeft =
    pricing && storeConfig.freeShippingThreshold > 0 && pricing.shipping > 0
      ? storeConfig.freeShippingThreshold - (pricing.subtotal - pricing.businessDiscount)
      : 0;

  return (
    <aside className={cn("rounded-3xl border border-border bg-white p-6 shadow-sm", className)}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Order summary</h2>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-light-color" />}
      </div>

      {/* Coupon */}
      {pricing?.coupon ? (
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-sage/10 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 font-semibold text-sage">
            <TicketPercent className="h-4 w-4" /> {pricing.coupon.code} applied
          </span>
          <button
            type="button"
            onClick={() => onCouponChange("")}
            className="rounded-full p-1 text-light-color hover:bg-white hover:text-ink"
            aria-label="Remove coupon"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={apply} className="mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <TicketPercent className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-light-text" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="h-11 w-full rounded-full border border-border bg-cream pl-10 pr-3 text-sm uppercase tracking-wide outline-none placeholder:normal-case placeholder:tracking-normal focus:border-clay"
                aria-label="Coupon code"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-11 rounded-full border border-ink px-5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-40"
            >
              Apply
            </button>
          </div>
          {couponCode && pricing?.couponError && (
            <p className="mt-2 text-xs text-dark-red">{pricing.couponError}</p>
          )}
        </form>
      )}

      {error ? (
        <p className="rounded-2xl bg-dark-red/10 p-4 text-sm text-dark-red">{error}</p>
      ) : !pricing ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-sand" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <Row label="Subtotal" value={formatPrice(pricing.subtotal)} />
          {pricing.businessDiscount > 0 && (
            <Row label="Business discount" value={`-${formatPrice(pricing.businessDiscount)}`} accent />
          )}
          {pricing.coupon && (
            <Row label={`Coupon (${pricing.coupon.code})`} value={`-${formatPrice(pricing.coupon.amount)}`} accent />
          )}
          <Row
            label="Shipping"
            value={pricing.shipping === 0 ? "Free" : formatPrice(pricing.shipping)}
            muted
          />
          {pricing.tax > 0 && <Row label="Tax" value={formatPrice(pricing.tax)} muted />}
          <div className="border-t border-dashed border-border pt-4">
            <div className="flex items-end justify-between">
              <span className="font-semibold text-ink">Total</span>
              <span className="font-display text-3xl tabular-nums text-ink">
                {formatPrice(pricing.total)}
              </span>
            </div>
          </div>

          {freeShipLeft > 0 && (
            <p className="flex items-center gap-2 rounded-2xl bg-marigold/15 px-4 py-3 text-xs text-ink">
              <Truck className="h-4 w-4 shrink-0 text-clay" />
              Add {formatPrice(freeShipLeft)} more for free delivery
            </p>
          )}
        </div>
      )}

      {children && <div className="mt-6">{children}</div>}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-light-color">
        <ShieldCheck className="h-3.5 w-3.5" /> Prices are confirmed securely when you order
      </p>
    </aside>
  );
}
