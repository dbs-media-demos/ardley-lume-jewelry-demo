import type { Metadata } from "next";
import Image from "next/image";
import { img } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, SplitReveal, Parallax } from "@/components/ui/Reveal";
import { FaqList } from "@/components/ui/FaqList";
import { FinalCta } from "@/components/ui/FinalCta";
import { faqs } from "@/content/faqs";

export const metadata: Metadata = buildMetadata({
  title: "Care & lifetime warranty",
  description: "How to care for gold, diamonds, pearls and silver, and what our lifetime warranty covers: free cleaning, prong checks, polishing and repairs for manufacturing defects.",
  path: "/care",
  eyebrow: "Care & warranty",
});

const GUIDE = [
  ["Gold & platinum", "Wear it every day; solid gold doesn't tarnish. Take rings off for the gym, gardening and chlorine pools. A soft cloth brings back the shine."],
  ["Diamonds", "They attract skin oils, which dull the sparkle. Soak in warm water with a drop of dish soap, brush gently with a soft toothbrush, rinse, pat dry."],
  ["Pearls", "Last on, first off: after perfume and lotion, before the shower. Wipe with a dry cloth and store flat. Free restringing for two years."],
  ["Emerald & opal", "Softer and more porous: no ultrasonic cleaners, no hot water. A damp cloth is enough, and a yearly check of the claws."],
  ["Sterling silver", "Darkens a little with air. The cloth in your box restores it in seconds; we'll polish it professionally for free any time."],
  ["Storage", "Separately, in the pouches in your box, so harder stones don't scratch softer metal. Chains fastened, flat, never knotted."],
];

export default function CarePage() {
  const polish = img("step-polish");
  return (
    <PageTransition>
      <PageHero
        eyebrow="Care & warranty"
        title="Made to be worn for decades."
        intro="Everything we make is covered for life against manufacturing defects, and cleaned, checked and polished for free whenever you visit."
        crumbs={[{ name: "Care & warranty", path: "/care" }]}
        image="bench-tools"
      />
      <section className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.2fr]" aria-labelledby="warranty-title">
        <div>
          <p className="eyebrow text-gold-ink">The lifetime warranty</p>
          <SplitReveal id="warranty-title" className="mt-3 font-display text-[clamp(2.4rem,5vw,4.4rem)]">
            If it&apos;s our fault, it&apos;s free. Forever.
          </SplitReveal>
          <ul className="mt-8 space-y-3">
            {[
              "Stones that loosen from a faulty setting: re-set free",
              "Broken solder joints and clasp failures: repaired free",
              "Free cleaning, polishing and prong checks, any time",
              "Free rhodium re-plating of white gold every 18 months",
              "Free resizing within 60 days, then at cost",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="text-gold-ink">✦</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-taupe">Not covered: loss, theft, or damage from accidents and wear (we recommend insuring engagement rings; we&apos;ll provide an appraisal free).</p>
        </div>
        <Parallax className="aspect-[4/5] rounded-2xl" amount={12}>
          <div className="absolute inset-0">
            <Image src={polish.src} alt={polish.alt} fill sizes="(min-width:1024px) 45vw, 92vw" quality={75} className="object-cover" />
          </div>
        </Parallax>
      </section>
      <section className="bg-bone py-20 md:py-28" aria-labelledby="care-title">
        <div className="wrap">
          <h2 id="care-title" className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">
            Caring for each material
          </h2>
          <Reveal stagger={0.08} className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {GUIDE.map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-ivory p-6">
                <h3 className="font-display text-2xl">{t}</h3>
                <p className="mt-2 text-sm text-ink/80">{d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="wrap grid gap-10 py-20 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="care-faq">
        <h2 id="care-faq" className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">
          Care questions
        </h2>
        <FaqList items={faqs.filter((f) => f.topic === "Care & warranty")} />
      </section>
      <FinalCta title="Bring it in for a free clean." image="bench-hands" />
    </PageTransition>
  );
}
