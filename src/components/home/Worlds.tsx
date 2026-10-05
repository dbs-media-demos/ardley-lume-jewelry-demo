"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, isTouch, prefersReducedMotion, whenIdle } from "@/lib/gsap";
import type { CardImg } from "@/lib/card-types";

export type World = { slug: string; name: string; blurb: string; count: number; img: CardImg; from: number };

/**
 * Scene 3: six rooms, one per category. Desktop: the page pins and the rooms
 * slide past horizontally with parallax inside each frame. Phones: a native swipe
 * rail with snap points (no scroll-jacking).
 */
export function Worlds({ worlds }: { worlds: World[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const tr = track.current;
      if (!el || !tr || prefersReducedMotion() || isTouch() || window.innerWidth < 1024) return;
      return whenIdle(() => {
        const distance = () => tr.scrollWidth - window.innerWidth;
        const tween = gsap.to(tr, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.7, invalidateOnRefresh: true },
        });
        tr.querySelectorAll<HTMLElement>("[data-world-img]").forEach((im) => {
          gsap.fromTo(im, { xPercent: -10 }, { xPercent: 10, ease: "none", scrollTrigger: { trigger: im.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        });
        tr.querySelectorAll<HTMLElement>("[data-world-name]").forEach((n) => {
          gsap.fromTo(n, { yPercent: 40, opacity: 0.5 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: n, containerAnimation: tween, start: "left 95%", end: "left 55%", scrub: true } });
        });
        gsap.to("[data-world-progress]", { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, scrub: true } });
      }, 1200, el);
    },
    { scope: root },
  );

  return (
    <section ref={root} data-dark className="relative overflow-hidden bg-forest text-ivory" aria-labelledby="worlds-title">
      <div className="flex min-h-[100svh] flex-col justify-center py-20 lg:h-[100svh] lg:py-0">
        <div className="wrap flex items-end justify-between gap-6 pb-8 lg:pb-10">
          <div>
            <p className="eyebrow text-gold-pale">Six rooms of light</p>
            <h2 id="worlds-title" className="mt-3 font-display text-[clamp(2.4rem,5vw,4.6rem)]">
              Find your piece
            </h2>
          </div>
          <Link href="/shop" className="btn btn-ghost-light hidden sm:inline-flex">
            Shop everything
          </Link>
        </div>

        <div className="no-scrollbar overflow-x-auto max-lg:snap-x max-lg:snap-mandatory lg:overflow-visible" data-cursor="Drag">
          <div ref={track} className="flex w-max gap-4 px-5 md:gap-6 md:px-10 lg:pr-[8vw]">
            {worlds.map((w, i) => (
              <Link
                key={w.slug}
                href={`/shop/${w.slug}`}
                className="group relative block h-[64svh] w-[78vw] shrink-0 snap-center overflow-hidden rounded-2xl bg-moss sm:w-[52vw] lg:h-[68vh] lg:w-[38vw]"
              >
                <div data-world-img className="absolute -inset-x-[12%] inset-y-0">
                  <Image src={w.img.src} alt="" fill sizes="(min-width:1024px) 46vw, 90vw" quality={75} className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <div className="absolute top-5 left-5 spec text-ivory/80">
                  {String(i + 1).padStart(2, "0")} / {String(worlds.length).padStart(2, "0")}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <h3 data-world-name className="font-display text-[clamp(2.4rem,4.4vw,4.4rem)] leading-none">
                    {w.name}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm text-ivory/85">{w.blurb}</p>
                  <p className="mt-4 spec text-gold-pale">
                    {w.count} pieces · from ${w.from.toLocaleString("en-US")} <span aria-hidden>→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="wrap mt-8 hidden lg:block">
          <div className="h-px w-full bg-ivory/15">
            <div data-world-progress className="h-px origin-left scale-x-0 bg-gold" />
          </div>
        </div>
      </div>
    </section>
  );
}
