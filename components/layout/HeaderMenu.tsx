"use client";
import { headerData } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HeaderMenu = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 text-sm font-medium">
      {headerData.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 transition-all",
              active
                ? "bg-ink text-cream shadow-sm"
                : "text-ink/70 hover:bg-white hover:text-ink"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
};

export default HeaderMenu;
