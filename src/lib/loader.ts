/**
 * The lead's-logo page loader on a preview (components/preview/LeadLoader). While it shows,
 * <html> has data-loading; when it starts to exit, the attribute goes and "loader:done" fires.
 * The homepage's own entrance (hero animations, counters, drawings) waits for that.
 */
export const LOADER_DONE = "loader:done";

/** Exit starts this long after the first paint (reduced motion: the finished logo, then a fade). */
export const LOADER_HOLD_MS = 1600;
export const LOADER_HOLD_REDUCED_MS = 600;

export const loaderShowing = () => typeof document !== "undefined" && document.documentElement.hasAttribute("data-loading");

/**
 * Runs `start` now, or when the loader starts to exit (3.2 s at the latest, whatever happens).
 * `start` may return a cleanup; the returned function cancels a pending start or runs that cleanup,
 * so it can be an effect's return value: `useEffect(() => whenLoaderDone(() => { … }), [])`.
 */
export function whenLoaderDone(start: () => void | (() => void)): () => void {
  let cleanup: void | (() => void);
  let pending = true;
  let timer = 0;
  const off = () => {
    window.removeEventListener(LOADER_DONE, run);
    window.clearTimeout(timer);
  };
  function run() {
    if (!pending) return;
    pending = false;
    off();
    cleanup = start();
  }
  if (!loaderShowing()) run();
  else {
    window.addEventListener(LOADER_DONE, run);
    timer = window.setTimeout(run, 3200);
  }
  return () => {
    pending = false;
    off();
    if (typeof cleanup === "function") cleanup();
  };
}

/**
 * The inline script that runs before the loader is parsed: a reload in the same tab skips it
 * (sessionStorage, one key per token); otherwise it times the exit, lets a click or key skip it,
 * and tells the page when it's done. `exitMs` is how long the exit takes in CSS.
 */
export function loaderScript(token: string, exitMs: number) {
  return `(function(){var d=document.documentElement,k=${JSON.stringify(`lead-loader:${token}`)},seen=false;
try{seen=sessionStorage.getItem(k)==="1";sessionStorage.setItem(k,"1")}catch(e){}
if(seen){d.setAttribute("data-loader","skip");return}
d.setAttribute("data-loader","on");d.setAttribute("data-loading","");
var rm=matchMedia("(prefers-reduced-motion: reduce)").matches,out=false,ev=["pointerdown","keydown","wheel","touchstart"],t;
function skip(){exit(true)}
function exit(fast){if(out)return;out=true;clearTimeout(t);ev.forEach(function(e){removeEventListener(e,skip,true)});
d.setAttribute("data-loader",rm?"fade":fast?"skip-out":"out");d.removeAttribute("data-loading");
try{dispatchEvent(new Event(${JSON.stringify(LOADER_DONE)}))}catch(e){}
setTimeout(function(){d.setAttribute("data-loader","done")},rm?450:fast?420:${exitMs + 60})}
t=setTimeout(function(){exit(false)},rm?${LOADER_HOLD_REDUCED_MS}:${LOADER_HOLD_MS});
ev.forEach(function(e){addEventListener(e,skip,{capture:true,passive:true})})})();`;
}
