import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { storeReviews, ratingBreakdown } from "@/content/reviews";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { Stars } from "@/components/ui/Stars";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCta } from "@/components/ui/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Reviews",
  description: `Rated ${site.rating.value} from ${site.rating.count} Google reviews: engagement rings, wedding bands, repairs and online orders from Dallas and across the US.`,
  path: "/reviews",
  eyebrow: `${site.rating.value} ★ · ${site.rating.count} reviews`,
});

export default function ReviewsPage() {
  const total = ratingBreakdown.reduce((s, [, n]) => s + n, 0);
  return (
    <PageTransition>
      <PageHero
        eyebrow="Reviews"
        title="In their words."
        intro="Proposals, anniversaries, repairs and one very nervous best man. Every review below is from a real order (in this demo, written to show how it would look)."
        crumbs={[{ name: "Reviews", path: "/reviews" }]}
      >
        <div className="rise mt-10 flex flex-wrap items-center gap-8 rounded-2xl bg-bone p-6" style={{ ["--d" as string]: "0.4s" }}>
          <div>
            <p className="font-display text-7xl leading-none">{site.rating.value}</p>
            <Stars value={site.rating.value} size="md" className="mt-2" />
            <p className="mt-1 text-sm text-taupe">{site.rating.count} Google reviews</p>
          </div>
          <ul className="min-w-60 flex-1 space-y-1.5" aria-label="Rating breakdown">
            {ratingBreakdown.map(([s, n]) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className="w-12">{s} stars</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <span className="block h-full rounded-full bg-gold-ink" style={{ width: `${(n / total) * 100}%` }} />
                </span>
                <span className="w-10 text-right text-taupe">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </PageHero>
      <section className="wrap pb-24" aria-label="Customer reviews">
        <Reveal stagger={0.06} className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
          {storeReviews.map((r) => (
            <figure key={r.name} className="rounded-2xl border border-ink/10 bg-bone/40 p-6">
              <div className="flex items-center justify-between">
                <Stars value={r.rating} />
                <span className="spec text-taupe">{r.tag}</span>
              </div>
              <blockquote className="mt-4 leading-relaxed">“{r.text}”</blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-medium">{r.name}</span> <span className="text-taupe">· {r.area} · {r.when}</span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </section>
      <FinalCta />
    </PageTransition>
  );
}
