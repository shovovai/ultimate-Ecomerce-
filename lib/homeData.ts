import "server-only";
import { backendClient } from "@/sanity/lib/backendClient";
import type { Category, Product } from "@/sanity.types";

// Home page sections refresh every 5 minutes
const CACHE = { next: { revalidate: 300, tags: ["products", "homepage"] } };

async function safeFetch<T>(query: string, fallback: T, params: Record<string, unknown> = {}): Promise<T> {
  try {
    return (await backendClient.fetch<T>(query, params, CACHE)) ?? fallback;
  } catch (error) {
    console.error("Home data fetch failed:", error);
    return fallback;
  }
}

/** Hot or discounted products that are still in stock, biggest discount first */
export const getFlashDeals = () =>
  safeFetch<Product[]>(
    `*[_type == "product" && (status == "hot" || (discount > 0 && discount < 100)) && !(stock == 0)]
      | order(discount desc, _updatedAt desc)[0...10]`,
    []
  );

/** Best-rated products (4+ stars) */
export const getTopRated = () =>
  safeFetch<Product[]>(
    `*[_type == "product" && averageRating >= 4] | order(averageRating desc, totalReviews desc)[0...10]`,
    []
  );

/** Featured products picked in the admin panel */
export const getEditorsPicks = () =>
  safeFetch<Product[]>(`*[_type == "product" && isFeatured == true] | order(_updatedAt desc)[0...10]`, []);

export interface CategoryShelf {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: Category["image"];
  productCount: number;
  products: Product[];
}

/** The busiest categories, each with its newest products */
export async function getCategoryShelves(limit = 3): Promise<CategoryShelf[]> {
  const shelves = await safeFetch<CategoryShelf[]>(
    `*[_type == "category" && defined(slug.current)]{
      _id, title, "slug": slug.current, description, image,
      "productCount": count(*[_type == "product" && references(^._id)]),
      "products": *[_type == "product" && references(^._id)] | order(_createdAt desc)[0...8]
    }`,
    []
  );
  return shelves
    .filter((s) => s.title && s.products?.length >= 2)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, limit);
}

export interface HomeReview {
  _id: string;
  rating: number;
  title?: string;
  content: string;
  isVerifiedPurchase?: boolean;
  firstName?: string;
  lastName?: string;
  product?: { name?: string; slug?: string; image?: NonNullable<Product["images"]>[number] };
}

/** Latest approved 4-5 star reviews with some text */
export const getHomeReviews = () =>
  safeFetch<HomeReview[]>(
    `*[_type == "review" && status == "approved" && rating >= 4 && length(content) > 20]
      | order(createdAt desc)[0...6]{
        _id, rating, title, content, isVerifiedPurchase,
        "firstName": user->firstName, "lastName": user->lastName,
        "product": product->{ name, "slug": slug.current, "image": images[0] }
      }`,
    []
  );
