import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = buildMetadata({ title: "Terms of sale", description: `Terms of sale and use for ${site.name}.`, path: "/terms" });

export default function TermsPage() {
  return (
    <PageTransition>
      <PageHero eyebrow="Last updated October 2026" title="Terms of sale" crumbs={[{ name: "Terms", path: "/terms" }]} />
      <div className="wrap pb-24">
        <Prose
          sections={[
            { h: "Demo store", body: <p>This is a concept store for a fictional business. Nothing can be purchased and no payment is ever taken. The terms below show what a live store would publish.</p> },
            {
              h: "Prices & availability",
              body: <p>Prices are in US dollars and include insured shipping where stated. Sales tax is calculated at checkout based on the delivery address. Made-to-order pieces are subject to stone availability; we&apos;ll confirm before making.</p>,
            },
            {
              h: "Lab-grown & natural stones",
              body: <p>Every stone is described accurately as lab-grown or natural, with treatments disclosed (for example, traditional oiling of emeralds). Centre stones over 0.5 ct include an independent grading report.</p>,
            },
            {
              h: "Returns & warranty",
              body: <p>Unworn pieces may be returned within {site.returnDays} days. Engraved, bespoke and builder pieces are final sale but will be resized or adjusted. Our lifetime warranty covers manufacturing defects; see Care &amp; warranty for details.</p>,
            },
            { h: "Contact", body: <p>{site.legalName}, {site.address.street}, {site.address.locality}, {site.address.region} {site.address.postalCode} · {site.phone} · {site.email}</p> },
          ]}
        />
      </div>
    </PageTransition>
  );
}
