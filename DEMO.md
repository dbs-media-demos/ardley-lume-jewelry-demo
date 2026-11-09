# Ardley & Lume (Scale by Noon demo)

- Niche: fine-jewelry online store + showroom   (Scale by Noon site industry id: `ecommerce`; this industry doesn't exist on scalebynoon.com yet and needs a new industry page or concept category)
- Market / city: US – Dallas, TX (Knox-Henderson), ships nationwide
- Languages: en
- Live URL: https://ardley-lume-jewelry-demo.vercel.app
- Repo: https://github.com/dbs-media-demos/ardley-lume-jewelry-demo (branch `main`, git-connected to Vercel project `ardley-lume-jewelry-demo`)
- Folder: DBS Media Portfolio/Demo Websites/jewelry
- Stack: Next.js 16.3.8, React 19.2.8, Tailwind v4, GSAP 3.15 (ScrollTrigger, SplitText, Flip, Draggable, Inertia), Lenis, three.js (desktop only: hero ring + ring-builder teaser; phones get stills and zero bytes of three.js, GSAP and Lenis)
- Palette: ink #0E1311, forest #17231E, oxblood #4B1D24, bone #EFE8DC, ivory #F8F4EC, taupe #6B645A, gold #C9A55C, gold-ink #7D5F26   Fonts: Gloock, Instrument Sans, Azeret Mono
- Pages: 83 static routes. Home, shop, 6 categories, 6 collections, 35 product pages, cart, checkout, success, wishlist, track, gift cards, engagement, ring builder, bridal, bespoke, appointment, education + 3 guides, ring size guide, care & warranty, about, shipping & returns, FAQ, visit, reviews, privacy, terms, 404.
- Signature features:
  - WebGL ring hero, desktop only (procedural solitaire: comfort-fit PBR gold band, six cathedral claws, a faceted brilliant (table, stars, upper and lower girdle facets, pavilion) drawn as refracted studio light + Fresnel glare, cursor-lit); scrolling dives the camera into the stone and the facets become the next scene (a self-drawing brilliant-cut diagram). The photo is the LCP; the ring is a still rendered from the same scene (in the server HTML) and the live canvas fades in over it after load.
  - Live 3D ring builder teaser (desktop): drag to turn the ring; choosing round/oval/emerald/pear rebuilds the stone and its claws, choosing yellow/platinum/rose blends the metal, and the price counts to the new total. It stands on an ivory surface with two layers of soft shadow (shadow-mapped key light + contact shadow). Phones drive the same choices over 12 renders of that scene. Why here and not a loose gem in the craft section: the hero is already a stone, and a configurator is the one thing a jeweller's customer actually touches; the lead gets a real result (ring + price).
  - "Many worlds" home: horizontal category track, fly through the "o" of a giant *forever* into the engagement scene, live ring-builder teaser, "three golds" metal morph with room-colour shift, pinned workshop zoom-through (sketch → wax → casting → setting → polish), 3D gift coverflow, reviews marquee, showroom scene.
  - Ring builder (/engagement/build): setting → stone shape, carat, lab/natural → metal → size, with a live layered SVG preview and animated price build-up; adds to the bag as one configured item.
  - Metal swatches morph the product photo (yellow/white/rose versions generated from the real photo) with a light sweep; "On a hand" true-scale view; hover lens + fullscreen zoom.
  - Shop: URL-synced filters animated with GSAP Flip, sticky condensing filter bar, letter-by-letter titles, draggable category rail, sale flip cards with countdown, coverflow swipers, instant search, quick view.
  - Store layer: fly-to-cart, cart drawer with undo, engraving (+$45) with live band preview, gift box + note, free-shipping bar, cross-sells, wishlist, recently viewed, shared-element morph from card to product page, page transitions.
  - Calm mock checkout: contact → delivery/pickup → shipping → card (brand detection, Luhn, flip preview) → review & pay; success page with a ring box opening; animated order tracking.
- Lighthouse (live, mobile, before the 3D pass): home P 94 / A 100 / BP 100 / SEO 69*; shop 94; product 95. Desktop: 99–100.
- Phone budget after the 3D pass (production build, 375 px, 4× CPU, slow 4G, `scripts/phone-budget.mjs`): home LCP ≈ 1.4–1.8 s, TBT ≈ 130–260 ms (median ≈ 155), CLS 0, JS 196 KB compressed (incl. ~20 KB of route prefetch), 0 bytes of three.js, ≈ 485 KB total, 2 font files.
  *SEO 69 is only the intentional noindex; 100 with `NEXT_PUBLIC_NOINDEX=false`.

## 3D and phones (how it's built)
- Only `HeroMotion` and `BuilderTeaser` import three.js, with `await import()` inside an effect behind `canRun3D()` (`src/lib/motion.ts`: `(min-width:1024px) and (hover:hover) and (pointer:fine)`, no reduced motion, no Save-Data), after load + idle. GSAP is also only reached through `loadGsap()` and every scroll scene runs through `useDesktopScene`, so phones download neither.
- Models are built from primitives in `src/components/fx/ring-kit.ts` (no model files, no licences).
- Stills: `npm run build && node scripts/with-server.mjs node scripts/ring-stills.mjs` renders `public/images/3d/*` straight from the live scenes (`?still=WxH` / `?builderStill`). Re-run after touching the ring or the lights.
- Phone sections below the fold use content-visibility with their real heights (`src/components/ui/Later.tsx`, measured by `scripts/section-heights.mjs`) and are separate Suspense boundaries, so hydration runs in short tasks. Re-measure after changing a section's phone layout.
- Checks: `scripts/phone-budget.mjs [route]`, `scripts/phone-trace.mjs` (what the long tasks are), `scripts/shots.mjs <dir>` (desktop + 375 px screenshots top to bottom), all via `scripts/with-server.mjs`.
- Phones: no pinned scenes, parallax, marquee or coverflow; reviews and steps are swipe rails, the gold morph is tap-to-switch, one 0.3 s fade-and-rise per section heading. The "Concept site" badge sits in the bottom bar on phones.
- No /for/[token] preview and no Serbian in this demo (English only, US market); nothing of that kind to keep.

## Demo store details
- Promo code: **WELCOME10** (10% off). Any other code shows a friendly error.
- Test card: **4242 4242 4242 4242**, any future expiry, any 3-digit CVC. Visa / Mastercard / Amex are detected; nothing is sent or stored (card data never leaves the component; only brand + last four reach the mock order).
- Track an order: any number like `AL-12345` plus any email.
- Free insured shipping over $250 · 30-day returns · free resizing for 60 days.

## How to make it real
All commerce goes through `src/lib/commerce`: `provider.ts` defines `CatalogProvider` (products, categories, collections) and `CheckoutProvider` (create checkout, place order, track). The demo ships `mock-provider.ts` (reads `src/content/products.ts`) and `mock-checkout.ts` (simulated payment). To go live, write a Shopify Storefront API catalog (products/variants → metal, size, length, stone options) and either hand the cart to Shopify Checkout or keep this checkout UI with Stripe Elements (PaymentIntent created in a route handler, card fields replaced by Stripe's), then swap the two exports in `src/lib/commerce/index.ts`. The UI doesn't change. Add GA4 + `ClickTracking.tsx` when it becomes a client site.

## Portfolio copy
EN title: Ardley & Lume — fine-jewelry store
EN one-liner (≤ 120 chars): A Dallas jewelry atelier's online store: scroll into a 3D diamond, build your ring, check out in a minute.
EN summary (2–3 sentences): A complete e-commerce concept for an independent fine-jewelry atelier: 35 products with real per-variant pricing, a ring builder, metal-morphing photos and a calm checkout. The homepage dives into a turning WebGL ring and flies through scene after scene, while shopping stays fast — 94+ mobile Lighthouse on the store pages.
SR title: Ardley & Lume — online prodavnica nakita
SR one-liner: Online prodavnica zlatare iz Dalasa: uronite u 3D dijamant, napravite svoj prsten, završite kupovinu za minut.
SR summary: Kompletan koncept online prodavnice za nezavisnu zlataru: 35 proizvoda sa cenama po varijanti, konfigurator prstena, fotografije koje menjaju boju metala i miran checkout. Početna strana uranja u 3D prsten i prolazi kroz niz scena, a kupovina ostaje brza — 94+ na mobilnom Lighthouse testu.

## Screenshots
handoff/desktop-home.png, handoff/desktop-3d-builder.png (live 3D ring builder), handoff/desktop-feature.png (gem dive), handoff/desktop-shop.png, handoff/desktop-product.png, handoff/mobile-home.png, handoff/mobile-product.png, handoff/mobile-checkout.png, handoff/scroll.mp4
