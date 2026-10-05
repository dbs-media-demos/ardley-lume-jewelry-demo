import type { CartExtras, CartLine, Category, Collection, CollectionSlug, CategorySlug, Order, Product, Address } from "./types";

/*
 * The commerce adapter.
 *
 * Every page and component asks this interface for products and orders; nothing
 * in the UI knows where the data comes from. The demo ships `mockProvider`
 * (a typed catalog file + a simulated payment), and switching to a real store is a
 * matter of writing one more implementation of this interface:
 *
 *   - Shopify: `getProducts`/`getProduct` map to Storefront API `products` /
 *     `productByHandle` queries (variants → metal/size/length options), and
 *     `createCheckout` creates a Cart and redirects to its `checkoutUrl`, or keeps
 *     this checkout UI with Shopify's Checkout Kit.
 *   - Stripe: products/prices live in Stripe (or a CMS), `createCheckout` creates a
 *     Checkout Session or a PaymentIntent and the card fields become Stripe
 *     Elements, so card data never touches our servers.
 *
 * Product, category and collection pages are statically generated from
 * `getProducts()` at build time, so a real store would rebuild (or revalidate)
 * when the catalog changes.
 */
export interface CatalogProvider {
  getProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
  getCategories(): Promise<Category[]>;
  getCategory(slug: CategorySlug): Promise<Category | undefined>;
  getCollections(): Promise<Collection[]>;
  getCollection(slug: CollectionSlug): Promise<{ collection: Collection; products: Product[] } | undefined>;
}

/** The browser-side half: it never imports the catalog, so it stays tiny. */
export interface CheckoutProvider {
  /** Server-side: validate lines and reserve stock. The demo only returns an id. */
  createCheckout(lines: CartLine[], extras: CartExtras): Promise<{ checkoutId: string }>;
  /**
   * Place the order. A real provider receives a payment token (Stripe
   * PaymentMethod id, Shopify payment session), never raw card numbers.
   */
  placeOrder(input: PlaceOrderInput): Promise<Order>;
  trackOrder(orderNumber: string, email: string): Promise<TrackResult | undefined>;
}

export type CommerceProvider = CatalogProvider & CheckoutProvider;

export type PlaceOrderInput = {
  checkoutId: string;
  email: string;
  lines: CartLine[];
  extras: CartExtras;
  address?: Address;
  pickup?: boolean;
  shippingId: string;
  state?: string;
  /** Only non-sensitive display data ever reaches the provider. */
  paymentToken: { brand: string; last4: string };
};

export type TrackStep = { label: string; detail: string; at?: string; done: boolean };
export type TrackResult = { number: string; status: string; carrier: string; eta: string; steps: TrackStep[] };
