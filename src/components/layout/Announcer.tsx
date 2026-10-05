"use client";

import { useUi } from "@/lib/store";

/** Polite live region for cart and wishlist updates ("Added Lume Signet, size 6, to your bag"). */
export function Announcer() {
  const { announce, bump } = useUi();
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announce ? <span key={bump}>{announce}</span> : null}
    </div>
  );
}
