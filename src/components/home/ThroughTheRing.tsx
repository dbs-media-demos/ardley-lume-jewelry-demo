"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion, whenIdle } from "@/lib/gsap";
import type { CardImg } from "@/lib/card-types";
import { Magnetic } from "@/components/ui/Magnetic";

/**
 * Scene 4: a giant "forever" whose o is a gold ring. Scrolling flies the camera
 * through the ring: the ivory panel scales around the ring's centre while a
 * mask hole (exactly the ring's opening) grows to fill the screen, revealing the
 * engagement scene behind it. Without motion it's simply two stacked sections.
 */
export function ThroughTheRing({ photo }: { photo: CardImg }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const panel = el.querySelector<HTMLElement>("[data-panel]")!;
      const ring = el.querySelector<HTMLElement>("[data-ring]")!;
      const scene = el.querySelector<HTMLElement>("[data-scene]")!;

      const measure = () => {
        const p = panel.getBoundingClientRect();
        const r = ring.getBoundingClientRect();
        const cx = r.left - p.left + r.width / 2;
        const cy = r.top - p.top + r.height / 2;
        const inner = (r.width / 2) * 0.72;
        panel.style.setProperty("--cx", `${cx}px`);
        panel.style.setProperty("--cy", `${cy}px`);
        panel.style.setProperty("--r", `${inner}px`);
        panel.style.transformOrigin = `${cx}px ${cy}px`;
        // Scale needed for the hole to cover the farthest corner.
        const far = Math.max(Math.hypot(cx, cy), Math.hypot(p.width - cx, cy), Math.hypot(cx, p.height - cy), Math.hypot(p.width - cx, p.height - cy));
        return (far / inner) * 1.08;
      };

      return whenIdle(() => {
        gsap.set(panel, { position: "absolute", inset: 0, zIndex: 2 });
        el.dataset.mode = "fly";
        // While the ivory panel covers the scene the header must stay dark-on-light.
        scene.removeAttribute("data-dark");
        let maxScale = measure();
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=170%",
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (st) => el.toggleAttribute("data-dark", st.progress > 0.62),
            onLeave: () => el.setAttribute("data-dark", ""),
            onRefreshInit: () => {
              gsap.set(panel, { scale: 1 });
              maxScale = measure();
            },
          },
        });
        tl.to("[data-ring-copy]", { opacity: 0, y: -30, duration: 0.15 }, 0)
          .to(panel, { scale: () => maxScale, duration: 0.7, ease: "power2.in" }, 0.05)
          .set(panel, { autoAlpha: 0 }, 0.76)
          .fromTo("[data-scene-img]", { scale: 1.35 }, { scale: 1, duration: 0.8 }, 0.05)
          .fromTo(scene.querySelectorAll("[data-scene-copy] > *"), { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.2 }, 0.72);
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set([panel, "[data-scene-img]", "[data-ring-copy]"], { clearProps: "all" });
          delete el.dataset.mode;
          el.removeAttribute("data-dark");
          scene.setAttribute("data-dark", "");
        };
      }, 1200, el);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="group/fly relative overflow-hidden">
      <section
        data-panel
        aria-labelledby="forever-title"
        className="relative flex h-[100svh] flex-col items-center justify-center bg-ivory px-5 text-center text-ink"
      >
        <p data-ring-copy className="eyebrow text-gold-ink">
          Engagement &amp; bridal
        </p>
        <h2 id="forever-title" className="mt-4 font-display text-[clamp(5rem,21vw,20rem)] leading-[0.8] tracking-[-0.04em]">
          <span className="sr-only">forever</span>
          <span aria-hidden className="inline-flex items-center">
            f
            <span data-ring className="relative mx-[0.02em] inline-block size-[0.62em] translate-y-[0.06em]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
                <defs>
                  <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f3dc9b" />
                    <stop offset="0.45" stopColor="#c9a55c" />
                    <stop offset="0.7" stopColor="#8f6e2c" />
                    <stop offset="1" stopColor="#e8d6a8" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="43" fill="none" stroke="url(#ring-gold)" strokeWidth="14" />
                <path d="M50 -8 L58 3 L50 14 L42 3 Z" fill="#fffaf0" stroke="#c9a55c" strokeWidth="1.2" />
              </svg>
            </span>
            rever
          </span>
        </h2>
        <p data-ring-copy className="mt-8 max-w-md text-taupe">
          Engagement rings, made around one stone: yours. Scroll through the ring.
        </p>
      </section>

      <section data-scene data-dark className="relative h-[100svh] overflow-hidden bg-ink text-ivory" aria-label="Engagement rings">
        <div data-scene-img className="absolute inset-0">
          <Image src={photo.src} alt={photo.alt} fill sizes="100vw" quality={75} className="object-cover" placeholder="blur" blurDataURL={photo.blur} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" />
        <div data-scene-copy className="wrap relative flex h-full flex-col justify-center">
          <p className="eyebrow text-gold-pale">The proposal, handled</p>
          <p className="mt-4 max-w-2xl font-display text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.95]">One stone. Chosen by eye, set by hand.</p>
          <p className="mt-6 max-w-md text-ivory/85">
            Compare stones side by side under daylight and candlelight, lab-grown or natural, then watch yours being set. Video consultations for out-of-towners.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Link href="/engagement/build" className="btn btn-gold">
                Build your ring
              </Link>
            </Magnetic>
            <Link href="/shop/engagement" className="btn btn-ghost-light">
              Shop engagement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
