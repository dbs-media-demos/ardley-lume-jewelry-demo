import Link from "next/link";
import { storeReviews, ratingBreakdown } from "@/content/reviews";
import { site } from "@/content/site";
import { Marquee } from "@/components/ui/Marquee";
import { Stars } from "@/components/ui/Stars";
import { SplitReveal } from "@/components/ui/Reveal";

function Card({ r }: { r: (typeof storeReviews)[number] }) {
  return (
    <figure className="mx-2.5 w-[19rem] shrink-0 rounded-2xl border border-ink/10 bg-ivory p-6 md:w-[23rem]">
      <div className="flex items-center justify-between">
        <Stars value={r.rating} />
        <span className="spec text-taupe">{r.tag}</span>
      </div>
      <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-ink/90">“{r.text}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 text-sm">
        <span className="grid size-9 place-items-center rounded-full bg-forest font-display text-ivory" aria-hidden>
          {r.name[0]}
        </span>
        <span>
          <span className="font-medium">{r.name}</span>
          <span className="block text-xs text-taupe">
            {r.area} · {r.when}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Scene 10: Google-style rating + two rows of reviews drifting in opposite directions. */
export function ReviewsMarquee() {
  const total = ratingBreakdown.reduce((s, [, n]) => s + n, 0);
  const half = Math.ceil(storeReviews.length / 2);
  return (
    <section className="overflow-hidden bg-bone py-24 text-ink md:py-32" aria-labelledby="reviews-title">
      <div className="wrap grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <p className="eyebrow text-gold-ink">Reviews</p>
          <SplitReveal id="reviews-title" className="mt-4 font-display text-[clamp(2.6rem,5vw,4.8rem)]">
            Three hundred proposals, give or take.
          </SplitReveal>
        </div>
        <div className="flex items-center gap-6 rounded-2xl bg-ivory p-6">
          <div>
            <p className="font-display text-6xl leading-none">{site.rating.value}</p>
            <Stars value={site.rating.value} className="mt-2" />
            <p className="mt-1 text-xs text-taupe">{site.rating.count} Google reviews</p>
          </div>
          <ul className="flex-1 space-y-1" aria-label="Rating breakdown">
            {ratingBreakdown.map(([stars, n]) => (
              <li key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-3">{stars}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <span className="block h-full rounded-full bg-gold-ink" style={{ width: `${(n / total) * 100}%` }} />
                </span>
                <span className="w-8 text-right text-taupe">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-14 space-y-5">
        <Marquee speed={70}>
          {storeReviews.slice(0, half).map((r) => (
            <Card key={r.name} r={r} />
          ))}
        </Marquee>
        <Marquee speed={80} reverse>
          {storeReviews.slice(half).map((r) => (
            <Card key={r.name} r={r} />
          ))}
        </Marquee>
      </div>
      <div className="wrap mt-10">
        <Link href="/reviews" className="btn btn-ghost">
          Read all reviews
        </Link>
      </div>
    </section>
  );
}
