"use client";

import { useEffect, useRef } from "react";
import { isDesktop, tweenNumber } from "@/lib/motion";

const group = (n: number, decimals: number) => {
  const [w, d] = n.toFixed(decimals).split(".");
  return w.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d ? `.${d}` : "");
};

/** Number that counts up when it enters the viewport (desktop). The final value is server-rendered. */
export function Counter({ value, prefix = "", suffix = "", decimals = 0, className }: { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => prefix + group(n, decimals) + suffix;
  useEffect(() => {
    const el = ref.current;
    if (!el || !isDesktop() || el.getBoundingClientRect().top < window.innerHeight) return;
    let stop = () => {};
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      stop = tweenNumber(0, value, 2200, (v) => (el.textContent = prefix + group(v, decimals) + suffix));
    }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [value, prefix, suffix, decimals]);
  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  );
}
