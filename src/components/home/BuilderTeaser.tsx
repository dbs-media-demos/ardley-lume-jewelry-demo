"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { buildPrice, SHAPES, type Shape } from "@/lib/builder";
import { formatPrice } from "@/lib/commerce/pricing";
import type { Tone, Metal } from "@/lib/commerce/types";
import { afterLoad, canRun3D, prefersReducedMotion, tweenNumber } from "@/lib/motion";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import type { BuilderHandle } from "@/components/fx/BuilderScene";

const TONES: { tone: Tone; metal: Metal; label: string; swatch: string }[] = [
  { tone: "yellow", metal: "14k-yellow", label: "Yellow gold", swatch: "linear-gradient(135deg,#f3dc9b,#c9a55c 55%,#8f6e2c)" },
  { tone: "white", metal: "platinum", label: "Platinum", swatch: "linear-gradient(135deg,#f1f2f4,#b7bcc2 55%,#7b8188)" },
  { tone: "rose", metal: "14k-rose", label: "Rose gold", swatch: "linear-gradient(135deg,#f6d2c2,#d39a83 55%,#9b6250)" },
];

/** Renders of the 3D ring for every stone × metal (scripts/ring-stills.mjs). Phones only ever see these. */
const stillSrc = (shape: Shape, tone: Tone) => `/images/3d/builder-${shape}-${tone}.webp`;

declare global {
  interface Window {
    __builderStill?: (shape: Shape, tone: Tone) => string;
  }
}

/**
 * The still for the current choice. A new one is only swapped in once it has loaded,
 * so the stage never flashes empty.
 */
function Still({ src, alt, hidden }: { src: string; alt: string; hidden: boolean }) {
  const [shown, setShown] = useState(src);
  const [next, setNext] = useState<string | null>(null);
  if (src !== shown && src !== next) setNext(src);
  if (src === shown && next) setNext(null);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shown} alt={alt} loading="lazy" decoding="async" className={clsx("absolute inset-0 size-full object-cover transition-opacity duration-700", hidden && "opacity-0 delay-500")} />
      {next && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={next}
          src={next}
          alt=""
          decoding="async"
          onLoad={() => {
            setShown(next);
            setNext(null);
          }}
          className="absolute inset-0 size-full object-cover opacity-0"
        />
      )}
    </>
  );
}

/**
 * Scene 5: a taste of the ring builder. Desktop: a live 3D solitaire you can drag
 * around; the stone and metal you pick change the ring itself and the price.
 * Phones: the same choices swap renders of that ring (no three.js).
 */
