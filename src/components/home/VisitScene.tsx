import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { areasFor, telOf, type Biz } from "@/lib/biz-core";
import { defaultBiz } from "@/lib/biz";
import { img } from "@/lib/images";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { Magnetic } from "@/components/ui/Magnetic";
import { Parallax, SplitReveal } from "@/components/ui/Reveal";
import { AreaMap } from "@/components/ui/AreaMap";
import { hoursRows } from "@/lib/hours";

/** Scene 11: the showroom. Oxblood room, parallax interior, live hours, map, and the booking CTA. */
export function VisitScene({ biz = defaultBiz }: { biz?: Biz }) {
  const room = img("showroom");
  const tel = telOf(biz);
  const rows = hoursRows(biz);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.preview ? `${biz.name}, ${biz.address.full || biz.area}` : "Knox-Henderson, Dallas, TX")}`;
  return (
    <section data-dark className="relative overflow-hidden bg-oxblood py-16 text-ivory md:py-32" aria-labelledby="visit-title">
      <div className="wrap grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14">
        <Parallax className="aspect-[3/2] rounded-[1.6rem] md:aspect-[5/4] lg:aspect-[4/5]" amount={14}>
          <div className="absolute inset-0">
            <Image src={room.src} alt={room.alt} fill sizes="(min-width:1024px) 46vw, 92vw" quality={75} className="object-cover" placeholder="blur" blurDataURL={room.blur} />
          </div>
        </Parallax>
        <div>
          <p className="eyebrow text-gold-pale">The showroom · {biz.preview ? biz.area : site.address.neighborhood}</p>
          <SplitReveal id="visit-title" className="mt-4 font-display text-[clamp(2.6rem,5vw,4.8rem)]">
            Come and see it in the light.
          </SplitReveal>
          <p className="mt-5 max-w-md text-ivory/85">
            {biz.preview ? "A quiet room" : "A quiet room off Henderson Avenue"} with north light, loupes on every table and the bench right behind the glass. Walk in, or book an hour with a jeweler to yourselves.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="spec text-gold-pale">Address</p>
              <p className="mt-2">{biz.address.full || biz.area}</p>
              <a href={maps} target="_blank" rel="noopener" className="link mt-1 inline-flex min-h-9 items-center text-sm text-gold-pale" data-track="directions">
                Get directions ↗
              </a>
            </div>
            {(rows.length > 0 || biz.hoursSummary) && (
            <div>
              <p className="spec text-gold-pale">Hours</p>
              <OpenBadge onDark className="mt-2" />
              <ul className="mt-2 space-y-0.5 text-sm text-ivory/80">
                {rows.length === 0 && <li>{biz.hoursSummary}</li>}
                {rows.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day.slice(0, 3)}</span>
                    <span>{h.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Link href="/appointment" className="btn btn-gold">
                Book a showroom visit
              </Link>
            </Magnetic>
            {tel && (
              <a href={tel} className="btn btn-ghost-light">
                Call {biz.phoneDisplay}
              </a>
            )}
          </div>
          {/* The sketch map (a preview: their towns, which phones get in the footer) is a desktop extra; phones have the address and directions link right above. */}
          {biz.preview ? (
            <div className="mt-10 max-lg:hidden">
              <p className="spec text-gold-pale">Clients from</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {areasFor(biz).map((a) => (
                  <li key={a} className="rounded-full border border-ivory/20 px-3.5 py-1.5 text-ivory/85">
                    {a}
                  </li>
                ))}
                <li className="rounded-full border border-gold/40 px-3.5 py-1.5 text-gold-pale">Insured shipping nationwide</li>
              </ul>
            </div>
          ) : (
            <AreaMap className="mt-10 max-w-lg max-lg:hidden" />
          )}
        </div>
      </div>
    </section>
  );
}
