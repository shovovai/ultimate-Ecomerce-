import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

// Shared section header: small eyebrow, serif title, optional "view all" link
const SectionHeading = ({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  className,
  children,
}: Props) => (
  <div
    className={cn(
      "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
      className
    )}
  >
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-light-color sm:text-base">{description}</p>
      )}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {children}
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
        >
          {linkLabel}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  </div>
);

export default SectionHeading;
