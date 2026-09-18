import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Container from "@/components/Container";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All categories",
  description: "Browse every category in the store.",
};
export const revalidate = 300;

const tints = ["bg-sand", "bg-shop_light_pink", "bg-[#e9efe6]", "bg-[#f6ecd6]"];

export default async function CategoriesPage() {
  const categories = await client.fetch<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { _id: string; title: string; slug: string; description?: string; image?: any; count: number }[]
  >(`*[_type == "category"] | order(title asc){
    _id, title, "slug": slug.current, description, image,
    "count": count(*[_type == "product" && references(^._id)])
  }`);

  return (
    <Container className="py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Browse the stalls</p>
      <h1 className="mb-2 mt-2 font-display text-4xl text-ink sm:text-5xl">All categories</h1>
      <p className="mb-10 text-light-color">{categories.length} categories to explore.</p>

      {categories.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-12 text-center text-light-color">
          No categories yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link
              key={c._id}
              href={`/category/${c.slug}`}
              className={cn(
                "group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl p-5 transition-transform hover:-translate-y-1",
                tints[i % tints.length]
              )}
            >
              <div className="relative z-10">
                <h2 className="font-display text-xl leading-tight text-ink sm:text-2xl">{c.title}</h2>
                <p className="mt-1 text-sm text-light-color">
                  {c.count} product{c.count === 1 ? "" : "s"}
                </p>
              </div>
              {c.image && (
                <Image
                  src={urlFor(c.image).width(500).url()}
                  alt=""
                  width={240}
                  height={240}
                  className="absolute bottom-10 right-3 h-1/2 w-3/4 object-contain transition-transform duration-500 group-hover:scale-110"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1 text-sm font-semibold text-ink/70 group-hover:text-clay">
                Shop now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
