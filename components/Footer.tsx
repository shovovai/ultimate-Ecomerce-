import Link from "next/link";
import {
  ChevronDown,
  Clock,
  Headset,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Logo from "./common/Logo";
import { contactConfig } from "@/config/contact";
import { getCategories } from "@/sanity/queries";
import { getSiteSettings } from "@/lib/siteSeo";
import { getPaymentOptions } from "@/lib/paymentConfig";
import SocialMedia from "./common/SocialMedia";
import NewsletterForm from "./NewsletterForm";
import Container from "./Container";
import { BackToTop, InstallAppButton } from "./layout/FooterClient";

type FooterLink = { title: string; href: string };

const PROVIDER_LABELS: Record<string, string[]> = {
  cash_on_delivery: ["Cash on delivery"],
  bkash: ["bKash"],
  nagad: ["Nagad"],
  rocket: ["Rocket"],
  upay: ["Upay"],
  bank: ["Bank transfer"],
  sslcommerz: ["SSLCommerz"],
  stripe: ["Visa", "Mastercard", "Amex"],
};

const promises = [
  { icon: Truck, title: "Fast delivery", text: "Tracked to your door" },
  { icon: ShieldCheck, title: "Secure payment", text: "Encrypted checkout" },
  { icon: RotateCcw, title: "Easy returns", text: "7-day return window" },
  { icon: Headset, title: "Real support", text: "Humans, 7 days a week" },
];

/** Accordion on phones, plain column from md up */
const FooterColumn = ({ title, links }: { title: string; links: FooterLink[] }) => {
  const items = links.map((link) => (
    <li key={link.href + link.title}>
      <Link href={link.href} className="text-cream/60 transition-colors hover:text-cream">
        {link.title}
      </Link>
    </li>
  ));

  return (
    <div className="border-b border-white/10 md:border-0">
      <details className="group md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold text-cream [&::-webkit-details-marker]:hidden">
          {title}
          <ChevronDown className="h-4 w-4 text-cream/50 transition-transform group-open:rotate-180" />
        </summary>
        <ul className="space-y-3 pb-5 text-sm">{items}</ul>
      </details>
      <div className="hidden md:block">
        <h3 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-cream/90">
          {title}
        </h3>
        <ul className="space-y-3 text-sm">{items}</ul>
      </div>
    </div>
  );
};

const Footer = async () => {
  const [settings, categories, paymentOptions] = await Promise.all([
    getSiteSettings(),
    getCategories().catch(() => []),
    getPaymentOptions().catch(() => []),
  ]);

  const storeName = settings.storeName;
  const phone = settings.supportPhone || contactConfig.company.phone;
  const email = settings.supportEmail || contactConfig.emails.support;
  const { company, businessHours } = contactConfig;

  const topCategories = [...(categories ?? [])]
    .sort((a, b) => (b?.productCount ?? 0) - (a?.productCount ?? 0))
    .slice(0, 6)
    .map((c) => ({ title: c?.title ?? "", href: `/category/${c?.slug?.current}` }))
    .filter((c) => c.title);

  const paymentLabels = [
    ...new Set(
      paymentOptions.flatMap((o) => PROVIDER_LABELS[o.kind === "manual" ? o.provider ?? "" : o.method] ?? [])
    ),
  ];

  const columns: { title: string; links: FooterLink[] }[] = [
    ...(topCategories.length
      ? [{ title: "Categories", links: [...topCategories, { title: "All categories", href: "/category" }] }]
      : []),
    {
      title: "Shop",
      links: [
        { title: "All products", href: "/shop" },
        { title: "Today's deals", href: "/deal" },
        { title: "Brands", href: "/brands" },
        { title: "Wishlist", href: "/wishlist" },
        { title: "My cart", href: "/cart" },
      ],
    },
    {
      title: "Help",
      links: [
        { title: "Help center", href: "/help" },
        { title: "FAQs", href: "/faq" },
        { title: "Track my order", href: "/user/orders" },
        { title: "Contact us", href: "/contact" },
        { title: "My account", href: "/user/dashboard" },
      ],
    },
    {
      title: "Company",
      links: [
        { title: "About us", href: "/about" },
        { title: "Blog", href: "/blog" },
        { title: "Terms & conditions", href: "/terms" },
        { title: "Privacy policy", href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="relative mt-20 bg-ink text-cream">
      {/* Market awning */}
      <div
        aria-hidden
        className="h-1.5 bg-[repeating-linear-gradient(90deg,var(--color-clay)_0_32px,var(--color-marigold)_32px_64px)]"
      />

      {/* Promises */}
      <div className="border-b border-white/10">
        <Container>
          <ul className="grid grid-cols-2 gap-y-6 py-8 lg:grid-cols-4">
            {promises.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-marigold ring-1 ring-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-cream/50">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* Newsletter */}
      <Container className="pt-12">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-clay p-6 sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-marigold/30 blur-3xl"
          />
          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                The {storeName} letter
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight text-white sm:text-3xl">
                New arrivals and members-only deals, once a week.
              </h2>
            </div>
            <div>
              <NewsletterForm tone="clay" />
              <p className="mt-3 text-xs text-white/70">No spam. Unsubscribe in one click.</p>
            </div>
          </div>
        </div>
      </Container>

      {/* Brand + links */}
      <Container className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="space-y-6 lg:col-span-4">
          <Logo variant="sm" inverted />
          <p className="max-w-sm text-sm leading-relaxed text-cream/60">{company.description}</p>

          <ul className="space-y-3 text-sm text-cream/70">
            {phone && (
              <li>
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-3 hover:text-cream">
                  <Phone className="h-4 w-4 shrink-0 text-marigold" />
                  {phone}
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${email}`} className="flex items-center gap-3 break-all hover:text-cream">
                <Mail className="h-4 w-4 shrink-0 text-marigold" />
                {email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-marigold" />
              <span>
                {company.address}, {company.city}
              </span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-marigold" />
              <span>{businessHours.weekday}</span>
            </li>
          </ul>

          <SocialMedia
            className="text-cream/70"
            iconClassName="border-white/15 hover:border-clay hover:bg-clay hover:text-white"
            tooltipClassName="bg-cream text-ink"
          />
        </div>

        <nav
          aria-label="Footer"
          className={`border-t border-white/10 md:grid md:gap-8 md:border-0 lg:col-span-8 lg:pl-8 ${
            columns.length > 3 ? "md:grid-cols-4" : "md:grid-cols-3"
          }`}
        >
          {columns.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </nav>
      </Container>

      {/* Payments + app */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">
          {paymentLabels.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/50">
                We accept
              </span>
              <ul className="flex flex-wrap gap-2">
                {paymentLabels.map((label) => (
                  <li
                    key={label}
                    className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide text-ink"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <InstallAppButton className="w-fit" />
        </Container>
      </div>

      {/* Legal */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col-reverse gap-4 py-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href="/terms" className="hover:text-cream">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-cream">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-cream">
              Contact
            </Link>
            <BackToTop />
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
