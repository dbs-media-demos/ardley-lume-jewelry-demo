import "server-only";
import type { Product } from "@/lib/commerce/types";
import { categoryBySlug } from "@/content/catalog";
import { img, productImg } from "@/lib/images";
import { fromPrice } from "@/lib/commerce/pricing";
import type { CardData, CardImg } from "@/lib/card-types";

const pick = (i: ReturnType<typeof img>): CardImg => ({ src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt });

/** Everything a product card / quick view needs, with images already resolved. */
export function toCard(p: Product): CardData {
  const { price, compareAt } = fromPrice(p);
  const tones = {
    yellow: pick(productImg(p, "yellow")),
    white: pick(productImg(p, "white")),
    rose: pick(productImg(p, "rose")),
  };
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    categoryName: categoryBySlug[p.category]?.name ?? "",
    short: p.short,
    price,
    compareAt,
    base: p.price,
    sale: p.sale,
    soldOut: p.soldOut,
    badges: p.badges ?? [],
    rating: p.rating,
    reviewCount: p.reviewCount,
    metals: p.metals,
    metalDelta: p.metalDelta,
    stones: p.stones,
    naturalDelta: p.naturalDelta,
    ringSizes: p.ringSizes,
    lengths: p.lengths,
    stone: p.stone,
    added: p.added,
    collections: p.collections,
    tones,
    model: pick(img(p.images.model)),
    scaleMm: p.scaleMm,
  };
}
