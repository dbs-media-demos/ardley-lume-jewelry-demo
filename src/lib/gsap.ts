"use client";

/* GSAP itself. Only ever reached through `loadGsap()` in lib/motion (a dynamic import), so phones never download it. */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Jewelry moves like light: long, soft, never bouncy.
  gsap.defaults({ ease: "expo.out", duration: 1.2 });
}

/** Below-the-fold plugins are fetched on first use to keep the first load lean. */
export const loadSplitText = () =>
  import("gsap/SplitText").then(({ SplitText }) => {
    gsap.registerPlugin(SplitText);
    return SplitText;
  });

export const loadFlip = () =>
  import("gsap/Flip").then(({ Flip }) => {
    gsap.registerPlugin(Flip);
    return Flip;
  });

export const loadDraggable = () =>
  Promise.all([import("gsap/Draggable"), import("gsap/InertiaPlugin")]).then(([{ Draggable }, { InertiaPlugin }]) => {
    gsap.registerPlugin(Draggable, InertiaPlugin);
    return Draggable;
  });

let refreshTimer = 0;
/**
 * Scenes are set up lazily and in no particular order, so after each one we
 * re-sort every ScrollTrigger by its position on the page and refresh once
 * (debounced). Otherwise a pin created "late" would push later pins off.
 */
export function scheduleRefresh() {
  if (typeof window === "undefined") return;
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, 120);
}

export { gsap, ScrollTrigger };
