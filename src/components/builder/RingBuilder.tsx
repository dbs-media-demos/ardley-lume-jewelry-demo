"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { RingPreview } from "./RingPreview";
import { BUILDER_METALS, buildPrice, CARATS, defaultBuild, SETTINGS, SHAPES, type Build, type Setting, type Shape } from "@/lib/builder";
import { formatPrice, metalLabel, metalSwatch, metalTone, RING_SIZES } from "@/lib/commerce/pricing";
import type { Metal, StoneOrigin } from "@/lib/commerce/types";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { addToCart } from "@/lib/add-to-cart";

/** Representative photos per setting for the bag line. */
const SETTING_IMAGE: Record<Setting, string> = {
  solitaire: "/images/p/ardley-solitaire-1.jpg",
  halo: "/images/p/celeste-oval-halo-1--white.jpg",
  "three-stone": "/images/p/trinity-three-stone-1.jpg",
  bezel: "/images/p/margot-emerald-cut-1.jpg",
};

function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = formatPrice(value);
      shown.current = value;
      return;
    }
    const o = { v: shown.current };
    const tw = gsap.to(o, {
      v: value,
      duration: 0.9,
      ease: "expo.out",
      onUpdate: () => {
        el.textContent = formatPrice(Math.round(o.v / 5) * 5);
      },
      onComplete: () => {
        shown.current = value;
      },
    });
    return () => {
      tw.kill();
    };
  }, [value]);
  return (
    <span ref={ref} className={className} aria-hidden>
      {formatPrice(value)}
    </span>
  );
}

