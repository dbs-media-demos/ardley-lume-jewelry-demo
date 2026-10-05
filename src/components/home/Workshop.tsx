"use client";

import Image from "next/image";
import { useRef } from "react";
import clsx from "clsx";
import { gsap, useGSAP, prefersReducedMotion, whenIdle } from "@/lib/gsap";
import type { CardImg } from "@/lib/card-types";

export type Step = { title: string; body: string; img: CardImg; hours: string };

/**
 * Scene 8 (and the About page): sketch → wax → casting → setting → polish.
 * Pinned and scrubbed; each frame pushes toward you while the next one opens
 * from a window in its centre, so you zoom *through* each step into the next.
 */
export function Workshop({ steps, id = "workshop", title = "From a pencil line to a polished ring" }: { steps: Step[]; id?: string; title?: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      return whenIdle(() => {
        el.dataset.mode = "pin";
        const n = steps.length;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: `+=${(n - 1) * 85}%`,
            pin: true,
            scrub: 0.8,
            onUpdate: (st) => {
              const idx = Math.min(n - 1, Math.round(st.progress * (n - 1)));
              el.querySelectorAll<HTMLElement>("[data-step-copy]").forEach((c, i) => c.toggleAttribute("data-active", i === idx));
              const num = el.querySelector("[data-step-num]");
              if (num) num.textContent = String(idx + 1).padStart(2, "0");
            },
          },
        });
        for (let i = 0; i < n - 1; i++) {
          tl.to(`[data-frame="${i}"]`, { scale: 2.6, duration: 1 }, i)
            .to(`[data-frame="${i}"]`, { opacity: 0, duration: 0.3 }, i + 0.7)
            .fromTo(
              `[data-frame="${i + 1}"]`,
              { clipPath: "inset(42% 40% 42% 40% round 999px)", scale: 0.92 },
              { clipPath: "inset(0% 0% 0% 0% round 0px)", scale: 1, duration: 1 },
              i,
            );
        }
        tl.fromTo("[data-step-bar]", { scaleX: 1 / n }, { scaleX: 1, duration: n - 1 }, 0);
        return () => {
          delete el.dataset.mode;
        };
      }, 1200, el);
    },
    { scope: root },
  );

  return (
    <section ref={root} id={id} data-dark className="group/ws relative bg-ink text-ivory" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="sr-only">
        {title}
      </h2>
      {/* Pinned, scrubbed version (desktop and phones with motion). The static list below is the no-motion fallback. */}
      <div className="relative hidden h-[100svh] overflow-hidden group-data-[mode=pin]/ws:block">
        {steps.map((s, i) => (
          <div key={s.title} data-frame={i} className="absolute inset-0 will-change-transform" style={{ zIndex: i + 1, clipPath: i === 0 ? undefined : "inset(42% 40% 42% 40% round 999px)" }}>
            <Image src={s.img.src} alt={s.img.alt} fill sizes="100vw" quality={60} className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-ink/10" />
          </div>
        ))}
        <div className="wrap pointer-events-none relative z-20 flex h-full flex-col justify-between py-24">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow text-gold-pale">At the bench</p>
              <p aria-hidden className="mt-3 max-w-xl font-display text-[clamp(2.2rem,4.4vw,4.2rem)] leading-[1.04]">
                {title}
              </p>
            </div>
            <p className="font-display text-6xl text-gold md:text-8xl" aria-hidden>
              <span data-step-num>01</span>
              <span className="text-2xl text-ivory/60 md:text-3xl"> / {String(steps.length).padStart(2, "0")}</span>
            </p>
          </div>
          <div className="relative min-h-44 max-w-md">
            {steps.map((s, i) => (
              <div
                key={s.title}
                data-step-copy
                data-active={i === 0 ? "" : undefined}
                className="absolute bottom-0 left-0 translate-y-4 opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] data-[active]:translate-y-0 data-[active]:opacity-100"
              >
                <p className="spec text-gold-pale">
                  Step {i + 1} · {s.hours}
                </p>
                <h3 className="mt-2 font-display text-4xl">{s.title}</h3>
                <p className="mt-3 text-ivory/85">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="h-px w-full bg-ivory/20">
            <div data-step-bar className="h-px origin-left bg-gold" style={{ transform: `scaleX(${1 / steps.length})` }} />
          </div>
        </div>
      </div>

      <div className="wrap py-24 group-data-[mode=pin]/ws:hidden">
        <p className="eyebrow text-gold-pale">At the bench</p>
        <p className="mt-3 max-w-xl font-display text-[clamp(2.2rem,4.4vw,4.2rem)] leading-[1.04]" aria-hidden>
          {title}
        </p>
        <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.title}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Image src={s.img.src} alt={s.img.alt} fill sizes="(min-width:1024px) 20vw, 50vw" quality={60} className="object-cover" />
              </div>
              <p className={clsx("spec mt-4 text-gold-pale")}>
                Step {i + 1} · {s.hours}
              </p>
              <h3 className="mt-1 font-display text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-ivory/85">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
