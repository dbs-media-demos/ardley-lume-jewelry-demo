import type { Metadata } from "next";
import Image from "next/image";
import { img } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { BespokeForm } from "@/components/forms/BespokeForm";
import { Reveal, SplitReveal, ScrubWords } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { FinalCta } from "@/components/ui/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Bespoke jewelry & custom engagement rings",
  description: "Design a one-off ring, band or heirloom redesign with Margot Ardley in Dallas. Sketches in a week, a wax to try on, made by hand in four to six weeks.",
  path: "/bespoke",
  eyebrow: "Bespoke",
  image: "/images/scenes/step-sketch.jpg",
});

const pick = (k: string) => {
  const i = img(k);
  return { src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt };
};

const MOODS = [
  { key: "still-stone", label: "Raw & earthy" },
  { key: "texture-gold", label: "Molten & bold" },
  { key: "still-water", label: "Quiet & minimal" },
  { key: "macro-gem", label: "Colour & light" },
  { key: "model-3", label: "Sculptural" },
  { key: "caustics", label: "Light & glass" },
  { key: "hero-a", label: "Fine & layered" },
  { key: "gift-box", label: "Classic & timeless" },
];

export default function BespokePage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="Bespoke"
        title="Drawn for one hand."
        intro="Bring an idea, a feeling, or your grandmother's stone. Margot sketches two or three directions, carves a wax you can try on, and we make it by hand."
        crumbs={[{ name: "Bespoke", path: "/bespoke" }]}
        image="step-sketch"
      />

      <section className="wrap py-20 md:py-28">
        <ScrubWords
          className="max-w-5xl font-display text-[clamp(2rem,4.2vw,3.8rem)] leading-[1.1]"
          text="Most bespoke rings start under $3,000 and take four to six weeks. You'll see a sketch within a week, a wax model within two, and progress photos at every stage after that."
        />
        <Reveal stagger={0.1} className="mt-16 grid gap-6 md:grid-cols-4">
          {[
            ["step-sketch", "1 · Sketch", "Two or three directions, drawn at true scale."],
            ["step-wax", "2 · Wax", "A carved model to try on and change."],
            ["bench-flame", "3 · Make", "Cast in recycled gold, set under the microscope."],
            ["step-polish", "4 · Finish", "Polished, hallmarked, boxed in oak."],
          ].map(([k, t, d]) => {
            const im = img(k);
            return (
              <figure key={k}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink">
                  <Image src={im.src} alt={im.alt} fill sizes="(min-width:768px) 22vw, 90vw" quality={60} className="object-cover" />
                </div>
                <figcaption className="mt-3">
                  <span className="font-display text-2xl">{t}</span>
                  <span className="block text-sm text-taupe">{d}</span>
                </figcaption>
              </figure>
            );
          })}
        </Reveal>
      </section>

      <section className="bg-bone py-20 md:py-28" aria-labelledby="inquiry-title">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow text-gold-ink">Start here</p>
            <SplitReveal id="inquiry-title" className="mt-3 font-display text-[clamp(2.4rem,5vw,4.4rem)]">
              Tell us what you&apos;re picturing.
            </SplitReveal>
            <p className="mt-4 max-w-sm text-taupe">Five short steps, about three minutes. Margot reads every inquiry herself and replies within two business days.</p>
          </div>
          <BespokeForm moods={MOODS.map((m) => ({ ...m, img: pick(m.key) }))} />
        </div>
      </section>
      <FinalCta title="Or sketch it together, in person." image="bench-hands" />
      <JsonLd data={serviceSchema("Bespoke jewelry design", "One-off rings, bands and heirloom redesigns, designed and made by hand in Dallas.", "/bespoke")} />
    </PageTransition>
  );
}
