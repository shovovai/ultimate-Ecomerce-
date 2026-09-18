import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="relative mb-8">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-sand">
          <ShoppingBag className="h-14 w-14 text-clay" strokeWidth={1.5} />
        </div>
        <span className="absolute -right-1 top-2 h-6 w-6 rounded-full bg-marigold" />
      </div>
      <h2 className="font-display text-3xl text-ink">Your basket is empty</h2>
      <p className="mt-3 text-light-color">
        Looks like you haven&apos;t picked anything yet. The haat is full of good
        finds — have a look around.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-clay"
        >
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/deal"
          className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:border-ink"
        >
          See today&apos;s deals
        </Link>
      </div>
    </div>
  );
}
