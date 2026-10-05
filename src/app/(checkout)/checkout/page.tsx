import type { Metadata } from "next";
import Link from "next/link";
import { Checkout } from "@/components/checkout/Checkout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Checkout", description: "Secure checkout.", path: "/checkout", noindex: true });

export default function CheckoutPage() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-none">Checkout</h1>
        <Link href="/cart" className="link-under text-sm text-taupe">
          ← Back to bag
        </Link>
      </div>
      <Checkout />
    </>
  );
}
