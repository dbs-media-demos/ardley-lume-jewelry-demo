"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, isTouch, prefersReducedMotion, whenIdle } from "@/lib/gsap";
import type { CardImg } from "@/lib/card-types";

export type Moment = { year: string; title: string; body: string; img: CardImg };

/** Horizontal timeline: pinned and scrubbed sideways on desktop, a swipe rail on phones. */
export function Timeline({ moments }: { moments: Moment[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const tr = track.current;
      if (!el || !tr || prefersReducedMotion() || isTouch() || window.innerWidth < 1024) return;
      return whenIdle(
        () => {
          const dist = () => tr.scrollWidth - window.innerWidth + 80;
          const tween = gsap.to(tr, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.7, invalidateOnRefresh: true } });
          gsap.to("[data-tl-line]", { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, scrub: true } });
          tr.querySelectorAll<HTMLElement>("[data-tl-img]").forEach((im) => {
            gsap.fromTo(im, { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: im, containerAnimation: tween, start: "left right", end: "right 60%", scrub: true } });
          });
        },
        1200,
        el,
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} data-dark className="relative overflow-hidden bg-ink py-20 text-ivory lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0" aria-labelledby="timeline-title">
      <div className="wrap">
        <p className="eyebrow text-gold-pale">Twelve years at the bench</p>
        <h2 id="timeline-title" className="mt-3 font-display text-[clamp(2.4rem,5vw,4.4rem)]">
          The long way round
        </h2>
      </div>
      <div className="no-scrollbar mt-10 overflow-x-auto lg:overflow-visible" data-cursor="Drag">
        <ol ref={track} className="relative flex w-max gap-6 px-5 md:px-10">
          <span aria-hidden className="absolute top-[5.4rem] right-10 left-10 h-px bg-ivory/15">
            <span data-tl-line className="block h-px origin-left scale-x-0 bg-gold" />
          </span>
          {moments.map((m) => (
            <li key={m.year} className="relative w-[78vw] shrink-0 sm:w-[46vw] lg:w-[30vw]">
              <p className="font-display text-7xl text-gold">{m.year}</p>
              <span aria-hidden className="mt-2 block size-3 rounded-full border-2 border-gold bg-ink" />
              <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-2xl">
                <div data-tl-img className="absolute inset-0">
                  <Image src={m.img.src} alt={m.img.alt} fill sizes="(min-width:1024px) 30vw, 78vw" quality={60} className="object-cover" />
                </div>
              </div>
              <h3 className="mt-5 font-display text-3xl">{m.title}</h3>
              <p className="mt-2 max-w-sm text-sm text-ivory/80">{m.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
