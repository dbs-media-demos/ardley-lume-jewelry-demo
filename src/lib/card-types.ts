import type { CategorySlug, CollectionSlug, Metal, StoneFacet, StoneOrigin, Tone } from "@/lib/commerce/types";

export type CardImg = { src: string; blur: string; w: number; h: number; alt: string };

/** The serialisable product summary shared by cards, quick view, search and cross-sells. */
export type CardData = {
  slug: string;
  name: string;
  category: CategorySlug;
  categoryName: string;
  short: string;
  price: number;
  compareAt?: number;
  base: number;
  sale?: number;
  soldOut?: boolean;
  badges: ("new" | "bestseller")[];
  rating: number;
  reviewCount: number;
  metals: Metal[];
  metalDelta?: Partial<Record<Metal, number>>;
  stones?: StoneOrigin[];
  naturalDelta?: number;
  ringSizes?: boolean;
  lengths?: number[];
  stone: StoneFacet;
  added: string;
  collections: CollectionSlug[];
  tones: Record<Tone, CardImg>;
  model: CardImg;
  scaleMm: number;
};

/** CardData has every field the pricing helpers need. */
export const asPriceInput = (c: CardData) => ({
  price: c.base,
  sale: c.sale,
  metalDelta: c.metalDelta,
  naturalDelta: c.naturalDelta,
  lengths: c.lengths,
});
