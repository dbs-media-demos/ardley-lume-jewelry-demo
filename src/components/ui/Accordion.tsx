"use client";

import { useId, useState, type ReactNode } from "react";
import clsx from "clsx";

/** Accessible disclosure list. Panels animate their height with a grid-rows transition. */
export function Accordion({ items, defaultOpen = 0, className }: { items: { title: string; body: ReactNode }[]; defaultOpen?: number | null; className?: string }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const base = useId();
  return (
    <div className={clsx("divide-y divide-ink/12 border-y border-ink/12", className)}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.title}>
            <h3 className="font-sans text-base font-medium tracking-normal">
              <button
                type="button"
                id={`${base}-b${i}`}
                aria-expanded={isOpen}
                aria-controls={`${base}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left"
              >
                {it.title}
                <span aria-hidden className={clsx("relative size-3 shrink-0 transition-transform duration-500", isOpen && "rotate-45")}>
                  <span className="absolute top-1/2 left-0 h-px w-3 bg-current" />
                  <span className="absolute top-0 left-1/2 h-3 w-px bg-current" />
                </span>
              </button>
            </h3>
            <div
              id={`${base}-p${i}`}
              role="region"
              aria-labelledby={`${base}-b${i}`}
              className={clsx("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="pb-6 text-[0.95rem] leading-relaxed text-ink/80">{it.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
