import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/Container";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const metadata: Metadata = {
  title: "Brands",
  description: "Shop products from the brands we carry.",
};
export const revalidate = 300;

export default async function BrandsPage() {
  const brands = await client.fetch<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { _id: string; title: string; slug: string; image?: any; count: number }[]
  >(`*[_type == "brand"] | order(title asc){
    _id, title, "slug": slug.current, image,
    "count": count(*[_type == "product" && brand._ref == ^._id])
  }`);

  return (
    <Container className="py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Trusted names</p>
      <h1 className="mb-2 mt-2 font-display text-4xl text-ink sm:text-5xl">Shop by brand</h1>
      <p className="mb-10 text-light-color">{brands.length} brands in store.</p>

      {brands.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-12 text-center text-light-color">
          No brands yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((b) => (
            <Link
              key={b._id}
              href={`/brands/${b.slug}`}
              className="group flex flex-col items-center rounded-3xl border border-border bg-white p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/5"
            >
              <div className="flex h-20 w-full items-center justify-center">
                {b.image ? (
                  <Image
                    src={urlFor(b.image).width(300).url()}
                    alt={`${b.title} logo`}
                    width={140}
                    height={80}
                    className="max-h-16 w-auto object-contain grayscale transition-all group-hover:grayscale-0"
                  />
                ) : (
                  <span className="font-display text-2xl text-ink">{b.title}</span>
                )}
              </div>
              <p className="mt-4 font-semibold text-ink">{b.title}</p>
              <p className="text-xs text-light-color">
                {b.count} product{b.count === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
