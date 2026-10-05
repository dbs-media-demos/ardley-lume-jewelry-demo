import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { GiftCardForm } from "@/components/forms/GiftCardForm";
import { img } from "@/lib/images";

export const metadata: Metadata = buildMetadata({
  title: "Gift cards",
  description: "Digital Ardley & Lume gift cards from $50 to $5,000, delivered by email with your note. Never expire; use online or in our Dallas showroom.",
  path: "/gift-cards",
  eyebrow: "Gift cards",
});

export default function GiftCardsPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="Gift cards"
        title="Let them choose the light."
        intro="A digital gift card, delivered by email with your note, today or on the day you choose. It never expires."
        crumbs={[{ name: "Gift cards", path: "/gift-cards" }]}
      />
      <div className="wrap pb-24">
        <GiftCardForm giftImage={img("gift-box").src} />
      </div>
    </PageTransition>
  );
}
