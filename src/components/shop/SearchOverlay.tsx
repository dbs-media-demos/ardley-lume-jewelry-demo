"use client";

import Link from "next/link";
import Image from "next/image";
import { useDeferredValue, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { ui, useUi } from "@/lib/store";
import { useCatalog } from "@/lib/use-catalog";
import { Price } from "@/components/ui/Price";
import { metalLabel } from "@/lib/commerce/pricing";

const POPULAR = ["Engagement", "Hoops", "Pearl", "Emerald", "Signet", "Tennis", "Under $500", "Rose gold"];

/** Instant search with thumbnails and prices, and suggestions when nothing matches. */
export function SearchOverlay() {
  const { search } = useUi();
  const catalog = useCatalog(true);
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q.trim().toLowerCase());

  const results =
    catalog && dq
      ? catalog.filter((c) => {
          if (dq === "under $500") return c.price < 500;
          const hay = [c.name, c.categoryName, c.short, c.stone, ...c.metals.map((m) => metalLabel[m]), ...c.collections].join(" ").toLowerCase();
          return dq.split(/\s+/).every((t) => hay.includes(t.replace(/s$/, "")));
        })
      : [];

  const close = () => {
    ui.closeSearch();
  };

  return (
    <Sheet open={search} onClose={close} label="Search the store" side="top">
      <div className="wrap py-6">
        <div className="flex items-center gap-3 border-b border-ink/20 pb-3">
          <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-taupe" aria-hidden>
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <label htmlFor="site-search" className="sr-only">
            Search rings, earrings, necklaces…
          </label>
          <input
            id="site-search"
            data-autofocus
            type="search"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search rings, pearls, rose gold…"
            className="min-h-12 w-full bg-transparent font-display text-3xl placeholder:text-taupe/70 focus:outline-none md:text-4xl"
          />
          <button type="button" onClick={close} className="grid size-11 shrink-0 place-items-center text-2xl" aria-label="Close search">
            ×
          </button>
        </div>

        <div className="max-h-[70dvh] overflow-y-auto pt-6 pb-4">
          {!dq || !results.length ? (
            <div>
              {dq && catalog && (
                <p className="mb-6 text-taupe" role="status">
                  Nothing for “{q.trim()}”. Try one of these, or{" "}
                  <Link href="/bespoke" onClick={close} className="link-under text-ink">
                    ask us to make it
                  </Link>
                  .
                </p>
              )}
              <p className="eyebrow text-taupe">Popular searches</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <button key={p} type="button" className="chip" onClick={() => setQ(p)}>
                    {p}
                  </button>
                ))}
              </div>
              {catalog && (
                <>
                  <p className="eyebrow mt-8 text-taupe">Bestsellers</p>
                  <ul className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {catalog
                      .filter((c) => c.badges.includes("bestseller"))
                      .slice(0, 4)
                      .map((c) => (
                        <Result key={c.slug} c={c} onNavigate={close} />
                      ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-taupe" role="status">
                {results.length} {results.length === 1 ? "piece" : "pieces"}
              </p>
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {results.slice(0, 12).map((c) => (
                  <Result key={c.slug} c={c} onNavigate={close} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Sheet>
  );
}

function Result({ c, onNavigate }: { c: NonNullable<ReturnType<typeof useCatalog>>[number]; onNavigate: () => void }) {
  return (
    <li>
      <Link href={`/product/${c.slug}`} onClick={onNavigate} className="group block">
        <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-bone">
          <Image src={c.tones.yellow.src} alt="" fill sizes="(min-width: 768px) 22vw, 45vw" quality={60} className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </span>
        <span className="mt-2 block text-sm font-medium">{c.name}</span>
        <Price price={c.price} compareAt={c.compareAt} className="text-sm text-taupe" />
      </Link>
    </li>
  );
}
