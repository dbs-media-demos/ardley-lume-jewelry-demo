import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

/**
 * CSS marquee (pauses on hover; static under reduced motion). The track holds the content twice for a seamless loop.
 * `railOnPhones`: below lg it's a native swipe rail instead (no auto-advance on phones), with the copy left out.
 */
export function Marquee({ children, className, speed = 40, reverse, railOnPhones }: { children: ReactNode; className?: string; speed?: number; reverse?: boolean; railOnPhones?: boolean }) {
  const animation = `marquee ${speed}s linear infinite${reverse ? " reverse" : ""}`;
  return (
    <div className={clsx("group/mq overflow-hidden [contain:paint]", railOnPhones && "max-lg:no-scrollbar max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:px-2.5", className)}>
      <div
        className={clsx("flex w-max group-hover/mq:[animation-play-state:paused]", railOnPhones && "lg:[animation:var(--mq)]")}
        style={railOnPhones ? ({ "--mq": animation } as CSSProperties) : { animation }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className={clsx("flex shrink-0 items-center", railOnPhones && "max-lg:hidden")} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
