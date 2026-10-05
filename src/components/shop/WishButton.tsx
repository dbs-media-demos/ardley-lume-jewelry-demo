"use client";

import clsx from "clsx";
import { toggleWish, ui, useWishlist } from "@/lib/store";

/** Heart toggle with a small burst. Persists locally. */
export function WishButton({ slug, name, className, size = "md" }: { slug: string; name: string; className?: string; size?: "md" | "lg" }) {
  const { slugs } = useWishlist();
  const on = slugs.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWish(slug);
        ui.announce(on ? `${name} removed from your wishlist` : `${name} saved to your wishlist`);
      }}
      className={clsx(
        "group/heart grid place-items-center rounded-full transition-transform active:scale-90",
        size === "lg" ? "relative size-12 border border-ink/15 bg-ivory hover:border-ink" : "size-11",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className={clsx(size === "lg" ? "size-5" : "size-[1.1rem]", "transition-transform duration-500", on && "scale-110")} aria-hidden>
        <path
          d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0112 7.4a4.2 4.2 0 017.5 2.5C19.5 15.4 12 20 12 20z"
          fill={on ? "var(--color-oxblood)" : "rgb(248 244 236 / 0.6)"}
          stroke={on ? "var(--color-oxblood)" : "currentColor"}
          strokeWidth="1.4"
        />
      </svg>
      {on && <span aria-hidden className="pointer-events-none absolute inset-1 rounded-full border border-oxblood/50 [animation:heart-ring_0.7s_var(--ease-out-expo)_forwards]" />}
    </button>
  );
}
