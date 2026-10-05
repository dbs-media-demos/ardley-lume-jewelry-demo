"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Jewelry moves like light: long, soft, never bouncy.
  gsap.defaults({ ease: "expo.out", duration: 1.2 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

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

/** Run a setup when the browser is idle (or after `timeout`), so scroll scenes never compete with first paint. */
export function whenIdle(fn: () => void | (() => void), timeout = 1200, scope?: Element | null) {
  if (typeof window === "undefined") return () => {};
  let cleanup: void | (() => void);
  let ctx: gsap.Context | null = null;
  const run = () => {
    // Own context, so every tween/ScrollTrigger made here is reverted on unmount.
    ctx = gsap.context(() => {
      cleanup = fn();
    }, scope ?? undefined);
    scheduleRefresh();
  };
  const w = window as Window & { requestIdleCallback?: typeof requestIdleCallback; cancelIdleCallback?: typeof cancelIdleCallback };
  let cancel: () => void;
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(run, { timeout });
    cancel = () => w.cancelIdleCallback?.(id);
  } else {
    const id = window.setTimeout(run, 200);
    cancel = () => window.clearTimeout(id);
  }
  return () => {
    cancel();
    if (typeof cleanup === "function") cleanup();
    ctx?.revert();
  };
}

export { gsap, ScrollTrigger, useGSAP };
