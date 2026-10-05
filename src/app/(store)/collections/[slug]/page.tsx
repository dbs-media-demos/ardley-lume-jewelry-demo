import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalog } from "@/lib/commerce";
import type { CollectionSlug } from "@/lib/commerce/types";
import { toCard } from "@/lib/cards";
import { buildMetadata } from "@/lib/seo";
import { ShopShell } from "@/components/shop/ShopShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { Coverflow } from "@/components/shop/Coverflow";
import { Countdown } from "@/components/shop/SaleFlips";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { JsonLd } from "@/components/ui/JsonLd";
import { itemListSchema } from "@/lib/schema";
import { img } from "@/lib/images";

export async function generateStaticParams() {
  return (await catalog.getCollections()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const res = await catalog.getCollection(slug as CollectionSlug);
  if (!res) return {};
  return buildMetadata({ title: res.collection.name, description: res.collection.blurb, path: `/collections/${slug}`, eyebrow: "Collection", image: img(res.collection.image).src });
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const res = await catalog.getCollection(slug as CollectionSlug);
  if (!res) notFound();
  const { collection, products } = res;
  const cards = products.map(toCard);
  const flow = slug === "on-sale" || slug === "gift-edit";

  const feature = flow ? (
    <section data-dark className="relative overflow-hidden bg-ink py-16 text-ivory md:py-20" aria-label={`${collection.name}, at a glance`}>
      <AmbientVideo src="/video/sparkle.mp4" poster="/video/sparkle-poster.jpg" label="Loose diamonds sparkling on black" className="absolute inset-0 size-full opacity-35" />
      <div className="wrap relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-gold-pale">{slug === "on-sale" ? "Ends October 31 · same warranty, same box" : "Gift-boxed with a handwritten note"}</p>
          <p className="mt-3 max-w-xl font-display text-[clamp(2rem,4vw,3.6rem)] leading-[1.02]">
            {slug === "on-sale" ? "Quietly reduced. Drag through them." : "Small boxes, long memories. Drag through them."}
          </p>
        </div>
        {slug === "on-sale" && <Countdown />}
      </div>
      <div className="relative mt-10">
        <Coverflow items={cards} label={collection.name} />
      </div>
    </section>
  ) : null;

  return (
    <PageTransition>
      <ShopShell
        eyebrow={`Collection · ${products.length} pieces`}
        title={collection.name}
        intro={collection.blurb}
        crumbs={[
          { name: "Shop", path: "/shop" },
          { name: collection.name, path: `/collections/${slug}` },
        ]}
        cards={cards}
        current={slug}
        facetCategories
        feature={feature}
      />
      <JsonLd data={itemListSchema(collection.name, products)} />
    </PageTransition>
  );
}
