"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUi } from "@/lib/store";

// The drawer, search and quick view are only downloaded the first time they're needed.
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const SearchOverlay = dynamic(() => import("@/components/shop/SearchOverlay").then((m) => m.SearchOverlay), { ssr: false });
const QuickView = dynamic(() => import("@/components/shop/QuickView").then((m) => m.QuickView), { ssr: false });

export function Overlays() {
  const { drawer, search, quickView } = useUi();
  const [used, setUsed] = useState({ drawer: false, search: false, quick: false });

  useEffect(() => {
    // Keep each overlay mounted after first use so its close animation can play.
    if ((drawer && !used.drawer) || (search && !used.search) || (quickView && !used.quick)) {
      const id = window.requestAnimationFrame(() =>
        setUsed((u) => ({ drawer: u.drawer || drawer, search: u.search || search, quick: u.quick || !!quickView })),
      );
      return () => window.cancelAnimationFrame(id);
    }
  }, [drawer, search, quickView, used]);

  return (
    <>
      {(used.drawer || drawer) && <CartDrawer />}
      {(used.search || search) && <SearchOverlay />}
      {(used.quick || quickView) && <QuickView />}
    </>
  );
}
