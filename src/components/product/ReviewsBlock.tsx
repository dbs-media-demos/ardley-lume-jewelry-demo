import type { Product } from "@/lib/commerce/types";
import { Stars } from "@/components/ui/Stars";

/** Product reviews with a rating breakdown (fictional, demo). */
export function ReviewsBlock({ product: p }: { product: Product }) {
  // A plausible distribution for the headline rating.
  const five = Math.round(p.reviewCount * Math.min(0.97, (p.rating - 4) * 0.95 + 0.05));
  const four = Math.max(0, Math.round((p.reviewCount - five) * 0.8));
  const rest = Math.max(0, p.reviewCount - five - four);
  const rows: [number, number][] = [
    [5, five],
    [4, four],
    [3, Math.ceil(rest / 2)],
    [2, Math.floor(rest / 2)],
    [1, 0],
  ];
  return (
    <section id="reviews" className="wrap scroll-mt-28 py-20" aria-labelledby="reviews-title">
      <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 id="reviews-title" className="font-display text-[clamp(2rem,4vw,3.4rem)]">
            Reviews
          </h2>
          <div className="mt-6 flex items-end gap-4">
            <p className="font-display text-7xl leading-none">{p.rating.toFixed(1)}</p>
            <div className="pb-2">
              <Stars value={p.rating} size="md" />
              <p className="mt-1 text-sm text-taupe">{p.reviewCount} verified reviews</p>
            </div>
          </div>
          <ul className="mt-6 space-y-1.5" aria-label="Rating breakdown">
            {rows.map(([s, n]) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className="w-12">{s} stars</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <span className="block h-full rounded-full bg-gold-ink" style={{ width: `${(n / p.reviewCount) * 100}%` }} />
                </span>
                <span className="w-8 text-right text-taupe">{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="space-y-6">
          {p.reviews.map((r) => (
            <li key={r.name + r.date} className="rounded-2xl border border-ink/10 bg-bone/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars value={r.rating} />
                <span className="text-xs text-taupe">{new Date(r.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
              <h3 className="mt-3 font-display text-2xl">{r.title}</h3>
              <p className="mt-2 leading-relaxed text-ink/85">{r.body}</p>
              <p className="mt-4 text-sm">
                <span className="font-medium">{r.name}</span> <span className="text-taupe">· {r.city} · Verified buyer</span>
                {r.variant ? <span className="block text-xs text-taupe">{r.variant}</span> : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
