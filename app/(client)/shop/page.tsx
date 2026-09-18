import Shop from "@/components/shopPage/Shop";
import { getAllBrands, getCategories } from "@/sanity/queries";
import { Suspense } from "react";

const ShopPage = async () => {
  const categories = await getCategories();
  const brands = await getAllBrands();
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-96 animate-pulse" />
        }
      >
        <Shop categories={categories} brands={brands} />
      </Suspense>
    </div>
  );
};

export default ShopPage;
