"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import type { CardData } from "@/lib/card-types";
import { formatPrice } from "@/lib/commerce/pricing";

const HALLMARK: Record<string, string> = { rings: "585 · AL · DAL", "wedding-bands": "PT950 · AL", earrings: "585 · AL", necklaces: "585 · AL · DAL", bracelets: "585 · AL · 7in", engagement: "PT950 · AL · 1CT" };

/** Sale cards that turn over (hover, focus or tap) to reveal the saving and a hallmark detail. The price is on both faces. */
export function SaleFlips({ items }: { items: CardData[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-5">
      {items.map((c) => (
        <FlipCard key={c.slug} c={c} />
      ))}
    </ul>
  );
}

function FlipCard({ c }: { c: CardData }) {
  const [flipped, setFlipped] = useState(false);
  const save = c.compareAt ? c.compareAt - c.price : 0;
  return (
    <li className="group/flip [perspective:1200px]">
      <div
        className={clsx(
          "relative aspect-[3/4] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] [transform-style:preserve-3d] [@media(hover:hover)]:group-hover/flip:[transform:rotateY(180deg)] group-focus-within/flip:[transform:rotateY(180deg)]",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        {/* front */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-bone [backface-visibility:hidden]">
          <Image src={c.tones.yellow.src} alt={c.tones.yellow.alt} fill sizes="(min-width:1024px) 18vw, 45vw" quality={60} className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-14 text-ivory">
            <p className="text-sm font-medium">{c.name}</p>
            <p className="mt-0.5 text-sm">
              <span className="sr-only">Sale price </span>
              {formatPrice(c.price)} <s className="opacity-70">{c.compareAt ? formatPrice(c.compareAt) : ""}</s>
            </p>
          </div>
          <span className="sale-tag absolute top-3 left-3 rounded-full bg-oxblood px-2.5 py-1 text-ivory">−{Math.round((c.sale ?? 0) * 100)}%</span>
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-ivory/90 text-ink md:hidden"
            aria-label={`Turn over ${c.name}`}
          >
            ↻
          </button>
        </div>
        {/* back */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-oxblood p-5 text-ivory [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-start justify-between">
            <span className="spec rounded-full border border-gold/50 px-2.5 py-1 text-gold-pale">{HALLMARK[c.category] ?? "585 · AL"}</span>
            <button type="button" onClick={() => setFlipped(false)} className="grid size-11 place-items-center md:hidden" aria-label={`Turn back ${c.name}`}>
              ↺
            </button>
          </div>
          <div>
            <p className="spec text-gold-pale">You save {formatPrice(save)}</p>
            <p className="mt-2 font-display text-5xl leading-none">{formatPrice(c.price)}</p>
            <p className="mt-1 text-sm text-ivory/75">
              was <s>{c.compareAt ? formatPrice(c.compareAt) : ""}</s>
            </p>
            <p className="mt-4 text-sm text-ivory/85">{c.name}: hallmarked, warrantied, boxed like any full-price piece.</p>
          </div>
          <Link href={`/product/${c.slug}`} className="btn btn-gold w-full">
            Shop it
          </Link>
        </div>
      </div>
    </li>
  );
}

const SALE_END = new Date("2026-10-31T23:59:00-05:00").getTime();
const sub = (cb: () => void) => {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
};

/** Countdown to the end of the sale (client-only, so no hydration mismatch). */
export function Countdown({ className }: { className?: string }) {
  const now = useSyncExternalStore(sub, () => Math.floor(Date.now() / 1000), () => 0);
  const left = now ? Math.max(0, SALE_END / 1000 - now) : 0;
  const parts = [
    ["days", Math.floor(left / 86400)],
    ["hrs", Math.floor((left % 86400) / 3600)],
    ["min", Math.floor((left % 3600) / 60)],
    ["sec", Math.floor(left % 60)],
  ] as const;
  return (
    <div className={clsx("flex items-end gap-4", className)} role="timer" aria-label="Time left in the sale">
      {parts.map(([k, v]) => (
        <div key={k} className="text-center">
          <p className="font-display text-4xl tabular-nums md:text-5xl" aria-hidden={k === "sec"}>
            {now ? String(v).padStart(2, "0") : "––"}
          </p>
          <p className="spec opacity-70">{k}</p>
        </div>
      ))}
    </div>
  );
}
