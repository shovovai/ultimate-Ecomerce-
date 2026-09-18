"use client";
import { Product } from "@/sanity.types";
import { useEffect, useState, memo, useCallback } from "react";
import { toast } from "sonner";
import PriceFormatter from "./PriceFormatter";
import { Button } from "./ui/button";
import useCartStore from "@/store";
import QuantityButtons from "./QuantityButtons";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { trackAddToCart } from "@/lib/analytics";

interface Props {
  product: Product;
  className?: string;
  /** Small overlay style used on product cards */
  compact?: boolean;
}

const AddToCartButton = memo(({ product, className, compact = false }: Props) => {
  const { addItem, getItemCount } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  // All hooks must be called before any conditional logic
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  // Use useEffect to set isClient to true after component mounts
  // This ensures that the component only renders on the client-side
  // Preventing hydration errors due to server/client mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success(`${product?.name} added to cart!`, {
        description: `Current quantity: ${itemCount + 1}`,
        duration: 3000,
      });
      // Firebase Analytics event
      trackAddToCart({
        productId: product._id,
        name: product.name || "Unknown",
        price: product.price ?? 0,
        quantity: itemCount + 1,
      });
    } else {
      toast.error("Stock limit reached", {
        description: "Cannot add more than available stock",
        duration: 4000,
      });
    }
  }, [product, itemCount, addItem]);

  // Early return after all hooks have been called - this is crucial for Rules of Hooks
  if (compact) {
    if (!isClient) return <div className="h-10" />;
    return itemCount ? (
      <div className="flex h-10 items-center justify-between rounded-full bg-white/95 px-3 shadow-md backdrop-blur">
        <span className="text-xs font-semibold text-ink">In cart</span>
        <QuantityButtons product={product} />
      </div>
    ) : (
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-cream shadow-md transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:bg-ink/40"
      >
        <ShoppingBag className="h-4 w-4" />
        {isOutOfStock ? "Out of stock" : "Add to cart"}
      </button>
    );
  }

  if (!isClient) {
    return (
      <div className="w-full h-12 flex items-center">
        <Button
          disabled
          className={cn(
            "w-full bg-gray-200 text-gray-500 shadow-none border border-gray-300",
            className
          )}
        >
          <ShoppingBag /> Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-12 flex items-center">
      {itemCount ? (
        <div className="text-sm w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <QuantityButtons product={product} />
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormatter
              amount={product?.price ? product.price * itemCount : 0}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "w-full rounded-full bg-ink text-cream shadow-none border border-ink font-semibold tracking-wide hover:bg-clay hover:border-clay hoverEffect",
            className
          )}
        >
          <ShoppingBag /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      )}
    </div>
  );
});

AddToCartButton.displayName = "AddToCartButton";

export default AddToCartButton;
