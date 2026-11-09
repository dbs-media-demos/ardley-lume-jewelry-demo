"use client";

import { useEffect, useRef, useState } from "react";
import { afterLoad, canRun3D, isDesktop, loadGsap } from "@/lib/motion";
import { giveUp3D, inTurn, is3DOff, on3DOff, watchFrames, watchWarmUp } from "@/lib/three-gate";
import type { RingHandle } from "@/components/fx/RingScene";

declare global {
  interface Window {
    __ringStill?: () => string;
  }
}

/**
 * Client half of the home hero.
 * - Phones, tablets, reduced motion, Save-Data: the ring is a still image (server HTML),
 *   nothing pins, and neither GSAP nor three.js is downloaded.
 * - Desktop (big screen + mouse): once the page has loaded and the browser is idle,
 *   three.js is imported inside the effect, the scene warms up unseen, and only then
 *   does the live ring fade in over the still, which stays as the fallback. If the
 *   warm-up stutters, it stops and the still stays; if the first 2 s of frames are too
 *   slow (or the other scene's were), it fades back to the still; either way for the
 *   rest of the visit (lib/three-gate). The hero pins and scrubs the dive.
 * - `?still=WxH` renders the opening frame at that size for scripts/ring-stills.mjs.
 */
export function HeroMotion({ still }: { still: { phone: string; desktop: string } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const ring = useRef<RingHandle | null>(null);
  const progress = useRef(0);
  const onScreen = useRef(false);
  const [live, setLive] = useState(false);

  // Scroll dive (desktop).
  useEffect(() => {
    if (!isDesktop()) return;
    const hero = document.getElementById("hero");
    if (!hero) return;
    let dead = false;
    let ctx: { revert: () => void } | null = null;
    const cancel = afterLoad(() => {
      void loadGsap().then(({ gsap, scheduleRefresh }) => {
        if (dead) return;
        ctx = gsap.context(() => {
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "+=110%",
              pin: true,
              pinSpacer: document.getElementById("hero-spacer") ?? undefined,
              scrub: 0.6,
              onUpdate: (st) => {
                progress.current = st.progress;
                ring.current?.setDive(Math.min(1, st.progress * 1.25));
                ring.current?.setVisible(onScreen.current && st.progress < 0.999);
              },
            },
          });
          tl.to("[data-hero-photo]", { scale: 1.5, yPercent: -6, duration: 1 }, 0)
            .to("[data-hero-copy]", { yPercent: -35, opacity: 0, duration: 0.45 }, 0)
            .to("[data-hero-cue]", { opacity: 0, duration: 0.15 }, 0)
            .to("[data-hero-canvas]", { scale: 1.08, duration: 1 }, 0)
            .fromTo("[data-hero-flash]", { opacity: 0 }, { opacity: 0.9, duration: 0.22 }, 0.58)
            .to("[data-hero-flash]", { opacity: 0, duration: 0.2 }, 0.8)
            .fromTo("[data-hero-night]", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.75)
            // The facets diagram (which may extend above its scene) only appears once the dive has gone dark.
            .fromTo("[data-facets-art]", { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.88);
        });
        scheduleRefresh();
      });
    }, 600);
    return () => {
      dead = true;
      cancel();
      ctx?.revert();
    };
  }, []);

  // Live WebGL ring (desktop only; three.js is imported here and nowhere else on this page).
  useEffect(() => {
    const stillSize = new URLSearchParams(window.location.search).get("still");
    if (!stillSize && (!canRun3D() || is3DOff())) return;
    let disposed = false;
    let fade = 0;
    const onMove = (e: PointerEvent) => ring.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const hero = document.getElementById("hero");
    // Off screen, or once the dive has gone fully dark (the night layer covers the canvas), nothing is drawn.
    const io = hero
      ? new IntersectionObserver(([en]) => {
          onScreen.current = en.isIntersecting;
          ring.current?.setVisible(en.isIntersecting && progress.current < 0.999);
        })
      : null;

    const start = async () => {
      const canvas = canvasRef.current;
      if (disposed || ring.current || !canvas || (!stillSize && is3DOff())) return;
      if (stillSize && wrapRef.current) {
        const [w, h] = stillSize.split("x").map(Number);
        Object.assign(wrapRef.current.style, { position: "fixed", inset: "0 auto auto 0", width: `${w}px`, height: `${h}px`, maskImage: "none", opacity: "1" });
      }
      performance.mark("3d:hero:start");
      let judged = () => {};
      const verdict = new Promise<void>((r) => (judged = r));
      const watch = watchFrames((ok) => {
        performance.mark(ok ? "3d:hero:smooth" : "3d:hero:slow");
        if (!ok) giveUp3D();
        judged();
      });
      const { createRingScene } = await import("@/components/fx/RingScene");
      if (disposed) return;
      // A warm-up that stutters means a processor too slow for live 3D: stop, keep the still.
      // (Watched from here: evaluating three.js itself is a one-off any machine pays once.)
      const warm = stillSize ? null : watchWarmUp();
      let handle: RingHandle | null = null;
      try {
        handle = await createRingScene(canvas, { still: !!stillSize, onGap: stillSize ? undefined : watch, proceed: warm?.ok });
        if (warm && !warm.ok()) {
          handle?.dispose(true);
          performance.mark("3d:hero:slow-warm-up");
          return giveUp3D();
        }
      } finally {
        warm?.stop();
      }
      if (!handle) return; // no real graphics chip: the still stays
      if (disposed || (!stillSize && is3DOff())) return handle.dispose();
      ring.current = handle;
      if (stillSize) {
        window.__ringStill = () => handle.snapshot();
        return;
      }
      handle.setDive(Math.min(1, progress.current * 1.25));
      window.addEventListener("pointermove", onMove, { passive: true });
      if (hero) io?.observe(hero);
      performance.mark("3d:hero:ready");
      setLive(true);
      // The next scene warms up once this one has proved smooth (or after 2.5 s if it's out of sight).
      await Promise.race([verdict, new Promise((r) => setTimeout(r, 2500))]);
    };

    // Too slow here or in another scene: freeze, fade back to the still, then free the GPU.
    const offSlow = on3DOff(() => {
      const r = ring.current;
      if (!r || stillSize) return;
      r.stop();
      setLive(false);
      window.removeEventListener("pointermove", onMove);
      fade = window.setTimeout(() => {
        r.dispose(true);
        if (ring.current === r) ring.current = null;
      }, 1600);
    });

    // After load and idle: the photo, the still and the text always come first.
    const cancel = afterLoad(() => void inTurn(start), 800);
    return () => {
      disposed = true;
      cancel();
      offSlow();
      window.clearTimeout(fade);
      window.removeEventListener("pointermove", onMove);
      io?.disconnect();
      ring.current?.dispose();
      ring.current = null;
      delete window.__ringStill;
    };
  }, []);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    if (live) hero.dataset.ring = "on";
    else delete hero.dataset.ring;
  }, [live]);

  return (
    <div
      ref={wrapRef}
      data-hero-canvas
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-[3.5rem] z-[2] h-[35%] lg:inset-x-auto lg:top-0 lg:right-0 lg:h-full lg:w-[62%] lg:[mask-image:linear-gradient(to_right,transparent,#000_24%)]"
    >
      <picture>
        <source media="(min-width: 1024px)" srcSet={still.desktop} />
        <img
          src={still.phone}
          alt=""
          decoding="async"
          className={`absolute inset-0 size-full object-contain object-[64%_50%] transition-opacity delay-500 duration-1000 lg:object-cover lg:object-center ${live ? "opacity-0" : "opacity-100"}`}
        />
      </picture>
      <canvas ref={canvasRef} className={`absolute inset-0 size-full transition-opacity duration-[1.4s] ease-[var(--ease-out-expo)] ${live ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
