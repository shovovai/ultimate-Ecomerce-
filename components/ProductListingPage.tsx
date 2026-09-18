import Link from "next/link";
import Image from "next/image";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import Container from "./Container";
import ProductCard from "./ProductCard";
import NoProductAvailable from "./product/NoProductAvailable";

interface Props {
  eyebrow: string;
  title: string;
  description?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
  products: Product[];
  breadcrumb: { label: string; href?: string }[];
  siblings?: { title: string; href: string; active?: boolean }[];
  siblingsLabel?: string;
}

// Shared layout for category and brand pages
export default function ProductListingPage({
  eyebrow,
  title,
  description,
  image,
  products,
  breadcrumb,
  siblings,
  siblingsLabel,
}: Props) {
  return (
    <Container className="py-10">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-light-color">
        {breadcrumb.map((b, i) => (
          <span key={b.label} className="flex items-center gap-1.5">
            {b.href ? (
              <Link href={b.href} className="hover:text-ink">
                {b.label}
              </Link>
            ) : (
              <span className="text-ink">{b.label}</span>
            )}
            {i < breadcrumb.length - 1 && <span aria-hidden>/</span>}
          </span>
        ))}
      </nav>

      <header className="relative mb-10 overflow-hidden rounded-[2rem] bg-sand px-6 py-10 sm:px-10">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">{eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">{title}</h1>
          {description && <p className="mt-3 text-light-color">{description}</p>}
          <p className="mt-4 text-sm font-semibold text-ink/70">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        {image && (
          <Image
            src={urlFor(image).width(500).url()}
            alt=""
            width={260}
            height={260}
            className="absolute -bottom-6 right-4 hidden h-56 w-56 object-contain opacity-90 mix-blend-multiply sm:block"
          />
        )}
      </header>

      {siblings && siblings.length > 0 && (
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {siblingsLabel && (
            <span className="shrink-0 self-center pr-1 text-xs font-semibold uppercase tracking-wider text-light-color">
              {siblingsLabel}
            </span>
          )}
          {siblings.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={
                s.active
                  ? "shrink-0 rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-cream"
                  : "shrink-0 rounded-full border border-border bg-white px-4 py-1.5 text-sm text-ink/80 hover:border-ink/40"
              }
            >
              {s.title}
            </Link>
          ))}
        </div>
      )}

      {products.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <NoProductAvailable />
      )}
    </Container>
  );
}
