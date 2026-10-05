import type { Metal, StoneOrigin } from "@/lib/commerce/types";

export type Setting = "solitaire" | "halo" | "three-stone" | "bezel";
export type Shape = "round" | "oval" | "emerald" | "pear";

export const SETTINGS: { id: Setting; name: string; blurb: string; price: number }[] = [
  { id: "solitaire", name: "Solitaire", blurb: "Six slim claws. Nothing between you and the stone.", price: 1200 },
  { id: "halo", name: "Halo", blurb: "A frame of micro-pavé that makes the centre read larger.", price: 1650 },
  { id: "three-stone", name: "Three-stone", blurb: "Two side stones: past, present and future.", price: 1950 },
  { id: "bezel", name: "Bezel", blurb: "A smooth rim of metal. Modern, protective, snag-free.", price: 1350 },
];

export const SHAPES: { id: Shape; name: string; factor: number }[] = [
  { id: "round", name: "Round", factor: 1 },
  { id: "oval", name: "Oval", factor: 0.92 },
  { id: "emerald", name: "Emerald", factor: 0.88 },
  { id: "pear", name: "Pear", factor: 0.9 },
];

export const CARATS = [0.5, 1, 1.5, 2, 3] as const;

/** Indicative stone prices (USD) for an F–G / VS, excellent-cut round. */
const STONE: Record<StoneOrigin, Record<number, number>> = {
  lab: { 0.5: 650, 1: 1400, 1.5: 2300, 2: 3300, 3: 5600 },
  natural: { 0.5: 1900, 1: 6200, 1.5: 11000, 2: 17500, 3: 34000 },
};

export const BUILDER_METALS: Metal[] = ["14k-yellow", "14k-white", "14k-rose", "18k-yellow", "platinum"];
const METAL_ADD: Partial<Record<Metal, number>> = { "18k-yellow": 350, platinum: 550 };

export type Build = { setting: Setting; shape: Shape; carat: number; stone: StoneOrigin; metal: Metal; size: number };

export function buildPrice(b: Build) {
  const setting = SETTINGS.find((s) => s.id === b.setting)!.price;
  const shape = SHAPES.find((s) => s.id === b.shape)!.factor;
  const stone = Math.round((STONE[b.stone][b.carat] * shape) / 5) * 5;
  const metal = METAL_ADD[b.metal] ?? 0;
  return { setting, stone, metal, total: setting + stone + metal };
}

export const defaultBuild: Build = { setting: "solitaire", shape: "round", carat: 1, stone: "lab", metal: "14k-yellow", size: 6 };
