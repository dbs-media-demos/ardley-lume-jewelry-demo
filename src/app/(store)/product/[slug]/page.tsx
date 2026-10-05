import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { catalog } from "@/lib/commerce";
import { img, productImg } from "@/lib/images";
import { toCard } from "@/lib/cards";
import { buildMetadata } from "@/lib/seo";
import { productSchema } from "@/lib/schema";
import { categoryBySlug } from "@/content/catalog";
import { site } from "@/content/site";
import { fromPrice, formatPrice } from "@/lib/commerce/pricing";
import { PageTransition } from "@/components/layout/PageTransition";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { ProductView } from "@/components/product/ProductView";
import { ReviewsBlock } from "@/components/product/ReviewsBlock";
import { PairsRail } from "@/components/product/PairsRail";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

const pick = (i: ReturnType<typeof img>) => ({ src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt });

export async function generateStaticParams() {
  return (await catalog.getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await catalog.getProduct(slug);
  if (!p) return {};
  const { price } = fromPrice(p);
  return buildMetadata({
    title: `${p.name} · ${categoryBySlug[p.category]?.name}`,
    description: `${p.short} From ${formatPrice(price)}. Made in Dallas, free insured shipping over $250, 30-day returns.`,
    path: `/product/${p.slug}`,
    eyebrow: formatPrice(price),
    image: img(p.images.hero).src,
  });
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = await catalog.getProduct(slug);
  if (!p) notFound();
  const all = await catalog.getProducts();
  const category = categoryBySlug[p.category];
  const pairs = p.pairs.map((s) => all.find((x) => x.slug === s)).filter((x): x is (typeof all)[number] => !!x);

  const heroes = { yellow: pick(productImg(p, "yellow")), white: pick(productImg(p, "white")), rose: pick(productImg(p, "rose")) };
  const rest = [pick(img(p.images.model)), ...(p.images.extra ?? []).map((k) => pick(img(k)))];

  return (
    <PageTransition>
      <div className="wrap pt-24 pb-8 md:pt-28">
        <ProductView
          product={p}
          categoryName={category?.name ?? ""}
          heroes={heroes}
          rest={rest}
          hand={pick(img("hand-scale-a"))}
          breadcrumbs={
            <Breadcrumbs
              items={[
                { name: "Shop", path: "/shop" },
                { name: category?.plural ?? "", path: `/shop/${p.category}` },
                { name: p.name, path: `/product/${p.slug}` },
              ]}
            />
          }
        />
      </div>

      <section className="wrap grid gap-12 py-16 lg:grid-cols-[1fr_1.2fr]" aria-labelledby="details-title">
        <div>
          <p className="eyebrow text-gold-ink">The details</p>
          <h2 id="details-title" className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)]">
            How it&apos;s made
          </h2>
          <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {p.specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-3 text-sm">
                <dt className="spec text-taupe">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[9rem_1fr] gap-4 py-3 text-sm">
              <dt className="spec text-taupe">SKU</dt>
              <dd>{p.sku}</dd>
            </div>
          </dl>
        </div>
        <Accordion
          items={[
            {
              title: "About this piece",
              body: (
                <div className="space-y-3">
                  {p.long.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                </div>
              ),
            },
            { title: "Materials & care", body: <p>{p.care} Every piece is covered by our lifetime warranty against manufacturing defects.</p> },
            {
              title: "Shipping & returns",
              body: (
                <div className="space-y-3">
                  <p>
                    Free insured shipping on orders over ${site.freeShippingOver}, signature on delivery. In-stock pieces ship in 1–2 business days; engagement rings and diamond bands are made to order in about two to three weeks.
                  </p>
                  <p>
                    Returns are free within {site.returnDays} days (engraved and custom pieces excepted), and resizing is free for {site.resizeDays} days.{" "}
                    <Link href="/shipping-returns" className="link-under">
                      Full policy
                    </Link>
                  </p>
                </div>
              ),
            },
            {
              title: "Gift options & engraving",
              body: <p>Every order arrives in our oak ring box with a handwritten note at no charge. Add hand engraving in your bag for ${site.engravingPrice}; you&apos;ll see a live preview on the band.</p>,
            },
          ]}
        />
      </section>

      <ReviewsBlock product={p} />
      <PairsRail items={pairs.map(toCard)} title="Pairs well with" />
      <RecentlyViewed exclude={p.slug} />
      <JsonLd data={productSchema(p)} />
    </PageTransition>
  );
}
