"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { CardData } from "@/lib/card-types";
import { Price } from "@/components/ui/Price";
import { gsap, loadDraggable, prefersReducedMotion } from "@/lib/gsap";

/**
 * 3D coverflow: drag (or flick, with inertia) through a fanned stack of pieces.
 * Arrow buttons and ←/→ keys work too. Without JS or with reduced motion it's a
 * plain horizontal scroll rail.
 */
export function Coverflow({ items, label, theme = "dark" }: { items: CardData[]; label: string; theme?: "dark" | "light" }) {
  const stage = useRef<HTMLDivElement>(null);
  const proxy = useRef<HTMLDivElement>(null);
  const pos = useRef(0);
  const dragged = useRef(false);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"rail" | "flow">("rail");
  const api = useRef<{ go: (i: number) => void } | null>(null);
  const n = items.length;

  useEffect(() => {
    const el = stage.current;
    const px = proxy.current;
    if (!el || !px || prefersReducedMotion()) return;
    let draggable: { kill: () => void } | null = null;
    let alive = true;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-flow-card]"));
    const spacing = () => Math.min(260, Math.max(150, el.clientWidth * 0.2));

    const render = () => {
      const p = pos.current;
      cards.forEach((c, i) => {
        const o = i - p;
        const a = Math.abs(o);
        gsap.set(c, {
          x: o * spacing() * (a < 1 ? 1 : 0.82 + 0.18 / a),
          z: -Math.min(a, 4) * 140,
          rotateY: Math.max(-58, Math.min(58, -o * 38)),
          scale: a < 1 ? 1.06 - a * 0.06 : 1,
          opacity: a > 3.6 ? 0 : 1 - Math.max(0, a - 2.6) * 0.8,
          zIndex: 100 - Math.round(a * 10),
          filter: `brightness(${Math.max(0.55, 1 - a * 0.16)})`,
        });
      });
      const idx = Math.max(0, Math.min(n - 1, Math.round(p)));
      setActive((cur) => (cur === idx ? cur : idx));
    };

    const go = (i: number) => {
      const target = Math.max(0, Math.min(n - 1, i));
      gsap.to(pos, { current: target, duration: 0.9, ease: "expo.out", onUpdate: render });
      gsap.set(px, { x: -target * spacing() });
    };
    api.current = { go };

    setMode("flow");
    const start = Math.min(2, n - 1);
    pos.current = start;
    gsap.set(px, { x: -start * spacing() });
    requestAnimationFrame(render);

    loadDraggable().then((Draggable) => {
      if (!alive) return;
      [draggable] = Draggable.create(px, {
        type: "x",
        trigger: el,
        inertia: true,
        dragClickables: true,
        minimumMovement: 6,
        bounds: { minX: -(n - 1) * spacing(), maxX: 0 },
        edgeResistance: 0.75,
        snap: (v: number) => Math.round(v / spacing()) * spacing(),
        onDragStart: () => {
          dragged.current = true;
        },
        onDrag: function (this: { x: number }) {
          pos.current = -this.x / spacing();
          render();
        },
        onThrowUpdate: function (this: { x: number }) {
          pos.current = -this.x / spacing();
          render();
        },
        onRelease: () => {
          window.setTimeout(() => (dragged.current = false), 60);
        },
      });
    });

    const onResize = () => go(Math.round(pos.current));
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      draggable?.kill();
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(pos);
      cards.forEach((c) => gsap.set(c, { clearProps: "all" }));
    };
  }, [n]);

  const dark = theme === "dark";

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={stage}
        data-cursor="Drag"
        onKeyDown={(e) => {
          if (mode !== "flow") return;
          if (e.key === "ArrowRight") api.current?.go(active + 1);
          if (e.key === "ArrowLeft") api.current?.go(active - 1);
        }}
        className={clsx(
          "relative select-none",
          mode === "flow" ? "h-[30rem] touch-pan-y [perspective:1400px] md:h-[34rem]" : "no-scrollbar flex snap-x gap-4 overflow-x-auto px-5 pb-4",
        )}
      >
        <div ref={proxy} className="hidden" />
        {items.map((c, i) => (
          <div
            key={c.slug}
            data-flow-card
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}: ${c.name}`}
            className={clsx(
              "w-[min(68vw,18rem)] shrink-0 snap-center md:w-[19rem]",
              mode === "flow" && "absolute top-6 left-1/2 -ml-[min(34vw,9rem)] [transform-style:preserve-3d] md:-ml-[9.5rem]",
            )}
          >
            <Link
              href={`/product/${c.slug}`}
              draggable={false}
              onClick={(e) => {
                if (dragged.current) e.preventDefault();
                else if (mode === "flow" && i !== active) {
                  e.preventDefault();
                  api.current?.go(i);
                }
              }}
              className={clsx("block overflow-hidden rounded-2xl", dark ? "bg-forest text-ivory" : "bg-ivory text-ink shadow-[0_30px_60px_-30px_rgba(14,19,17,0.35)]")}
              tabIndex={mode === "flow" && i !== active ? -1 : 0}
            >
              <div className="relative aspect-[4/5]">
                <Image src={c.tones.yellow.src} alt={c.tones.yellow.alt} fill sizes="19rem" quality={60} draggable={false} className="pointer-events-none object-cover" />
                {c.sale ? <span className="sale-tag absolute top-3 left-3 rounded-full bg-oxblood px-2.5 py-1 text-ivory">−{Math.round(c.sale * 100)}%</span> : null}
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <p className="text-[0.95rem] font-medium">{c.name}</p>
                <Price price={c.price} compareAt={c.compareAt} className="shrink-0 text-sm" />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {mode === "flow" && (
        <div className="mt-2 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => api.current?.go(active - 1)}
            disabled={active === 0}
            aria-label="Previous piece"
            className={clsx("grid size-12 place-items-center rounded-full border transition disabled:opacity-40", dark ? "border-ivory/30 hover:border-ivory" : "border-ink/20 hover:border-ink")}
          >
            ←
          </button>
          <p className={clsx("spec min-w-16 text-center", dark ? "text-mist" : "text-taupe")} aria-live="polite">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </p>
          <button
            type="button"
            onClick={() => api.current?.go(active + 1)}
            disabled={active === n - 1}
            aria-label="Next piece"
            className={clsx("grid size-12 place-items-center rounded-full border transition disabled:opacity-40", dark ? "border-ivory/30 hover:border-ivory" : "border-ink/20 hover:border-ink")}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
