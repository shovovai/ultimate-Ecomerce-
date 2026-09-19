"use client";
import React, { useEffect, useRef, useState } from "react";
import { RotateCcw, Share2, ShieldCheck, Star, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import FavoriteButton from "@/components/FavoriteButton";
import ImageView from "@/components/common/ImageView";
import PriceView from "@/components/PriceView";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import ProductReviews from "@/components/ProductReviews";
import RelatedProducts from "./RelatedProducts";
import { trackProductView } from "@/lib/analytics";
import { recordRecentlyViewed } from "@/lib/recentlyViewed";
import { formatPrice, storeConfig } from "@/lib/storeConfig";
import { BRAND_QUERYResult, Product } from "@/sanity.types";

interface ProductContentProps {
  product: Product;
  relatedProducts: Product[];
  brand: BRAND_QUERYResult | null;
}

const ProductContent = ({ product, relatedProducts, brand }: ProductContentProps) => {
  const averageRating = product?.averageRating || 0;
  const totalReviews = product?.totalReviews || 0;
  const brandName = brand?.[0]?.brandName;
  const stock = product?.stock ?? 0;

  // Phones: show a sticky buy bar once the main "Add to cart" scrolls out of view
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (product) {
      trackProductView({ productId: product._id, name: product.name || "Unknown" });
      recordRecentlyViewed(product);
    }
  }, [product]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  const perks = [
    {
      icon: Truck,
      title: storeConfig.freeShippingThreshold > 0 ? "Free delivery" : "Delivery",
      text:
        storeConfig.freeShippingThreshold > 0
          ? `On orders over ${formatPrice(storeConfig.freeShippingThreshold)}`
          : "Fast, tracked delivery",
    },
    { icon: Wallet, title: "Cash on delivery", text: "Pay when it arrives" },
    { icon: RotateCcw, title: "Easy returns", text: "Within 7 days of delivery" },
    { icon: ShieldCheck, title: "Secure checkout", text: "Encrypted payments" },
  ];

  const details: [string, React.ReactNode][] = [
    ["Brand", brandName || "—"],
    ["Type", product?.variant ? product.variant.replace(/^\w/, (c) => c.toUpperCase()) : "—"],
    ["Availability", stock > 0 ? `${stock} in stock` : "Out of stock"],
    ["SKU", product?.slug?.current?.toUpperCase() || "—"],
  ];

  return (
    <Container className="pb-8">
      <div className="py-5">
        <DynamicBreadcrumb
          productData={{ name: product?.name || "", slug: product?.slug?.current || "" }}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <ImageView images={product?.images} isStock={product?.stock} alt={product?.name} />
        </div>

        <div>
          {brandName && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">{brandName}</p>
          )}
          <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            {product?.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <a href="#reviews" className="flex items-center gap-1.5">
              <span className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(averageRating) ? "fill-marigold text-marigold" : "text-light-text"
                    }`}
                  />
                ))}
              </span>
              <span className="text-light-color hover:text-ink">
                {totalReviews
                  ? `${averageRating.toFixed(1)} · ${totalReviews} review${totalReviews === 1 ? "" : "s"}`
                  : "No reviews yet"}
              </span>
            </a>
            <button onClick={share} className="ml-auto flex items-center gap-1.5 text-light-color hover:text-ink">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>

          <div className="mt-6 rounded-3xl bg-sand p-5 sm:p-6">
            <PriceView price={product?.price} discount={product?.discount} className="font-display text-3xl font-normal" />
            <p
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                stock === 0 ? "bg-dark-red/10 text-dark-red" : stock <= 5 ? "bg-marigold/20 text-ink" : "bg-sage/15 text-sage"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${stock === 0 ? "bg-dark-red" : stock <= 5 ? "bg-marigold" : "bg-sage"}`} />
              {stock === 0 ? "Out of stock" : stock <= 5 ? `Only ${stock} left — order soon` : "In stock, ready to ship"}
            </p>

            <div ref={ctaRef} className="mt-5 flex items-center gap-3">
              <div className="flex-1">
                <AddToCartButton product={product} className="h-12 text-base" />
              </div>
              <FavoriteButton showProduct={true} product={product} />
            </div>
          </div>

          {product?.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-light-color">{product.description}</p>
          )}

          <ul className="mt-8 grid grid-cols-2 gap-3">
            {perks.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3 rounded-2xl border border-border p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="text-xs text-light-color">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-8 divide-y divide-border rounded-2xl border border-border">
            {details.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-light-color">{label}</dt>
                <dd className="text-right font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section id="reviews" className="mt-20 scroll-mt-40">
        <ProductReviews productId={product._id} productName={product.name || "this product"} />
      </section>

      <RelatedProducts currentProduct={product} relatedProducts={relatedProducts} />

      <div
        className={`fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 transition-all duration-300 lg:hidden ${
          showStickyBar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-white/95 p-2 pl-4 shadow-[0_10px_30px_-10px_rgba(31,26,23,0.35)] ring-1 ring-ink/10 backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-light-color">{product?.name}</p>
            <p className="font-display text-lg leading-tight text-ink">{formatPrice(product?.price)}</p>
          </div>
          <div className="w-40 shrink-0">
            <AddToCartButton product={product} compact />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ProductContent;
