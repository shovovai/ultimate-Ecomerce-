import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Product } from "@/sanity.types";
import Container from "../Container";
import ProductRail from "./ProductRail";
import DealTimer from "./DealTimer";

const FlashDeals = ({ products }: { products: Product[] }) => {
  if (products.length < 2) return null;

  return (
    <Container className="mt-12 sm:mt-16">
      <section className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-border">
        <div className="relative flex flex-col gap-4 overflow-hidden bg-ink px-5 py-5 text-cream sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
          <div aria-hidden className="absolute -left-10 -top-20 h-48 w-48 rounded-full bg-clay/50 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-marigold text-ink">
              <Zap className="h-5 w-5 fill-current" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-marigold">Flash deals</p>
              <h2 className="font-display text-2xl leading-tight sm:text-3xl">Today&apos;s hottest prices</h2>
            </div>
          </div>
          <div className="relative flex items-center justify-between gap-4 sm:justify-end">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-cream/60">Ends in</span>
              <DealTimer />
            </div>
            <Link
              href="/deal"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-marigold"
            >
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <ProductRail products={products} />
        </div>
      </section>
    </Container>
  );
};

export default FlashDeals;
