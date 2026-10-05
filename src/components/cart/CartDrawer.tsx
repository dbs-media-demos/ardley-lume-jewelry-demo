"use client";

import { Sheet } from "@/components/ui/Sheet";
import { cartCount, ui, useCart, useUi } from "@/lib/store";
import { CartContents } from "./CartContents";

/** Slide-in bag. Opens after add-to-cart (once the fly-to-cart lands). */
export function CartDrawer() {
  const { drawer } = useUi();
  const count = cartCount(useCart());
  return (
    <Sheet open={drawer} onClose={ui.closeDrawer} label="Your bag" side="right">
      <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <p className="font-display text-2xl">
          Your bag <span className="font-sans text-base text-taupe">({count})</span>
        </p>
        <button type="button" onClick={ui.closeDrawer} className="grid size-11 place-items-center text-2xl" aria-label="Close bag" data-autofocus>
          ×
        </button>
      </div>
      <CartContents compact onNavigate={ui.closeDrawer} />
    </Sheet>
  );
}
