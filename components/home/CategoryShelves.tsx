import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";
import type { CategoryShelf } from "@/lib/homeData";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import ProductRail from "./ProductRail";

const tints = ["bg-sand", "bg-[#e9efe6]", "bg-shop_light_pink"];

/** One shelf per busy category: a banner tile plus its newest products */
const CategoryShelves = ({ shelves }: { shelves: CategoryShelf[] }) => {
  if (!shelves.length) return null;

  return (
    <Container className="mt-16 sm:mt-20">
      <SectionHeading
        eyebrow="Aisle by aisle"
        title="Shop the categories"
        description="The newest arrivals from our busiest stalls."
        href="/category"
        linkLabel="All categories"
      />
      <div className="space-y-10 sm:space-y-12">
        {shelves.map((shelf, index) => (
          <section key={shelf._id} className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
            <Link
              href={`/category/${shelf.slug}`}
              className={cn(
                "group relative flex min-h-[8.5rem] overflow-hidden rounded-[1.5rem] p-5 lg:min-h-full lg:p-6",
                tints[index % tints.length]
              )}
            >
              <div className="relative z-10 flex max-w-[62%] flex-col lg:max-w-none">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                  {shelf.productCount} product{shelf.productCount === 1 ? "" : "s"}
                </p>
                <h3 className="mt-1 font-display text-2xl leading-tight text-ink lg:text-3xl">{shelf.title}</h3>
                {shelf.description && (
                  <p className="mt-2 hidden text-sm leading-relaxed text-light-color lg:line-clamp-3">
                    {shelf.description}
                  </p>
                )}
                <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream transition-colors group-hover:bg-clay lg:mt-5">
                  Shop all <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              {shelf.image && (
                <Image
                  src={urlFor(shelf.image).width(400).url()}
                  alt=""
                  width={200}
                  height={200}
                  className="absolute -bottom-1 -right-1 h-32 w-32 object-contain transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-110 lg:bottom-4 lg:right-4 lg:h-40 lg:w-40"
                />
              )}
            </Link>
            <ProductRail products={shelf.products} size="narrow" />
          </section>
        ))}
      </div>
    </Container>
  );
};

export default CategoryShelves;
