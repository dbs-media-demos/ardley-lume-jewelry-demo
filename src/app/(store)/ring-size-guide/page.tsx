import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { SizerForm, PrintButton } from "@/components/forms/SizerForm";
import { FaqList } from "@/components/ui/FaqList";
import { faqs } from "@/content/faqs";

export const metadata: Metadata = buildMetadata({
  title: "Ring size guide & free ring sizer",
  description: "US ring size chart with diameters and circumferences, a printable sizer, and a free ring sizer by mail. Plus free resizing for 60 days.",
  path: "/ring-size-guide",
  eyebrow: "Ring size guide",
});

const sizes = Array.from({ length: 21 }, (_, i) => 3 + i * 0.5);
const diameter = (s: number) => 11.63 + 0.8128 * s;

export default function SizeGuidePage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="Ring size guide"
        title="Find the size, then forget it."
        intro="Three ways to get it right, and a safety net: resizing is free for 60 days on everything we make."
        crumbs={[{ name: "Ring size guide", path: "/ring-size-guide" }]}
      />

      <section className="wrap grid gap-12 pb-20 lg:grid-cols-3" aria-label="Three ways to measure">
        {[
          ["01", "Measure a ring you own", "Lay a ring that fits the right finger over the circles below (or measure its inside diameter) and match it to the chart."],
          ["02", "Print the sizer", "Print at 100% scale (no 'fit to page'). Check the 50 mm ruler with a real ruler, then compare."],
          ["03", "Get a free sizer", "A reusable plastic sizer by mail in 2–4 days, in a plain envelope so it won't spoil a surprise."],
        ].map(([n, t, d]) => (
          <div key={n} className="rounded-2xl border border-ink/10 p-6">
            <p className="font-display text-5xl text-gold-ink">{n}</p>
            <h2 className="mt-3 font-display text-3xl">{t}</h2>
            <p className="mt-2 text-taupe">{d}</p>
          </div>
        ))}
      </section>

      <section className="bg-bone py-20" aria-labelledby="chart-title">
        <div className="wrap grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 id="chart-title" className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">
              Size chart (US)
            </h2>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-ink/10 bg-ivory">
              <table className="w-full text-sm">
                <caption className="sr-only">US ring sizes with inside diameter and circumference in millimetres</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left">
                    <th scope="col" className="spec px-4 py-3 font-normal text-taupe">US size</th>
                    <th scope="col" className="spec px-4 py-3 font-normal text-taupe">Diameter</th>
                    <th scope="col" className="spec px-4 py-3 font-normal text-taupe">Circumference</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s) => (
                    <tr key={s} className="border-b border-ink/5 last:border-0">
                      <th scope="row" className="px-4 py-2 text-left font-medium">
                        {s}
                      </th>
                      <td className="px-4 py-2">{diameter(s).toFixed(1)} mm</td>
                      <td className="px-4 py-2">{(Math.PI * diameter(s)).toFixed(1)} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">Printable sizer</h2>
            <p className="mt-3 text-taupe">Print at 100%. The ruler must measure exactly 50 mm.</p>
            <div className="mt-6 rounded-2xl bg-ivory p-6">
              <div className="flex flex-wrap items-end gap-5">
                {[4, 5, 6, 7, 8, 9].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <span className="rounded-full border-2 border-ink" style={{ width: `${diameter(s)}mm`, height: `${diameter(s)}mm` }} aria-hidden />
                    <span className="spec">{s}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6" aria-hidden>
                <div className="relative h-6 border-b-2 border-ink" style={{ width: "50mm" }}>
                  {Array.from({ length: 11 }, (_, i) => (
                    <span key={i} className="absolute bottom-0 w-px bg-ink" style={{ left: `${i * 5}mm`, height: i % 2 === 0 ? "14px" : "8px" }} />
                  ))}
                </div>
                <p className="spec mt-1">50 mm</p>
              </div>
              <div className="mt-6">
                <PrintButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sizer" className="wrap grid scroll-mt-28 gap-12 py-20 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="sizer-title">
        <div>
          <p className="eyebrow text-gold-ink">Free, by mail</p>
          <h2 id="sizer-title" className="mt-3 font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">
            Not sure? We&apos;ll send a free sizer.
          </h2>
          <p className="mt-4 text-taupe">Measure at the end of the day, when fingers are largest. Between two sizes? Choose the larger.</p>
        </div>
        <SizerForm />
      </section>

      <section className="wrap grid gap-10 pb-24 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="size-faq">
        <h2 id="size-faq" className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)]">
          Sizing questions
        </h2>
        <FaqList items={faqs.filter((f) => f.topic === "Returns & sizing")} />
      </section>
    </PageTransition>
  );
}
