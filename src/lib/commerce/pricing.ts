import type { CartExtras, CartLine, Metal, Product, ShippingMethod, StoneOrigin, Tone, Totals, Variant } from "./types";
import { site } from "@/content/site";

/*
 * Pure pricing helpers. They run on the server (static pages, JSON-LD) and in the
 * browser (variant pickers, cart, checkout) and never touch the catalog file, so
 * client bundles stay small.
 */

export const metalLabel: Record<Metal, string> = {
  "14k-yellow": "14k Yellow Gold",
  "14k-white": "14k White Gold",
  "14k-rose": "14k Rose Gold",
  "18k-yellow": "18k Yellow Gold",
  platinum: "Platinum",
  sterling: "Sterling Silver",
};

export const metalShort: Record<Metal, string> = {
  "14k-yellow": "Yellow",
  "14k-white": "White",
  "14k-rose": "Rose",
  "18k-yellow": "18k",
  platinum: "Platinum",
  sterling: "Silver",
};

export const metalTone: Record<Metal, Tone> = {
  "14k-yellow": "yellow",
  "14k-white": "white",
  "14k-rose": "rose",
  "18k-yellow": "yellow",
  platinum: "white",
  sterling: "white",
};

/** Swatch colours (purely decorative; the label is always shown as text too). */
export const metalSwatch: Record<Metal, string> = {
  "14k-yellow": "linear-gradient(135deg,#f3dc9b,#c9a55c 55%,#8f6e2c)",
  "14k-white": "linear-gradient(135deg,#f4f4f2,#c9cacb 55%,#8e9092)",
  "14k-rose": "linear-gradient(135deg,#f6d2c2,#d39a83 55%,#9b6250)",
  "18k-yellow": "linear-gradient(135deg,#f7d98a,#d6a83f 55%,#94681c)",
  platinum: "linear-gradient(135deg,#f1f2f4,#b7bcc2 55%,#7b8188)",
  sterling: "linear-gradient(135deg,#f6f6f6,#cfd1d3 55%,#94979b)",
};

export const stoneLabel: Record<StoneOrigin, string> = { lab: "Lab-grown", natural: "Natural" };

export const RING_SIZES = Array.from({ length: 21 }, (_, i) => 3 + i * 0.5);

type PriceInput = Pick<Product, "price" | "sale" | "metalDelta" | "naturalDelta" | "lengths">;

const round5 = (n: number) => Math.round(n / 5) * 5;

export function metalDeltaFor(p: PriceInput, metal: Metal) {
  if (p.metalDelta && p.metalDelta[metal] !== undefined) return p.metalDelta[metal]!;
  if (metal === "18k-yellow") return round5(p.price * 0.2);
  if (metal === "platinum") return round5(p.price * 0.3);
  return 0;
}

/** Full (pre-sale) price of a variant. */
export function listPrice(p: PriceInput, v: Variant) {
  let price = p.price + metalDeltaFor(p, v.metal);
  if (v.stone === "natural") price += p.naturalDelta ?? 0;
  if (v.length && p.lengths) price += Math.max(0, p.lengths.indexOf(v.length)) * 30;
  return price;
}

export function variantPrice(p: PriceInput, v: Variant): { price: number; compareAt?: number } {
  const list = listPrice(p, v);
  if (!p.sale) return { price: list };
  return { price: round5(list * (1 - p.sale)), compareAt: list };
}

export function variantKey(v: Variant) {
  return [v.metal, v.size ?? "", v.length ?? "", v.stone ?? ""].join("|");
}

export function variantLabel(v: Variant) {
  return [
    metalLabel[v.metal],
    v.stone ? `${stoneLabel[v.stone]} stone` : null,
    v.size ? `Size ${v.size}` : null,
    v.length ? `${v.length}″ chain` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Deterministic mock stock: mostly healthy, a few "only N left", the odd sold-out size. */
export function variantStock(p: Pick<Product, "slug" | "soldOut">, v: Variant) {
  if (p.soldOut) return 0;
  const h = hash(p.slug + variantKey(v)) % 23;
  if (h === 0 && v.size) return 0;
  if (h < 4) return 1 + (h % 2);
  return 3 + (h % 9);
}

export function defaultVariant(p: Pick<Product, "metals" | "ringSizes" | "lengths" | "stones">): Variant {
  return {
    metal: p.metals[0],
    size: p.ringSizes ? 6.5 : undefined,
    length: p.lengths ? p.lengths[Math.min(1, p.lengths.length - 1)] : undefined,
    stone: p.stones ? p.stones[0] : undefined,
  };
}

/** Lowest price across metals and stones (for "from $X" on cards). */
export function fromPrice(p: Product) {
  return variantPrice(p, { metal: p.metals[0], stone: p.stones?.[0], length: p.lengths?.[0] });
}

export const shippingMethods: ShippingMethod[] = [
  { id: "standard", name: "Insured standard", price: 12, days: [3, 5], note: "Fully insured, signature on delivery" },
  { id: "express", name: "Insured express", price: 28, days: [2, 2], note: "Fully insured, signature on delivery" },
  { id: "overnight", name: "Priority overnight", price: 45, days: [1, 1], note: "Order by 2 pm CT, Tue–Fri" },
  { id: "pickup", name: "Pick up at the showroom", price: 0, days: [1, 2], note: "Knox-Henderson, Dallas · ready in 1–2 days" },
];

export const TAX_RATES: Record<string, number> = { TX: 0.0825, OK: 0.0895, CA: 0.0725, NY: 0.08875, FL: 0.07, IL: 0.0825 };

export function isPromoValid(code?: string) {
  return !!code && code.trim().toUpperCase() === site.promo.code;
}

export function computeTotals(lines: CartLine[], extras: CartExtras, opts: { shippingId?: string; state?: string } = {}): Totals {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const discount = isPromoValid(extras.promo) ? Math.round(subtotal * (site.promo.percent / 100)) : 0;
  const engraving = lines.reduce((s, l) => s + (l.engraving ? site.engravingPrice * l.qty : 0), 0);
  const merch = subtotal - discount;
  const freeShip = merch >= site.freeShippingOver;
  const method = shippingMethods.find((m) => m.id === (opts.shippingId ?? "standard")) ?? shippingMethods[0];
  let shipping = lines.length === 0 ? 0 : method.price;
  if (method.id === "standard" && freeShip) shipping = 0;
  if (method.id === "express" && freeShip) shipping = 16;
  const rate = opts.state ? (TAX_RATES[opts.state] ?? 0.07) : 0;
  const tax = Math.round((merch + engraving) * rate * 100) / 100;
  return {
    subtotal,
    discount,
    shipping,
    engraving,
    tax,
    total: Math.round((merch + engraving + shipping + tax) * 100) / 100,
    freeShippingRemaining: Math.max(0, site.freeShippingOver - merch),
  };
}

export function formatPrice(n: number, opts: { cents?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  }).format(n);
}
