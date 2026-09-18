import { Product } from "@/sanity.types";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";

interface RelatedProductsProps {
  currentProduct: Product;
  relatedProducts: Product[];
}

const RelatedProducts = ({ currentProduct, relatedProducts }: RelatedProductsProps) => {
  const items = (relatedProducts || []).filter((p) => p._id !== currentProduct._id).slice(0, 5);
  if (items.length === 0) return null;

  return (
    <section className="mt-20">
      <SectionHeading eyebrow="You may also like" title="Related products" href="/shop" linkLabel="Shop all" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
        {items.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
