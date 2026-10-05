import type { CardData } from "@/lib/card-types";
import type { CategorySlug, Tone } from "@/lib/commerce/types";
import { metalTone } from "@/lib/commerce/pricing";

/*
 * Shop filters, kept in the URL (?cat=rings&metal=yellow&stone=diamond&price=500-1000&sale=1&sort=price-asc)
 * so any filtered view can be shared or bookmarked.
 */

export type Filters = {
  cat: CategorySlug[];
  metal: (Tone | "platinum")[];
  stone: string[];
  price: string | null;
  sale: boolean;
  instock: boolean;
  sort: string;
};

export const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Best rated" },
];

export const PRICE_BANDS = [
  { id: "0-500", label: "Under $500", min: 0, max: 500 },
  { id: "500-1000", label: "$500–$1,000", min: 500, max: 1000 },
  { id: "1000-2500", label: "$1,000–$2,500", min: 1000, max: 2500 },
  { id: "2500-up", label: "$2,500+", min: 2500, max: Infinity },
];

export const METAL_FACETS: { id: Tone | "platinum"; label: string; swatch: string }[] = [
  { id: "yellow", label: "Yellow gold", swatch: "linear-gradient(135deg,#f3dc9b,#c9a55c 55%,#8f6e2c)" },
  { id: "white", label: "White gold & silver", swatch: "linear-gradient(135deg,#f4f4f2,#c9cacb 55%,#8e9092)" },
  { id: "rose", label: "Rose gold", swatch: "linear-gradient(135deg,#f6d2c2,#d39a83 55%,#9b6250)" },
  { id: "platinum", label: "Platinum", swatch: "linear-gradient(135deg,#f1f2f4,#b7bcc2 55%,#7b8188)" },
];

export const STONE_FACETS = [
  { id: "diamond", label: "Diamond" },
  { id: "pearl", label: "Pearl" },
  { id: "colour", label: "Coloured stone" },
  { id: "none", label: "Pure gold" },
];

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function parseFilters(sp: URLSearchParams): Filters {
  return {
    cat: list(sp.get("cat")) as CategorySlug[],
    metal: list(sp.get("metal")) as Filters["metal"],
    stone: list(sp.get("stone")),
    price: sp.get("price"),
    sale: sp.get("sale") === "1",
    instock: sp.get("instock") === "1",
    sort: sp.get("sort") ?? "featured",
  };
}

export function toQuery(f: Filters, q?: string) {
  const sp = new URLSearchParams();
  if (f.cat.length) sp.set("cat", f.cat.join(","));
  if (f.metal.length) sp.set("metal", f.metal.join(","));
  if (f.stone.length) sp.set("stone", f.stone.join(","));
  if (f.price) sp.set("price", f.price);
  if (f.sale) sp.set("sale", "1");
  if (f.instock) sp.set("instock", "1");
  if (f.sort !== "featured") sp.set("sort", f.sort);
  if (q) sp.set("q", q);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const activeCount = (f: Filters) => f.cat.length + f.metal.length + f.stone.length + (f.price ? 1 : 0) + (f.sale ? 1 : 0) + (f.instock ? 1 : 0);

function matchesStone(c: CardData, s: string) {
  if (s === "colour") return ["emerald", "sapphire", "opal", "onyx"].includes(c.stone);
  return c.stone === s;
}

/** Visible slugs in display order. */
export function applyFilters(cards: CardData[], f: Filters): string[] {
  const band = PRICE_BANDS.find((b) => b.id === f.price);
  const out = cards.filter((c) => {
    if (f.cat.length && !f.cat.includes(c.category)) return false;
    if (f.metal.length && !f.metal.some((m) => (m === "platinum" ? c.metals.includes("platinum") : c.metals.some((x) => metalTone[x] === m && x !== "platinum")))) return false;
    if (f.stone.length && !f.stone.some((s) => matchesStone(c, s))) return false;
    if (band && (c.price < band.min || c.price >= band.max)) return false;
    if (f.sale && !c.sale) return false;
    if (f.instock && c.soldOut) return false;
    return true;
  });
  const sorted = [...out];
  switch (f.sort) {
    case "newest":
      sorted.sort((a, b) => b.added.localeCompare(a.added));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
  }
  return sorted.map((c) => c.slug);
}
