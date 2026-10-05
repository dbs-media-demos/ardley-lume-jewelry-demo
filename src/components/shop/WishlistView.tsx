"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/store";
import { useCatalog } from "@/lib/use-catalog";
import { ProductCard } from "./ProductCard";
import type { CardData } from "@/lib/card-types";

/** Saved pieces (stored in this browser). */
export function WishlistView() {
  const { slugs } = useWishlist();
  const catalog = useCatalog(true);
  if (!catalog) return <p className="text-taupe">Loading your saved pieces…</p>;
  const items = slugs.map((s) => catalog.find((c) => c.slug === s)).filter((c): c is CardData => !!c);
  if (!items.length)
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <p className="font-display text-4xl">Nothing saved yet.</p>
        <p className="mt-3 text-taupe">Tap the heart on any piece to keep it here. It&apos;s saved in this browser, no account needed.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-ink">
            Browse the collection
          </Link>
          <Link href="/collections/bestsellers" className="btn btn-ghost">
            See bestsellers
          </Link>
        </div>
      </div>
    );
  return (
    <>
      <p className="mb-8 text-taupe" role="status">
        {items.length} saved {items.length === 1 ? "piece" : "pieces"} · stored in this browser
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {items.map((c) => (
          <ProductCard key={c.slug} card={c} />
        ))}
      </div>
    </>
  );
}
