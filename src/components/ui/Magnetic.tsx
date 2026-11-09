"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { isDesktop, loadGsap } from "@/lib/motion";

/** Wraps a CTA so it leans toward the cursor (desktop only). */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isDesktop()) return;
    let xTo: (v: number) => unknown = () => {};
    let yTo: (v: number) => unknown = () => {};
    let dead = false;
    void loadGsap().then(({ gsap }) => {
      if (dead) return;
      xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      dead = true;
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className={className ?? "inline-block"}>
      {children}
    </span>
  );
}
