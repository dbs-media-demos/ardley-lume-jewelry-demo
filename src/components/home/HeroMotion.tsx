"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, isTouch, prefersReducedMotion, whenIdle } from "@/lib/gsap";
import type { RingHandle } from "@/components/fx/RingScene";

/**
 * Client half of the home hero:
 * - pins the hero and scrubs the "dive": photo pushes in, headline lifts away,
 *   a gold flash, then darkness that hands over to the facets scene;
 * - after idle (desktop) or the first touch (phones), lazy-loads three.js and
 *   fades a turning, cursor-lit ring in over the photo. The photo stays the LCP
 *   element and the fallback.
 */
export function HeroMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ring = useRef<RingHandle | null>(null);
  const progress = useRef(0);
  const [live, setLive] = useState(false);

  // Scroll dive (works with or without WebGL).
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const hero = document.getElementById("hero");
    if (!hero) return;
    let tl: gsap.core.Timeline | null = null;
    const cancel = whenIdle(() => {
      tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=110%",
          pin: true,
          scrub: 0.6,
          onUpdate: (st) => {
            progress.current = st.progress;
            ring.current?.setDive(Math.min(1, st.progress * 1.25));
          },
        },
      });
      tl.to("[data-hero-photo]", { scale: 1.5, yPercent: -6, duration: 1 }, 0)
        .to("[data-hero-copy]", { yPercent: -35, opacity: 0, duration: 0.45 }, 0)
        .to("[data-hero-cue]", { opacity: 0, duration: 0.15 }, 0)
        .to("[data-hero-canvas]", { scale: 1.08, duration: 1 }, 0)
        .fromTo("[data-hero-flash]", { opacity: 0 }, { opacity: 0.9, duration: 0.22 }, 0.58)
        .to("[data-hero-flash]", { opacity: 0, duration: 0.2 }, 0.8)
        .fromTo("[data-hero-night]", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.75);
      // Let the facets scene rise over the last part of the dive (no black gap).
      const facets = document.getElementById("facets");
      if (facets) {
        facets.dataset.overlap = "on";
        ScrollTrigger.refresh();
      }
    });
    return () => {
      cancel();
      tl?.scrollTrigger?.kill();
      delete document.getElementById("facets")?.dataset.overlap;
      tl?.kill();
      gsap.set(["[data-hero-photo]", "[data-hero-copy]", "[data-hero-cue]", "[data-hero-canvas]", "[data-hero-flash]", "[data-hero-night]"], { clearProps: "all" });
    };
  }, []);

  // Lazy WebGL ring.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    let disposed = false;
    let cleanupIdle = () => {};
    const touch = isTouch();

    const start = async () => {
      if (disposed || ring.current || !canvasRef.current) return;
      const test = document.createElement("canvas");
      if (!test.getContext("webgl2")) return;
      const { createRingScene } = await import("@/components/fx/RingScene");
      if (disposed || !canvasRef.current) return;
      ring.current = createRingScene(canvasRef.current, { lowPower: touch });
      ring.current.setDive(Math.min(1, progress.current * 1.25));
      setLive(true);
    };

    if (touch) {
      const kick = () => {
        window.removeEventListener("touchstart", kick);
        window.removeEventListener("scroll", kick);
        start();
      };
      window.addEventListener("touchstart", kick, { passive: true, once: true });
      window.addEventListener("scroll", kick, { passive: true, once: true });
      const t = window.setTimeout(kick, 6000);
      cleanupIdle = () => {
        window.clearTimeout(t);
        window.removeEventListener("touchstart", kick);
        window.removeEventListener("scroll", kick);
      };
    } else {
      // Desktop: after load + idle, so it never competes with first paint.
      const t = window.setTimeout(() => (cleanupIdle = whenIdle(() => void start(), 2500)), 1200);
      cleanupIdle = () => window.clearTimeout(t);
    }

    const onMove = (e: PointerEvent) => ring.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    window.addEventListener("pointermove", onMove, { passive: true });

    const hero = document.getElementById("hero");
    const io = hero ? new IntersectionObserver(([en]) => ring.current?.setVisible(en.isIntersecting)) : null;
    if (hero) io?.observe(hero);

    return () => {
      disposed = true;
      cleanupIdle();
      window.removeEventListener("pointermove", onMove);
      io?.disconnect();
      ring.current?.dispose();
      ring.current = null;
    };
  }, []);

  useEffect(() => {
    if (!live) return;
    const hero = document.getElementById("hero");
    if (hero) hero.dataset.ring = "on";
    ScrollTrigger.refresh();
  }, [live]);

  return (
    <div
      data-hero-canvas
      aria-hidden
      className={`pointer-events-none absolute top-[9%] right-0 z-[2] h-[50%] w-full transition-opacity duration-[2.2s] ease-[var(--ease-out-expo)] md:inset-y-0 md:h-full md:w-[64%] md:[mask-image:linear-gradient(to_right,transparent,#000_22%)] ${live ? "opacity-100" : "opacity-0"}`}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
