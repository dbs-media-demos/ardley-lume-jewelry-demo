import type { Metadata } from "next";
import { site } from "@/content/site";

type Input = {
  title: string;
  description: string;
  path: string;
  /** Short label above the title on the generated share image. */
  eyebrow?: string;
  /** Product/collection photo for the share image (public path). */
  image?: string;
  absoluteTitle?: boolean;
  /** Cart, checkout, wishlist, track: always out of the index. */
  noindex?: boolean;
};

export const ogImageUrl = (title: string, eyebrow?: string, image?: string) => {
  const params = new URLSearchParams({ title });
  if (eyebrow) params.set("eyebrow", eyebrow);
  if (image) params.set("image", image);
  return `/api/og?${params.toString()}`;
};

export function buildMetadata({ title, description, path, eyebrow, image, absoluteTitle, noindex }: Input): Metadata {
  const og = ogImageUrl(absoluteTitle ? site.tagline : title, eyebrow, image);
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.name,
      title: fullTitle,
      description,
      locale: "en_US",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [og] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
