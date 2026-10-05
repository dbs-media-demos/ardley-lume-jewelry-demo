import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";
import { products } from "@/content/products";
import { categories, collections } from "@/content/catalog";
import { guides } from "@/content/education";

// Cart, checkout, success, wishlist and track are intentionally left out (noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-10-05");
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({ url: `${siteUrl}${path}`, lastModified: now, changeFrequency, priority });
  return [
    page("/", 1, "weekly"),
    page("/shop", 0.9, "weekly"),
    ...categories.map((c) => page(`/shop/${c.slug}`, 0.85, "weekly")),
    ...collections.map((c) => page(`/collections/${c.slug}`, 0.75, "weekly")),
    ...products.map((p) => page(`/product/${p.slug}`, 0.8, "weekly")),
    page("/engagement", 0.9),
    page("/engagement/build", 0.8),
    page("/bridal", 0.8),
    page("/bespoke", 0.7),
    page("/appointment", 0.7),
    page("/education", 0.6),
    ...guides.map((g) => page(`/education/${g.slug}`, 0.6)),
    page("/ring-size-guide", 0.6),
    page("/care", 0.5),
    page("/about", 0.6),
    page("/gift-cards", 0.6),
    page("/shipping-returns", 0.5),
    page("/faq", 0.5),
    page("/visit", 0.7),
    page("/reviews", 0.6),
    page("/privacy", 0.2, "yearly"),
    page("/terms", 0.2, "yearly"),
  ];
}
