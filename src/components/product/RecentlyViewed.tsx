"use client";

import { useRecent } from "@/lib/store";
import { useCatalog } from "@/lib/use-catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import type { CardData } from "@/lib/card-types";

/** Pieces this visitor looked at before (stored locally), minus the current one. */
export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const { slugs } = useRecent();
  const wanted = slugs.filter((s) => s !== exclude).slice(0, 4);
  const catalog = useCatalog(wanted.length > 0);
  if (!wanted.length || !catalog) return null;
  const items = wanted.map((s) => catalog.find((c) => c.slug === s)).filter((c): c is CardData => !!c);
  if (!items.length) return null;
  return (
    <section className="wrap pb-24" aria-labelledby="recent-title">
      <h2 id="recent-title" className="font-display text-[clamp(1.8rem,3vw,2.6rem)]">
        Recently viewed
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
        {items.map((c) => (
          <ProductCard key={c.slug} card={c} />
        ))}
      </div>
    </section>
  );
}
