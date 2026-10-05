"use client";

import { useRef } from "react";
import type { CardData } from "@/lib/card-types";
import { ProductCard } from "@/components/shop/ProductCard";
import { gsap, useGSAP, prefersReducedMotion, whenIdle } from "@/lib/gsap";

/** "Pairs well with": cards drift at different speeds as the rail scrolls past (parallax). */
export function PairsRail({ items, title }: { items: CardData[]; title: string }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion() || window.innerWidth < 768) return;
      return whenIdle(
        () => {
          el.querySelectorAll<HTMLElement>("[data-par]").forEach((c, i) => {
            gsap.fromTo(c, { y: 60 + i * 40 }, { y: -20 - i * 25, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
          });
        },
        1200,
        el,
      );
    },
    { scope: root },
  );
  if (!items.length) return null;
  return (
    <section ref={root} className="overflow-hidden py-20" aria-labelledby="pairs-title">
      <div className="wrap">
        <h2 id="pairs-title" className="font-display text-[clamp(2rem,4vw,3.4rem)]">
          {title}
        </h2>
        <div className="no-scrollbar -mx-5 mt-10 flex gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0" data-cursor="Drag">
          {items.map((c) => (
            <div key={c.slug} data-par className="w-[70vw] shrink-0 md:w-auto">
              <ProductCard card={c} sizes="(min-width: 768px) 30vw, 70vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
