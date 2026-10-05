"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import clsx from "clsx";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, loadSplitText, whenIdle } from "@/lib/gsap";
import type { SplitText } from "gsap/SplitText";

/*
 * Scroll reveals. Content is always in the HTML and visible by default; JS only
 * hides (opacity/transform) what is still below the fold, then eases it in.
 */

const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

type SplitProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  id?: string;
  /** "lines" rises line by line; "chars" assembles letter by letter. */
  by?: "lines" | "chars";
};

/** Headline that rises out of a mask, line by line (or letter by letter). */
export function SplitReveal({ children, as: Tag = "h2", className, delay = 0, stagger, id, by = "lines" }: SplitProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion() || !belowFold(el)) return;
      gsap.set(el, { opacity: 0 });
      let split: SplitText | null = null;
      let dead = false;
      const io = new IntersectionObserver(
        async ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          const Split = await loadSplitText();
          if (dead) return;
          split = Split.create(el, {
            type: by === "chars" ? "lines,chars" : "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              gsap.set(el, { opacity: 1 });
              const targets = by === "chars" ? self.chars : self.lines;
              return gsap.from(targets, {
                yPercent: by === "chars" ? 100 : 110,
                rotate: by === "chars" ? 6 : 0,
                duration: by === "chars" ? 1.1 : 1.5,
                stagger: stagger ?? (by === "chars" ? 0.025 : 0.1),
                delay,
                ease: "expo.out",
                onComplete: () => self.revert(),
              });
            },
          });
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      io.observe(el);
      return () => {
        dead = true;
        io.disconnect();
        split?.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: number;
  id?: string;
  /** Wipe children in with a clip-path mask instead of a fade. */
  wipe?: boolean;
  style?: CSSProperties;
};

/** Fade + rise (or a mask wipe) when scrolled into view; children stagger if `stagger` is set. */
export function Reveal({ children, as: Tag = "div", className, delay = 0, y = 32, stagger, id, wipe, style }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion() || !belowFold(el)) return;
      const targets = stagger ? Array.from(el.children) : [el];
      if (wipe) {
        gsap.set(targets, { clipPath: "inset(100% 0% 0% 0%)", y: 40 });
      } else {
        gsap.set(targets, { opacity: 0, y });
      }
      const cancel = whenIdle(() => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(
              targets,
              wipe
                ? { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.4, delay, stagger: stagger ?? 0, ease: "expo.out", clearProps: "clipPath,transform" }
                : { opacity: 1, y: 0, duration: 1.3, delay, stagger: stagger ?? 0, ease: "expo.out", clearProps: "transform" },
            ),
        });
      });
      return cancel;
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className} style={style}>
      {children}
    </Tag>
  );
}

/** Paragraph whose words brighten one by one as you scroll through it. */
export function ScrubWords({ text, className, as: Tag = "p", from = 0.55 }: { text: string; className?: string; as?: ElementType; from?: number }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const words = el.querySelectorAll<HTMLElement>("[data-w]");
      return whenIdle(() => {
        gsap.fromTo(
          words,
          { opacity: from },
          { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 } },
        );
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-w>
          {w}{" "}
        </span>
      ))}
    </Tag>
  );
}

/** Image frame whose content drifts with scroll and unmasks on enter. */
export function Parallax({
  children,
  className,
  amount = 12,
  reveal = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  reveal?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const inner = el?.firstElementChild as HTMLElement | null;
      if (!el || !inner || prefersReducedMotion()) return;
      const hide = reveal && belowFold(el);
      if (hide) gsap.set(el, { clipPath: "inset(14% 8% 14% 8% round 12px)" });
      return whenIdle(() => {
        gsap.set(inner, { scale: 1 + amount / 100 });
        gsap.fromTo(
          inner,
          { yPercent: -amount / 2 },
          { yPercent: amount / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
        if (hide) {
          gsap.to(el, {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            duration: 1.8,
            ease: "expo.out",
            clearProps: "clipPath",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        }
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={clsx("relative overflow-hidden", className)} style={style}>
      {children}
    </div>
  );
}
