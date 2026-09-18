import HomeBanner from "@/components/HomeBanner";
import HomeCategories from "@/components/HomeCategories";
import HomeProductShowcase from "@/components/HomeProductShowcase";
import { PromoBand, ValueStrip } from "@/components/HomeHighlights";
import ShopByBrands from "@/components/ShopByBrands";
import LatestBlog from "@/components/LatestBlog";
import { getCategories } from "@/sanity/queries";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";
import { getSiteSettings } from "@/lib/siteSeo";

export default async function Home() {
  // 9 = one featured tile (2x2) + 8 regular tiles → three full rows
  const categories = await getCategories(9);

  const settings = await getSiteSettings();
  const organizationSchema = generateOrganizationSchema(settings);
  const websiteSchema = generateWebsiteSchema(settings);

  return (
    <div className="pb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <HomeBanner />
      <ValueStrip />
      <HomeCategories categories={categories} />
      <HomeProductShowcase />
      <PromoBand />
      <ShopByBrands />
      <LatestBlog />
    </div>
  );
}
