"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useCartStore from "@/store";
import { image } from "@/sanity/image";
import { formatPrice } from "@/lib/storeConfig";
import QuantityButtons from "@/components/QuantityButtons";
import EmptyCart from "@/components/EmptyCart";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useCheckoutQuote, useCouponCode } from "@/hooks/useCheckoutQuote";

export default function CartView() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useCouponCode();
  const { items, pricing, error, loading } = useCheckoutQuote(couponCode);
  const { deleteCartProduct, resetCart, addToFavorite, favoriteProduct } = useCartStore();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-sand" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-sand" />
      </div>
    );
  }

  if (items.length === 0) return <EmptyCart />;

  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="grid items-start gap-8 pb-20 lg:grid-cols-[1fr_380px] lg:pb-0">
      <section>
        <div className="mb-4 flex items-center justify-between text-sm">
          <p className="text-light-color">
            {itemCount} item{itemCount === 1 ? "" : "s"} in your basket
          </p>
          <button
            onClick={() => {
              if (window.confirm("Remove all items from your cart?")) {
                resetCart();
                toast.success("Cart cleared");
              }
            }}
            className="font-medium text-light-color underline-offset-4 hover:text-dark-red hover:underline"
          >
            Clear cart
          </button>
        </div>

        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-white">
          {items.map(({ product, quantity }) => {
            const saved = favoriteProduct.some((f) => f._id === product._id);
            const href = `/product/${product.slug?.current}`;
            return (
              <li key={product._id} className="flex gap-4 p-4 sm:gap-6 sm:p-5">
                <Link
                  href={href}
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sand sm:h-28 sm:w-28"
                >
                  {product.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image(product.images[0]).size(300, 300).url()}
                      alt={product.name || "Product"}
                      className="h-full w-full object-contain p-2 mix-blend-multiply"
                    />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={href}
                        className="line-clamp-2 font-semibold leading-snug text-ink hover:text-clay"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-light-color">
                        {formatPrice(product.price)} each
                        {typeof product.stock === "number" && product.stock <= 5 && (
                          <span className="ml-2 font-medium text-clay">
                            · only {product.stock} left
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-xl tabular-nums text-ink">
                      {formatPrice((product.price || 0) * quantity)}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <QuantityButtons
                      product={product}
                      className="rounded-full border border-border bg-cream px-1"
                    />
                    <div className="flex items-center gap-1 text-sm">
                      <button
                        onClick={() => addToFavorite(product)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-light-color hover:bg-sand hover:text-ink"
                      >
                        <Heart className={saved ? "h-4 w-4 fill-clay text-clay" : "h-4 w-4"} />
                        <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
                      </button>
                      <button
                        onClick={() => {
                          deleteCartProduct(product._id);
                          toast.success(`${product.name} removed`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-light-color hover:bg-dark-red/10 hover:text-dark-red"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <Link
          href="/shop"
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ink/70 hover:text-clay"
        >
          ← Continue shopping
        </Link>
      </section>

      <OrderSummary
        pricing={pricing}
        loading={loading}
        error={error}
        couponCode={couponCode}
        onCouponChange={setCouponCode}
        className="lg:sticky lg:top-40"
      >
        <button
          onClick={() => router.push("/checkout")}
          disabled={!pricing || !!error}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-cream transition-colors hover:bg-clay disabled:opacity-50"
        >
          Checkout securely <ArrowRight className="h-4 w-4" />
        </button>
      </OrderSummary>

      {/* Phones: sticky total + action above the bottom nav */}
      <div className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-white/95 p-2 pl-4 shadow-[0_10px_30px_-10px_rgba(31,26,23,0.35)] ring-1 ring-ink/10 backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-light-color">Total</p>
            <p className="font-display text-lg leading-tight text-ink">{pricing ? formatPrice(pricing.total) : "…"}</p>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            disabled={!pricing || !!error}
            className="flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-cream disabled:opacity-50"
          >
            Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
