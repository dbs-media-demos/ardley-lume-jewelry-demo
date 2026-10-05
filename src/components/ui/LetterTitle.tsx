import clsx from "clsx";
import type { ElementType } from "react";

/**
 * Title that assembles letter by letter, CSS only (transform, no opacity), so it
 * paints immediately and never delays LCP. Screen readers get the plain string.
 */
export function LetterTitle({ text, as: Tag = "h1", className, delay = 0 }: { text: string; as?: ElementType; className?: string; delay?: number }) {
  let i = 0;
  return (
    <Tag className={clsx("font-display", className)} aria-label={text}>
      {text.split(" ").map((word, w) => (
        <span key={w} aria-hidden className="inline-block overflow-hidden whitespace-nowrap pb-[0.1em] align-bottom">
          {word.split("").map((ch) => {
            const d = delay + i++ * 0.035;
            return (
              <span key={i} className="letter inline-block" style={{ animationDelay: `${d}s` }}>
                {ch}
              </span>
            );
          })}
          {w < text.split(" ").length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
}
