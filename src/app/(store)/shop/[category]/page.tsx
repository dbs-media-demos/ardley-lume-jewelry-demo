import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalog } from "@/lib/commerce";
import type { CategorySlug } from "@/lib/commerce/types";
import { toCard } from "@/lib/cards";
import { buildMetadata } from "@/lib/seo";
import { ShopShell } from "@/components/shop/ShopShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { JsonLd } from "@/components/ui/JsonLd";
import { itemListSchema } from "@/lib/schema";
import { img } from "@/lib/images";

export async function generateStaticParams() {
  return (await catalog.getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = await catalog.getCategory(category as CategorySlug);
  if (!c) return {};
  return buildMetadata({ title: `${c.plural} in recycled gold`, description: c.blurb, path: `/shop/${c.slug}`, eyebrow: "Ardley & Lume · Dallas", image: img(c.image).src });
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const c = await catalog.getCategory(category as CategorySlug);
  if (!c) notFound();
  const products = (await catalog.getProducts()).filter((p) => p.category === c.slug);
  return (
    <PageTransition>
      <ShopShell
        eyebrow={`${products.length} pieces`}
        title={c.plural}
        intro={c.blurb}
        crumbs={[
          { name: "Shop", path: "/shop" },
          { name: c.plural, path: `/shop/${c.slug}` },
        ]}
        cards={products.map(toCard)}
        current={c.slug}
      />
      <JsonLd data={itemListSchema(c.plural, products)} />
    </PageTransition>
  );
}
