"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { site } from "@/content/site";
import { cartCount, ui, useCart } from "@/lib/store";

/** Phones: Call · Book a visit · Bag, always one thumb away. Product pages use their own buy bar. */
export function MobileBar() {
  const pathname = usePathname();
  const count = cartCount(useCart());
  if (pathname.startsWith("/product/") || pathname.startsWith("/engagement/build")) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-ink/10 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="grid grid-cols-[1fr_1.3fr_1fr]">
        <a href={site.phoneHref} className="flex min-h-14 items-center justify-center gap-2 text-sm font-semibold">
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path
              d="M6.6 3h3l1.5 4.2-2 1.3a11 11 0 006.4 6.4l1.3-2L21 14.4v3A2.6 2.6 0 0118.4 20 15.4 15.4 0 014 5.6 2.6 2.6 0 016.6 3z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          Call
        </a>
        <Link
          href="/appointment"
          className="my-1.5 flex min-h-11 items-center justify-center rounded-full bg-ink text-[0.78rem] font-semibold tracking-[0.12em] text-ivory uppercase"
        >
          Book a visit
        </Link>
        <button type="button" onClick={ui.openDrawer} data-bag-target className="flex min-h-14 items-center justify-center gap-2 text-sm font-semibold">
          Bag
          <span className={clsx("grid min-w-5 place-items-center rounded-full px-1 text-[0.7rem] leading-5", count ? "bg-gold text-ink" : "bg-ink/10")}>{count}</span>
        </button>
      </div>
    </div>
  );
}
