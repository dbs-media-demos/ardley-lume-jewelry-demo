"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { agency, agencyUrl } from "@/content/site";

const KEY = "al-demo-pill";
const noop = () => () => {};

/** "Concept site by Scale by Noon" badge, dismissible for the session. */
export function DemoPill() {
  const pathname = usePathname();
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
  if (hidden || dismissed) return null;
  // Sits higher where a sticky mobile bar lives at the bottom.
  const raised = !pathname.startsWith("/checkout");

  return (
    <div
      className={clsx(
        "fixed right-3 z-[120] flex items-center overflow-hidden rounded-full border border-ivory/15 bg-ink/90 text-[0.75rem] text-ivory shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur md:right-5 md:bottom-5",
        raised ? "bottom-[5.25rem]" : "bottom-3",
      )}
    >
      <a href={agencyUrl} target="_blank" rel="noopener" className="flex min-h-11 items-center gap-2 py-2 pr-1 pl-4 font-medium hover:text-gold-pale">
        <span aria-hidden className="size-1.5 rounded-full bg-gold" />
        <span className="hidden whitespace-nowrap sm:inline">Concept site by {agency.name}</span>
        <span className="whitespace-nowrap sm:hidden">{agency.name}</span>
        <span aria-hidden>↗</span>
      </a>
      <button
        type="button"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {}
        }}
        aria-label="Dismiss the concept site badge"
        className="grid min-h-11 w-10 place-items-center text-ivory/70 hover:text-ivory"
      >
        ×
      </button>
    </div>
  );
}
