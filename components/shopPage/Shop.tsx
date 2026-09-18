"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { BRANDS_QUERYResult, Category, Product } from "@/sanity.types";
import { catalogFetch } from "@/lib/publicFetch";
import { formatPrice, storeConfig } from "@/lib/storeConfig";
import { cn } from "@/lib/utils";
import Container from "../Container";
import ProductCard from "../ProductCard";
import NoProductAvailable from "../product/NoProductAvailable";

interface Props {
  categories: Category[];
  brands: BRANDS_QUERYResult;
}

type Sort = "featured" | "newest" | "price-asc" | "price-desc" | "name";

const buckets = storeConfig.priceBuckets;
const PRICE_RANGES = [
  { label: `Under ${formatPrice(buckets[0]).replace(/\.00$/, "")}`, value: `0-${buckets[0]}` },
  ...buckets.slice(1).map((b, i) => ({
    label: `${formatPrice(buckets[i]).replace(/\.00$/, "")} – ${formatPrice(b).replace(/\.00$/, "")}`,
    value: `${buckets[i]}-${b}`,
  })),
  { label: `Over ${formatPrice(buckets[buckets.length - 1]).replace(/\.00$/, "")}`, value: `${buckets[buckets.length - 1]}-1000000000` },
];

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
      active ? "border-ink bg-ink text-cream" : "border-border bg-white text-ink/80 hover:border-ink/40"
    )}
  >
    {children}
  </button>
);

const Shop = ({ categories, brands }: Props) => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(searchParams?.get("category") || null);
  const [brand, setBrand] = useState<string | null>(searchParams?.get("brand") || null);
  const [price, setPrice] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [minPrice, maxPrice] = price ? price.split("-").map(Number) : [0, 1_000_000_000];
      const data = await catalogFetch<Product[]>("shop", {
        selectedCategory: category,
        selectedBrand: brand,
        minPrice,
        maxPrice,
      });
      setProducts(data || []);
    } catch (error) {
      console.error("Shop product fetching error", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, brand, price]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const visible = useMemo(() => {
    let list = inStockOnly ? products.filter((p) => (p.stock ?? 0) > 0) : [...products];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "newest":
        list.sort((a, b) => (b._createdAt || "").localeCompare(a._createdAt || ""));
        break;
      case "name":
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        list = list.sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured));
    }
    return list;
  }, [products, sort, inStockOnly]);

  const activeCount = [category, brand, price, inStockOnly || null].filter(Boolean).length;
  const clearAll = () => {
    setCategory(null);
    setBrand(null);
    setPrice(null);
    setInStockOnly(false);
  };

  const filters = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-light-color">Category</h3>
        <div className="flex flex-wrap gap-2">
          <Chip active={!category} onClick={() => setCategory(null)}>All</Chip>
          {categories?.map((c) => (
            <Chip
              key={c._id}
              active={category === c.slug?.current}
              onClick={() => setCategory(category === c.slug?.current ? null : c.slug?.current || null)}
            >
              {c.title}
            </Chip>
          ))}
        </div>
      </div>
      {brands?.length > 0 && (
        <div>
          <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-light-color">Brand</h3>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <Chip
                key={b._id}
                active={brand === b.slug?.current}
                onClick={() => setBrand(brand === b.slug?.current ? null : b.slug?.current || null)}
              >
                {b.title}
              </Chip>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-light-color">Price</h3>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((r) => (
            <Chip key={r.value} active={price === r.value} onClick={() => setPrice(price === r.value ? null : r.value)}>
              {r.label}
            </Chip>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-clay)]"
        />
        In stock only
      </label>
    </div>
  );

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">The market</p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Shop everything</h1>
          <p className="mt-2 text-sm text-light-color">
            {loading ? "Loading products…" : `${visible.length} product${visible.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[11px] text-white">
                {activeCount}
              </span>
            )}
          </button>
          <label className="sr-only" htmlFor="shop-sort">Sort by</label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-11 rounded-full border border-border bg-white px-4 text-sm font-medium text-ink outline-none focus:border-clay"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {category && (
            <button onClick={() => setCategory(null)} className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-3 py-1 text-sm font-medium text-clay">
              {categories.find((c) => c.slug?.current === category)?.title || category} <X className="h-3.5 w-3.5" />
            </button>
          )}
          {brand && (
            <button onClick={() => setBrand(null)} className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-3 py-1 text-sm font-medium text-clay">
              {brands.find((b) => b.slug?.current === brand)?.title || brand} <X className="h-3.5 w-3.5" />
            </button>
          )}
          {price && (
            <button onClick={() => setPrice(null)} className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-3 py-1 text-sm font-medium text-clay">
              {PRICE_RANGES.find((r) => r.value === price)?.label} <X className="h-3.5 w-3.5" />
            </button>
          )}
          {inStockOnly && (
            <button onClick={() => setInStockOnly(false)} className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-3 py-1 text-sm font-medium text-clay">
              In stock <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={clearAll} className="ml-1 text-sm font-medium text-light-color underline-offset-4 hover:text-ink hover:underline">
            Clear all
          </button>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-40">{filters}</div>
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-2xl bg-sand" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-sand" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-sand" />
                </div>
              ))}
            </div>
          ) : visible.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <NoProductAvailable className="bg-transparent" />
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-cream p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="rounded-full p-2 hover:bg-sand" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filters}
            <div className="mt-8 flex gap-3">
              <button onClick={clearAll} className="flex-1 rounded-full border border-ink/15 py-3 text-sm font-semibold">
                Clear
              </button>
              <button onClick={() => setFiltersOpen(false)} className="flex-1 rounded-full bg-ink py-3 text-sm font-semibold text-cream">
                Show {visible.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Shop;
