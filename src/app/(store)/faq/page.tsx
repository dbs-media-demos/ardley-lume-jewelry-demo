import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { faqs } from "@/content/faqs";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { FaqList } from "@/components/ui/FaqList";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqSchema } from "@/lib/schema";
import { FinalCta } from "@/components/ui/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Frequently asked questions",
  description: "Shipping, returns, ring sizing, lab-grown vs natural diamonds, recycled gold, bespoke, financing and our lifetime warranty: answered by the jewelers.",
  path: "/faq",
  eyebrow: "FAQ",
});

const TOPICS = ["Orders & shipping", "Returns & sizing", "Diamonds & materials", "Engagement & bespoke", "Care & warranty"] as const;

export default function FaqPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="FAQ"
        title="Good questions."
        intro="If yours isn't here, call or email: a jeweler (not a bot) will answer, usually within the hour while we're open."
        crumbs={[{ name: "FAQ", path: "/faq" }]}
      />
      <div className="wrap space-y-16 pb-24">
        {TOPICS.map((t, i) => (
          <section key={t} className="grid gap-8 lg:grid-cols-[1fr_1.6fr]" aria-labelledby={`faq-${i}`}>
            <h2 id={`faq-${i}`} className="font-display text-[clamp(1.9rem,3.4vw,2.8rem)]">
              {t}
            </h2>
            <FaqList items={faqs.filter((f) => f.topic === t)} schema={false} defaultOpen={i === 0 ? 0 : null} />
          </section>
        ))}
      </div>
      <FinalCta title="Still wondering? Come and ask." />
      <JsonLd data={faqSchema(faqs)} />
    </PageTransition>
  );
}
