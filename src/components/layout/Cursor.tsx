"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, isTouch, prefersReducedMotion } from "@/lib/gsap";

/**
 * A fine gold ring that follows the mouse. Over products (`data-cursor="View"`) and
 * rails (`data-cursor="Drag"`) it swells into a labelled lens. The native cursor
 * stays visible, so nothing is lost for anyone.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return;
    const id = window.setTimeout(() => setEnabled(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = ring.current;
    if (!enabled || !el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });
    let current = "";
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target as Element | null;
      const target = t?.closest?.("[data-cursor]");
      const next = target?.getAttribute("data-cursor") ?? "";
      const interactive = !next && t?.closest?.("a, button, input, select, textarea, label");
      el.dataset.state = next ? "label" : interactive ? "hover" : "idle";
      if (next !== current) {
        current = next;
        setLabel(next);
      }
    };
    const leave = () => (el.dataset.state = "hidden");
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={ring}
      aria-hidden
      data-state="hidden"
      className="pointer-events-none fixed top-0 left-0 z-[300] grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold/70 transition-[width,height,background-color,border-color,opacity] duration-500 ease-[var(--ease-out-expo)] data-[state=hidden]:opacity-0 data-[state=hover]:size-12 data-[state=hover]:border-gold data-[state=label]:size-[5.5rem] data-[state=label]:border-transparent data-[state=label]:bg-ink/85 data-[state=label]:backdrop-blur-sm"
    >
      <span className="font-mono text-[0.66rem] tracking-[0.22em] text-gold-pale uppercase">{label}</span>
    </div>
  );
}
