/*
 * What keeps the desktop 3D from ever stuttering. Nothing here imports three.js.
 * - Scenes warm up one at a time (`inTurn`), so two never compile at once.
 * - Each scene's first 2 s of visible frames are watched (`watchFrames`): under ~45 fps
 *   on average, or a 3rd frame over 100 ms (or one over 400 ms), and this machine is too
 *   weak. Then `giveUp3D()` tells every live scene to fade back to its still, and scenes
 *   that haven't started stay stills, for this page load. Two slow page loads keep the
 *   stills for the rest of the visit (sessionStorage). One slow start used to (the old
 *   "al:3d" flag, no longer read): on 18 Nov every refresh got the stills.
 */

const KEY = "al:3d-slow";
const SLOW_LIMIT = 2;
const EVENT = "al:3d-off";

// This page load ran slow (counted once)
let slowHere = false;

export const is3DOff = () => {
  if (slowHere) return true;
  try {
    return Number(sessionStorage.getItem(KEY) || 0) >= SLOW_LIMIT;
  } catch {
    return false;
  }
};

export function giveUp3D() {
  if (!slowHere) {
    slowHere = true;
    try {
      sessionStorage.setItem(KEY, String(Number(sessionStorage.getItem(KEY) || 0) + 1));
    } catch {}
  }
  window.dispatchEvent(new Event(EVENT));
}

export function on3DOff(fn: () => void) {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

let turn: Promise<unknown> = Promise.resolve();
/** Runs `task` after every task queued before it has finished. */
export function inTurn<T>(task: () => Promise<T>): Promise<T> {
  const p = turn.then(task);
  turn = p.catch(() => {});
  return p;
}

/** Lets the browser paint and handle input between two chunks of warm-up work. */
export const breathe = () =>
  new Promise<void>((r) => {
    const w = window as Window & { requestIdleCallback?: typeof requestIdleCallback };
    if (w.requestIdleCallback) w.requestIdleCallback(() => r(), { timeout: 250 });
    else setTimeout(r, 16);
  });

/**
 * Watches the page's frames while a scene loads and warms up. On a good machine that work
 * rarely costs a frame over 100 ms; if a 3rd one does, or one goes over 400 ms, the processor
 * is too slow for live 3D, and the warm-up stops right there (the scene never shows) instead
 * of stuttering on. One such frame isn't enough: the unseen first draw is the GPU's first real
 * one, and on a refresh it alone took 371 ms on a PC that then ran 112 fps (18 Nov).
 */
export function watchWarmUp() {
  let last = 0;
  let raf = 0;
  let slow = false;
  let hitches = 0;
  const tick = (now: number) => {
    const gap = last ? now - last : 0;
    if (gap > 100 && (++hitches >= 3 || gap > 400)) slow = true;
    last = now;
    raf = requestAnimationFrame(tick);
  };
  const onTab = () => (last = 0); // a hidden tab draws no frames; that gap isn't a stutter
  document.addEventListener("visibilitychange", onTab);
  raf = requestAnimationFrame(tick);
  return {
    ok: () => !slow,
    stop() {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onTab);
    },
  };
}

/**
 * Feed it each frame's gap in ms (0 for the first frame after a pause, which is skipped).
 * Calls `verdict` once: true after 2 s of good frames, false as soon as they are too slow.
 * The first `grace` frames pay one-off costs (the GPU's first real draw: 371 ms on a refresh of a
 * PC that then ran 112 fps, 18 Nov) and don't count; after them a hitch or two (a font, an image
 * decode) isn't a slow computer: the 3rd frame over 100 ms is, or one over 400 ms.
 */
export function watchFrames(verdict: (ok: boolean) => void, ms = 2000, grace = 5) {
  let total = 0;
  let n = 0;
  let warm = grace;
  let hitches = 0;
  let done = false;
  return (gap: number) => {
    if (done || !gap) return;
    if (warm > 0) {
      warm--;
      return;
    }
    total += gap;
    n++;
    const slow = (gap > 100 && (++hitches >= 3 || gap > 400)) || (total >= ms && (n * 1000) / total < 45);
    if (slow || total >= ms) {
      done = true;
      verdict(!slow);
    }
  };
}
