import Link from "next/link";
import { ArrowRight, Headset, ShieldCheck, Truck, Undo2 } from "lucide-react";
import Container from "./Container";

const values = [
  { icon: Truck, title: "Quick delivery", text: "Fast dispatch, tracked to your door" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Card, wallet or cash on delivery" },
  { icon: Undo2, title: "Easy returns", text: "Changed your mind? Return within 7 days" },
  { icon: Headset, title: "Real support", text: "Friendly humans, 7 days a week" },
];

/** Thin row of store promises shown under the hero */
export const ValueStrip = () => (
  <Container className="mt-6">
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
      {values.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-start gap-3 bg-cream p-4 sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-shop_light_pink text-clay">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="mt-0.5 hidden text-xs text-light-color sm:block">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  </Container>
);

/** Two editorial promo tiles */
export const PromoBand = () => (
  <Container className="mt-20 grid gap-4 md:grid-cols-2">
    <Link
      href="/deal"
      className="group relative overflow-hidden rounded-[1.75rem] bg-ink p-8 text-cream sm:p-10"
    >
      <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-clay/40 blur-2xl" />
      <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-marigold">
        Deal of the week
      </p>
      <h3 className="relative mt-3 max-w-xs font-display text-3xl leading-tight sm:text-4xl">
        Big savings on <span className="italic text-marigold">hot</span> picks
      </h3>
      <span className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-ink transition-colors group-hover:bg-marigold">
        Grab the deals
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
    <Link
      href="/category"
      className="group relative overflow-hidden rounded-[1.75rem] bg-clay p-8 text-white sm:p-10"
    >
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-1/3 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.12)_0_12px,transparent_12px_24px)]"
      />
      <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
        Home &amp; living
      </p>
      <h3 className="relative mt-3 max-w-xs font-display text-3xl leading-tight sm:text-4xl">
        Upgrade every corner of your home
      </h3>
      <span className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-clay transition-colors group-hover:bg-ink group-hover:text-cream">
        Explore categories
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  </Container>
);
