"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, ViewTransition } from "react";
import clsx from "clsx";
import type { CardData } from "@/lib/card-types";
import type { Metal, Tone } from "@/lib/commerce/types";
import { metalLabel, metalSwatch, metalTone } from "@/lib/commerce/pricing";
import { Price } from "@/components/ui/Price";
import { WishButton } from "./WishButton";
import { ui } from "@/lib/store";

type Props = {
  card: CardData;
  sizes?: string;
  priority?: boolean;
  /** Give the image a view-transition name so it morphs into the product page (one per page!). */
  morph?: boolean;
  className?: string;
  tone?: "light" | "dark";
};

/** One metal swatch per distinct tone the piece is offered in. */
function toneSwatches(metals: Metal[]) {
  const seen = new Set<Tone>();
  return metals.filter((m) => {
    const t = metalTone[m];
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });
}

export function ProductCard({ card, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw", priority, morph, className, tone: theme = "light" }: Props) {
  const swatches = toneSwatches(card.metals);
  const [metal, setMetal] = useState<Metal>(card.metals[0]);
  const imgWrap = useRef<HTMLDivElement>(null);
  const tone = metalTone[metal];
  const href = `/product/${card.slug}${metal !== card.metals[0] ? `?metal=${metal}` : ""}`;
  const pct = card.sale ? Math.round(card.sale * 100) : 0;
  // One <Image> per distinct photo the piece's metals map to (white-only pieces have one).
  const distinct = Array.from(new Map(swatches.map((m) => [card.tones[metalTone[m]].src, card.tones[metalTone[m]]])).values());

  const image = (
    <div ref={imgWrap} className="glint relative aspect-[4/5] overflow-hidden rounded-[0.9rem] bg-bone">
      {distinct.map((im) => {
        const show = im.src === card.tones[tone].src;
        return (
          <Image
            key={im.src}
            src={im.src}
            alt={show ? `${card.name} in ${metalLabel[metal]}` : ""}
            aria-hidden={!show}
            fill
            sizes={sizes}
            quality={75}
            preload={priority && show}
            placeholder={im.blur ? "blur" : "empty"}
            blurDataURL={im.blur || undefined}
            className={clsx(
              "object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] group-hover/card:scale-[1.04]",
              show ? "opacity-100" : "opacity-0",
            )}
          />
        );
      })}
      <Image
        src={card.model.src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        quality={60}
        className="object-cover opacity-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] [@media(hover:hover)]:group-hover/card:opacity-100"
      />
    </div>
  );

  return (
    <article className={clsx("group/card relative", className)} data-card={card.slug}>
      <div className="relative">
        <Link href={href} data-cursor="View" className="block" aria-label={`${card.name}, ${metalLabel[metal]}`}>
          {morph ? (
            <ViewTransition name={`product-${card.slug}`} share="morph" default="none">
              {image}
            </ViewTransition>
          ) : (
            image
          )}
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {card.soldOut ? (
            <span className="sale-tag rounded-full bg-ink px-2.5 py-1 text-ivory">Sold out</span>
          ) : card.sale ? (
            <span className="sale-tag rounded-full bg-oxblood px-2.5 py-1 text-ivory">Sale −{pct}%</span>
          ) : card.badges.includes("new") ? (
            <span className="sale-tag rounded-full bg-ivory/90 px-2.5 py-1 text-ink">New</span>
          ) : card.badges.includes("bestseller") ? (
            <span className="sale-tag rounded-full bg-ivory/90 px-2.5 py-1 text-ink">Bestseller</span>
          ) : null}
        </div>
        <WishButton slug={card.slug} name={card.name} className="absolute top-1.5 right-1.5 text-ink" />

        <button
          type="button"
          onClick={() => ui.openQuickView(card.slug)}
          className="absolute right-3 bottom-3 left-3 flex min-h-11 translate-y-2 items-center justify-center gap-2 rounded-full bg-ivory/92 text-[0.72rem] font-semibold tracking-[0.14em] text-ink uppercase opacity-0 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur transition-[opacity,transform,background-color] duration-500 ease-[var(--ease-out-expo)] group-hover/card:translate-y-0 group-hover/card:opacity-100 hover:bg-ivory focus-visible:translate-y-0 focus-visible:opacity-100 max-md:hidden"
        >
          {card.soldOut ? "Quick view" : "Quick add"}
          <span aria-hidden>+</span>
        </button>
        <button
          type="button"
          onClick={() => ui.openQuickView(card.slug)}
          aria-label={`Quick add ${card.name}`}
          className="absolute right-2 bottom-2 grid size-11 place-items-center rounded-full bg-ivory/92 text-lg text-ink shadow md:hidden"
        >
          +
        </button>
      </div>

      <div className={clsx("mt-3.5 flex items-start justify-between gap-3", theme === "dark" ? "text-ivory" : "text-ink")}>
        <div className="min-w-0">
          <h3 className="font-sans text-[0.95rem] leading-snug font-medium tracking-normal">
            <Link href={href} className="link">
              {card.name}
            </Link>
          </h3>
          <p className={clsx("mt-0.5 text-[0.8rem]", theme === "dark" ? "text-mist" : "text-taupe")}>{card.categoryName}</p>
        </div>
        <Price price={card.price} compareAt={card.compareAt} className="shrink-0 text-[0.92rem]" />
      </div>

      {swatches.length > 1 && (
        <div className="-ml-1.5 mt-1 flex items-center" role="group" aria-label={`Metal for ${card.name}`}>
          {swatches.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={metalTone[m] === tone}
              aria-label={`Show in ${metalLabel[m]}`}
              title={metalLabel[m]}
              onClick={() => {
                if (metalTone[m] === tone) return;
                setMetal(m);
                // Restart the light sweep across the photo.
                const el = imgWrap.current;
                if (el) {
                  delete el.dataset.glint;
                  void el.offsetWidth;
                  el.dataset.glint = "on";
                }
              }}
              className="group/sw grid size-9 place-items-center"
            >
              <span
                className={clsx(
                  "block size-4 rounded-full ring-1 ring-offset-2 transition-[box-shadow,transform] duration-300 group-hover/sw:scale-110",
                  theme === "dark" ? "ring-offset-ink" : "ring-offset-ivory",
                  metalTone[m] === tone ? (theme === "dark" ? "ring-ivory" : "ring-ink") : "ring-transparent",
                )}
                style={{ background: metalSwatch[m] }}
              />
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
