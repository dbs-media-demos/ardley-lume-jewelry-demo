/*
 * What keeps the desktop 3D from ever stuttering. Nothing here imports three.js.
 * - Scenes warm up one at a time (`inTurn`), so two never compile at once.
 * - Each scene's first 2 s of visible frames are watched (`watchFrames`): under ~45 fps
 *   on average, or any single frame over 100 ms, and this machine is too weak. Then
 *   `giveUp3D()` remembers it for the visit (sessionStorage) and tells every live scene
 *   to fade back to its still; scenes that haven't started stay stills.
 */

const KEY = "al:3d";
const EVENT = "al:3d-off";

export const is3DOff = () => {
  try {
    return sessionStorage.getItem(KEY) === "still";
  } catch {
    return false;
  }
};

export function giveUp3D() {
  try {
    sessionStorage.setItem(KEY, "still");
  } catch {}
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
 * never costs a frame over 100 ms; if it does, the processor is too slow for live 3D, and
 * the warm-up stops right there (the scene never shows) instead of stuttering on.
 */
export function watchWarmUp() {
  let last = 0;
  let raf = 0;
  let slow = false;
  const tick = (now: number) => {
    if (last && now - last > 100) slow = true;
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
 */
export function watchFrames(verdict: (ok: boolean) => void, ms = 2000) {
  let total = 0;
  let n = 0;
  let done = false;
  return (gap: number) => {
    if (done || !gap) return;
    total += gap;
    n++;
    const slow = gap > 100 || (total >= ms && (n * 1000) / total < 45);
    if (slow || total >= ms) {
      done = true;
      verdict(!slow);
    }
  };
}
