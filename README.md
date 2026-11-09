# Ardley & Lume — fine-jewelry store (Scale by Noon concept)

Live: https://ardley-lume-jewelry-demo.vercel.app · See `DEMO.md` for the handoff.

```bash
npm install
npm run dev     # http://localhost:4250
npm run build && npm start
```

## Commerce adapter (`src/lib/commerce`)

| File | Role |
|---|---|
| `types.ts` | Product, variant, cart, order shapes used by the whole UI |
| `provider.ts` | `CatalogProvider` + `CheckoutProvider` interfaces (with notes for Shopify / Stripe) |
| `mock-provider.ts` | Demo catalog from `src/content/products.ts` (server-only) |
| `mock-checkout.ts` | Demo checkout: ~1.5 s simulated authorisation, mock tracking |
| `pricing.ts` | Pure pricing: per-variant price/stock, sale prices, shipping, tax, promo |
| `index.ts` | The swap point: export real implementations here |

A real store replaces the two mock exports with a Shopify Storefront API catalog and a Stripe (Elements / Checkout Session) or Shopify checkout; pages and components stay the same. Product, category and collection pages are statically generated from `getProducts()`.

## Images
`scripts/process-images.mjs` turns raw downloads (git-ignored) into graded 4:5 product shots, recoloured metal-tone variants and `src/content/images.ts` (with blur placeholders). Credits: `public/images/SOURCES.md`.

## 3D, phones and checks
See "3D and phones" in `DEMO.md`. Scripts (run against the production build): `with-server.mjs`, `ring-stills.mjs`, `phone-budget.mjs`, `phone-trace.mjs`, `section-heights.mjs`, `shots.mjs`.

## Flags
`NEXT_PUBLIC_NOINDEX` — anything but `"false"` keeps the demo out of search engines (default).
