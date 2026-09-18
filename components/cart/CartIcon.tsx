"use client";
import useCartStore from "@/store";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const CartIcon = () => {
  const { items } = useCartStore();
  const itemCount = items?.length || 0;
  const displayCount = itemCount > 9 ? "9+" : itemCount;

  return (
    <Link href={"/cart"} className="group relative">
      <ShoppingBag className="group-hover:text-shop_light_green hoverEffect" />
      {itemCount > 0 ? (
        <span
          className={`absolute -top-1 -right-1 bg-clay text-white rounded-full text-[10px] ring-2 ring-cream font-semibold flex items-center justify-center min-w-[16px] h-[16px] ${
            itemCount > 9 ? "px-1" : ""
          }`}
        >
          {displayCount}
        </span>
      ) : (
        <span className="absolute -top-1 -right-1 bg-clay text-white rounded-full text-[10px] ring-2 ring-cream font-semibold flex items-center justify-center min-w-[16px] h-[16px]">
          0
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
