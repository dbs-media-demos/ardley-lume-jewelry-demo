import { useEffect, type DependencyList, type RefObject } from "react";

/*
 * Motion without the weight. Nothing here imports GSAP or three.js: GSAP is only
 * reached through `loadGsap()` (a dynamic import), and every scroll scene runs
 * through `useDesktopScene`, which never loads it on phones, tablets or with
 * reduced motion. Phones keep CSS reveals and native scrolling.
 */

export type GsapKit = typeof import("./gsap");

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () => typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

const saveData = () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/** A big screen with a real mouse: the only place pinned scenes, parallax and three.js run. */
export const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches && !prefersReducedMotion();

/** The 3D gate: desktop, no reduced motion, no Save-Data. */
export const canRun3D = () => isDesktop() && !saveData();

let kit: Promise<GsapKit> | null = null;
export const loadGsap = () => (kit ??= import("./gsap"));

/** Run after the browser is idle (or after `timeout`). Returns a cancel function. */
export function onIdle(fn: () => void, timeout = 1200) {
  const w = window as Window & { requestIdleCallback?: typeof requestIdleCallback; cancelIdleCallback?: typeof cancelIdleCallback };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}

/** Run once the page has loaded and the browser is idle. */
export function afterLoad(fn: () => void, timeout = 1200) {
  let cancel = () => {};
  const go = () => (cancel = onIdle(fn, timeout));
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
  return () => {
    window.removeEventListener("load", go);
    cancel();
  };
}

/**
 * Desktop-only GSAP scene: after idle, loads GSAP, runs `setup` inside a context
 * scoped to `scope` (every tween/ScrollTrigger is reverted on unmount), then
 * re-sorts and refreshes all triggers once.
 */
export function useDesktopScene(scope: RefObject<Element | null>, setup: (k: GsapKit, el: HTMLElement) => void | (() => void), deps: DependencyList = [], timeout = 1200) {
  useEffect(() => {
    const el = scope.current as HTMLElement | null;
    if (!el || !isDesktop()) return;
    let dead = false;
    let ctx: { revert: () => void } | null = null;
    let cleanup: void | (() => void);
    const cancel = onIdle(() => {
      void loadGsap().then((k) => {
        if (dead) return;
        ctx = k.gsap.context(() => {
          cleanup = setup(k, el);
        }, el);
        k.scheduleRefresh();
      });
    }, timeout);
    return () => {
      dead = true;
      cancel();
      if (typeof cleanup === "function") cleanup();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** A number easing from `from` to `to` (expo out), without GSAP. Returns a stop function. */
export function tweenNumber(from: number, to: number, ms: number, onUpdate: (v: number) => void, onDone?: () => void) {
  const t0 = performance.now();
  let raf = requestAnimationFrame(function step(now) {
    const p = Math.min(1, (now - t0) / ms);
    const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    onUpdate(from + (to - from) * e);
    if (p < 1) raf = requestAnimationFrame(step);
    else onDone?.();
  });
  return () => cancelAnimationFrame(raf);
}
