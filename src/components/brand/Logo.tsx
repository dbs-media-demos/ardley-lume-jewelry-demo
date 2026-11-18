"use client";

import clsx from "clsx";
import { useBiz } from "@/components/preview/BizContext";
import { LeadLogo } from "./LeadLogo";

/** The mark: a ring seen face-on, with a four-point glint where the stone would sit. */
export function Mark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <circle cx="18" cy="22" r="12.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M30 2.5 C30.6 7.6 32.4 9.4 37.5 10 C32.4 10.6 30.6 12.4 30 17.5 C29.4 12.4 27.6 10.6 22.5 10 C27.6 9.4 29.4 7.6 30 2.5 Z"
        fill="var(--color-gold)"
      />
    </svg>
  );
}

/**
 * Mark + wordmark. The wordmark is live text (in the display serif), so it stays crisp and accessible.
 * A preview shows the business's own logo from the CRM (its ink follows the header's light/dark
 * states), or without one their name set the same way.
 */
export function Logo({ className, compact, onDark }: { className?: string; compact?: boolean; onDark?: boolean }) {
  const biz = useBiz();
  if (biz.logo) return <LeadLogo svg={biz.logo.svg} label={biz.name} className={clsx("h-9 max-w-[12rem] sm:max-w-[15rem]", className)} />;
  if (biz.preview)
    return (
      <span className={clsx("inline-flex items-center gap-2.5", className)}>
        <Mark className="h-7 w-7 shrink-0" />
        <span className={clsx("block max-w-[12rem] truncate font-display leading-none tracking-[0.08em] uppercase sm:max-w-[17rem]", biz.shortName.length > 18 ? "text-[0.92rem]" : compact ? "text-[1.02rem]" : "text-[1.15rem]")}>
          {biz.shortName}
        </span>
      </span>
    );
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <Mark className="h-7 w-7 shrink-0" />
      <span className={clsx("font-display leading-none tracking-[0.08em] uppercase", compact ? "text-[1.02rem]" : "text-[1.15rem]")}>
        Ardley <span className={onDark ? "text-gold" : "text-gold-ink"}>&amp;</span> Lume
      </span>
    </span>
  );
}
