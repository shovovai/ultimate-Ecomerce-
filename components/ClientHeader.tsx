"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ClerkLoaded, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Flame, LifeBuoy, Search, Truck, UserRound } from "lucide-react";
import Container from "./Container";
import HeaderMenu from "./layout/HeaderMenu";
import Logo from "./common/Logo";
import CartIcon from "./cart/CartIcon";
import MobileMenu from "./layout/MobileMenu";
import SearchBar from "./common/SearchBar";
import FavoriteButton from "./FavoriteButton";
import NotificationBell from "./NotificationBell";
import UserDropdown from "./UserDropdown";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { openSearch } from "./layout/BottomNav";

const iconWrap =
  "flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-sand transition-colors";

const ClientHeader = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Phones: hide the search row while scrolling down, show it again on scroll up
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - lastY) > 6) {
        setCompact(y > 120 && y > lastY);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle redirect after successful login
  useEffect(() => {
    if (isSignedIn && user && isMounted && typeof window !== "undefined") {
      const redirectTo = searchParams.get("redirectTo");
      if (redirectTo) {
        router.push(decodeURIComponent(redirectTo));
        router.replace(window.location.pathname);
      }
    }
  }, [isSignedIn, user, searchParams, router, isMounted]);

  const authUrl = (base: string) => {
    if (!isMounted || typeof window === "undefined") return base;
    const currentPath = window.location.pathname + window.location.search;
    return `${base}?redirectTo=${encodeURIComponent(currentPath)}`;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-cream/90 backdrop-blur-md transition-shadow",
        scrolled ? "border-border shadow-[0_6px_24px_-12px_rgba(31,26,23,0.25)]" : "border-transparent"
      )}
    >
      <Container>
        {/* Main row */}
        <div className="flex h-14 items-center gap-3 sm:h-[4.5rem] lg:h-20 lg:gap-10">
          <div className="flex shrink-0 items-center gap-1">
            <MobileMenu />
            <Logo />
          </div>

          <div className="ml-auto flex min-w-0 flex-1 justify-end sm:ml-0 sm:justify-center">
            <div className="w-auto sm:w-full sm:max-w-xl">
              <SearchBar />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <div className={cn(iconWrap, "hidden sm:flex")}>
              <FavoriteButton />
            </div>
            <div className={cn(iconWrap, "hidden lg:flex")}>
              <CartIcon />
            </div>
            <ClerkLoaded>
              <SignedIn>
                <div className={iconWrap}>
                  <NotificationBell />
                </div>
                <div className="ml-1">
                  <UserDropdown />
                </div>
              </SignedIn>
              <SignedOut>
                <Link
                  href={authUrl("/sign-in")}
                  className="ml-1 hidden items-center gap-2 rounded-full bg-ink px-3 py-2 text-sm font-semibold text-cream transition-colors hover:bg-clay sm:inline-flex sm:px-4"
                >
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
                <Link
                  href={authUrl("/sign-up")}
                  className="ml-1 hidden rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink lg:inline-flex"
                >
                  Join
                </Link>
              </SignedOut>
            </ClerkLoaded>
          </div>
        </div>

        {/* Phone search row (collapses while scrolling down) */}
        <div
          className={cn(
            "grid transition-all duration-300 sm:hidden",
            compact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] pb-3 opacity-100"
          )}
        >
          <div className="overflow-hidden">
            <button
              type="button"
              onClick={openSearch}
              className="flex h-11 w-full items-center gap-3 rounded-2xl bg-sand px-4 text-left text-sm text-light-color ring-1 ring-ink/5 active:scale-[0.99]"
            >
              <Search className="h-4 w-4 text-ink/60" />
              Search products, brands…
            </button>
          </div>
        </div>
      </Container>

      {/* Navigation band (desktop) */}
      <div className="hidden border-t border-border/70 bg-white/55 lg:block">
        <Container>
          <div className="flex h-14 items-center justify-between gap-6">
            <div className="rounded-full bg-sand/80 p-1 ring-1 ring-ink/5">
              <HeaderMenu />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="hidden items-center gap-2 pr-3 text-light-color xl:inline-flex">
                <Truck className="h-4 w-4 text-sage" />
                Fast delivery · Cash on delivery available
              </span>
              <span aria-hidden className="hidden h-5 w-px bg-border xl:block" />
              <Link
                href="/deal"
                className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-4 py-2 font-semibold text-clay transition-colors hover:bg-clay hover:text-white"
              >
                <Flame className="h-4 w-4" /> Today&apos;s deals
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-light-color transition-colors hover:bg-sand hover:text-ink"
              >
                <LifeBuoy className="h-4 w-4" /> Help
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
};

export default ClientHeader;
