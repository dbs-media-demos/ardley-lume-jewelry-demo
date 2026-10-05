import clsx from "clsx";

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

/** Mark + wordmark. The wordmark is live text (in the display serif), so it stays crisp and accessible. */
export function Logo({ className, compact, onDark }: { className?: string; compact?: boolean; onDark?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <Mark className="h-7 w-7 shrink-0" />
      <span className={clsx("font-display leading-none tracking-[0.08em] uppercase", compact ? "text-[1.02rem]" : "text-[1.15rem]")}>
        Ardley <span className={onDark ? "text-gold" : "text-gold-ink"}>&amp;</span> Lume
      </span>
    </span>
  );
}
