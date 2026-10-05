"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import clsx from "clsx";
import type { Metal, Product, StoneOrigin, Tone, Variant } from "@/lib/commerce/types";
import type { CardImg } from "@/lib/card-types";
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
import { ProductGallery } from "./ProductGallery";
import { WishButton } from "@/components/shop/WishButton";
import { Stars } from "@/components/ui/Stars";
import { addToCart } from "@/lib/add-to-cart";
import { pushRecent } from "@/lib/store";
import { site } from "@/content/site";

type Props = {
  product: Product;
  categoryName: string;
  heroes: Record<Tone, CardImg>;
  rest: CardImg[];
  hand: CardImg;
  breadcrumbs: ReactNode;
};

const noop = () => () => {};

/** Business-day delivery estimate, computed in the browser (so it's never stale). */
function useArrival(days: [number, number]) {
  return useSyncExternalStore(
    noop,
    () => {
      const add = (n: number) => {
        const d = new Date();
        let left = n;
        while (left > 0) {
          d.setDate(d.getDate() + 1);
          if (d.getDay() !== 0 && d.getDay() !== 6) left--;
        }
        return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      };
      return `${add(days[0])} – ${add(days[1])}`;
    },
    () => "",
  );
}

export function ProductView({ product: p, categoryName, heroes, rest, hand, breadcrumbs }: Props) {
  const [variant, setVariant] = useState<Variant>(() => {
    const v = defaultVariant(p);
    return { ...v, size: undefined };
  });
  const [sizeError, setSizeError] = useState(false);
  const [notify, setNotify] = useState<"idle" | "open" | "done">("idle");
  const [email, setEmail] = useState("");
  const atc = useRef<HTMLButtonElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  const sizeId = useId();

  // ?metal= from a card swatch preselects the metal (read after mount; the page itself is static).
  useEffect(() => {
    pushRecent(p.slug);
    const m = new URLSearchParams(window.location.search).get("metal") as Metal | null;
    if (m && p.metals.includes(m)) {
      const id = window.requestAnimationFrame(() => setVariant((v) => ({ ...v, metal: m })));
      return () => window.cancelAnimationFrame(id);
    }
  }, [p.slug, p.metals]);

  // Sticky buy bar on phones once the main button scrolls away.
  useEffect(() => {
    const el = atc.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tone = metalTone[variant.metal];
  const { price, compareAt } = variantPrice(p, variant);
  const stock = variantStock(p, { ...variant, size: variant.size ?? 6.5 });
  const soldOut = p.soldOut || (variant.size !== undefined && stock === 0);
  const madeToOrder = p.category === "engagement" || (p.category === "wedding-bands" && p.stone === "diamond");
  const arrival = useArrival(madeToOrder ? [12, 16] : [2, 5]);
  const needsSize = !!p.ringSizes && variant.size === undefined;

  const set = (patch: Partial<Variant>) => {
    setVariant((v) => ({ ...v, ...patch }));
    if (patch.size !== undefined) setSizeError(false);
  };

  const add = () => {
    if (needsSize) {
      setSizeError(true);
      document.getElementById(sizeId)?.focus();
      return;
    }
    if (soldOut) return;
    const v = { ...variant };
    addToCart(
      {
        id: `${p.slug}|${variantKey(v)}`,
        slug: p.slug,
        name: p.name,
        image: heroes[tone].src,
        variant: v,
        variantLabel: variantLabel(v),
        unitPrice: price,
        compareAt,
        qty: 1,
      },
      galleryRef.current?.querySelector<HTMLElement>(".glint") ?? null,
    );
  };

  const stockLine = p.soldOut
    ? "Sold out. We're making more."
    : variant.size !== undefined && stock === 0
      ? `Size ${variant.size} is sold out. Try another size or ask us to make one.`
      : stock <= 2
        ? `Only ${stock} left${variant.size ? ` in size ${variant.size}` : ""}`
        : madeToOrder
          ? "Made to order at our Dallas bench"
          : "In stock · ready to ship";

  const scaleKind = p.ringSizes ? "ring" : "other";
  const stoneMm = p.category === "engagement" ? p.scaleMm : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
      <div ref={galleryRef} className="-mx-5 md:mx-0">
        <ProductGallery
          slug={p.slug}
          name={p.name}
          tone={tone}
          heroes={heroes}
          rest={rest}
          metalLabel={metalLabel[variant.metal]}
          scale={{ kind: scaleKind, mm: p.scaleMm, stoneMm, hand }}
        />
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        {breadcrumbs}
        <p className="eyebrow mt-6 text-gold-ink">{categoryName}</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="rise font-display text-[clamp(2.4rem,4.4vw,3.8rem)] leading-[0.98]">{p.name}</h1>
          <WishButton slug={p.slug} name={p.name} size="lg" className="mt-1 shrink-0" />
        </div>
        <a href="#reviews" className="mt-3 inline-flex min-h-9 items-center">
          <Stars value={p.rating} count={p.reviewCount} />
        </a>

        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <p className="font-display text-4xl" aria-live="polite">
            {compareAt ? <span className="sr-only">Sale price </span> : null}
            {formatPrice(price)}
          </p>
          {compareAt ? (
            <>
              <s className="text-lg text-taupe">
                <span className="sr-only">was </span>
                {formatPrice(compareAt)}
              </s>
              <span className="sale-tag rounded-full bg-oxblood px-2.5 py-1 text-ivory">Save {formatPrice(compareAt - price)}</span>
            </>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-taupe">Or 4 interest-free payments of {formatPrice(price / 4, { cents: true })} (demo)</p>
        <p className="mt-5 text-[1.02rem] leading-relaxed text-ink/85">{p.short}</p>

        {/* Metal */}
        <fieldset className="mt-7">
          <legend className="flex w-full items-baseline justify-between text-sm">
            <span className="font-semibold">Metal</span>
            <span className="text-taupe">{metalLabel[variant.metal]}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.metals.map((m) => (
              <label key={m} className="chip gap-2 pr-4 pl-2.5" title={metalLabel[m]}>
                <input type="radio" name="metal" value={m} checked={variant.metal === m} onChange={() => set({ metal: m })} className="sr-only" />
                <span aria-hidden className="size-5 rounded-full ring-1 ring-ink/10" style={{ background: metalSwatch[m] }} />
                {metalLabel[m].replace(" Gold", "").replace("Sterling Silver", "Silver")}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Stone origin */}
        {p.stones && p.stones.length > 1 && (
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Stone</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {p.stones.map((s: StoneOrigin) => {
                const delta = s === "natural" ? p.naturalDelta ?? 0 : 0;
                return (
                  <label key={s} className="chip h-auto flex-col items-start rounded-xl py-2.5">
                    <input type="radio" name="stone" value={s} checked={variant.stone === s} onChange={() => set({ stone: s })} className="sr-only" />
                    <span className="font-medium">{stoneLabel[s]}</span>
                    <span className="text-xs opacity-75">{delta ? `+${formatPrice(delta)}` : "Included"} · {s === "lab" ? "identical, kinder price" : "mined, graded"}</span>
                  </label>
                );
              })}
            </div>
            <Link href="/education/lab-vs-natural" className="link mt-2 inline-flex min-h-9 items-center text-sm text-taupe">
              Lab-grown or natural? An honest guide →
            </Link>
          </fieldset>
        )}

        {/* Chain length */}
        {p.lengths && (
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Chain length</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.lengths.map((l, i) => (
                <label key={l} className="chip">
                  <input type="radio" name="length" value={l} checked={variant.length === l} onChange={() => set({ length: l })} className="sr-only" />
                  {l}″{i > 0 ? <span className="text-xs opacity-70"> +{formatPrice(i * 30)}</span> : null}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Ring size */}
        {p.ringSizes && (
          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm">
              <label htmlFor={sizeId} className="font-semibold">
                Ring size (US)
              </label>
              <Link href="/ring-size-guide" className="link text-taupe">
                Size guide
              </Link>
            </div>
            <select
              id={sizeId}
              className="field mt-2"
              value={variant.size ?? ""}
              aria-invalid={sizeError}
              aria-describedby={sizeError ? `${sizeId}-err` : `${sizeId}-help`}
              onChange={(e) => set({ size: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">Select a size</option>
              {RING_SIZES.map((s) => {
                const st = variantStock(p, { ...variant, size: s });
                return (
                  <option key={s} value={s} disabled={st === 0}>
                    {s}
                    {st === 0 ? " · sold out" : st <= 2 ? ` · only ${st} left` : ""}
                  </option>
                );
              })}
            </select>
            {sizeError ? (
              <p id={`${sizeId}-err`} className="mt-1.5 text-sm text-error" role="alert">
                Please choose a size. Not sure? We&apos;ll mail you a free sizer.
              </p>
            ) : (
              <p id={`${sizeId}-help`} className="mt-1.5 text-sm text-taupe">
                Free resizing within {site.resizeDays} days. <Link href="/ring-size-guide#sizer" className="link-under">Get a free sizer</Link>
              </p>
            )}
          </div>
        )}

        {/* Stock + delivery */}
        <div className="mt-6 space-y-1.5 text-sm">
          <p className="flex items-center gap-2">
            <span aria-hidden className={clsx("size-2 rounded-full", soldOut ? "bg-error" : stock <= 2 ? "bg-gold" : "bg-emerald-600")} />
            {stockLine}
          </p>
          {!p.soldOut && (
            <p className="text-taupe">
              Insured delivery {arrival ? <>arrives <span className="text-ink">{arrival}</span></> : "in 2–5 business days"}. {price >= site.freeShippingOver ? "Free shipping." : `Free over $${site.freeShippingOver}.`}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6">
          {p.soldOut ? (
            notify === "done" ? (
              <p role="status" className="rounded-xl border border-gold/50 bg-bone px-4 py-3 text-sm">
                We&apos;ll email {email} the moment it&apos;s back. (Demo: nothing was sent.)
              </p>
            ) : (
              <form
                className="flex gap-2"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) setNotify("done");
                  else setNotify("open");
                }}
              >
                <label className="sr-only" htmlFor="notify-email">
                  Email
                </label>
                <input id="notify-email" type="email" className="field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={notify === "open"} />
                <button type="submit" className="btn btn-ink shrink-0">
                  Notify me
                </button>
              </form>
            )
          ) : (
            <button ref={atc} type="button" onClick={add} disabled={soldOut} className="btn btn-ink w-full py-4 text-[0.85rem]">
              {soldOut ? "Sold out in this size" : `Add to bag · ${formatPrice(price)}`}
            </button>
          )}
          {notify === "open" && <p className="mt-1.5 text-sm text-error">Please enter a valid email.</p>}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/appointment" className="btn btn-ghost text-[0.72rem]">
              Try it in Dallas
            </Link>
            <a href={site.phoneHref} className="btn btn-ghost text-[0.72rem]">
              Ask a jeweler
            </a>
          </div>
        </div>

        <ul className="mt-7 grid grid-cols-2 gap-3 text-sm text-taupe">
          {["Recycled solid gold", "Free insured shipping $250+", "30-day returns", "Lifetime warranty"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span aria-hidden className="text-gold-ink">✦</span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Sticky buy bar (phones) */}
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-[85] border-t border-ink/10 bg-ivory/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-500 ease-[var(--ease-out-expo)] md:hidden",
          showBar && !p.soldOut ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showBar}
        inert={!showBar}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.name}</p>
            <p className="text-sm text-taupe">
              {formatPrice(price)} · {metalLabel[variant.metal].replace(" Gold", "")}
              {variant.size ? ` · ${variant.size}` : ""}
            </p>
          </div>
          <button type="button" onClick={add} className="btn btn-ink shrink-0 px-5">
            {needsSize ? "Choose size" : "Add to bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
