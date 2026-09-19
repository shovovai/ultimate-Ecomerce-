import HomeBanner from "@/components/HomeBanner";
import HomeCategories from "@/components/HomeCategories";
import HomeProductShowcase from "@/components/HomeProductShowcase";
import { PromoBand } from "@/components/HomeHighlights";
import ShopByBrands from "@/components/ShopByBrands";
import LatestBlog from "@/components/LatestBlog";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import CategoryRail from "@/components/home/CategoryRail";
import FlashDeals from "@/components/home/FlashDeals";
import CategoryShelves from "@/components/home/CategoryShelves";
import ProductRail from "@/components/home/ProductRail";
import CustomerReviews from "@/components/home/CustomerReviews";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import { getCategories } from "@/sanity/queries";
import {
  getCategoryShelves,
  getEditorsPicks,
  getFlashDeals,
  getHomeReviews,
  getTopRated,
} from "@/lib/homeData";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";
import { getSiteSettings } from "@/lib/siteSeo";
import { jsonLd } from "@/lib/jsonLd";

export default async function Home() {
  const [categories, settings, flashDeals, shelves, topRated, editorsPicks, reviews] = await Promise.all([
    getCategories(),
    getSiteSettings(),
    getFlashDeals(),
    getCategoryShelves(),
    getTopRated(),
    getEditorsPicks(),
    getHomeReviews(),
  ]);

  const organizationSchema = generateOrganizationSchema(settings);
  const websiteSchema = generateWebsiteSchema(settings);

  return (
    <div className="pb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }}
      />

      <HomeBanner />
      <CategoryRail categories={(categories ?? []).slice(0, 14)} />
      <FlashDeals products={flashDeals} />
      {/* 9 = one featured tile (2x2) + 8 regular tiles → three full rows */}
      <HomeCategories categories={(categories ?? []).slice(0, 9)} />
      <HomeProductShowcase />
      <CategoryShelves shelves={shelves} />
      <PromoBand />

      {topRated.length >= 2 && (
        <Container className="mt-16 sm:mt-20">
          <SectionHeading
            eyebrow="Customer favourites"
            title="Top rated"
            description="Four stars and up, straight from our reviews."
            href="/shop"
            linkLabel="Shop all"
          />
          <ProductRail products={topRated} />
        </Container>
      )}

      {editorsPicks.length >= 2 && (
        <Container className="mt-16 sm:mt-20">
          <SectionHeading
            eyebrow="Hand-picked"
            title="Editor's picks"
            description="Products our team would buy again."
            href="/shop"
            linkLabel="Shop all"
          />
          <ProductRail products={editorsPicks} />
        </Container>
      )}

      <ShopByBrands />
      <CustomerReviews reviews={reviews} />
      <RecentlyViewed />
      <LatestBlog />
    </div>
  );
}
