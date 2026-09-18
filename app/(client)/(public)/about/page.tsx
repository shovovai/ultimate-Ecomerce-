import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HeartHandshake, PackageCheck, ShieldCheck, Sprout, Truck, Wallet } from "lucide-react";
import Container from "@/components/Container";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "About us",
  description: `The story behind ${brand.name} and how we work.`,
};

// Edit the copy on this page to tell your own story.
const values = [
  {
    icon: HeartHandshake,
    title: "Customers first",
    text: "Every decision starts with one question: does this make shopping easier and fairer for you?",
  },
  {
    icon: ShieldCheck,
    title: "Honest products",
    text: "Clear descriptions, real photos and prices you can trust — no hidden fees at checkout.",
  },
  {
    icon: Truck,
    title: "Dependable delivery",
    text: "Orders are confirmed, packed and tracked by our own team, right to your door.",
  },
  {
    icon: Sprout,
    title: "Growing together",
    text: "We work with local suppliers and trusted brands so the whole marketplace thrives.",
  },
];

const steps = [
  { icon: PackageCheck, title: "You order", text: "Pick your products and check out in a minute." },
  { icon: HeartHandshake, title: "We confirm", text: "Our team calls or messages to confirm your address." },
  { icon: Truck, title: "We deliver", text: "Your order is packed with care and delivered quickly." },
  { icon: Wallet, title: "You pay your way", text: "Cash on delivery, mobile wallet or card." },
];

export default function AboutPage() {
  return (
    <div>
      <Container className="pt-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-cream sm:px-12 sm:py-20">
          <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-clay/40 blur-3xl" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-marigold">About us</p>
          <h1 className="relative mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            A market for everyone, <span className="italic text-marigold">open all day.</span>
          </h1>
          <p className="relative mt-6 max-w-2xl text-lg text-cream/70">
            &ldquo;Haat&rdquo; is the village market where neighbours meet to buy and sell. {brand.name}{" "}
            brings that same trust and variety online — quality products, fair prices, and people
            you can actually reach when you need help.
          </p>
        </section>
      </Container>

      <Container className="mt-20 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Our story</p>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Why we started</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-light-color">
            <p>
              We started {brand.name} because shopping online should feel as simple and personal as
              walking into your favourite local shop. Too often it meant unclear prices, slow delivery
              and nobody to talk to.
            </p>
            <p>
              So we built a store around the basics done well: carefully chosen products, honest
              information, a team that confirms every order, and payment options that work for you.
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-clay"
          >
            Talk to us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-3xl bg-sand p-6">
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-clay" />
                <span className="font-display text-3xl text-ink/15">0{i + 1}</span>
              </div>
              <p className="mt-4 font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm text-light-color">{text}</p>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="mt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">What we stand for</p>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Our values</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-border bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-shop_light_pink text-clay">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-sans text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-light-color">{text}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="mt-20">
        <div className="flex flex-col items-center rounded-[2rem] bg-clay px-6 py-14 text-center text-white">
          <h2 className="max-w-xl font-display text-3xl sm:text-4xl">Come and have a look around the haat</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-clay hover:bg-ink hover:text-cream">
              Start shopping
            </Link>
            <Link href="/deal" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:border-white">
              Today&apos;s deals
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
