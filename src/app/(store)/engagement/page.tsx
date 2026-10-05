import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { catalog } from "@/lib/commerce";
import { toCard } from "@/lib/cards";
import { img } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal, SplitReveal, Parallax } from "@/components/ui/Reveal";
import { FaqList } from "@/components/ui/FaqList";
import { FinalCta } from "@/components/ui/FinalCta";
import { JsonLd } from "@/components/ui/JsonLd";
import { Magnetic } from "@/components/ui/Magnetic";
import { faqs } from "@/content/faqs";
import { guides } from "@/content/education";

export const metadata: Metadata = buildMetadata({
  title: "Engagement rings, made in Dallas",
  description: "Solitaire, halo, three-stone and bezel engagement rings with lab-grown or natural diamonds, set by hand in Knox-Henderson. Compare stones in person or by video.",
  path: "/engagement",
  eyebrow: "Engagement",
  image: "/images/scenes/proposal.jpg",
});

const STEPS = [
  ["Talk", "A 45-minute consultation in the showroom or by video. Budget, style, timeline, no pressure."],
  ["Choose the stone", "We source three candidates and show them side by side under daylight and candlelight."],
  ["Design", "Pick a signature setting or have Margot sketch something new. We send a render and a wax to try on."],
  ["Set & finish", "Theo sets the stone under the microscope; Luis polishes it to a mirror. Progress photos at each stage."],
  ["The moment", "Boxed in oak, insured to the door or ready in the showroom. Free resizing if you guessed the size."],
];

export default async function EngagementPage() {
  const products = (await catalog.getProducts()).filter((p) => p.category === "engagement");
  const proposal = img("couple-hands");
  return (
    <PageTransition>
      <PageHero
        eyebrow="Engagement rings"
        title="One stone. Yours."
        intro="Signature settings, or a ring designed from a sketch. Lab-grown or natural diamonds, compared side by side, set by hand at our Dallas bench."
        crumbs={[{ name: "Engagement", path: "/engagement" }]}
        image="proposal"
        position="60% 50%"
      >
        <div className="rise mt-8 flex flex-wrap gap-3" style={{ ["--d" as string]: "0.45s" }}>
          <Magnetic>
            <Link href="/engagement/build" className="btn btn-gold">
              Build your ring
            </Link>
          </Magnetic>
          <Link href="/appointment" className="btn btn-ghost-light">
            Book a consultation
          </Link>
        </div>
      </PageHero>

      <section className="wrap py-20 md:py-28" aria-labelledby="signature-title">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SplitReveal id="signature-title" className="max-w-2xl font-display text-[clamp(2.4rem,5vw,4.4rem)]">
            Six signature settings
          </SplitReveal>
          <Link href="/shop/engagement" className="btn btn-ghost">
            Shop all engagement
          </Link>
        </div>
        <Reveal wipe stagger={0.08} className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} card={toCard(p)} />
          ))}
        </Reveal>
      </section>

      <section data-dark className="bg-forest py-20 text-ivory md:py-28" aria-labelledby="process-title">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow text-gold-pale">How it works</p>
            <SplitReveal id="process-title" className="mt-4 font-display text-[clamp(2.4rem,5vw,4.4rem)]">
              From first question to the question.
            </SplitReveal>
            <Parallax className="mt-10 aspect-[4/3] rounded-2xl" amount={10}>
              <div className="absolute inset-0">
                <Image src={proposal.src} alt={proposal.alt} fill sizes="(min-width:1024px) 40vw, 90vw" quality={75} className="object-cover" />
              </div>
            </Parallax>
          </div>
          <Reveal as="ol" stagger={0.1} className="space-y-px self-center overflow-hidden rounded-2xl">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex gap-6 bg-moss/70 p-6">
                <span className="font-display text-4xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-display text-2xl">{t}</span>
                  <span className="mt-1 block text-sm text-ivory/80">{d}</span>
                </span>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="wrap py-20 md:py-28" aria-labelledby="learn-title">
        <h2 id="learn-title" className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">
          Learn before you buy
        </h2>
        <Reveal stagger={0.1} className="mt-10 grid gap-6 md:grid-cols-3">
          {guides.map((g) => {
            const gi = img(g.image);
            return (
              <Link key={g.slug} href={`/education/${g.slug}`} className="group block">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-ink">
                  <Image src={gi.src} alt="" fill sizes="(min-width:768px) 30vw, 90vw" quality={60} className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                </span>
                <span className="spec mt-4 block text-gold-ink">{g.read}</span>
                <span className="mt-1 block font-display text-2xl">{g.title}</span>
                <span className="mt-1 block text-sm text-taupe">{g.dek}</span>
              </Link>
            );
          })}
        </Reveal>
      </section>

      <section className="wrap grid gap-10 pb-24 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="eng-faq">
        <h2 id="eng-faq" className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">
          Engagement questions
        </h2>
        <FaqList items={faqs.filter((f) => f.topic === "Engagement & bespoke" || f.topic === "Diamonds & materials")} />
      </section>
      <FinalCta title="Compare stones in person." />
      <JsonLd data={serviceSchema("Engagement ring design", "Custom and signature engagement rings with lab-grown or natural diamonds, made in Dallas.", "/engagement")} />
    </PageTransition>
  );
}
