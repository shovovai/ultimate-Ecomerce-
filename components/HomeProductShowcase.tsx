import { backendClient } from "@/sanity/lib/backendClient";
import { productType } from "@/constants";
import { ALL_PRODUCTS_QUERYResult } from "@/sanity.types";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import ProductShowcaseTabs from "./ProductShowcaseTabs";

const QUERY = `*[_type == "product" && variant == $variant] | order(_createdAt desc)[0...10]{
  ...,"categories": categories[]->title
}`;

// Server-side fetch (no browser → Sanity CORS dependency); tabs switch client-side
const HomeProductShowcase = async () => {
  const groups = await Promise.all(
    productType.map(async (item) => {
      try {
        const products = await backendClient.fetch<ALL_PRODUCTS_QUERYResult>(
          QUERY,
          { variant: item.value },
          { next: { revalidate: 300, tags: ["product"] } }
        );
        return { title: item.title, products };
      } catch (error) {
        console.error("Product fetching error", error);
        return { title: item.title, products: [] as ALL_PRODUCTS_QUERYResult };
      }
    })
  );

  return (
    <Container className="mt-20">
      <SectionHeading
        eyebrow="Fresh at the haat"
        title="New arrivals"
        description="Hand-picked products, just landed in store."
        href="/shop"
        linkLabel="Shop all"
      />
      <ProductShowcaseTabs groups={groups} />
    </Container>
  );
};

export default HomeProductShowcase;
