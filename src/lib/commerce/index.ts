/*
 * Swap point. To go live, replace these two lines with real implementations of
 * `CatalogProvider` / `CheckoutProvider` (e.g. `shopifyCatalog`, `stripeCheckout`).
 * The UI imports only from here.
 */
export { mockCatalog as catalog } from "./mock-provider";
export type * from "./types";
export type * from "./provider";
