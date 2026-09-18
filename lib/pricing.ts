import "server-only";
import { backendClient } from "@/sanity/lib/backendClient";
import { calcShipping, calcTax, round2, storeConfig } from "@/lib/storeConfig";

// Single source of truth for order totals. Every price comes from Sanity —
// never from the browser — so totals cannot be tampered with.

export interface CartLineInput {
  productId: string;
  quantity: number;
}

export interface PricedLine {
  productId: string;
  name: string;
  slug?: string;
  image?: unknown;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
}

export interface AppliedCoupon {
  _id: string;
  code: string;
  discountType: "percent" | "fixed";
  value: number;
  amount: number;
}

export interface PricingResult {
  lines: PricedLine[];
  subtotal: number;
  businessDiscount: number;
  coupon: AppliedCoupon | null;
  couponError?: string;
  discountTotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

export class PricingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

interface CouponDoc {
  _id: string;
  code: string;
  discountType: "percent" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number;
  usedCount?: number;
  oncePerCustomer?: boolean;
  active?: boolean;
}

/** Accepts both `{productId, quantity}` and legacy cart items `{product: {_id}, quantity}` */
export function normalizeCartInput(items: unknown): CartLineInput[] {
  if (!Array.isArray(items)) return [];
  const merged = new Map<string, number>();
  for (const raw of items) {
    const item = raw as { productId?: string; product?: { _id?: string }; quantity?: number };
    const productId = item?.productId || item?.product?._id;
    const quantity = Math.floor(Number(item?.quantity));
    if (!productId || typeof productId !== "string" || !(quantity > 0)) continue;
    merged.set(productId, (merged.get(productId) || 0) + Math.min(quantity, 999));
  }
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}

export const normalizeCouponCode = (code: unknown) =>
  typeof code === "string" ? code.trim().toUpperCase().slice(0, 32) : "";

async function evaluateCoupon(
  code: string,
  eligibleAmount: number,
  customer: { clerkUserId?: string | null; email?: string | null }
): Promise<{ coupon: AppliedCoupon | null; error?: string }> {
  const doc = await backendClient.fetch<CouponDoc | null>(
    `*[_type == "coupon" && upper(code) == $code][0]`,
    { code }
  );
  if (!doc || doc.active === false) return { coupon: null, error: "This coupon code is not valid" };

  const now = Date.now();
  if (doc.startsAt && new Date(doc.startsAt).getTime() > now)
    return { coupon: null, error: "This coupon is not active yet" };
  if (doc.expiresAt && new Date(doc.expiresAt).getTime() < now)
    return { coupon: null, error: "This coupon has expired" };
  if (doc.usageLimit && (doc.usedCount || 0) >= doc.usageLimit)
    return { coupon: null, error: "This coupon has reached its usage limit" };
  if (doc.minOrderAmount && eligibleAmount < doc.minOrderAmount)
    return {
      coupon: null,
      error: `Spend at least ${doc.minOrderAmount} to use this coupon`,
    };

  if (doc.oncePerCustomer && (customer.clerkUserId || customer.email)) {
    const used = await backendClient.fetch<number>(
      `count(*[_type == "order" && upper(couponCode) == $code && status != "cancelled" && (clerkUserId == $uid || email == $email)])`,
      { code, uid: customer.clerkUserId || "", email: customer.email || "" }
    );
    if (used > 0) return { coupon: null, error: "You have already used this coupon" };
  }

  let amount =
    doc.discountType === "percent"
      ? (eligibleAmount * Math.min(doc.value, 100)) / 100
      : doc.value;
  if (doc.discountType === "percent" && doc.maxDiscountAmount) {
    amount = Math.min(amount, doc.maxDiscountAmount);
  }
  amount = round2(Math.min(amount, eligibleAmount));

  return {
    coupon: {
      _id: doc._id,
      code: doc.code.toUpperCase(),
      discountType: doc.discountType,
      value: doc.value,
      amount,
    },
  };
}

export async function priceCart(
  items: CartLineInput[],
  options: {
    couponCode?: string;
    clerkUserId?: string | null;
    email?: string | null;
    /** When true an invalid coupon throws instead of being reported */
    strictCoupon?: boolean;
  } = {}
): Promise<PricingResult> {
  if (items.length === 0) throw new PricingError("Your cart is empty");

  const products = await backendClient.fetch<
    { _id: string; name?: string; slug?: string; price?: number; stock?: number; image?: unknown }[]
  >(
    `*[_type == "product" && _id in $ids]{ _id, name, "slug": slug.current, price, stock, "image": images[0] }`,
    { ids: items.map((i) => i.productId) }
  );
  const byId = new Map(products.map((p) => [p._id, p]));

  const lines: PricedLine[] = items.map(({ productId, quantity }) => {
    const p = byId.get(productId);
    if (!p || typeof p.price !== "number") {
      throw new PricingError("One of the products in your cart is no longer available");
    }
    const stock = typeof p.stock === "number" ? p.stock : 0;
    if (stock <= 0) throw new PricingError(`"${p.name}" is out of stock`);
    if (quantity > stock) {
      throw new PricingError(`Only ${stock} of "${p.name}" left in stock`);
    }
    return {
      productId,
      name: p.name || "Product",
      slug: p.slug,
      image: p.image,
      unitPrice: p.price,
      quantity,
      lineTotal: round2(p.price * quantity),
      stock,
    };
  });

  const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));

  // Business account discount
  let businessDiscount = 0;
  if (options.clerkUserId || options.email) {
    const isBusiness = await backendClient.fetch<boolean>(
      `count(*[_type in ["user", "userType"] && isBusiness == true && (clerkUserId == $uid || email == $email)]) > 0`,
      { uid: options.clerkUserId || "", email: options.email || "" }
    );
    if (isBusiness) businessDiscount = round2(subtotal * storeConfig.businessDiscountRate);
  }

  const afterBusiness = round2(subtotal - businessDiscount);

  // Coupon
  let coupon: AppliedCoupon | null = null;
  let couponError: string | undefined;
  const code = normalizeCouponCode(options.couponCode);
  if (code) {
    const result = await evaluateCoupon(code, afterBusiness, {
      clerkUserId: options.clerkUserId,
      email: options.email,
    });
    coupon = result.coupon;
    couponError = result.error;
    if (!coupon && options.strictCoupon) throw new PricingError(couponError || "Invalid coupon");
  }

  const discountTotal = round2(businessDiscount + (coupon?.amount || 0));
  const discounted = round2(Math.max(0, subtotal - discountTotal));
  // Free-shipping threshold is judged on the pre-coupon amount
  const shipping = calcShipping(afterBusiness);
  const tax = calcTax(discounted);
  const total = round2(discounted + shipping + tax);

  return {
    lines,
    subtotal,
    businessDiscount,
    coupon,
    couponError,
    discountTotal,
    shipping,
    tax,
    total,
    currency: storeConfig.currency,
  };
}
