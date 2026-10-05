import type { Metadata } from "next";
import { CartContents } from "@/components/cart/CartContents";
import { PageTransition } from "@/components/layout/PageTransition";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Your bag", description: "Your Ardley & Lume bag.", path: "/cart", noindex: true });

export default function CartPage() {
  return (
    <PageTransition>
      <div className="wrap pt-28 pb-24 md:pt-36">
        <p className="eyebrow text-gold-ink">Free insured shipping over $250</p>
        <h1 className="mt-3 mb-10 font-display text-[clamp(2.8rem,6vw,5rem)] leading-none">Your bag</h1>
        <CartContents />
      </div>
    </PageTransition>
  );
}
