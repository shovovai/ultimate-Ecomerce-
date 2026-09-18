"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Home, LayoutGrid, Search, ShoppingBag, UserRound, type LucideIcon } from "lucide-react";
import useCartStore from "@/store";
import { cn } from "@/lib/utils";

/** Opens the global search modal (listened to by SearchBar) */
export const openSearch = () => window.dispatchEvent(new Event("open-search"));

interface Item {
  label: string;
  icon: LucideIcon;
  href?: string;
  match?: (path: string) => boolean;
  onClick?: () => void;
  badge?: number;
}

// App-style bottom navigation for phones and tablets (hidden on desktop)
export default function BottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? items.reduce((n, i) => n + i.quantity, 0) : 0;

  const nav: Item[] = [
    { label: "Home", icon: Home, href: "/", match: (p) => p === "/" },
    {
      label: "Browse",
      icon: LayoutGrid,
      href: "/category",
      match: (p) => p.startsWith("/category") || p.startsWith("/shop") || p.startsWith("/brands") || p.startsWith("/deal"),
    },
    { label: "Search", icon: Search, onClick: openSearch },
    { label: "Cart", icon: ShoppingBag, href: "/cart", match: (p) => p.startsWith("/cart") || p.startsWith("/checkout"), badge: cartCount },
    {
      label: "Account",
      icon: UserRound,
      href: isSignedIn ? "/user/dashboard" : "/sign-in",
      match: (p) => p.startsWith("/user") || p.startsWith("/wishlist") || p.startsWith("/sign-in"),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-center justify-between rounded-[1.75rem] bg-ink/95 p-1.5 shadow-[0_12px_40px_-12px_rgba(31,26,23,0.6)] ring-1 ring-white/10 backdrop-blur-md">
        {nav.map((item) => {
          const active = item.match?.(pathname) ?? false;
          const Icon = item.icon;
          const inner = (
            <span
              className={cn(
                "relative flex h-12 items-center justify-center gap-2 rounded-[1.35rem] px-3.5 text-sm font-semibold transition-all duration-300",
                active ? "bg-cream text-ink" : "text-cream/70 active:scale-95"
              )}
            >
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
                {!!item.badge && (
                  <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-marigold px-1 text-[10px] font-bold text-ink ring-2 ring-ink">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300",
                  active ? "max-w-24 opacity-100" : "max-w-0 opacity-0"
                )}
              >
                {item.label}
              </span>
            </span>
          );
          return (
            <li key={item.label}>
              {item.href ? (
                <Link href={item.href} aria-label={item.label} aria-current={active ? "page" : undefined}>
                  {inner}
                </Link>
              ) : (
                <button type="button" onClick={item.onClick} aria-label={item.label}>
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
