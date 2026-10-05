import clsx from "clsx";
import type { ReactNode } from "react";

/** CSS marquee (pauses on hover; static under reduced motion). The track holds the content twice for a seamless loop. */
export function Marquee({ children, className, speed = 40, reverse }: { children: ReactNode; className?: string; speed?: number; reverse?: boolean }) {
  return (
    <div className={clsx("group/mq overflow-hidden", className)}>
      <div
        className="flex w-max group-hover/mq:[animation-play-state:paused]"
        style={{ animation: `marquee ${speed}s linear infinite${reverse ? " reverse" : ""}` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
