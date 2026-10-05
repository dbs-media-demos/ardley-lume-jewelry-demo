import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageTransition } from "@/components/layout/PageTransition";
import { WishlistView } from "@/components/shop/WishlistView";

export const metadata: Metadata = buildMetadata({ title: "Wishlist", description: "Your saved pieces.", path: "/wishlist", noindex: true });

export default function WishlistPage() {
  return (
    <PageTransition>
      <div className="wrap pt-28 pb-24 md:pt-36">
        <p className="eyebrow text-gold-ink">Saved for later</p>
        <h1 className="mt-3 mb-10 font-display text-[clamp(2.8rem,6vw,5rem)] leading-none">Wishlist</h1>
        <WishlistView />
      </div>
    </PageTransition>
  );
}
