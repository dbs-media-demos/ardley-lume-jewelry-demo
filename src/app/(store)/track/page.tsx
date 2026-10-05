import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { PageTransition } from "@/components/layout/PageTransition";
import { TrackForm } from "@/components/forms/TrackForm";

export const metadata: Metadata = buildMetadata({ title: "Track an order", description: "Track your Ardley & Lume order from our bench to your door.", path: "/track", noindex: true });

export default function TrackPage() {
  return (
    <PageTransition>
      <div className="wrap pt-28 pb-24 md:pt-36">
        <p className="eyebrow text-gold-ink">Order status</p>
        <h1 className="mt-3 mb-4 font-display text-[clamp(2.8rem,6vw,5rem)] leading-none">Track an order</h1>
        <p className="mb-10 max-w-xl text-taupe">
          From the bench to your door, insured all the way. Buying a gift instead? <Link href="/gift-cards" className="link-under text-ink">Send a gift card</Link>.
        </p>
        <TrackForm />
      </div>
    </PageTransition>
  );
}
