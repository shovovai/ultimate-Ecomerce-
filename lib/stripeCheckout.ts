import "server-only";
import { getStripeClient } from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { brand } from "@/config/brand";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";

const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export class CheckoutError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface PayableOrder {
  _id: string;
  orderNumber: string;
  email?: string;
  clerkUserId?: string;
  status?: string;
  paymentStatus?: string;
  totalPrice?: number;
  currency?: string;
  customerName?: string;
  address?: { name?: string; address?: string; city?: string; state?: string; zip?: string };
  phone?: string;
}

/** Loads an order that belongs to the given user and can still be paid */
export async function loadPayableOrder(orderId: string, clerkUserId: string): Promise<PayableOrder> {
  const order = await backendClient.fetch<PayableOrder | null>(
    `*[_type == "order" && _id == $orderId && clerkUserId == $clerkUserId][0]{
      _id, orderNumber, email, clerkUserId, status, paymentStatus,
      totalPrice, currency, customerName, address, phone
    }`,
    { orderId, clerkUserId }
  );
  if (!order) throw new CheckoutError("Order not found", 404);
  if (order.paymentStatus === PAYMENT_STATUSES.PAID || order.status === ORDER_STATUSES.PAID) {
    throw new CheckoutError("This order is already paid");
  }
  if (order.status === ORDER_STATUSES.CANCELLED) {
    throw new CheckoutError("This order was cancelled");
  }
  if (!order.totalPrice || order.totalPrice <= 0) {
    throw new CheckoutError("Invalid order total");
  }
  return order;
}

/**
 * Creates a Stripe Checkout session for exactly the order total stored in Sanity
 * (discounts, shipping and tax included). Returns the hosted payment URL.
 */
export async function createStripeSessionForOrder(order: PayableOrder): Promise<string> {
  const stripe = await getStripeClient();
  const currency = (order.currency || "USD").toUpperCase();
  const unitAmount = ZERO_DECIMAL.has(currency)
    ? Math.round(order.totalPrice!)
    : Math.round(order.totalPrice! * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: `${brand.name} order ${order.orderNumber}`,
            description: "Items, shipping and tax",
          },
        },
      },
    ],
    customer_email: order.email || undefined,
    customer_creation: "always",
    invoice_creation: { enabled: true },
    success_url: `${brand.url}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}&orderNumber=${encodeURIComponent(order.orderNumber)}`,
    cancel_url: `${brand.url}/user/orders/${order._id}?cancelled=true`,
    metadata: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      expectedAmount: String(unitAmount),
    },
  });

  await backendClient
    .patch(order._id)
    .set({ stripeCheckoutSessionId: session.id })
    .commit()
    .catch(() => {});

  if (!session.url) throw new CheckoutError("Stripe did not return a payment URL", 502);
  return session.url;
}
