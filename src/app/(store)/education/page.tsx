import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { img } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";
import { guides } from "@/content/education";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCta } from "@/components/ui/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Jewelry education: diamonds, metals & sizing",
  description: "Plain-English guides to the 4Cs, lab-grown vs natural diamonds, gold and platinum, ring sizes and care, from the bench jewelers at Ardley & Lume.",
  path: "/education",
  eyebrow: "Education",
});

export default function EducationPage() {
  const more = [
    { href: "/ring-size-guide", title: "Ring size guide", dek: "A printable sizer, a chart, and a free sizer by mail.", image: "bench-tools" },
    { href: "/care", title: "Care & lifetime warranty", dek: "Keep it bright for decades, and what we fix for free.", image: "step-polish" },
  ];
  return (
    <PageTransition>
      <PageHero
        eyebrow="Education"
        title="Buy it knowing."
        intro="Short, honest guides written by the people who make the pieces. No upsell, no jargon you'll need a loupe to decode."
        crumbs={[{ name: "Education", path: "/education" }]}
      />
      <section className="wrap pb-24">
        <Reveal stagger={0.1} className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g, i) => {
            const im = img(g.image);
            return (
              <Link key={g.slug} href={`/education/${g.slug}`} className={`group block ${i === 0 ? "md:col-span-2" : ""}`}>
                <span className={`relative block overflow-hidden rounded-2xl bg-ink ${i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                  <Image src={im.src} alt="" fill sizes={i === 0 ? "(min-width:768px) 66vw, 92vw" : "(min-width:768px) 33vw, 92vw"} quality={70} className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                </span>
                <span className="spec mt-4 block text-gold-ink">{g.read}</span>
                <span className="mt-1 block font-display text-3xl">{g.title}</span>
                <span className="mt-1 block max-w-lg text-taupe">{g.dek}</span>
              </Link>
            );
          })}
          {more.map((m) => {
            const im = img(m.image);
            return (
              <Link key={m.href} href={m.href} className="group block">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-ink">
                  <Image src={im.src} alt="" fill sizes="(min-width:768px) 33vw, 92vw" quality={70} className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                </span>
                <span className="spec mt-4 block text-gold-ink">Guide</span>
                <span className="mt-1 block font-display text-3xl">{m.title}</span>
                <span className="mt-1 block text-taupe">{m.dek}</span>
              </Link>
            );
          })}
        </Reveal>
      </section>
      <FinalCta title="Questions are free. Ask a jeweler." />
    </PageTransition>
  );
}
