import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { shippingMethods, formatPrice } from "@/lib/commerce/pricing";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { Prose } from "@/components/ui/Prose";
import { FaqList } from "@/components/ui/FaqList";
import { faqs } from "@/content/faqs";

export const metadata: Metadata = buildMetadata({
  title: "Shipping & returns",
  description: "Free insured shipping over $250, signature on delivery, 30-day free returns and free resizing within 60 days. Showroom pickup in Dallas.",
  path: "/shipping-returns",
  eyebrow: "Shipping & returns",
});

export default function ShippingPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="Shipping & returns"
        title="Insured to the door. Easy to return."
        intro={`Free insured shipping over $${site.freeShippingOver}, ${site.returnDays}-day returns, and free resizing for ${site.resizeDays} days.`}
        crumbs={[{ name: "Shipping & returns", path: "/shipping-returns" }]}
      />
      <div className="wrap grid gap-16 pb-24 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-ink/10">
            <table className="w-full text-sm">
              <caption className="bg-bone px-5 py-3 text-left font-display text-xl">Delivery options</caption>
              <thead>
                <tr className="border-b border-ink/10 text-left">
                  <th scope="col" className="spec px-5 py-2 font-normal text-taupe">Method</th>
                  <th scope="col" className="spec px-5 py-2 font-normal text-taupe">Time</th>
                  <th scope="col" className="spec px-5 py-2 font-normal text-taupe">Price</th>
                </tr>
              </thead>
              <tbody>
                {shippingMethods.map((m) => (
                  <tr key={m.id} className="border-b border-ink/5 last:border-0">
                    <th scope="row" className="px-5 py-3 text-left font-medium">
                      {m.name}
                    </th>
                    <td className="px-5 py-3">{m.days[0] === m.days[1] ? `${m.days[0]} day${m.days[0] > 1 ? "s" : ""}` : `${m.days[0]}–${m.days[1]} days`}</td>
                    <td className="px-5 py-3">
                      {m.id === "standard" ? `${formatPrice(m.price)} · free over $${site.freeShippingOver}` : m.price ? formatPrice(m.price) : "Free"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Prose
          sections={[
            {
              h: "Shipping",
              body: (
                <>
                  <p>Every order ships fully insured for its value, by courier, with a signature required on delivery. In-stock pieces leave our bench in 1–2 business days.</p>
                  <p>Engagement rings, diamond bands and builder rings are made to order in about two to three weeks (bespoke four to six). We send progress photos and a tracking link the moment it ships.</p>
                  <p>We ship to all 50 states. Orders ship in a plain outer box, so nobody guesses what&apos;s inside.</p>
                </>
              ),
            },
            {
              h: "Returns",
              body: (
                <>
                  <p>Return any unworn piece within {site.returnDays} days of delivery for a full refund to your original payment method. Return shipping is free and insured: start a return by email or phone and we&apos;ll send a prepaid label.</p>
                  <p>Engraved, bespoke and builder pieces are made just for you, so we resize, adjust or remake them rather than refund. Gift cards are non-refundable.</p>
                </>
              ),
            },
            {
              h: "Resizing & exchanges",
              body: (
                <>
                  <p>Resizing is free within {site.resizeDays} days of delivery, usually up or down two sizes. Eternity bands are remade to size instead. Exchanges for a different piece are welcome within 30 days.</p>
                  <p>
                    Not sure of the size? Use our <Link href="/ring-size-guide">ring size guide</Link> or order a free sizer.
                  </p>
                </>
              ),
            },
          ]}
        />
      </div>
      <section className="wrap grid gap-10 pb-24 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="ship-faq">
        <h2 id="ship-faq" className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">
          Shipping questions
        </h2>
        <FaqList items={faqs.filter((f) => f.topic === "Orders & shipping" || f.topic === "Returns & sizing")} />
      </section>
    </PageTransition>
  );
}
