import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./common/Logo";
import { categoriesData, quickLinksData } from "@/constants";
import { contactConfig } from "@/config/contact";
import { brand } from "@/config/brand";
import SocialMedia from "./common/SocialMedia";
import NewsletterForm from "./NewsletterForm";
import Container from "./Container";

const Footer = () => {
  const { company, businessHours, emails } = contactConfig;

  return (
    <footer className="mt-20 bg-ink text-cream">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <Container className="grid gap-8 py-12 lg:grid-cols-2 lg:items-center lg:py-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-marigold">
              The WebHaat letter
            </p>
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              New arrivals and members-only deals,{" "}
              <span className="italic text-clay">once a week.</span>
            </h2>
          </div>
          <div className="lg:pl-12">
            <NewsletterForm tone="dark" />
            <p className="mt-3 text-xs text-cream/50">
              No spam. Unsubscribe in one click.
            </p>
          </div>
        </Container>
      </div>

      {/* Link columns */}
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-4">
          <Logo variant="sm" inverted />
          <p className="max-w-sm text-sm leading-relaxed text-cream/60">
            {company.description}
          </p>
          <SocialMedia
            className="text-cream/70"
            iconClassName="border-white/15 hover:border-clay hover:bg-clay hover:text-white"
            tooltipClassName="bg-cream text-ink"
          />
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-cream">
            Shop
          </h3>
          <ul className="space-y-2.5 text-sm">
            {categoriesData.slice(0, 6).map((item) => (
              <li key={item.title}>
                <Link
                  href={`/category/${item.href}`}
                  className="text-cream/60 transition-colors hover:text-cream"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-cream">
            Company
          </h3>
          <ul className="space-y-2.5 text-sm">
            {quickLinksData.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className="text-cream/60 transition-colors hover:text-cream"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-cream">
            Get in touch
          </h3>
          <ul className="space-y-3 text-sm text-cream/60">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
              <span>
                {company.address}, {company.city}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
              <a href={`tel:${company.phone.replace(/[^\d+]/g, "")}`} className="hover:text-cream">
                {company.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
              <a href={`mailto:${emails.support}`} className="hover:text-cream">
                {emails.support}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
              <span>{businessHours.weekday}</span>
            </li>
          </ul>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p>Secure payments · Visa · Mastercard · Stripe · Cash on delivery</p>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
