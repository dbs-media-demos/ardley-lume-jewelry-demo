"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion, whenIdle } from "@/lib/gsap";
import { Counter } from "@/components/ui/Counter";

/* Round-brilliant crown, seen from above: table, stars, kites, upper girdles. */
const P = (r: number, deg: number) => [500 + r * Math.cos((deg * Math.PI) / 180), 500 + r * Math.sin((deg * Math.PI) / 180)] as const;
const R = 440;
const T = Array.from({ length: 8 }, (_, i) => P(R * 0.55, i * 45 - 90));
const S = Array.from({ length: 8 }, (_, i) => P(R * 0.8, i * 45 - 67.5));
const G = Array.from({ length: 16 }, (_, i) => P(R, i * 22.5 - 90));
const pt = (p: readonly [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

const facets: string[] = [];
for (let i = 0; i < 8; i++) {
  const n = (i + 1) % 8;
  facets.push([T[i], S[i], T[n]].map(pt).join(" ")); // star
  facets.push([T[i], S[(i + 7) % 8], G[(2 * i + 15) % 16], G[2 * i], S[i]].map(pt).join(" ")); // kite (approx)
  facets.push([S[i], G[2 * i], G[2 * i + 1]].map(pt).join(" ")); // upper girdle a
  facets.push([S[i], G[2 * i + 1], G[(2 * i + 2) % 16]].map(pt).join(" ")); // upper girdle b
}
const table = T.map(pt).join(" ");

/** Scene 2: the stone's architecture draws itself while the manifesto scrubs in. */
export function Facets() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      return whenIdle(() => {
        const lines = el.querySelectorAll<SVGGeometryElement>("[data-line]");
        lines.forEach((l) => {
          const len = l.getTotalLength();
          gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
        });
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", end: "bottom bottom", scrub: 0.8 } });
        tl.to(lines, { strokeDashoffset: 0, stagger: 0.004, duration: 0.5, ease: "none" }, 0)
          .fromTo("[data-diagram]", { scale: 1.9, rotate: -24 }, { scale: 1, rotate: 0, duration: 1, ease: "none" }, 0)
          .fromTo("[data-sweep]", { rotate: 0 }, { rotate: 300, duration: 1, ease: "none" }, 0);
        const words = el.querySelectorAll("[data-w]");
        gsap.fromTo(words, { opacity: 0.42 }, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: "[data-manifesto]", start: "top 75%", end: "bottom 40%", scrub: 0.6 } });
      }, 1200, el);
    },
    { scope: root },
  );

  const text = "Every piece begins as a question of light: how it enters a stone, how it leaves, and how it finally lands on you.";

  return (
    <section ref={root} id="facets" data-dark className="relative z-[6] bg-ink text-ivory" aria-labelledby="facets-title">
      {/* Clip sideways only: while this scene rises over the hero, the diagram may extend above its top edge. */}
      <div className="sticky top-0 h-[100svh] overflow-x-clip">
        <div className="absolute inset-0 grid place-items-center">
          <svg data-diagram viewBox="0 0 1000 1000" className="w-[150vw] max-w-none opacity-80 md:w-[min(92vh,80vw)]" aria-hidden>
            <defs>
              <radialGradient id="facet-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e8d6a8" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#e8d6a8" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="facet-beam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff6dc" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff6dc" stopOpacity="0.32" />
                <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
              </linearGradient>
              <clipPath id="facet-clip">
                <circle cx="500" cy="500" r={R} />
              </clipPath>
            </defs>
            <circle cx="500" cy="500" r={R} fill="url(#facet-glow)" />
            <g clipPath="url(#facet-clip)">
              {facets.map((f, i) => (
                <polygon key={i} points={f} fill="#c9a55c" opacity={0.03 + ((i * 37) % 11) / 90} />
              ))}
              <polygon points={table} fill="#c9a55c" opacity="0.06" />
              <g data-sweep style={{ transformOrigin: "500px 500px" }}>
                <rect x="380" y="-200" width="240" height="1400" fill="url(#facet-beam)" />
              </g>
            </g>
            <g fill="none" stroke="#c9a55c" strokeWidth="1.2" strokeLinejoin="round">
              <circle data-line cx="500" cy="500" r={R} />
              <polygon data-line points={table} />
              {facets.map((f, i) => (
                <polygon data-line key={i} points={f} strokeOpacity="0.75" />
              ))}
            </g>
          </svg>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgb(14_19_17/0.55),transparent)]" aria-hidden />
      </div>

      <div className="relative -mt-[100svh] flex min-h-[200svh] flex-col justify-center">
        <div className="wrap grid min-h-[100svh] place-items-center text-center">
          <div data-manifesto className="max-w-4xl">
            <p className="eyebrow text-gold-pale" id="facets-title">
              The Ardley &amp; Lume way
            </p>
            <p className="mt-6 font-display text-[clamp(2rem,4.6vw,4.4rem)] leading-[1.08]">
              {text.split(" ").map((w, i) => (
                <span key={i} data-w>
                  {w}{" "}
                </span>
              ))}
            </p>
          </div>
        </div>
        <div className="wrap grid gap-px overflow-hidden pb-24 sm:grid-cols-3">
          {[
            { v: 2014, label: "At the bench in Dallas since", plain: true },
            { v: 100, suffix: "%", label: "Recycled gold, certified" },
            { v: 4200, suffix: "+", label: "Pieces made by hand" },
          ].map((s) => (
            <div key={s.label} className="border-t border-ivory/15 px-1 py-7 text-left sm:px-6">
              <p className="spec text-mist">{s.label}</p>
              <p className="mt-3 font-display text-6xl text-gold">{s.plain ? s.v : <Counter value={s.v} suffix={s.suffix} />}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
