import type { Metadata } from "next";
import Link from "next/link";
import { catalog } from "@/lib/commerce";
import { toCard } from "@/lib/cards";
import { buildMetadata } from "@/lib/seo";
import { ShopShell } from "@/components/shop/ShopShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { SaleFlips, Countdown } from "@/components/shop/SaleFlips";
import { Coverflow } from "@/components/shop/Coverflow";
import { JsonLd } from "@/components/ui/JsonLd";
import { itemListSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Shop fine jewelry",
  description:
    "Engagement rings, wedding bands, gold rings, earrings, necklaces and bracelets, made at our Dallas bench in recycled gold. Free insured shipping over $250.",
  path: "/shop",
  eyebrow: "The collection",
});

export default async function ShopPage() {
  const [products, sale, gifts] = await Promise.all([catalog.getProducts(), catalog.getCollection("on-sale"), catalog.getCollection("gift-edit")]);
  const cards = products.map(toCard);
  return (
    <PageTransition>
      <ShopShell
        eyebrow={`${products.length} pieces · made in Dallas`}
        title="The collection"
        intro="Every piece in recycled solid gold or platinum, made at our bench and shipped insured. Filter by metal, stone or price and the grid rearranges itself."
        crumbs={[{ name: "Shop", path: "/shop" }]}
        cards={cards}
        facetCategories
        after={
          <>
            <section data-dark className="bg-oxblood py-20 text-ivory md:py-28" aria-labelledby="sale-title">
              <div className="wrap">
                <div className="flex flex-wrap items-end justify-between gap-8">
                  <div>
                    <p className="eyebrow text-gold-pale">On sale now · ends Oct 31</p>
                    <h2 id="sale-title" className="mt-3 font-display text-[clamp(2.4rem,5vw,4.6rem)]">
                      Turn them over.
                    </h2>
                    <p className="mt-3 max-w-md text-ivory/85">
                      Studio samples and last-of-the-run pieces, quietly reduced. Hover or tap a card for the saving and its hallmark.
                    </p>
                  </div>
                  <Countdown />
                </div>
                <div className="mt-12">
                  <SaleFlips items={(sale?.products ?? []).map(toCard)} />
                </div>
                <Link href="/collections/on-sale" className="btn btn-ghost-light mt-10">
                  See the whole sale
                </Link>
              </div>
            </section>
            <section data-dark className="overflow-hidden bg-forest py-20 text-ivory md:py-28" aria-labelledby="gift-title">
              <div className="wrap">
                <p className="eyebrow text-gold-pale">The Gift Edit</p>
                <h2 id="gift-title" className="mt-3 font-display text-[clamp(2.4rem,5vw,4.6rem)]">
                  Everything under $500.
                </h2>
              </div>
              <div className="mt-10">
                <Coverflow items={(gifts?.products ?? []).map(toCard)} label="The Gift Edit" />
              </div>
            </section>
          </>
        }
      />
      <JsonLd data={itemListSchema("All jewelry", products)} />
    </PageTransition>
  );
}
