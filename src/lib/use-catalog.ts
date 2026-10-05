"use client";

import { useEffect, useState } from "react";
import type { CardData } from "@/lib/card-types";

let cache: CardData[] | null = null;
let pending: Promise<CardData[]> | null = null;

export function loadCatalog() {
  if (cache) return Promise.resolve(cache);
  pending ??= fetch("/catalog.json")
    .then((r) => r.json() as Promise<CardData[]>)
    .then((d) => (cache = d))
    .catch(() => {
      pending = null;
      return [] as CardData[];
    });
  return pending;
}

/** The product summaries, fetched once (lazily) from the static /catalog.json. */
export function useCatalog(enabled = true) {
  const [data, setData] = useState<CardData[] | null>(cache);
  useEffect(() => {
    if (!enabled || data) return;
    let alive = true;
    loadCatalog().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [enabled, data]);
  return data;
}
