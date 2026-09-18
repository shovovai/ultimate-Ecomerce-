import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import Title from "@/components/Title";
import DealCountdown from "@/components/DealCountdown";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { DEAL_PRODUCTSResult, Product } from "@/sanity.types";
import { getDealProducts, getCategories } from "@/sanity/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, TrendingDown, ShoppingBag } from "lucide-react";
import Link from "next/link";

const DealPage = async () => {
  const [products] = await Promise.all([getDealProducts(), getCategories()]);

  // Calculate deal statistics
  const totalProducts = products?.length || 0;
  const avgDiscount = totalProducts
    ? products.reduce((acc, product) => acc + (product?.discount || 0), 0) /
      totalProducts
    : 0;
  const maxDiscount = totalProducts
    ? Math.max(...products.map((p) => p?.discount || 0))
    : 0;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <Container className="pt-6">
        <DynamicBreadcrumb />
      </Container>

      {/* Hero Section */}
      <Container className="py-6 sm:py-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-ink text-cream">
          <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-clay/50 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-marigold/20 blur-3xl" />
          <div className="relative flex flex-col gap-8 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                <Flame className="h-4 w-4 text-marigold" />
                Hot deals{maxDiscount > 0 ? ` · up to ${maxDiscount}% off` : ""}
              </span>
              <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                This week&apos;s <span className="italic text-marigold">steals</span>
              </h1>
              <p className="mt-4 max-w-xl text-cream/70 sm:text-lg">
                Limited-time prices on hand-picked products. Once the timer
                runs out or stock is gone, they&apos;re gone.
              </p>
              <div className="mt-8 flex flex-wrap gap-8">
                <div>
                  <p className="font-display text-3xl">{totalProducts}</p>
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-cream/60">
                    <ShoppingBag className="h-3.5 w-3.5" /> Products on deal
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl">{avgDiscount.toFixed(0)}%</p>
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-cream/60">
                    <TrendingDown className="h-3.5 w-3.5" /> Average saving
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:flex-shrink-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
                <DealCountdown />
              </div>
            </div>
          </div>
        </section>
      </Container>

      {/* Products Section */}
      <Container className="py-8 sm:py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
              Limited stock
            </p>
            <Title className="font-display text-3xl font-normal text-ink sm:text-4xl">
              All deals
            </Title>
          </div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product: DEAL_PRODUCTSResult[0]) => (
              <div
                key={product?._id}
               
              >
                <ProductCard product={product as unknown as Product} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No Deals Available Right Now
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Check back soon for amazing deals and discounts!
                </p>
                <Button asChild>
                  <Link href="/shop">Browse All Products</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Container>

      {/* Call to Action */}
      <Container className="py-8 sm:py-12">
        <Card className="bg-gradient-to-r from-shop_dark_green to-shop_light_green text-white">
          <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
              Don&apos;t Miss Out on These Amazing Deals!
            </h2>
            <p className="text-sm sm:text-base text-white/90 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter to get notified about flash sales,
              exclusive deals, and new arrivals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/shop">Explore All Products</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-shop_dark_green w-full sm:w-auto"
              >
                Subscribe for Deals
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default DealPage;
