import Link from "next/link";
import Image from "next/image";
import { img } from "@/lib/images";
import { site } from "@/content/site";
import { Magnetic } from "./Magnetic";
import { SplitReveal } from "./Reveal";

/** Closing call to action used on most inner pages. */
export function FinalCta({ title = "See it in the light, in person.", image = "showroom-2" }: { title?: string; image?: string }) {
  const im = img(image);
  return (
    <section data-dark className="relative overflow-hidden bg-ink py-28 text-ivory md:py-36" aria-labelledby="cta-title">
      <Image src={im.src} alt="" fill sizes="100vw" quality={60} className="object-cover opacity-35" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,transparent,rgb(14_19_17/0.85))]" />
      <div className="wrap relative text-center">
        <p className="eyebrow text-gold-pale">Knox-Henderson · Dallas</p>
        <SplitReveal id="cta-title" className="mx-auto mt-4 max-w-3xl font-display text-[clamp(2.6rem,6vw,5.4rem)]">
          {title}
        </SplitReveal>
        <p className="mx-auto mt-5 max-w-md text-ivory/85">An hour with a jeweler, loupes on the table, no pressure. Or call and we&apos;ll talk it through.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <Link href="/appointment" className="btn btn-gold">
              Book a showroom visit
            </Link>
          </Magnetic>
          <a href={site.phoneHref} className="btn btn-ghost-light">
            Call {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
