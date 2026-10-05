import type { Metadata } from "next";
import Image from "next/image";
import { img } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { team } from "@/content/team";
import { workshopSteps } from "@/content/story";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { ScrubWords, Reveal, SplitReveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { Workshop } from "@/components/home/Workshop";
import { Timeline } from "@/components/home/Timeline";
import { FinalCta } from "@/components/ui/FinalCta";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { JsonLd } from "@/components/ui/JsonLd";
import { siteUrl } from "@/content/site";

export const metadata: Metadata = buildMetadata({
  title: "Our story: a Dallas jewelry atelier",
  description: "Ardley & Lume was founded in 2014 by bench jeweler Margot Ardley. Recycled gold, lab-grown and natural stones, and every piece made by hand in Knox-Henderson.",
  path: "/about",
  eyebrow: "Our story",
  image: "/images/scenes/bench-hands.jpg",
});

const pick = (k: string) => {
  const i = img(k);
  return { src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt };
};

const MOMENTS = [
  { year: "2014", title: "A bench by a window", body: "Margot rents a 200 sq ft studio above a Deep Ellum print shop, with one north-facing window and a secondhand bench.", img: "bench-tools" },
  { year: "2016", title: "The first proposal", body: "A friend asks for an engagement ring. The Ardley solitaire is born, and still outsells everything else we make.", img: "proposal" },
  { year: "2018", title: "Recycled, all of it", body: "We move to 100% certified recycled gold and platinum. Same metal, no new mining.", img: "texture-gold" },
  { year: "2020", title: "Proposals by video", body: "Stone videos and video consultations, so couples in Chicago and Houston could choose with us too.", img: "macro-facets" },
  { year: "2022", title: "Knox-Henderson", body: "A real showroom off Henderson Avenue, with the bench right behind the glass so you can watch.", img: "showroom" },
  { year: "2026", title: "4,200 pieces later", body: "Four of us, one bench each, and the same window light. Every piece still passes Margot's loupe.", img: "still-water" },
];

export default function AboutPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="Our story"
        title="A bench, a window, and the light."
        intro={`Founded in ${site.founded} by bench jeweler ${site.founder}. Four people, one showroom in Knox-Henderson, and every piece made by hand.`}
        crumbs={[{ name: "Our story", path: "/about" }]}
        image="bench-hands"
      />
      <section className="wrap py-24 md:py-32">
        <ScrubWords
          className="max-w-5xl font-display text-[clamp(2rem,4.4vw,4rem)] leading-[1.1]"
          text="We started with one rule: make every piece as if it were for someone we love, then let them watch us make it. Twelve years later the bench is still behind the glass, the gold is still recycled, and Margot still checks every stone under her own loupe."
        />
        <Reveal stagger={0.1} className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-ink/10 sm:grid-cols-3">
          {[
            { v: 4200, s: "+", l: "Pieces made by hand" },
            { v: 100, s: "%", l: "Recycled gold & platinum" },
            { v: 312, s: "", l: "Five-star reviews" },
          ].map((x) => (
            <div key={x.l} className="bg-ivory p-8">
              <p className="font-display text-6xl text-gold-ink">
                <Counter value={x.v} suffix={x.s} />
              </p>
              <p className="spec mt-3 text-taupe">{x.l}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section data-dark className="relative h-[70svh] min-h-96 overflow-hidden bg-ink text-ivory" aria-label="At the bench">
        <AmbientVideo src="/video/bench.mp4" poster="/video/bench-poster.jpg" label="Close-up of a gold earring being filed by hand at the bench" className="absolute inset-0 size-full" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30" />
        <div className="wrap relative flex h-full items-end pb-12">
          <p className="max-w-xl font-display text-[clamp(2rem,4vw,3.6rem)] leading-[1.05]">Every surface filed and finished by hand, a few millimetres at a time.</p>
        </div>
      </section>
      <Timeline moments={MOMENTS.map((m) => ({ ...m, img: pick(m.img) }))} />
      <Workshop id="about-workshop" title="How every piece is made" steps={workshopSteps.map((s) => ({ ...s, img: pick(s.img) }))} />

      <section className="wrap py-24 md:py-32" aria-labelledby="team-title">
        <p className="eyebrow text-gold-ink">The people</p>
        <SplitReveal id="team-title" className="mt-3 font-display text-[clamp(2.4rem,5vw,4.4rem)]">
          Four benches, one standard.
        </SplitReveal>
        <Reveal stagger={0.1} className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((t) => {
            const im = img(t.image);
            return (
              <figure key={t.name}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink">
                  <Image src={im.src} alt={`${t.name} at work`} fill sizes="(min-width:1024px) 22vw, 45vw" quality={60} className="object-cover" />
                </div>
                <figcaption className="mt-4">
                  <span className="block font-display text-2xl">{t.name}</span>
                  <span className="spec block text-gold-ink">{t.role}</span>
                  <span className="mt-2 block text-sm text-taupe">{t.bio}</span>
                </figcaption>
              </figure>
            );
          })}
        </Reveal>
      </section>
      <FinalCta title="Come and watch us work." image="showroom" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `About ${site.name}`,
          url: `${siteUrl}/about`,
          mainEntity: { "@type": "Organization", name: site.name, founder: { "@type": "Person", name: site.founder }, foundingDate: String(site.founded) },
        }}
      />
    </PageTransition>
  );
}
