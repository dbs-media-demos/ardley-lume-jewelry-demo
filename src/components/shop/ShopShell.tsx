import { Suspense, type ReactNode } from "react";
import type { CardData } from "@/lib/card-types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LetterTitle } from "@/components/ui/LetterTitle";
import { CategoryRail } from "./CategoryRail";
import { Catalog } from "./Catalog";
import { OfferMarquee } from "./OfferMarquee";
import { ProductCard } from "./ProductCard";
import { categories } from "@/content/catalog";
import { img } from "@/lib/images";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  crumbs: { name: string; path: string }[];
  cards: CardData[];
  current?: string;
  facetCategories?: boolean;
  /** Extra band between the header and the grid (sale coverflow, countdown…). */
  feature?: ReactNode;
  /** Band after the grid. */
  after?: ReactNode;
};

function pick(key: string) {
  const i = img(key);
  return { src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt };
}

/** Shared layout for /shop, category and collection pages. */
export function ShopShell({ eyebrow, title, intro, crumbs, cards, current, facetCategories, feature, after }: Props) {
  const rail = [
    { slug: "all", name: "Everything", img: pick("still-stone"), href: "/shop" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name, img: pick(c.image), href: `/shop/${c.slug}` })),
    { slug: "on-sale", name: "On sale now", img: pick("still-water"), href: "/collections/on-sale" },
    { slug: "gift-edit", name: "Gifts under $500", img: pick("gift-box"), href: "/collections/gift-edit" },
  ];
  return (
    <>
      <div className="pt-[4.5rem]">
        <OfferMarquee />
      </div>
      <section className="wrap pt-10 pb-6 md:pt-14" aria-labelledby="shop-title">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="eyebrow rise text-gold-ink">{eyebrow}</p>
            <div id="shop-title">
              <LetterTitle text={title} className="mt-3 text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] tracking-[-0.03em]" />
            </div>
          </div>
          <p className="rise max-w-md text-taupe md:justify-self-end" style={{ ["--d" as string]: "0.25s" }}>
            {intro}
          </p>
        </div>
        <div className="rise mt-8" style={{ ["--d" as string]: "0.35s" }}>
          <CategoryRail items={rail} current={current ?? "all"} />
        </div>
      </section>
      {feature}
      <section className="wrap pb-24" aria-label="Products">
        <Suspense
          fallback={
            <div className="mt-[4.6rem] grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((c, i) => (
                <ProductCard key={c.slug} card={c} priority={i < 2} />
              ))}
            </div>
          }
        >
          <Catalog cards={cards} categories={facetCategories ? categories.map((c) => ({ slug: c.slug, name: c.name })) : undefined} />
        </Suspense>
      </section>
      {after}
    </>
  );
}
