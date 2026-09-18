import Stripe from "stripe";

// Stripe is optional: stores can run on Cash on Delivery / SSLCommerz only.
// The client is created lazily so a missing STRIPE_SECRET_KEY never breaks
// the build or unrelated pages — only Stripe calls fail, with a clear error.
export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env to enable card payments."
    );
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
  });
  return client;
}

// Backwards-compatible default export: `stripe.checkout...` resolves lazily
const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export default stripe;
