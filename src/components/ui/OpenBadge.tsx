"use client";

import { useSyncExternalStore } from "react";
import clsx from "clsx";
import { openStatus } from "@/lib/hours";

const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 60000);
  return () => window.clearInterval(id);
};
let last = "";
const snap = () => {
  const s = openStatus();
  const key = `${s.open ? 1 : 0}|${s.label}`;
  if (key !== last) last = key;
  return last;
};

/** Live "Open now · until 7 pm" badge in Dallas time (rendered on the client only). */
export function OpenBadge({ className, onDark }: { className?: string; onDark?: boolean }) {
  const key = useSyncExternalStore(subscribe, snap, () => "");
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
