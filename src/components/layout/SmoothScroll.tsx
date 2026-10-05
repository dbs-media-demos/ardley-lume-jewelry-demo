"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion, isTouch, whenIdle } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scrolling on desktop only, loaded after idle and driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Touch devices keep native momentum scrolling; reduced motion keeps native scrolling too.
    if (prefersReducedMotion() || isTouch()) return;
    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;
    let dead = false;
    const cancel = whenIdle(() => {
      import("lenis").then(({ default: L }) => {
        if (dead) return;
        lenis = new L({ lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: -96 } });
        window.__lenis = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        tick = (time: number) => lenis?.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      });
    }, 2000);
    return () => {
      dead = true;
      cancel();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  // New page: re-measure every trigger once the new layout settles.
  useEffect(() => {
    window.__lenis?.resize();
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
