import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { Category } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";
import Container from "../Container";

const tints = ["bg-sand", "bg-shop_light_pink", "bg-[#e9efe6]", "bg-[#f6ecd6]"];

/** App-style row of round category shortcuts under the hero */
const CategoryRail = ({ categories }: { categories: Category[] }) => {
  if (!categories?.length) return null;

  return (
    <Container className="mt-6 sm:mt-8">
      <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
        <ul className="mx-auto flex w-max gap-3 sm:gap-5">
          {categories.map((category, index) => (
            <li key={category._id}>
              <Link
                href={`/category/${category.slug?.current}`}
                className="group flex w-[4.5rem] flex-col items-center gap-2 text-center sm:w-20"
              >
                <span
                  className={cn(
                    "flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-1 ring-ink/5 transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-95 sm:h-[4.5rem] sm:w-[4.5rem]",
                    tints[index % tints.length]
                  )}
                >
                  {category.image ? (
                    <Image
                      src={urlFor(category.image).width(160).url()}
                      alt=""
                      width={56}
                      height={56}
                      className="h-11 w-11 object-contain sm:h-12 sm:w-12"
                    />
                  ) : (
                    <span className="font-display text-xl text-ink">{category.title?.charAt(0)}</span>
                  )}
                </span>
                <span className="line-clamp-2 text-xs font-medium leading-tight text-ink/80 group-hover:text-clay">
                  {category.title}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/category" className="group flex w-[4.5rem] flex-col items-center gap-2 text-center sm:w-20">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-cream transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-95 sm:h-[4.5rem] sm:w-[4.5rem]">
                <LayoutGrid className="h-6 w-6" />
              </span>
              <span className="text-xs font-medium leading-tight text-ink/80 group-hover:text-clay">View all</span>
            </Link>
          </li>
        </ul>
      </nav>
    </Container>
  );
};

export default CategoryRail;
