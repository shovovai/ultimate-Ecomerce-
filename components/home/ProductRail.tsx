import { Product } from "@/sanity.types";
import { cn } from "@/lib/utils";
import ProductCard from "../ProductCard";

// Desktop shows a single row; extra items stay reachable by swiping on phones
const DESKTOP = {
  wide: "lg:grid-cols-4 xl:grid-cols-5 lg:[&>*:nth-child(n+5)]:hidden xl:[&>*:nth-child(5)]:block",
  narrow: "lg:grid-cols-3 xl:grid-cols-4 lg:[&>*:nth-child(n+4)]:hidden xl:[&>*:nth-child(4)]:block",
};

interface Props {
  products: Product[];
  size?: keyof typeof DESKTOP;
  className?: string;
}

/** Swipeable product row on phones, one-row grid on desktop */
const ProductRail = ({ products, size = "wide", className }: Props) => (
  <div
    className={cn(
      "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:gap-4 lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0",
      DESKTOP[size],
      className
    )}
  >
    {products.map((product) => (
      <div key={product._id} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[23%] lg:w-auto">
        <ProductCard product={product} />
      </div>
    ))}
  </div>
);

export default ProductRail;
