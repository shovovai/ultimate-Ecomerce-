import "server-only";
import { PAYMENT_METHODS } from "@/lib/orderStatus";

export const isSslCommerzConfigured = () =>
  Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD);

/** Payment methods customers can pick at checkout, based on what is configured in .env */
export function availablePaymentMethods(): string[] {
  const methods: string[] = [PAYMENT_METHODS.CASH_ON_DELIVERY];
  if (process.env.STRIPE_SECRET_KEY) methods.push(PAYMENT_METHODS.STRIPE);
  if (isSslCommerzConfigured()) methods.push(PAYMENT_METHODS.SSLCOMMERZ);
  return methods;
}
