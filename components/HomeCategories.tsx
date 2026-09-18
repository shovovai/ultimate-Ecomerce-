import { Category } from "@/sanity.types";
import Container from "./Container";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/utils";

interface Props {
  categories: Category[];
}

const tints = ["bg-sand", "bg-shop_light_pink", "bg-[#e9efe6]", "bg-[#f6ecd6]"];

const HomeCategories = ({ categories }: Props) => {
  if (!categories?.length) return null;

  return (
    <Container className="mt-20">
      <SectionHeading
        eyebrow="Browse the stalls"
        title="Shop by category"
        description="Find what you need faster — every aisle of the haat in one place."
        href="/category"
        linkLabel="All categories"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {categories.map((category, index) => (
          <Link
            key={category?._id}
            href={`/category/${category?.slug?.current}`}
            className={cn(
              "group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 sm:p-5",
              tints[index % tints.length],
              index === 0 && "md:col-span-2 md:row-span-2 md:aspect-auto"
            )}
          >
            <h3
              className={cn(
                "relative z-10 max-w-[70%] font-display leading-tight text-ink",
                index === 0 ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
              )}
            >
              {category?.title}
            </h3>

            {category?.image && (
              <Image
                src={urlFor(category.image).width(400).url()}
                alt=""
                width={200}
                height={200}
                className={cn(
                  "absolute object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3",
                  index === 0
                    ? "bottom-4 right-4 h-1/2 w-1/2"
                    : "bottom-2 right-2 h-[55%] w-[55%]"
                )}
              />
            )}

            <span className="relative z-10 inline-flex w-fit items-center gap-1 text-sm font-semibold text-ink/70 transition-colors group-hover:text-clay">
              Shop now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
};

export default HomeCategories;
