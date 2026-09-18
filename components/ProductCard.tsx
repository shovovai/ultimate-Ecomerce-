import { memo } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/sanity.types";
import { image } from "@/sanity/image";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import ProductSideMenu from "./ProductSideMenu";

const ProductCard = memo(({ product }: { product: Product }) => {
  const href = `/product/${product?.slug?.current}`;
  const outOfStock = product?.stock === 0;
  const lowStock = !outOfStock && (product?.stock ?? 0) > 0 && (product?.stock ?? 0) <= 5;
  const rating = product?.averageRating || 0;

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-sand">
        {product?.images?.[0] && (
          <Link href={href} aria-label={product?.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image(product.images[0]).size(700, 700).url()}
              alt={product?.name || "Product image"}
              loading="lazy"
              className={`aspect-square w-full object-contain p-5 mix-blend-multiply transition-transform duration-500 ${
                outOfStock ? "opacity-40 grayscale" : "group-hover:scale-[1.06]"
              }`}
            />
          </Link>
        )}

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {!!product?.discount && product.discount > 0 && (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold text-white">
              -{product.discount}%
            </span>
          )}
          {product?.status === "hot" && (
            <span className="rounded-full bg-marigold px-2.5 py-1 text-[11px] font-bold text-ink">
              Hot
            </span>
          )}
          {product?.status === "sale" && !product?.discount && (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold text-white">
              Sale
            </span>
          )}
          {product?.status === "new" && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-cream">
              New
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink">
              Sold out
            </span>
          )}
        </div>

        <ProductSideMenu product={product} />

        {/* Quick add — slides up on hover (always visible on touch) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-all duration-300 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <AddToCartButton product={product} compact />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        {product?.categories && product.categories.length > 0 && (
          <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-wider text-light-text">
            {product.categories.map((cat) => cat).join(" · ")}
          </p>
        )}
        <Link href={href} className="mt-1">
          <h3 className="line-clamp-2 font-sans text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-clay">
            {product?.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-light-color">
          <Star
            className={`h-3.5 w-3.5 ${rating ? "fill-marigold text-marigold" : "text-light-text"}`}
          />
          {rating ? (
            <span>
              <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
              {product?.totalReviews ? ` (${product.totalReviews})` : ""}
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
          {lowStock && (
            <span className="ml-auto font-semibold text-clay">
              Only {product?.stock} left
            </span>
          )}
        </div>

        <div className="mt-2">
          <PriceView price={product?.price} discount={product?.discount} className="text-base" />
        </div>
      </div>
    </article>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
