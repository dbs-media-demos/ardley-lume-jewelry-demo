import Link from "next/link";
import Image from "next/image";
import { site, fullAddress } from "@/content/site";
import { img } from "@/lib/images";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { Magnetic } from "@/components/ui/Magnetic";
import { Parallax, SplitReveal } from "@/components/ui/Reveal";
import { AreaMap } from "@/components/ui/AreaMap";
import { hoursRows } from "@/lib/hours";

/** Scene 11: the showroom. Oxblood room, parallax interior, live hours, map, and the booking CTA. */
export function VisitScene() {
  const room = img("showroom");
  return (
    <section data-dark className="relative overflow-hidden bg-oxblood py-24 text-ivory md:py-32" aria-labelledby="visit-title">
      <div className="wrap grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <Parallax className="aspect-[4/5] rounded-[1.6rem] md:aspect-[5/4] lg:aspect-[4/5]" amount={14}>
          <div className="absolute inset-0">
            <Image src={room.src} alt={room.alt} fill sizes="(min-width:1024px) 46vw, 92vw" quality={75} className="object-cover" placeholder="blur" blurDataURL={room.blur} />
          </div>
        </Parallax>
        <div>
          <p className="eyebrow text-gold-pale">The showroom · {site.address.neighborhood}</p>
          <SplitReveal id="visit-title" className="mt-4 font-display text-[clamp(2.6rem,5vw,4.8rem)]">
            Come and see it in the light.
          </SplitReveal>
          <p className="mt-5 max-w-md text-ivory/85">
            A quiet room off Henderson Avenue with north light, loupes on every table and the bench right behind the glass. Walk in, or book an hour with a jeweler to yourselves.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="spec text-gold-pale">Address</p>
              <p className="mt-2">{fullAddress}</p>
              <a href="https://www.google.com/maps/search/?api=1&query=Knox-Henderson%2C+Dallas%2C+TX" target="_blank" rel="noopener" className="link mt-1 inline-flex min-h-9 items-center text-sm text-gold-pale" data-track="directions">
                Get directions ↗
              </a>
            </div>
            <div>
              <p className="spec text-gold-pale">Hours</p>
              <OpenBadge onDark className="mt-2" />
              <ul className="mt-2 space-y-0.5 text-sm text-ivory/80">
                {hoursRows().map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day.slice(0, 3)}</span>
                    <span>{h.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Link href="/appointment" className="btn btn-gold">
                Book a showroom visit
              </Link>
            </Magnetic>
            <a href={site.phoneHref} className="btn btn-ghost-light">
              Call {site.phone}
            </a>
          </div>
          <AreaMap className="mt-10 max-w-lg" />
        </div>
      </div>
    </section>
  );
}
