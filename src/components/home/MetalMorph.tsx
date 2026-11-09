"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import clsx from "clsx";
import { useDesktopScene } from "@/lib/motion";
import type { CardImg } from "@/lib/card-types";

type Gold = { key: string; name: string; note: string; bg: string; img: CardImg };

/**
 * Scene 6: three golds, one piece. Desktop: the section pins; scrolling morphs the
 * same signet from yellow to white to rose with a sweep of light, while the whole
 * room changes colour with it. Phones: tap a gold and the photo (and the room) change.
 */
export function MetalMorph({ golds, href }: { golds: Gold[]; href: string }) {
  const root = useRef<HTMLElement>(null);
  const [pick, setPick] = useState(0);
  const jump = useRef<((i: number) => void) | null>(null);

  useDesktopScene(root, ({ gsap }, el) => {
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
    // A click on a gold scrolls the scene to it.
    jump.current = (i) => {
      const st = tl.scrollTrigger;
      if (!st) return;
      const y = st.start + ((st.end - st.start) * i) / tl.duration();
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    };
    return () => {
      jump.current = null;
      delete el.dataset.mode;
    };
  });

  const choose = (i: number) => {
    if (jump.current) jump.current(i);
    else setPick(i);
  };

  return (
    <section
      ref={root}
      className="group/morph relative overflow-hidden text-ink transition-colors duration-700 data-[mode=morph]:transition-none"
      style={{ backgroundColor: golds[pick].bg }}
      aria-labelledby="morph-title"
    >
      <div className="wrap grid items-center gap-8 py-16 lg:min-h-[100svh] lg:grid-cols-[1fr_1.1fr_1fr] lg:gap-10 lg:py-20">
        <div>
          <p className="eyebrow text-gold-ink">Choose your gold</p>
          <h2 id="morph-title" className="mt-4 font-display text-[clamp(2.6rem,5vw,4.8rem)]">
            Three golds. One piece.
          </h2>
          <p className="mt-5 max-w-sm text-taupe">
            Every gold piece comes in yellow, white or rose, all solid and recycled. Tap a swatch on any product and the photo changes with it.
          </p>
          <Link href={href} className="btn btn-ink mt-8 max-lg:hidden">
            Shop the Lume Signet
          </Link>
        </div>

        <div className="relative mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-[1.6rem] lg:aspect-[4/5] lg:rounded-[2rem] shadow-[0_2px_4px_rgba(14,19,17,0.06),0_24px_48px_-24px_rgba(14,19,17,0.35),0_60px_100px_-50px_rgba(14,19,17,0.45)] max-lg:max-w-[26rem]">
          {golds.map((g, i) => (
            <div
              key={g.key}
              data-gold={i}
              className={clsx(
                "absolute inset-0 transition-opacity duration-500 group-data-[mode=morph]/morph:transition-none",
                i > 0 && "group-data-[mode=morph]/morph:[clip-path:inset(0%_100%_0%_0%)]",
                pick === i ? "opacity-100" : "opacity-0 group-data-[mode=morph]/morph:opacity-100",
              )}
            >
              <Image src={g.img.src} alt={g.img.alt} fill sizes="(min-width:1024px) 30vw, 26rem" quality={75} className="object-cover" placeholder="blur" blurDataURL={g.img.blur} />
              <div data-sweep={i} aria-hidden className="absolute inset-y-0 -left-1/2 w-[200%] -translate-x-[120%] bg-[linear-gradient(105deg,transparent_42%,rgba(255,250,235,0.7)_50%,transparent_58%)]" />
            </div>
          ))}
        </div>

        <ol className="lg:space-y-6 lg:pl-10">
          {golds.map((g, i) => (
            <li key={g.key} className="border-t border-ink/15">
              <button
                type="button"
                onClick={() => choose(i)}
                aria-pressed={pick === i}
                className="group/g block w-full pt-3 pb-2 text-left lg:pt-4 transition-transform active:scale-[0.99] lg:pb-0"
              >
                <span className="flex items-center gap-3">
                  <span className="spec text-gold-ink">0{i + 1}</span>
                  <span
                    aria-hidden
                    className={clsx("size-3 rounded-full ring-1 ring-ink/20 transition-transform lg:hidden", pick === i && "scale-125 ring-ink")}
                    style={{ background: ["linear-gradient(135deg,#f3dc9b,#c9a55c)", "linear-gradient(135deg,#f1f2f4,#b7bcc2)", "linear-gradient(135deg,#f6d2c2,#d39a83)"][i] }}
                  />
                </span>
                <span
                  data-label={i}
                  className={clsx("mt-1 block font-display text-3xl transition-opacity duration-300 group-data-[mode=morph]/morph:transition-none", pick === i ? "opacity-100" : "opacity-50")}
                >
                  {g.name}
                </span>
                <span
                  data-note={i}
                  className={clsx("mt-1 block text-sm text-taupe", i > 0 && "group-data-[mode=morph]/morph:opacity-0")}
                >
                  {g.note}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <Link href={href} className="btn btn-ink justify-self-start lg:hidden">
          Shop the Lume Signet
        </Link>
      </div>
    </section>
  );
}
