"use client";

import { useSyncExternalStore } from "react";
import clsx from "clsx";
import { useBiz } from "@/components/preview/BizContext";
import { openStatus } from "@/lib/biz-core";

const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 60000);
  return () => window.clearInterval(id);
};

/**
 * Live "Open now · until 7 pm" badge in the store's own timezone (rendered on the client only,
 * its line held from the start). A preview without known hours shows nothing.
 */
export function OpenBadge({ className, onDark }: { className?: string; onDark?: boolean }) {
  const biz = useBiz();
  const key = useSyncExternalStore(
    subscribe,
    () => {
      const s = openStatus(biz);
      return s ? `${s.open ? 1 : 0}|${s.text}` : "-";
    },
    () => "",
  );
  if (key === "-" || !biz.hours) return null;
  const [open, label] = key ? [key[0] === "1", key.slice(2)] : [false, "Hours"];
  return (
    <span className={clsx("inline-flex items-center gap-2 text-sm", className)}>
      <span
        aria-hidden
        className={clsx("size-2 rounded-full", key ? (open ? "bg-emerald-500 [animation:pulse-dot_2s_infinite]" : onDark ? "bg-mist" : "bg-taupe") : "bg-transparent")}
      />
      <span>{label}</span>
    </span>
  );
}
