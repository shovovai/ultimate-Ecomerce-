import type { Metadata } from "next";
import Container from "@/components/Container";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <Container className="py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Your basket</p>
      <h1 className="mb-8 mt-2 font-display text-4xl text-ink">Shopping cart</h1>
      <CartView />
    </Container>
  );
}
