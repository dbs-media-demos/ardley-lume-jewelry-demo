"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import clsx from "clsx";
import { gsap, useGSAP, prefersReducedMotion, whenIdle } from "@/lib/gsap";
import type { CardImg } from "@/lib/card-types";

type Gold = { key: string; name: string; note: string; bg: string; img: CardImg };

/**
 * Scene 6: three golds, one piece. The section pins; scrolling morphs the same
 * signet from yellow to white to rose with a sweep of light, while the whole room
 * changes colour with it.
 */
export function MetalMorph({ golds, href }: { golds: Gold[]; href: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      return whenIdle(() => {
        el.dataset.mode = "morph";
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "+=200%", pin: true, scrub: 0.8 },
        });
        golds.forEach((g, i) => {
          if (i === 0) return;
          const at = i - 0.5;
          tl.to(el, { backgroundColor: g.bg, duration: 0.5 }, at)
            .fromTo(`[data-gold="${i}"]`, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5 }, at)
            .fromTo(`[data-sweep="${i}"]`, { xPercent: -120 }, { xPercent: 120, duration: 0.5 }, at)
            .to(`[data-label="${i - 1}"]`, { opacity: 0.5, duration: 0.2 }, at + 0.15)
            .fromTo(`[data-label="${i}"]`, { opacity: 0.5 }, { opacity: 1, duration: 0.2 }, at + 0.15)
            .fromTo(`[data-note="${i}"]`, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.2 }, at + 0.25)
            .to(`[data-note="${i - 1}"]`, { opacity: 0, y: -16, duration: 0.2 }, at + 0.1);
        });
        tl.to({}, { duration: 0.3 });
        return () => {
          delete el.dataset.mode;
        };
      }, 1200, el);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="group/morph relative overflow-hidden text-ink" style={{ backgroundColor: golds[0].bg }} aria-labelledby="morph-title">
      <div className="wrap grid min-h-[100svh] items-center gap-10 py-20 lg:grid-cols-[1fr_1.1fr_1fr]">
        <div>
          <p className="eyebrow text-gold-ink">Choose your gold</p>
          <h2 id="morph-title" className="mt-4 font-display text-[clamp(2.6rem,5vw,4.8rem)]">
            Three golds. One piece.
          </h2>
          <p className="mt-5 max-w-sm text-taupe">
            Every gold piece comes in yellow, white or rose, all solid and recycled. Tap a swatch on any product and the photo changes with it.
          </p>
          <Link href={href} className="btn btn-ink mt-8">
            Shop the Lume Signet
          </Link>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(14,19,17,0.45)]">
          {golds.map((g, i) => (
            <div
              key={g.key}
              data-gold={i}
              className={clsx("absolute inset-0", i > 0 && "group-data-[mode=morph]/morph:[clip-path:inset(0%_100%_0%_0%)]")}
            >
              <Image src={g.img.src} alt={g.img.alt} fill sizes="(min-width:1024px) 30vw, 90vw" quality={75} className="object-cover" placeholder="blur" blurDataURL={g.img.blur} />
              <div data-sweep={i} aria-hidden className="absolute inset-y-0 -left-1/2 w-[200%] -translate-x-[120%] bg-[linear-gradient(105deg,transparent_42%,rgba(255,250,235,0.7)_50%,transparent_58%)]" />
            </div>
          ))}
        </div>

        <ol className="space-y-6 lg:pl-10">
          {golds.map((g, i) => (
            <li key={g.key} className="border-t border-ink/15 pt-4">
              <p className="spec text-gold-ink">0{i + 1}</p>
              <p data-label={i} className={clsx("font-display text-3xl", i > 0 && "group-data-[mode=morph]/morph:opacity-50")}>
                {g.name}
              </p>
              <p data-note={i} className={clsx("mt-1 text-sm text-taupe", i > 0 && "group-data-[mode=morph]/morph:opacity-0")}>
                {g.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
