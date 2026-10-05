import clsx from "clsx";

/** Star rating; the number is always available as text. */
export function Stars({ value, count, className, size = "sm" }: { value: number; count?: number; className?: string; size?: "sm" | "md" }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={clsx("inline-flex items-center gap-1.5", className)}>
      <span className={clsx("relative inline-block leading-none tracking-[0.12em]", size === "sm" ? "text-[0.78rem]" : "text-base")} aria-hidden>
        <span className="opacity-25">★★★★★</span>
        <span className="absolute inset-0 overflow-hidden text-gold-ink" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      <span className={clsx(size === "sm" ? "text-xs" : "text-sm")}>
        <span className="sr-only">Rated </span>
        {value.toFixed(1)}
        <span className="sr-only"> out of 5</span>
        {count !== undefined && <span className="opacity-70"> ({count}<span className="sr-only"> reviews</span>)</span>}
      </span>
    </span>
  );
}
