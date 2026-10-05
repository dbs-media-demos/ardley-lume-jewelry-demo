import Link from "next/link";
import type { CardData } from "@/lib/card-types";
import { Coverflow } from "@/components/shop/Coverflow";
import { SplitReveal } from "@/components/ui/Reveal";

/** Scene 9: The Gift Edit as a 3D coverflow you can fling. */
export function GiftEdit({ items }: { items: CardData[] }) {
  return (
    <section data-dark className="relative overflow-hidden bg-forest py-24 text-ivory md:py-32" aria-labelledby="gift-title">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-[60%] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,rgb(201_165_92/0.16),transparent)]" />
      <div className="wrap relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-gold-pale">The Gift Edit · under $500</p>
          <SplitReveal id="gift-title" className="mt-4 max-w-2xl font-display text-[clamp(2.6rem,5vw,4.8rem)]">
            Small boxes, long memories.
          </SplitReveal>
          <p className="mt-4 max-w-md text-ivory/85">Gift-boxed with a handwritten note at no charge. Guessed the size? Resizing is free for 60 days.</p>
        </div>
        <Link href="/collections/gift-edit" className="btn btn-ghost-light">
          Shop the Gift Edit
        </Link>
      </div>
      <div className="relative mt-10">
        <Coverflow items={items} label="The Gift Edit" />
      </div>
    </section>
  );
}
