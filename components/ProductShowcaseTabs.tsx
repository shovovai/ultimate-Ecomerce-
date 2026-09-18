"use client";

import { useState } from "react";
import { ALL_PRODUCTS_QUERYResult, Product } from "@/sanity.types";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";
import NoProductAvailable from "./product/NoProductAvailable";

interface Props {
  groups: { title: string; products: ALL_PRODUCTS_QUERYResult }[];
}

const ProductShowcaseTabs = ({ groups }: Props) => {
  const [tab, setTab] = useState(groups[0]?.title ?? "");
  const products = groups.find((g) => g.title === tab)?.products ?? [];

  return (
    <>
      <div role="tablist" className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {groups.map((g) => (
          <button
            key={g.title}
            role="tab"
            aria-selected={tab === g.title}
            onClick={() => setTab(g.title)}
            className={cn(
              "shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              tab === g.title
                ? "bg-ink text-cream"
                : "bg-sand text-ink/70 hover:bg-shop_light_pink hover:text-ink"
            )}
          >
            {g.title}
            <span className="ml-1.5 text-xs opacity-60">{g.products.length}</span>
          </button>
        ))}
      </div>

      {products.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product._id} product={product as unknown as Product} />
          ))}
        </div>
      ) : (
        <NoProductAvailable selectedTab={tab} />
      )}
    </>
  );
};

export default ProductShowcaseTabs;
