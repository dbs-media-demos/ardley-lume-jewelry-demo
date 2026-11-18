import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} | Fine Jewelry & Engagement Rings, Dallas`,
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

export default function Home() {
  return <HomePage hero="3d" />;
}
