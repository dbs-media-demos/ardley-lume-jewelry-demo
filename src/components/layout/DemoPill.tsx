"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { agency, agencyUrl } from "@/content/site";

const KEY = "al-demo-pill";
const noop = () => () => {};

/** The badge's shown/dismissed state, shared by the desktop pill and the phone bar strip. */
export function useDemoBadge() {
  const [hidden, setHidden] = useState(false);
  const dismissed = useSyncExternalStore(
    noop,
    () => {
      try {
        return sessionStorage.getItem(KEY) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  };
  return [!(hidden || dismissed), dismiss] as const;
}

/** Phones: a slim strip on top of the bottom bar, so it never sits over the page. */
export function DemoStrip() {
  const [show, dismiss] = useDemoBadge();
  if (!show) return null;
  return (
    <div className="flex items-center justify-between border-b border-ink/10 bg-ink pl-4 text-[0.72rem] text-ivory/85">
      <a href={agencyUrl} target="_blank" rel="noopener" className="flex min-h-8 items-center gap-2">
        <span aria-hidden className="size-1.5 rounded-full bg-gold" />
        Concept site by {agency.name} <span aria-hidden>↗</span>
      </a>
      <button type="button" onClick={dismiss} aria-label="Dismiss the concept site badge" className="grid min-h-8 w-11 place-items-center text-ivory/70">
        ×
      </button>
    </div>
  );
}

/** "Concept site by Scale by Noon" badge (tablet/desktop corner pill), dismissible for the session. */
export function DemoPill() {
  const pathname = usePathname();
  const [show, dismiss] = useDemoBadge();
  if (!show) return null;
  // Phones show it in the bottom bar (DemoStrip); checkout carries its own demo banner.
  if (pathname.startsWith("/checkout")) return null;

  return (
    <div className="fixed right-5 bottom-5 z-[120] flex items-center overflow-hidden rounded-full border border-ivory/15 bg-ink/90 text-[0.75rem] text-ivory shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur max-md:hidden">
      <a href={agencyUrl} target="_blank" rel="noopener" className="flex min-h-11 items-center gap-2 py-2 pr-1 pl-4 font-medium hover:text-gold-pale">
        <span aria-hidden className="size-1.5 rounded-full bg-gold" />
        <span className="whitespace-nowrap">Concept site by {agency.name}</span>
        <span aria-hidden>↗</span>
      </a>
      <button type="button" onClick={dismiss} aria-label="Dismiss the concept site badge" className="grid min-h-11 w-10 place-items-center text-ivory/70 hover:text-ivory">
        ×
      </button>
    </div>
  );
}
