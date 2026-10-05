import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, guideBySlug } from "@/content/education";
import { buildMetadata } from "@/lib/seo";
import { img } from "@/lib/images";
import { siteUrl, site } from "@/content/site";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { FinalCta } from "@/components/ui/FinalCta";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/education/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug[slug];
  if (!g) return {};
  return buildMetadata({ title: g.title, description: g.dek, path: `/education/${g.slug}`, eyebrow: "Education", image: img(g.image).src });
}

export default async function GuidePage({ params }: PageProps<"/education/[slug]">) {
  const { slug } = await params;
  const g = guideBySlug[slug];
  if (!g) notFound();
  const others = guides.filter((x) => x.slug !== g.slug);
  return (
    <PageTransition>
      <PageHero
        eyebrow={`Education · ${g.read}`}
        title={g.title}
        intro={g.dek}
        crumbs={[
          { name: "Education", path: "/education" },
          { name: g.title, path: `/education/${g.slug}` },
        ]}
        image={g.image}
      />
      <article className="wrap grid gap-12 py-20 lg:grid-cols-[14rem_1fr] lg:gap-20">
        <nav aria-label="In this guide" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="eyebrow text-taupe">In this guide</p>
            <ol className="mt-4 space-y-2 text-sm">
              {g.sections.map((s, i) => (
                <li key={s.h}>
                  <a href={`#s${i}`} className="link text-taupe hover:text-ink">
                    {s.h}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <div className="max-w-2xl space-y-16">
          {g.sections.map((s, i) => (
            <Reveal key={s.h} as="section" id={`s${i}`} className="scroll-mt-28">
              <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.8rem)]">{s.h}</h2>
              <div className="mt-4 space-y-4 text-[1.06rem] leading-relaxed text-ink/85">
                {s.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {s.facts && (
                <dl className="mt-6 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-bone/50 px-5">
                  {s.facts.map(([k, v]) => (
                    <div key={k} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                      <dt className="spec text-taupe">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Reveal>
          ))}
          <div className="rounded-2xl bg-forest p-8 text-ivory">
            <p className="font-display text-3xl">Rather see it than read it?</p>
            <p className="mt-2 text-ivory/80">Bring this guide to the showroom and we&apos;ll put the stones under a loupe for you.</p>
            <Link href="/appointment" className="btn btn-gold mt-5">
              Book a visit
            </Link>
          </div>
        </div>
      </article>
      <section className="wrap pb-20" aria-labelledby="more-guides">
        <h2 id="more-guides" className="font-display text-3xl">
          Keep reading
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/education/${o.slug}`} className="group flex items-center justify-between gap-4 rounded-2xl border border-ink/10 p-6 hover:border-ink/40">
                <span>
                  <span className="block font-display text-2xl">{o.title}</span>
                  <span className="text-sm text-taupe">{o.read}</span>
                </span>
                <span aria-hidden className="text-xl transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <FinalCta />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.dek,
          image: `${siteUrl}${img(g.image).src}`,
          author: { "@type": "Person", name: site.founder },
          publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512.png` } },
          mainEntityOfPage: `${siteUrl}/education/${g.slug}`,
          datePublished: "2026-03-02",
          dateModified: "2026-09-15",
        }}
      />
    </PageTransition>
  );
}
