import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import { getAllBrands } from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";

const ShopByBrands = async () => {
  const brands = await getAllBrands();
  if (!brands?.length) return null;

  return (
    <Container className="mt-20">
      <SectionHeading
        eyebrow="Trusted names"
        title="Shop by brand"
        href="/brands"
        linkLabel="All brands"
      />
      <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-white sm:grid-cols-4 lg:grid-cols-8">
        {brands.slice(0, 16).map((brand) => (
          <Link
            key={brand?._id}
            href={{ pathname: "/shop", query: { brand: brand?.slug?.current } }}
            className="group -mb-px -mr-px flex aspect-[3/2] items-center justify-center border-b border-r border-border p-5 transition-colors hover:bg-cream"
            title={brand?.title}
          >
            {brand?.image ? (
              <Image
                src={urlFor(brand.image).width(240).url()}
                alt={`${brand?.title || "Brand"} logo`}
                width={120}
                height={80}
                className="max-h-full w-auto object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
              />
            ) : (
              <span className="font-display text-lg text-ink/60 group-hover:text-ink">
                {brand?.title}
              </span>
            )}
          </Link>
        ))}
      </div>
    </Container>
  );
};

export default ShopByBrands;
