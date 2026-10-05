"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import type { CardData } from "@/lib/card-types";
import { ProductCard } from "./ProductCard";
import { Sheet } from "@/components/ui/Sheet";
import { applyFilters, activeCount, METAL_FACETS, parseFilters, PRICE_BANDS, SORTS, STONE_FACETS, toQuery, type Filters } from "@/lib/filters";
import { gsap, loadFlip, prefersReducedMotion } from "@/lib/gsap";
import type { Flip as FlipType } from "gsap/Flip";

type Props = {
  cards: CardData[];
  /** Show the category facet (only on /shop). */
  categories?: { slug: string; name: string }[];
};

/**
 * The product grid. Every card stays mounted; filtering hides cards and sorting
 * changes their CSS `order`, so GSAP Flip can glide each card to its new place
 * (and fade the leavers) instead of the grid jumping.
 */
export function Catalog({ cards, categories }: Props) {
  const sp = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => parseFilters(new URLSearchParams(sp.toString())));
  const [sheet, setSheet] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof FlipType.getState> | null>(null);
  const Flip = useRef<typeof FlipType | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [condensed, setCondensed] = useState(false);

  const visible = useMemo(() => applyFilters(cards, filters), [cards, filters]);
  const order = useMemo(() => new Map(visible.map((s, i) => [s, i])), [visible]);
  const count = activeCount(filters);

  useEffect(() => {
    loadFlip().then((F) => (Flip.current = F));
  }, []);

  // Sync filters → URL (no navigation, no server round trip).
  useEffect(() => {
    const url = `${window.location.pathname}${toQuery(filters)}`;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", url);
  }, [filters]);

  // Condense the sticky filter bar once it sticks.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCondensed(e.intersectionRatio < 1), { threshold: [1], rootMargin: "-73px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const update = (fn: (f: Filters) => Filters) => {
    const g = grid.current;
    if (g && Flip.current && !prefersReducedMotion()) {
      flipState.current = Flip.current.getState(g.querySelectorAll("[data-flip]"));
    }
    setFilters((f) => fn(f));
  };

  useLayoutEffect(() => {
    const st = flipState.current;
    const F = Flip.current;
    const g = grid.current;
    if (!st || !F || !g) return;
    flipState.current = null;
    F.from(st, {
      targets: g.querySelectorAll("[data-flip]"),
      duration: 0.75,
      ease: "expo.inOut",
      absolute: true,
      stagger: 0.012,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.15, ease: "expo.out" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.88, duration: 0.35, ease: "power2.in" }),
    });
  }, [filters]);

  const toggle = <K extends "cat" | "metal" | "stone">(key: K, value: Filters[K][number]) =>
    update((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(value as string) ? arr.filter((x) => x !== value) : [...arr, value] };
    });

  const clear = () => update((f) => ({ ...f, cat: [], metal: [], stone: [], price: null, sale: false, instock: false }));
  const setPrice = (id: string) => update((f) => ({ ...f, price: f.price === id ? null : id }));

  const facetGroups = (
    <>
      {categories && (
        <fieldset>
          <legend className="eyebrow mb-3 text-taupe">Category</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <label key={c.slug} className="chip">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={filters.cat.includes(c.slug as Filters["cat"][number])}
                  onChange={() => toggle("cat", c.slug as Filters["cat"][number])}
                />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="eyebrow mb-3 text-taupe">Metal</legend>
        <div className="flex flex-wrap gap-2">
          {METAL_FACETS.map((m) => (
            <label key={m.id} className="chip">
              <input type="checkbox" className="sr-only" checked={filters.metal.includes(m.id)} onChange={() => toggle("metal", m.id)} />
              <span aria-hidden className="size-3.5 rounded-full" style={{ background: m.swatch }} />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3 text-taupe">Stone</legend>
        <div className="flex flex-wrap gap-2">
          {STONE_FACETS.map((s) => (
            <label key={s.id} className="chip">
              <input type="checkbox" className="sr-only" checked={filters.stone.includes(s.id)} onChange={() => toggle("stone", s.id)} />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3 text-taupe">Price</legend>
        <div className="flex flex-wrap gap-2">
          {PRICE_BANDS.map((b) => (
            <label key={b.id} className="chip">
              <input type="checkbox" className="sr-only" checked={filters.price === b.id} onChange={() => setPrice(b.id)} />
              {b.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3 text-taupe">Availability</legend>
        <div className="flex flex-wrap gap-2">
          <label className="chip">
            <input type="checkbox" className="sr-only" checked={filters.sale} onChange={() => update((f) => ({ ...f, sale: !f.sale }))} />
            On sale
          </label>
          <label className="chip">
            <input type="checkbox" className="sr-only" checked={filters.instock} onChange={() => update((f) => ({ ...f, instock: !f.instock }))} />
            In stock
          </label>
        </div>
      </fieldset>
    </>
  );

  return (
    <div>
      {/* Sticky bar: filters button + quick facets (desktop) + sort. Condenses once it sticks. */}
      <div
        ref={bar}
        className={clsx(
          "sticky top-[63px] z-30 -mx-5 border-y border-ink/10 bg-ivory/92 px-5 backdrop-blur-md transition-[padding] duration-500 md:-mx-10 md:px-10",
          condensed ? "py-2" : "py-3.5",
        )}
      >
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setSheet(true)} className="chip shrink-0 gap-2" aria-haspopup="dialog">
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
              <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
            Filters{count ? ` (${count})` : ""}
          </button>
          <div className="no-scrollbar hidden flex-1 items-center gap-2 overflow-x-auto lg:flex">
            {METAL_FACETS.slice(0, 3).map((m) => (
              <button key={m.id} type="button" aria-pressed={filters.metal.includes(m.id)} onClick={() => toggle("metal", m.id)} className="chip shrink-0">
                <span aria-hidden className="size-3.5 rounded-full" style={{ background: m.swatch }} />
                {m.label.replace(" & silver", "")}
              </button>
            ))}
            <button type="button" aria-pressed={filters.stone.includes("diamond")} onClick={() => toggle("stone", "diamond")} className="chip shrink-0">
              Diamond
            </button>
            <button type="button" aria-pressed={filters.price === "0-500"} onClick={() => setPrice("0-500")} className="chip shrink-0">
              Under $500
            </button>
            <button type="button" aria-pressed={filters.sale} onClick={() => update((f) => ({ ...f, sale: !f.sale }))} className="chip shrink-0">
              On sale
            </button>
            {count > 0 && (
              <button type="button" onClick={clear} className="link ml-1 min-h-11 shrink-0 text-sm text-taupe">
                Clear all
              </button>
            )}
          </div>
          <p className="ml-auto hidden shrink-0 text-sm text-taupe sm:block" aria-live="polite">
            {visible.length} {visible.length === 1 ? "piece" : "pieces"}
          </p>
          <label className="relative ml-auto shrink-0 sm:ml-0">
            <span className="sr-only">Sort by</span>
            <select
              value={filters.sort}
              onChange={(e) => update((f) => ({ ...f, sort: e.target.value }))}
              className="min-h-11 appearance-none rounded-full border border-ink/18 bg-transparent py-2 pr-9 pl-4 text-sm hover:border-ink"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 10 6" className="pointer-events-none absolute top-1/2 right-4 w-2.5 -translate-y-1/2" aria-hidden>
              <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </label>
        </div>
      </div>

      <div ref={grid} className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c, i) => {
          const idx = order.get(c.slug);
          const shown = idx !== undefined;
          return (
            <div key={c.slug} data-flip data-flip-id={c.slug} className={clsx(!shown && "hidden")} style={{ order: shown ? idx : 999 }}>
              <ProductCard card={c} morph priority={i < 2} />
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="mx-auto my-16 max-w-md rounded-2xl border border-ink/10 bg-bone/60 p-8 text-center">
          <p className="font-display text-3xl">Nothing matches, yet.</p>
          <p className="mt-3 text-taupe">Try fewer filters. Or tell us what you&apos;re picturing: most of our bespoke pieces start exactly like this.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={clear} className="btn btn-ink">
              Clear filters
            </button>
            <Link href="/bespoke" className="btn btn-ghost">
              Start a bespoke piece
            </Link>
          </div>
        </div>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)} label="Filters" side="right">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <p className="font-display text-2xl">Filters</p>
          <button type="button" onClick={() => setSheet(false)} className="grid size-11 place-items-center text-xl" aria-label="Close filters">
            ×
          </button>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">{facetGroups}</div>
        <div className="flex gap-3 border-t border-ink/10 px-6 py-4">
          <button type="button" onClick={clear} className="btn btn-ghost flex-1">
            Clear
          </button>
          <button type="button" onClick={() => setSheet(false)} className="btn btn-ink flex-[2]">
            Show {visible.length} {visible.length === 1 ? "piece" : "pieces"}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