export function BuilderTeaser() {
  const [shape, setShape] = useState<Shape>("oval");
  const [toneIdx, setToneIdx] = useState(0);
  const t = TONES[toneIdx];
  const total = buildPrice({ setting: "solitaire", shape, carat: 1, stone: "lab", metal: t.metal, size: 6 }).total;
  const priceRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(total);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<BuilderHandle | null>(null);
  const choice = useRef({ shape, tone: t.tone });
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = priceRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = formatPrice(total);
      shown.current = total;
      return;
    }
    return tweenNumber(
      shown.current,
      total,
      900,
      (v) => (el.textContent = formatPrice(Math.round(v / 5) * 5)),
      () => (shown.current = total),
    );
  }, [total]);

  // Live 3D (desktop only): imported inside this effect once the stage nears the screen.
  useEffect(() => {
    const still = new URLSearchParams(window.location.search).has("builderStill");
    const el = stage.current;
    if (!el || (!still && !canRun3D())) return;
    let dead = false;
    let vis: IntersectionObserver | null = null;
    const start = async () => {
      if (dead || scene.current || !canvas.current) return;
      if (!document.createElement("canvas").getContext("webgl2")) return;
      const { createBuilderScene } = await import("@/components/fx/BuilderScene");
      if (dead || !canvas.current) return;
      scene.current = createBuilderScene(canvas.current, choice.current, { still });
      if (still) {
        window.__builderStill = (s, tn) => scene.current!.snapshot(s, tn);
        return;
      }
      vis = new IntersectionObserver(([e]) => scene.current?.setVisible(e.isIntersecting));
      vis.observe(el);
      requestAnimationFrame(() => !dead && setLive(true));
    };
    let cancelLoad = () => {};
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        cancelLoad = afterLoad(() => void start(), 600);
      },
      { rootMargin: still ? "100000px" : "600px 0px" },
    );
    near.observe(el);
    return () => {
      dead = true;
      near.disconnect();
      cancelLoad();
      vis?.disconnect();
      scene.current?.dispose();
      scene.current = null;
      delete window.__builderStill;
    };
  }, []);

  useEffect(() => {
    choice.current = { shape, tone: t.tone };
    scene.current?.set(shape, t.tone);
  }, [shape, t.tone]);

  const label = `Solitaire with a 1 carat ${shape} stone in ${t.label}`;

  return (
    <section className="relative overflow-hidden bg-ivory py-14 text-ink md:py-36" aria-labelledby="builder-title">
      <div className="wrap grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
        <div>
          <p className="eyebrow text-gold-ink">The ring builder</p>
          <SplitReveal id="builder-title" className="mt-4 font-display text-[clamp(2.6rem,5.4vw,5rem)]">
            Four choices. One ring that&apos;s only yours.
          </SplitReveal>
          <Reveal as="ol" stagger={0.08} className="mt-8 grid grid-cols-2 gap-x-6 border-t border-ink/10 lg:mt-10">
            {[
              ["Setting", "Solitaire, halo, three-stone or bezel"],
              ["Stone", "Round, oval, emerald or pear. Lab or natural"],
              ["Metal", "Yellow, white or rose gold, or platinum"],
              ["Size", "US 3 to 13, with a free sizer if unsure"],
            ].map(([k, v], i) => (
              <li key={k} className="border-b border-ink/10 py-4 lg:py-5">
                <span className="spec text-gold-ink">0{i + 1}</span>
                <p className="mt-1 font-display text-2xl">{k}</p>
                <p className="mt-1 text-sm text-taupe">{v}</p>
              </li>
            ))}
          </Reveal>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-bone shadow-[0_1px_2px_rgba(14,19,17,0.05),0_30px_60px_-40px_rgba(14,19,17,0.4),0_80px_120px_-80px_rgba(125,95,38,0.35)]">
          <div ref={stage} className="relative aspect-[5/4] lg:aspect-[4/3]" data-cursor={live ? "Drag" : undefined}>
            <Still src={stillSrc(shape, t.tone)} alt={label} hidden={live} />
            <canvas
              ref={canvas}
              aria-label={`${label}. Drag to turn it.`}
              role="img"
              className={clsx("absolute inset-0 size-full cursor-grab touch-pan-y transition-opacity duration-1000 active:cursor-grabbing", live ? "opacity-100" : "pointer-events-none opacity-0")}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_38%,rgb(255_255_255/0.35),transparent_70%)]" />
            <p className={clsx("spec pointer-events-none absolute top-5 left-6 text-taupe transition-opacity duration-700", live ? "opacity-100" : "opacity-0")} aria-hidden>
              Live 3D · drag to turn
            </p>
          </div>

          <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-8">
            <div className="space-y-3">
              <div role="radiogroup" aria-label="Stone shape" className="flex flex-wrap gap-1.5 sm:gap-2">
                {SHAPES.map((s) => (
                  <button key={s.id} type="button" role="radio" aria-checked={shape === s.id} onClick={() => setShape(s.id)} className="chip active:scale-95 max-sm:px-3 max-sm:text-[0.8rem]">
                    {s.name}
                  </button>
                ))}
              </div>
              <div role="radiogroup" aria-label="Metal" className="flex items-center gap-1">
                {TONES.map((m, i) => (
                  <button key={m.tone} type="button" role="radio" aria-checked={toneIdx === i} aria-label={m.label} title={m.label} onClick={() => setToneIdx(i)} className="grid size-11 place-items-center active:scale-90">
                    <span className={`block size-6 rounded-full ring-1 ring-offset-2 ring-offset-bone transition ${toneIdx === i ? "ring-ink" : "ring-transparent"}`} style={{ background: m.swatch }} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-taupe">{t.label}</span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 md:block md:text-right">
              <div>
                <p className="spec text-taupe">1 ct lab-grown solitaire</p>
                <p className="font-display text-4xl">
                  <span ref={priceRef} aria-hidden>
                    {formatPrice(total)}
                  </span>
                  <span className="sr-only" aria-live="polite">
                    {formatPrice(total)}
                  </span>
                </p>
              </div>
              <Link href={`/engagement/build?shape=${shape}&metal=${t.metal}`} className="btn btn-ink md:mt-4">
                Open the builder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