export function RingBuilder() {
  const [b, setB] = useState<Build>(defaultBuild);
  const [sizeTouched, setSizeTouched] = useState(false);
  const [sizeErr, setSizeErr] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const price = buildPrice(b);
  const tone = metalTone[b.metal];

  // Presets from the home teaser (?shape=oval&metal=platinum).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const shape = sp.get("shape") as Shape | null;
    const metal = sp.get("metal") as Metal | null;
    if (!shape && !metal) return;
    const id = window.requestAnimationFrame(() =>
      setB((cur) => ({
        ...cur,
        shape: shape && SHAPES.some((s) => s.id === shape) ? shape : cur.shape,
        metal: metal && BUILDER_METALS.includes(metal) ? metal : cur.metal,
      })),
    );
    return () => window.cancelAnimationFrame(id);
  }, []);

  const set = (patch: Partial<Build>) => setB((cur) => ({ ...cur, ...patch }));
  const settingName = SETTINGS.find((s) => s.id === b.setting)!.name;
  const shapeName = SHAPES.find((s) => s.id === b.shape)!.name;
  const description = `${settingName}, ${b.carat} ct ${b.stone === "lab" ? "lab-grown" : "natural"} ${shapeName.toLowerCase()} diamond, ${metalLabel[b.metal]}`;

  const add = () => {
    if (!sizeTouched) {
      setSizeErr(true);
      document.getElementById("builder-size")?.focus();
      return;
    }
    addToCart(
      {
        id: `custom|${b.setting}|${b.shape}|${b.carat}|${b.stone}|${b.metal}|${b.size}`,
        slug: "ring-builder",
        name: `Your ${settingName.toLowerCase()} ring`,
        image: SETTING_IMAGE[b.setting],
        variant: { metal: b.metal, size: b.size, stone: b.stone },
        variantLabel: `${b.carat} ct ${b.stone === "lab" ? "lab-grown" : "natural"} ${shapeName.toLowerCase()} · ${metalLabel[b.metal]} · Size ${b.size}`,
        unitPrice: price.total,
        qty: 1,
        custom: { ...b },
      },
      previewRef.current,
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      {/* Live preview + price build-up */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div ref={previewRef} className="relative overflow-hidden rounded-[2rem] bg-bone p-6 md:p-10">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_38%,#fff,transparent)]" />
          <RingPreview setting={b.setting} shape={b.shape} carat={b.carat} tone={tone} title={description} className="relative mx-auto w-full max-w-lg" />
          <p className="spec relative mt-2 text-center text-taupe">Illustration · your ring is made by hand in Dallas</p>
        </div>
        <div className="mt-5 rounded-2xl border border-ink/10 p-5">
          <ul className="space-y-1.5 text-sm">
            <li className="flex justify-between">
              <span>{settingName} setting</span>
              <AnimatedPrice value={price.setting} />
            </li>
            <li className="flex justify-between">
              <span>
                {b.carat} ct {b.stone === "lab" ? "lab-grown" : "natural"} {shapeName.toLowerCase()}
              </span>
              <AnimatedPrice value={price.stone} />
            </li>
            <li className="flex justify-between">
              <span>{metalLabel[b.metal]}</span>
              <span>{price.metal ? `+${formatPrice(price.metal)}` : "Included"}</span>
            </li>
          </ul>
          <div className="mt-4 flex items-end justify-between border-t border-ink/10 pt-4">
            <div>
              <p className="spec text-taupe">Your ring</p>
              <p className="font-display text-5xl leading-none">
                <AnimatedPrice value={price.total} />
              </p>
              <p className="sr-only" aria-live="polite">
                Total {formatPrice(price.total)}
              </p>
            </div>
            <p className="text-right text-xs text-taupe">
              Made to order · 3–4 weeks
              <br />
              Free insured shipping
            </p>
          </div>
          <button type="button" onClick={add} className="btn btn-ink mt-5 w-full py-4">
            Add to bag · {formatPrice(price.total)}
          </button>
          <Link href="/appointment" className="link mt-2 flex min-h-11 items-center justify-center text-sm text-taupe">
            Rather see stones first? Book a consultation
          </Link>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-12">
        <fieldset>
          <legend className="font-display text-3xl">
            <span className="spec mr-3 align-middle text-gold-ink">01</span>Setting
          </legend>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {SETTINGS.map((s) => (
              <label key={s.id} className={clsx("group cursor-pointer rounded-2xl border p-4 transition-colors", b.setting === s.id ? "border-ink bg-bone" : "border-ink/12 hover:border-ink/40")}>
                <input type="radio" name="setting" className="sr-only" checked={b.setting === s.id} onChange={() => set({ setting: s.id })} />
                <RingPreview setting={s.id} shape={b.shape} carat={1} tone={tone} className="w-full" />
                <span className="mt-2 block font-medium">{s.name}</span>
                <span className="block text-xs text-taupe">{s.blurb}</span>
                <span className="mt-1 block text-xs">from {formatPrice(s.price)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-3xl">
            <span className="spec mr-3 align-middle text-gold-ink">02</span>Stone
          </legend>
          <p className="mt-2 text-sm text-taupe">Shape</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Stone shape">
            {SHAPES.map((s) => (
              <label key={s.id} className="chip">
                <input type="radio" name="shape" className="sr-only" checked={b.shape === s.id} onChange={() => set({ shape: s.id })} />
                {s.name}
              </label>
            ))}
          </div>
          <p className="mt-5 text-sm text-taupe">Carat</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Carat weight">
            {CARATS.map((c) => (
              <label key={c} className="chip">
                <input type="radio" name="carat" className="sr-only" checked={b.carat === c} onChange={() => set({ carat: c })} />
                {c} ct
              </label>
            ))}
          </div>
          <p className="mt-5 text-sm text-taupe">Origin</p>
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Diamond origin">
            {(["lab", "natural"] as StoneOrigin[]).map((o) => (
              <label key={o} className="chip h-auto flex-col items-start rounded-xl py-2.5">
                <input type="radio" name="origin" className="sr-only" checked={b.stone === o} onChange={() => set({ stone: o })} />
                <span className="font-medium">{o === "lab" ? "Lab-grown" : "Natural"}</span>
                <span className="text-xs opacity-75">{o === "lab" ? "Identical crystal, kinder price" : "Mined, independently graded"}</span>
              </label>
            ))}
          </div>
          <Link href="/education/diamond-4cs" className="link mt-3 inline-flex min-h-9 items-center text-sm text-taupe">
            How we grade: the 4Cs without jargon →
          </Link>
        </fieldset>

        <fieldset>
          <legend className="font-display text-3xl">
            <span className="spec mr-3 align-middle text-gold-ink">03</span>Metal
          </legend>
          <div className="mt-5 flex flex-wrap gap-2">
            {BUILDER_METALS.map((m) => (
              <label key={m} className="chip gap-2 pl-2.5">
                <input type="radio" name="metal" className="sr-only" checked={b.metal === m} onChange={() => set({ metal: m })} />
                <span aria-hidden className="size-5 rounded-full ring-1 ring-ink/10" style={{ background: metalSwatch[m] }} />
                {metalLabel[m]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <h2 className="font-display text-3xl">
            <span className="spec mr-3 align-middle text-gold-ink">04</span>
            <label htmlFor="builder-size">Size</label>
          </h2>
          <select
            id="builder-size"
            className="field mt-5"
            value={sizeTouched ? b.size : ""}
            aria-invalid={sizeErr}
            aria-describedby="builder-size-help"
            onChange={(e) => {
              setSizeTouched(!!e.target.value);
              setSizeErr(false);
              if (e.target.value) set({ size: Number(e.target.value) });
            }}
          >
            <option value="">Select a US size</option>
            {RING_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p id="builder-size-help" className={clsx("mt-2 text-sm", sizeErr ? "text-error" : "text-taupe")} role={sizeErr ? "alert" : undefined}>
            {sizeErr ? "Choose a size to continue. Guessing for a proposal? Pick 6; resizing is free for 60 days." : "Guessing for a proposal? Most people pick 6, and resizing is free for 60 days."}{" "}
            <Link href="/ring-size-guide" className="link-under">
              Size guide
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
