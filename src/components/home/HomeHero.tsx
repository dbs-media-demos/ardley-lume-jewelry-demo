import Link from "next/link";
import { getImageProps } from "next/image";
import { img } from "@/lib/images";
import { site } from "@/content/site";
import { HeroMotion } from "./HeroMotion";
import { Magnetic } from "@/components/ui/Magnetic";

/** Phone/tablet and desktop stills of the 3D ring, rendered from the live scene by scripts/ring-stills.mjs. */
export const RING_STILL = { phone: "/images/3d/hero-ring-phone.webp", desktop: "/images/3d/hero-ring-desktop.webp" };

/**
 * Scene 1: the light hero. Photo (LCP) + the ring as a still in the server HTML;
 * on desktop HeroMotion fades the live WebGL ring in over the still and scrubs the
 * dive into the stone. The heading, text and buttons are painted at once, never animated in.
 */
export function HomeHero() {
  const wide = img("hero-b");
  const tall = img("hero-portrait");
  const common = { alt: wide.alt, sizes: "100vw", quality: 75 };
  const {
    props: { srcSet: tallSet },
  } = getImageProps({ ...common, src: tall.src, width: tall.w, height: tall.h, quality: 60 });
  const { props: wideProps } = getImageProps({ ...common, src: wide.src, width: wide.w, height: wide.h });

  return (
    // The spacer is rendered up front and handed to ScrollTrigger, so pinning never
    // re-parents the hero (re-inserting it would register a late LCP candidate).
    <div id="hero-spacer">
      <section id="hero" data-hero-dark className="group/hero relative h-[84svh] min-h-[37rem] overflow-hidden bg-ink text-ivory lg:h-[100svh]">
        <div data-hero-photo className="absolute inset-0 origin-[62%_55%] transition-opacity duration-[2s] lg:opacity-70 group-data-[ring=on]/hero:opacity-55">
          <picture className="zoom-settle absolute inset-0 block">
            <source media="(max-width: 767px)" srcSet={tallSet} sizes="100vw" />
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img {...wideProps} loading="eager" fetchPriority="high" className="size-full object-cover object-[62%_50%]" />
          </picture>
        </div>
        <div aria-hidden className="absolute inset-0 z-[1] bg-[radial-gradient(130%_80%_at_20%_100%,rgb(14_19_17/0.94),rgb(14_19_17/0.55)_55%,transparent_80%)] lg:bg-[radial-gradient(120%_90%_at_15%_85%,rgb(14_19_17/0.88),transparent_60%)]" />
        <div aria-hidden className="absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-ink/70 to-transparent" />

        <HeroMotion still={RING_STILL} />

        <div data-hero-copy className="wrap relative z-[3] flex h-full flex-col justify-end pb-6 md:pb-16 lg:pb-20">
          <h1>
            <span className="eyebrow block text-[0.64rem] tracking-[0.12em] text-gold-pale sm:text-[0.72rem] sm:tracking-[0.22em] md:text-[0.8rem]">Fine jewelry &amp; engagement rings · Dallas, TX</span>
            <span className="mt-2.5 block max-w-[11ch] font-display text-[clamp(2.9rem,8.2vw,8.4rem)] leading-[0.9] tracking-[-0.03em] md:mt-5">
              Made in the <em className="text-gold not-italic">light.</em>
            </span>
          </h1>
          <p className="mt-3 max-w-md text-[0.92rem] leading-normal text-ivory/85 md:mt-6 md:text-[1.02rem] md:leading-relaxed">
            Engagement rings, wedding bands and everyday gold, cast and set at our own bench in Knox-Henderson. Recycled gold, lab-grown or natural stones, shipped insured nationwide.
          </p>
          <a href="#reviews" className="mt-2 inline-flex min-h-9 items-center gap-2.5 self-start text-sm text-ivory/90 md:mt-5">
            <span aria-hidden className="tracking-[0.14em] text-gold">
              ★★★★★
            </span>
            <span>
              <strong className="font-semibold text-ivory">{site.rating.value}</strong> · {site.rating.count} Google reviews
            </span>
          </a>
          <div className="mt-2 grid grid-cols-[1.1fr_1fr] gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3 md:mt-6">
            <Magnetic className="contents sm:inline-block">
              <Link href="/shop" className="btn btn-gold w-full px-3 sm:w-auto sm:px-6">
                <span className="sm:hidden">Shop jewelry</span>
                <span className="max-sm:hidden">Shop the collection</span>
              </Link>
            </Magnetic>
            <a href={site.phoneHref} className="btn btn-ghost-light px-3 whitespace-nowrap sm:px-6" data-track="call">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
                <path d="M6.6 3h3l1.5 4.2-2 1.3a11 11 0 006.4 6.4l1.3-2L21 14.4v3A2.6 2.6 0 0118.4 20 15.4 15.4 0 014 5.6 2.6 2.6 0 016.6 3z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="sm:hidden">{site.phone.replace(/^\((\d+)\) /, "$1 ")}</span>
              <span className="max-sm:hidden">Call {site.phone}</span>
            </a>
            <Link href="/engagement/build" className="link col-span-2 inline-flex min-h-10 items-center justify-self-start text-[0.78rem] font-semibold tracking-[0.14em] text-gold-pale uppercase sm:ml-2">
              Design your ring →
            </Link>
          </div>
        </div>

        <div data-hero-cue aria-hidden className="absolute bottom-7 left-[69%] z-[3] hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/70 lg:flex">
          <span className="eyebrow">Scroll into the stone</span>
          <span className="block h-10 w-px origin-top bg-gradient-to-b from-gold to-transparent [animation:cue_2.4s_var(--ease-in-out-soft)_infinite]" />
        </div>

        <div data-hero-flash aria-hidden className="pointer-events-none absolute inset-0 z-[4] bg-[radial-gradient(circle_at_68%_45%,#fff8e6,#e8d6a8_35%,transparent_75%)] opacity-0" />
        <div data-hero-night aria-hidden className="pointer-events-none absolute inset-0 z-[5] bg-ink opacity-0" />
      </section>
    </div>
  );
}
