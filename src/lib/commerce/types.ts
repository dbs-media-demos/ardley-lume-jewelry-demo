/*
 * Commerce domain types.
 *
 * The UI only ever talks to these shapes. The demo fills them from a typed file
 * (`src/content/products.ts`) through `mock-provider.ts`; a real store would fill
 * them from Shopify's Storefront API or Stripe (see `provider.ts`).
 */

export type Metal = "14k-yellow" | "14k-white" | "14k-rose" | "18k-yellow" | "platinum" | "sterling";
export type Tone = "yellow" | "white" | "rose";
export type StoneOrigin = "lab" | "natural";

export type CategorySlug = "rings" | "engagement" | "wedding-bands" | "earrings" | "necklaces" | "bracelets";
export type CollectionSlug = "new-in" | "bestsellers" | "gift-edit" | "on-sale" | "everyday-gold" | "bridal";
export type StoneFacet = "diamond" | "pearl" | "emerald" | "sapphire" | "opal" | "onyx" | "none";

export type Review = {
  name: string;
  city: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string; // ISO
  title: string;
  body: string;
  variant?: string;
};

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  /** Base price in USD for the default variant (first metal, lab stone, first length). */
  price: number;
  /** Sale: fraction off (0.2 = 20% off). The original price becomes the compare-at price. */
  sale?: number;
  sku: string;
  metals: Metal[];
  /** Explicit price deltas per metal; otherwise 18k is +20% and platinum +30%. */
  metalDelta?: Partial<Record<Metal, number>>;
  ringSizes?: boolean;
  lengths?: number[];
  /** Offered stone origins. Natural costs `naturalDelta` more. */
  stones?: StoneOrigin[];
  naturalDelta?: number;
  stone: StoneFacet;
  short: string;
  long: string[];
  specs: [string, string][];
  care: string;
  badges?: ("new" | "bestseller")[];
  soldOut?: boolean;
  collections: CollectionSlug[];
  pairs: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  /** Image keys from `src/content/images.ts`. The hero is recoloured per metal tone. */
  images: { hero: string; model: string; extra?: string[] };
  /** Real-world size of the piece, used by the "on the hand" scale view. */
  scaleMm: number;
  added: string; // ISO date, for "Newest"
};

export type Variant = {
  metal: Metal;
  size?: number;
  length?: number;
  stone?: StoneOrigin;
};

export type PricedVariant = Variant & {
  key: string;
  price: number;
  compareAt?: number;
  stock: number;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  plural: string;
  blurb: string;
  image: string;
};

export type Collection = {
  slug: CollectionSlug;
  name: string;
  blurb: string;
  image: string;
};

export type CartLine = {
  id: string; // product slug + variant key (+ "custom" for builder rings)
  slug: string;
  name: string;
  image: string; // resolved image src (tone-matched)
  variant: Variant;
  variantLabel: string;
  unitPrice: number;
  compareAt?: number;
  qty: number;
  /** Ring builder configuration, when the line is a custom ring. */
  custom?: { setting: string; shape: string; carat: number; metal: Metal; size: number; stone: StoneOrigin };
  engraving?: string;
};

export type CartExtras = {
  giftBox: boolean;
  giftNote: string;
  promo?: string;
};

export type Address = {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
};

export type ShippingMethod = { id: string; name: string; price: number; days: [number, number]; note: string };

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  engraving: number;
  tax: number;
  total: number;
  freeShippingRemaining: number;
};

export type Order = {
  number: string;
  email: string;
  lines: CartLine[];
  extras: CartExtras;
  address?: Address;
  pickup?: boolean;
  shipping: ShippingMethod;
  totals: Totals;
  placedAt: string;
  cardLast4: string;
  cardBrand: string;
};
