import type { Metadata } from "next";
import { previewBiz } from "./preview";

/** Title and description for a personalised preview (/for/<token> and its /v2); never indexed. */
export async function previewMetadata(token: string): Promise<Metadata> {
  const biz = await previewBiz(token);
  const robots = { index: false, follow: false, googleBot: { index: false, follow: false } };
  if (!biz) return { title: "Preview not found", robots };
  const place = [biz.address.city || biz.area, biz.address.region].filter(Boolean).join(", ") || biz.area;
  const title = `${biz.name} | Fine Jewelry & Engagement Rings, ${place}`;
  const description = `Engagement rings, wedding bands and everyday fine jewelry from ${biz.name} in ${biz.area}. Visit the showroom or call ${biz.phoneDisplay || "us"}.`;
  return {
    title: { absolute: title },
    description,
    robots,
    alternates: { canonical: null },
    openGraph: { type: "website", siteName: biz.name, title, description, images: [] },
    twitter: { card: "summary", title, description },
  };
}
