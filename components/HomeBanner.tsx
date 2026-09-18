import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, RotateCcw, Truck, Wallet } from "lucide-react";
import { banner_1 } from "@/images";
import Container from "./Container";

const perks = [
  { icon: Truck, label: "Fast home delivery" },
  { icon: Wallet, label: "Cash on delivery" },
  { icon: RotateCcw, label: "Easy 7-day returns" },
];

const HomeBanner = () => {
  return (
    <Container className="pt-4 sm:pt-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-sand">
        {/* decorative awning stripes */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,var(--color-clay)_0_32px,var(--color-marigold)_32px_64px)]"
        />

        <div className="grid items-center gap-10 px-6 pb-10 pt-12 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:px-14 lg:py-16">
          {/* Copy */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-ink/10">
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />
              New season at the haat
            </span>

            <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] text-ink sm:text-6xl lg:text-[4.2rem]">
              Everything you love,{" "}
              <span className="italic text-clay">one market</span> away.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-light-color sm:text-lg">
              Electronics, home essentials and everyday finds from brands you
              trust — at honest prices, delivered to your door.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-clay"
              >
                Start shopping
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/deal"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white/60 px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
              >
                <BadgePercent className="h-4 w-4 text-clay" />
                Today&apos;s deals
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink/80">
              {perks.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <Icon className="h-4 w-4 text-clay" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-square">
              <div className="absolute inset-[6%] rounded-full bg-clay" />
              <div className="absolute inset-[18%] rounded-full border-2 border-dashed border-cream/50" />
              <Image
                src={banner_1}
                alt="Featured product"
                priority
                className="relative z-10 h-full w-full object-contain p-[10%] drop-shadow-[0_30px_40px_rgba(31,26,23,0.35)]"
              />

              <div className="absolute left-0 top-[12%] z-20 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-ink/10">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-light-color">
                  This week
                </p>
                <p className="font-display text-2xl leading-none text-ink">
                  Up to <span className="text-clay">50%</span> off
                </p>
              </div>

              <div className="absolute bottom-[10%] right-0 z-20 flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-cream shadow-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-marigold text-ink">
                  <Truck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">Free delivery</p>
                  <p className="text-xs text-cream/60">on qualifying orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
};

export default HomeBanner;
