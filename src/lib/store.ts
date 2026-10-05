"use client";

import { useSyncExternalStore } from "react";
import type { CartExtras, CartLine } from "@/lib/commerce/types";

/*
 * Tiny external stores (cart, wishlist, recently viewed, UI) read with
 * useSyncExternalStore. Persistence is best-effort: every storage call is wrapped,
 * so private windows and blocked storage still get a working (in-memory) cart.
 */

function createStore<T>(key: string | null, initial: T, storage: "local" | "session" = "local") {
  let state = initial;
  let loaded = false;
  const listeners = new Set<() => void>();
  const store = () => (storage === "local" ? window.localStorage : window.sessionStorage);

  const load = () => {
    if (loaded || typeof window === "undefined" || !key) return;
    loaded = true;
    try {
      const raw = store().getItem(key);
      if (raw) state = { ...initial, ...JSON.parse(raw) };
    } catch {}
  };

  const api = {
    get: () => {
      load();
      return state;
    },
    server: () => initial,
    set: (next: T | ((s: T) => T)) => {
      load();
      state = typeof next === "function" ? (next as (s: T) => T)(state) : next;
      if (key) {
        try {
          store().setItem(key, JSON.stringify(state));
        } catch {}
      }
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          loaded = false;
          load();
          l();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
  return api;
}

/* ---------- cart ---------- */

export type CartState = { lines: CartLine[]; extras: CartExtras; removed?: { line: CartLine; index: number } | null };
const emptyCart: CartState = { lines: [], extras: { giftBox: true, giftNote: "" }, removed: null };
export const cartStore = createStore<CartState>("al-cart-v1", emptyCart);

export const useCart = () => useSyncExternalStore(cartStore.subscribe, cartStore.get, cartStore.server);

export const cart = {
  add(line: CartLine) {
    cartStore.set((s) => {
      const existing = s.lines.find((l) => l.id === line.id && !l.engraving);
      const lines = existing
        ? s.lines.map((l) => (l === existing ? { ...l, qty: Math.min(9, l.qty + line.qty) } : l))
        : [...s.lines, line];
      return { ...s, lines, removed: null };
    });
  },
  setQty(id: string, qty: number) {
    cartStore.set((s) => ({ ...s, lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(9, qty)) } : l)) }));
  },
  remove(id: string) {
    cartStore.set((s) => {
      const index = s.lines.findIndex((l) => l.id === id);
      if (index < 0) return s;
      return { ...s, lines: s.lines.filter((l) => l.id !== id), removed: { line: s.lines[index], index } };
    });
  },
  undo() {
    cartStore.set((s) => {
      if (!s.removed) return s;
      const lines = [...s.lines];
      lines.splice(s.removed.index, 0, s.removed.line);
      return { ...s, lines, removed: null };
    });
  },
  setEngraving(id: string, text: string) {
    cartStore.set((s) => ({ ...s, lines: s.lines.map((l) => (l.id === id ? { ...l, engraving: text || undefined } : l)) }));
  },
  setExtras(extras: Partial<CartExtras>) {
    cartStore.set((s) => ({ ...s, extras: { ...s.extras, ...extras } }));
  },
  clear() {
    cartStore.set(emptyCart);
  },
};

export const cartCount = (s: CartState) => s.lines.reduce((n, l) => n + l.qty, 0);

/* ---------- wishlist & recently viewed ---------- */

type SlugList = { slugs: string[] };
export const wishlistStore = createStore<SlugList>("al-wishlist-v1", { slugs: [] });
export const useWishlist = () => useSyncExternalStore(wishlistStore.subscribe, wishlistStore.get, wishlistStore.server);
export const toggleWish = (slug: string) =>
  wishlistStore.set((s) => ({ slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [slug, ...s.slugs] }));

export const recentStore = createStore<SlugList>("al-recent-v1", { slugs: [] });
export const useRecent = () => useSyncExternalStore(recentStore.subscribe, recentStore.get, recentStore.server);
export const pushRecent = (slug: string) =>
  recentStore.set((s) => ({ slugs: [slug, ...s.slugs.filter((x) => x !== slug)].slice(0, 12) }));

/* ---------- UI (not persisted) ---------- */

export type UiState = {
  drawer: boolean;
  search: boolean;
  quickView: string | null;
  announce: string;
  bump: number;
};
export const uiStore = createStore<UiState>(null, { drawer: false, search: false, quickView: null, announce: "", bump: 0 });
export const useUi = () => useSyncExternalStore(uiStore.subscribe, uiStore.get, uiStore.server);
export const ui = {
  openDrawer: () => uiStore.set((s) => ({ ...s, drawer: true, search: false, quickView: null })),
  closeDrawer: () => uiStore.set((s) => ({ ...s, drawer: false })),
  openSearch: () => uiStore.set((s) => ({ ...s, search: true, drawer: false })),
  closeSearch: () => uiStore.set((s) => ({ ...s, search: false })),
  openQuickView: (slug: string) => uiStore.set((s) => ({ ...s, quickView: slug })),
  closeQuickView: () => uiStore.set((s) => ({ ...s, quickView: null })),
  announce: (text: string) => uiStore.set((s) => ({ ...s, announce: text, bump: s.bump + 1 })),
};
