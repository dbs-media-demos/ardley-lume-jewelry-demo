import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { PageTransition } from "@/components/layout/PageTransition";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LetterTitle } from "@/components/ui/LetterTitle";
import { RingBuilder } from "@/components/builder/RingBuilder";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Ring builder: design your engagement ring",
  description: "Choose a setting, a lab-grown or natural diamond, the metal and your size. See it live and watch the price build as you go. Made to order in Dallas.",
  path: "/engagement/build",
  eyebrow: "The ring builder",
});

export default function BuildPage() {
  return (
    <PageTransition>
      <div className="wrap pt-28 pb-24 md:pt-32">
        <Breadcrumbs
          items={[
            { name: "Engagement", path: "/engagement" },
            { name: "Ring builder", path: "/engagement/build" },
          ]}
        />
        <div className="mt-6 mb-10 flex flex-wrap items-end justify-between gap-6">
          <LetterTitle text="Design your ring" className="text-[clamp(2.8rem,6.5vw,6rem)] leading-[0.92] tracking-[-0.03em]" />
          <p className="rise max-w-sm text-taupe" style={{ ["--d" as string]: "0.3s" }}>
            Four choices. The preview and price update as you go. Every builder ring is made to order and checked by Margot before it ships.
          </p>
        </div>
        <RingBuilder />
      </div>
      <JsonLd data={serviceSchema("Custom engagement ring builder", "Configure a made-to-order engagement ring: setting, diamond shape, carat, origin, metal and size.", "/engagement/build")} />
    </PageTransition>
  );
}
