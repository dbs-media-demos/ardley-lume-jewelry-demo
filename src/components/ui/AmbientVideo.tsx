"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { isTouch, prefersReducedMotion } from "@/lib/gsap";

/**
 * Muted ambient loop. The poster is the first paint; the video only loads once it's
 * near the viewport (and on phones only after the first interaction or 6 s), never
 * with reduced motion or Save-Data, and pauses off-screen.
 */
export function AmbientVideo({ src, poster, className, label }: { src: string; poster: string; className?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    let armed = !isTouch();
    let near = false;
    const start = () => {
      if (armed && near) setLoad(true);
    };
    const arm = () => {
      armed = true;
      start();
    };
    const t = window.setTimeout(arm, 6000);
    window.addEventListener("touchstart", arm, { once: true, passive: true });
    window.addEventListener("scroll", arm, { once: true, passive: true });
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        start();
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(v);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("touchstart", arm);
      window.removeEventListener("scroll", arm);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (load) ref.current?.play().catch(() => {});
  }, [load]);

  return (
    <video ref={ref} className={clsx("object-cover", className)} poster={poster} muted loop playsInline preload="none" aria-label={label}>
      {load ? <source src={src} type="video/mp4" /> : null}
    </video>
  );
}
