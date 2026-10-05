import type { MetadataRoute } from "next";
import { noindex, siteUrl } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  // Concept site: stays out of search engines unless NEXT_PUBLIC_NOINDEX=false.
  if (noindex) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout", "/wishlist", "/track"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
