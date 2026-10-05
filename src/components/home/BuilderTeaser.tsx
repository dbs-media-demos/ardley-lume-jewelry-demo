"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RingPreview } from "@/components/builder/RingPreview";
import { buildPrice, SHAPES, type Shape } from "@/lib/builder";
import { formatPrice } from "@/lib/commerce/pricing";
import type { Tone, Metal } from "@/lib/commerce/types";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";

const TONES: { tone: Tone; metal: Metal; label: string; swatch: string }[] = [
  { tone: "yellow", metal: "14k-yellow", label: "Yellow gold", swatch: "linear-gradient(135deg,#f3dc9b,#c9a55c 55%,#8f6e2c)" },
  { tone: "white", metal: "platinum", label: "Platinum", swatch: "linear-gradient(135deg,#f1f2f4,#b7bcc2 55%,#7b8188)" },
  { tone: "rose", metal: "14k-rose", label: "Rose gold", swatch: "linear-gradient(135deg,#f6d2c2,#d39a83 55%,#9b6250)" },
];

/** Scene 5: a taste of the ring builder. Shape and metal change the live preview and the price. */
export function BuilderTeaser() {
  const [shape, setShape] = useState<Shape>("oval");
  const [toneIdx, setToneIdx] = useState(0);
  const t = TONES[toneIdx];
  const total = buildPrice({ setting: "solitaire", shape, carat: 1, stone: "lab", metal: t.metal, size: 6 }).total;
  const priceRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(total);

  useEffect(() => {
    const el = priceRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = formatPrice(total);
      shown.current = total;
      return;
    }
    const o = { v: shown.current };
    const tw = gsap.to(o, {
      v: total,
      duration: 0.9,
      ease: "expo.out",
      onUpdate: () => {
        el.textContent = formatPrice(Math.round(o.v / 5) * 5);
      },
      onComplete: () => {
        shown.current = total;
      },
    });
    return () => {
      tw.kill();
    };
  }, [total]);

  return (
    <section className="relative overflow-hidden bg-ivory py-24 text-ink md:py-36" aria-labelledby="builder-title">
      <div className="wrap grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow text-gold-ink">The ring builder</p>
          <SplitReveal id="builder-title" className="mt-4 font-display text-[clamp(2.6rem,5.4vw,5rem)]">
            Four choices. One ring that&apos;s only yours.
          </SplitReveal>
          <Reveal as="ol" stagger={0.08} className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-ink/10 sm:grid-cols-2">
            {[
              ["Setting", "Solitaire, halo, three-stone or bezel"],
              ["Stone", "Round, oval, emerald or pear. Lab or natural"],
              ["Metal", "Yellow, white or rose gold, or platinum"],
              ["Size", "US 3 to 13, with a free sizer if unsure"],
            ].map(([k, v], i) => (
              <li key={k} className="bg-bone/60 p-5">
                <span className="spec text-gold-ink">0{i + 1}</span>
                <p className="mt-1 font-display text-2xl">{k}</p>
                <p className="mt-1 text-sm text-taupe">{v}</p>
              </li>
            ))}
          </Reveal>
        </div>

        <div className="relative rounded-[2rem] bg-bone p-6 md:p-10">
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(60%_50%_at_50%_40%,#fff,transparent)]" aria-hidden />
          <RingPreview setting="solitaire" shape={shape} carat={1} tone={t.tone} title={`Solitaire with a 1 carat ${shape} stone in ${t.label}`} className="relative mx-auto w-full max-w-md" />

          <div className="relative mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div role="radiogroup" aria-label="Stone shape" className="flex flex-wrap gap-2">
                {SHAPES.map((s) => (
                  <button key={s.id} type="button" role="radio" aria-checked={shape === s.id} onClick={() => setShape(s.id)} className="chip">
                    {s.name}
                  </button>
                ))}
              </div>
              <div role="radiogroup" aria-label="Metal" className="flex items-center gap-1">
                {TONES.map((m, i) => (
                  <button key={m.tone} type="button" role="radio" aria-checked={toneIdx === i} aria-label={m.label} title={m.label} onClick={() => setToneIdx(i)} className="grid size-11 place-items-center">
                    <span className={`block size-6 rounded-full ring-1 ring-offset-2 ring-offset-bone transition ${toneIdx === i ? "ring-ink" : "ring-transparent"}`} style={{ background: m.swatch }} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-taupe">{t.label}</span>
              </div>
            </div>
            <div className="md:text-right">
              <p className="spec text-taupe">1 ct lab-grown solitaire</p>
              <p className="font-display text-4xl">
                <span ref={priceRef} aria-hidden>
                  {formatPrice(total)}
                </span>
                <span className="sr-only" aria-live="polite">
                  {formatPrice(total)}
                </span>
              </p>
              <Link href={`/engagement/build?shape=${shape}&metal=${t.metal}`} className="btn btn-ink mt-4">
                Open the builder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
