import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { catalog } from "@/lib/commerce";
import { toCard } from "@/lib/cards";
import { img } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";
import { fromPrice, formatPrice } from "@/lib/commerce/pricing";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { FinalCta } from "@/components/ui/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Bridal & wedding bands",
  description: "Wedding bands fitted to your engagement ring, matching his-and-hers bands, eternity bands and the earrings for the day. Hand-engraved inside, made in Dallas.",
  path: "/bridal",
  eyebrow: "Bridal",
  image: "/images/scenes/couple-hands.jpg",
});

const STACKS: { name: string; note: string; slugs: [string, string] }[] = [
  { name: "The classic", note: "A six-claw solitaire beside a domed comfort band. Timeless, and it never catches.", slugs: ["ardley-solitaire", "classic-band"] },
  { name: "Old Hollywood", note: "An emerald cut with a knife-edge band: two lines of light, nothing else.", slugs: ["margot-emerald-cut", "knife-edge-band"] },
  { name: "All the light", note: "Oval halo plus a full eternity band, for sparkle from every angle.", slugs: ["celeste-oval-halo", "eternity-band"] },
  { name: "The pair", note: "Pear halo and a pavé companion band fitted flush at the bench.", slugs: ["dewdrop-pear", "companion-band"] },
];

export default async function BridalPage() {
  const all = await catalog.getProducts();
  const bands = all.filter((p) => p.category === "wedding-bands");
  const forTheDay = all.filter((p) => ["pearl-drops", "glint-studs", "pearl-strand", "tennis-bracelet"].includes(p.slug));
  return (
    <PageTransition>
      <PageHero
        eyebrow="Bridal & wedding bands"
        title="Made to sit side by side."
        intro="Bands fitted to your engagement ring at the bench, matching his-and-hers sets, and the pieces for the day itself. Your vows, hand-engraved inside."
        crumbs={[{ name: "Bridal", path: "/bridal" }]}
        image="couple-hands"
      />

      <section className="wrap py-20 md:py-28" aria-labelledby="stacks-title">
        <p className="eyebrow text-gold-ink">Bridal stacks</p>
        <SplitReveal id="stacks-title" className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.4rem)]">
          Four pairings we love, fitted to each other.
        </SplitReveal>
        <Reveal stagger={0.1} className="mt-12 grid gap-6 md:grid-cols-2">
          {STACKS.map((s) => {
            const items = s.slugs.map((slug) => all.find((p) => p.slug === slug)!).filter(Boolean);
            const total = items.reduce((sum, p) => sum + fromPrice(p).price, 0);
            return (
              <article key={s.name} className="rounded-2xl border border-ink/10 bg-bone/50 p-5">
                <div className="grid grid-cols-2 gap-3">
                  {items.map((p) => {
                    const im = img(p.images.hero);
                    return (
                      <Link key={p.slug} href={`/product/${p.slug}`} className="group relative block aspect-square overflow-hidden rounded-xl bg-bone">
                        <Image src={im.src} alt={im.alt} fill sizes="(min-width:768px) 22vw, 45vw" quality={60} className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                        <span className="absolute inset-x-2 bottom-2 rounded-full bg-ivory/90 px-3 py-1 text-center text-xs font-medium">{p.name}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-3xl">{s.name}</h3>
                    <p className="mt-1 max-w-sm text-sm text-taupe">{s.note}</p>
                  </div>
                  <p className="shrink-0 text-right text-sm">
                    <span className="block text-taupe">together from</span>
                    <span className="font-display text-2xl">{formatPrice(total)}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </Reveal>
      </section>

      <section data-dark className="bg-ink py-20 text-ivory md:py-28" aria-labelledby="bands-title">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SplitReveal id="bands-title" className="font-display text-[clamp(2.4rem,5vw,4.4rem)]">
              Wedding bands
            </SplitReveal>
            <Link href="/shop/wedding-bands" className="btn btn-ghost-light">
              Shop all bands
            </Link>
          </div>
          <Reveal wipe stagger={0.08} className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-5">
            {bands.map((p) => (
              <ProductCard key={p.slug} card={toCard(p)} tone="dark" sizes="(min-width:1024px) 18vw, 45vw" />
            ))}
          </Reveal>
          <p className="mt-12 max-w-2xl text-ivory/80">
            Every band can be hand-engraved inside for $45: a date, coordinates, or each other&apos;s handwriting traced from your vows. Bought with an Ardley &amp; Lume engagement ring, the fitting is already done.
          </p>
        </div>
      </section>

      <section className="wrap py-20 md:py-28" aria-labelledby="day-title">
        <h2 id="day-title" className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">
          For the day itself
        </h2>
        <Reveal wipe stagger={0.08} className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {forTheDay.map((p) => (
            <ProductCard key={p.slug} card={toCard(p)} />
          ))}
        </Reveal>
      </section>
      <FinalCta title="Try them on together." image="couple-hands" />
    </PageTransition>
  );
}
