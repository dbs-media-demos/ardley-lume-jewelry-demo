import type { Metadata, Viewport } from "next";
import { Gloock, Instrument_Sans, Azeret_Mono } from "next/font/google";
import "./globals.css";
import { site, siteUrl, noindex } from "@/content/site";
import { ogImageUrl } from "@/lib/seo";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Cursor } from "@/components/layout/Cursor";
import { DemoPill } from "@/components/layout/DemoPill";
import { Announcer } from "@/components/layout/Announcer";
import { Overlays } from "@/components/layout/Overlays";

const gloock = Gloock({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gloock",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

// Specs and hallmarks only: never preloaded, and skipped if it's late (no layout shift).
const azeret = Azeret_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-azeret",
  display: "optional",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} | Fine Jewelry & Engagement Rings, Dallas`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  category: "shopping",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/",
    images: [{ url: ogImageUrl(site.tagline), width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image" },
  robots: noindex ? { index: false, follow: false, googleBot: { index: false, follow: false } } : { index: true, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#0e1311",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${gloock.variable} ${instrument.variable} ${azeret.variable}`}>
      <body>
        <a
          href="#main"
          className="fixed top-3 left-3 z-[200] -translate-y-24 rounded-full bg-ink px-5 py-3 font-semibold text-ivory transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll />
        {children}
        <Overlays />
        <Announcer />
        <DemoPill />
        <Cursor />
      </body>
    </html>
  );
}
