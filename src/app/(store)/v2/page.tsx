import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/content/site";

/** The homepage without any 3D (for a slow laptop, or a lead who'd rather not): same sections, words and photos; only the hero differs. */
export const metadata: Metadata = {
  ...buildMetadata({
    title: `${site.name} | Fine Jewelry & Engagement Rings, Dallas`,
    absoluteTitle: true,
    description: site.description,
    path: "/",
  }),
  robots: { index: false, follow: true },
};

export default function HomeV2() {
  return <HomePage hero="v2" />;
}
