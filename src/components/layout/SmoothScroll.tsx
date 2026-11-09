"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { isDesktop, loadGsap, onIdle } from "@/lib/motion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scrolling on desktop only, loaded after idle and driven by GSAP's ticker so ScrollTrigger stays in sync. Phones keep native scrolling and never download either. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isDesktop()) return;
    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;
    let dead = false;
    let kit: Awaited<ReturnType<typeof loadGsap>> | null = null;
    const cancel = onIdle(() => {
      void Promise.all([import("lenis"), loadGsap()]).then(([{ default: L }, k]) => {
        if (dead) return;
        kit = k;
        lenis = new L({ lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: -96 } });
        window.__lenis = lenis;
        lenis.on("scroll", k.ScrollTrigger.update);
        tick = (time: number) => lenis?.raf(time * 1000);
        k.gsap.ticker.add(tick);
        k.gsap.ticker.lagSmoothing(0);
      });
    }, 2000);
    return () => {
      dead = true;
      cancel();
      if (tick) kit?.gsap.ticker.remove(tick);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  // New page: re-measure every trigger once the new layout settles.
  useEffect(() => {
    if (!isDesktop()) return;
    window.__lenis?.resize();
    const id = window.setTimeout(() => void loadGsap().then((k) => k.ScrollTrigger.refresh()), 400);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
