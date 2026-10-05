import "server-only";
import type { CatalogProvider } from "./provider";
import { products } from "@/content/products";
import { categories, collections } from "@/content/catalog";

/*
 * Demo catalog: reads the typed product file. Swap this for a Shopify
 * Storefront API implementation (same interface) to make the store real.
 */

const byCollection: Record<string, (p: (typeof products)[number]) => boolean> = {
  "on-sale": (p) => !!p.sale,
  "gift-edit": (p) => p.price < 500 && !p.soldOut,
  "new-in": (p) => !!p.badges?.includes("new"),
  bestsellers: (p) => !!p.badges?.includes("bestseller"),
};

export const mockCatalog: CatalogProvider = {
  async getProducts() {
    return products;
  },
  async getProduct(slug) {
    return products.find((p) => p.slug === slug);
  },
  async getCategories() {
    return categories;
  },
  async getCategory(slug) {
    return categories.find((c) => c.slug === slug);
  },
  async getCollections() {
    return collections;
  },
  async getCollection(slug) {
    const collection = collections.find((c) => c.slug === slug);
    if (!collection) return undefined;
    const rule = byCollection[slug];
    return { collection, products: products.filter((p) => (rule ? rule(p) : p.collections.includes(slug))) };
  },
};
