"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import clsx from "clsx";
import { Sheet } from "@/components/ui/Sheet";
import { ui, useUi } from "@/lib/store";
import { useCatalog } from "@/lib/use-catalog";
import type { CardData } from "@/lib/card-types";
import { asPriceInput } from "@/lib/card-types";
import type { Variant } from "@/lib/commerce/types";
import {
  defaultVariant,
  formatPrice,
  metalLabel,
  metalSwatch,
  metalTone,
  RING_SIZES,
  stoneLabel,
  variantKey,
  variantLabel,
  variantPrice,
  variantStock,
} from "@/lib/commerce/pricing";
import { addToCart } from "@/lib/add-to-cart";
import { Stars } from "@/components/ui/Stars";

/** Quick view: pick the variant and add to bag without leaving the grid. */
export function QuickView() {
  const { quickView } = useUi();
  const catalog = useCatalog(true);
  const card = catalog?.find((c) => c.slug === quickView) ?? null;
  return (
    <Sheet open={!!quickView && !!card} onClose={ui.closeQuickView} label={card ? `Quick view: ${card.name}` : "Quick view"} side="center">
      {card && <Body key={card.slug} c={card} />}
    </Sheet>
  );
}

function Body({ c }: { c: CardData }) {
  const [v, setV] = useState<Variant>({ ...defaultVariant(c), size: undefined });
  const [err, setErr] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const tone = metalTone[v.metal];
  const { price, compareAt } = variantPrice(asPriceInput(c), v);
  const stock = variantStock(c, { ...v, size: v.size ?? 6.5 });

  const add = () => {
    if (c.ringSizes && v.size === undefined) return setErr(true);
    addToCart(
      { id: `${c.slug}|${variantKey(v)}`, slug: c.slug, name: c.name, image: c.tones[tone].src, variant: v, variantLabel: variantLabel(v), unitPrice: price, compareAt, qty: 1 },
      imgRef.current,
    );
    ui.closeQuickView();
  };

  return (
    <div className="grid max-h-[92dvh] overflow-y-auto md:max-h-[86vh] md:grid-cols-2">
      <div ref={imgRef} className="relative aspect-[4/5] bg-bone md:aspect-auto md:min-h-[30rem]">
        {Array.from(new Set(c.metals.map((m) => c.tones[metalTone[m]].src))).map((src) => (
          <Image key={src} src={src} alt={src === c.tones[tone].src ? `${c.name} in ${metalLabel[v.metal]}` : ""} fill sizes="(min-width: 768px) 32rem, 100vw" quality={75} className={clsx("object-cover transition-opacity duration-700", src === c.tones[tone].src ? "opacity-100" : "opacity-0")} />
        ))}
      </div>
      <div className="flex flex-col p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-gold-ink">{c.categoryName}</p>
            <h2 className="mt-2 font-display text-4xl">{c.name}</h2>
          </div>
          <button type="button" onClick={ui.closeQuickView} className="-mt-2 -mr-2 grid size-11 shrink-0 place-items-center text-2xl" aria-label="Close quick view">
            ×
          </button>
        </div>
        <Stars value={c.rating} count={c.reviewCount} className="mt-2" />
        <p className="mt-3 text-2xl">
          {formatPrice(price)}
          {compareAt ? <s className="ml-2 text-base text-taupe">{formatPrice(compareAt)}</s> : null}
        </p>
        <p className="mt-3 text-sm text-ink/80">{c.short}</p>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Metal · <span className="font-normal text-taupe">{metalLabel[v.metal]}</span></legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {c.metals.map((m) => (
              <label key={m} className="chip gap-2 pl-2" title={metalLabel[m]}>
                <input type="radio" name="qv-metal" className="sr-only" checked={v.metal === m} onChange={() => setV({ ...v, metal: m })} />
                <span aria-hidden className="size-4 rounded-full" style={{ background: metalSwatch[m] }} />
                {metalLabel[m].replace(" Gold", "").replace("Sterling Silver", "Silver")}
              </label>
            ))}
          </div>
        </fieldset>

        {c.stones && c.stones.length > 1 && (
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">Stone</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.stones.map((s) => (
                <label key={s} className="chip">
                  <input type="radio" name="qv-stone" className="sr-only" checked={v.stone === s} onChange={() => setV({ ...v, stone: s })} />
                  {stoneLabel[s]}
                  {s === "natural" && c.naturalDelta ? <span className="text-xs opacity-70">+{formatPrice(c.naturalDelta)}</span> : null}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {c.lengths && (
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">Chain length</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.lengths.map((l) => (
                <label key={l} className="chip">
                  <input type="radio" name="qv-length" className="sr-only" checked={v.length === l} onChange={() => setV({ ...v, length: l })} />
                  {l}″
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {c.ringSizes && (
          <div className="mt-4">
            <label htmlFor="qv-size" className="text-sm font-semibold">
              Ring size (US)
            </label>
            <select id="qv-size" className="field mt-2" value={v.size ?? ""} aria-invalid={err} onChange={(e) => (setV({ ...v, size: e.target.value ? Number(e.target.value) : undefined }), setErr(false))}>
              <option value="">Select a size</option>
              {RING_SIZES.map((s) => (
                <option key={s} value={s} disabled={variantStock(c, { ...v, size: s }) === 0}>
                  {s}
                </option>
              ))}
            </select>
            {err && (
              <p role="alert" className="mt-1 text-sm text-error">
                Please choose a size.
              </p>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-taupe">{c.soldOut ? "Sold out" : stock <= 2 ? `Only ${stock} left` : "In stock · insured delivery in 2–5 days"}</p>

        <div className="mt-auto pt-6">
          {c.soldOut ? (
            <Link href={`/product/${c.slug}`} onClick={ui.closeQuickView} className="btn btn-ink w-full">
              Get notified
            </Link>
          ) : (
            <button type="button" onClick={add} className="btn btn-ink w-full py-4">
              Add to bag · {formatPrice(price)}
            </button>
          )}
          <Link href={`/product/${c.slug}`} onClick={ui.closeQuickView} className="link mt-3 flex min-h-11 items-center justify-center text-sm">
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}
