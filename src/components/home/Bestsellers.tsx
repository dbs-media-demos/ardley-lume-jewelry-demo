import Link from "next/link";
import type { CardData } from "@/lib/card-types";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";

/** Scene 7: the pieces Dallas keeps coming back for, ready to buy from right here. */
export function Bestsellers({ items }: { items: CardData[] }) {
  return (
    <section className="bg-ivory py-24 text-ink md:py-32" aria-labelledby="best-title">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-gold-ink">Bestsellers</p>
            <SplitReveal id="best-title" className="mt-4 max-w-2xl font-display text-[clamp(2.6rem,5vw,4.8rem)]">
              Worn every day, by half of Dallas.
            </SplitReveal>
          </div>
          <Link href="/collections/bestsellers" className="btn btn-ghost">
            Shop bestsellers
          </Link>
        </div>
        <Reveal wipe stagger={0.09} className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {items.map((c) => (
            <ProductCard key={c.slug} card={c} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
