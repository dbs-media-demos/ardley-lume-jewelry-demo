"use client";

import { cart, ui } from "@/lib/store";
import type { CartLine } from "@/lib/commerce/types";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** The visible bag icon (header on desktop, bottom bar on phones). */
function bagTarget(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-bag-target]"));
  return all.find((el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0) ?? null;
}

/** The product image lifts off, arcs into the bag icon and the count bumps. */
export function flyToCart(source?: HTMLElement | null): Promise<void> {
  const target = bagTarget();
  if (!source || !target || prefersReducedMotion()) return Promise.resolve();
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width) return Promise.resolve();

  const img = source instanceof HTMLImageElement ? source : source.querySelector("img");
  const ghost = document.createElement("div");
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    zIndex: "400",
    pointerEvents: "none",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 24px 60px -20px rgba(0,0,0,.45)",
    backgroundImage: img ? `url("${img.currentSrc || img.src}")` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#efe8dc",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const scale = Math.max(0.06, 28 / from.width);

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        ghost.remove();
        resolve();
      },
    });
    tl.to(ghost, { scale: 0.62, duration: 0.28, ease: "power2.out" })
      .to(ghost, { x: dx, duration: 0.75, ease: "power2.inOut" }, 0.18)
      .to(ghost, { y: dy, duration: 0.75, ease: "back.in(1.6)" }, 0.18)
      .to(ghost, { scale, borderRadius: "999px", duration: 0.75, ease: "power2.in" }, 0.18)
      .to(ghost, { opacity: 0, duration: 0.15 }, 0.85);
  });
}

export function addToCart(line: CartLine, source?: HTMLElement | null, opts: { openDrawer?: boolean } = {}) {
  const flight = flyToCart(source);
  // Add immediately so the count is right even if someone navigates mid-flight.
  cart.add(line);
  ui.announce(`Added ${line.name}, ${line.variantLabel}, to your bag`);
  flight.then(() => {
    if (opts.openDrawer !== false) ui.openDrawer();
  });
}
