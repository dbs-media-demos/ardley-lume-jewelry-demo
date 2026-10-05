import Link from "next/link";
import { getImageProps } from "next/image";
import { img } from "@/lib/images";
import { HeroMotion } from "./HeroMotion";
import { Magnetic } from "@/components/ui/Magnetic";

/** Scene 1: the light hero. Photo (LCP) + CSS-only intro; WebGL ring and scroll dive are layered on by HeroMotion. */
export function HomeHero() {
  const wide = img("hero-b");
  const tall = img("hero-portrait");
  const common = { alt: wide.alt, sizes: "100vw", quality: 75 };
  const {
    props: { srcSet: tallSet },
  } = getImageProps({ ...common, src: tall.src, width: tall.w, height: tall.h, quality: 60 });
  const { props: wideProps } = getImageProps({ ...common, src: wide.src, width: wide.w, height: wide.h });

  return (
    <section id="hero" data-hero-dark className="group/hero relative h-[100svh] min-h-[38rem] overflow-hidden bg-ink text-ivory">
      <div data-hero-photo className="absolute inset-0 origin-[62%_55%] transition-opacity duration-[2s] group-data-[ring=on]/hero:opacity-55">
        <picture className="zoom-settle absolute inset-0 block">
          <source media="(max-width: 767px)" srcSet={tallSet} sizes="100vw" />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...wideProps} fetchPriority="high" className="size-full object-cover object-[62%_50%]" />
        </picture>
      </div>
      <div aria-hidden className="absolute inset-0 z-[1] bg-[radial-gradient(120%_90%_at_15%_85%,rgb(14_19_17/0.88),transparent_60%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-ink/70 to-transparent" />

      <HeroMotion />

      <div data-hero-copy className="wrap relative z-[3] flex h-full flex-col justify-end pb-24 md:pb-20">
        <p className="eyebrow rise text-gold-pale" style={{ ["--d" as string]: "0.1s" }}>
          Fine jewelry · Knox-Henderson, Dallas
        </p>
        <h1 className="mt-5 font-display text-[clamp(3.4rem,10.5vw,10rem)] leading-[0.88] tracking-[-0.03em]">
          <span className="rise-mask">
            <span style={{ ["--d" as string]: "0.15s" }}>Made in</span>
          </span>
          <span className="rise-mask">
            <span style={{ ["--d" as string]: "0.3s" }}>
              the <em className="text-gold not-italic">light.</em>
            </span>
          </span>
        </h1>
        <div className="rise mt-7 flex flex-col gap-7 md:flex-row md:items-end md:justify-between" style={{ ["--d" as string]: "0.45s" }}>
          <p className="max-w-md text-[1.02rem] leading-relaxed text-ivory/85">
            Engagement rings, wedding bands and everyday gold, cast and set at our own bench in Dallas. Recycled gold, lab-grown or natural stones, shipped insured nationwide.
          </p>
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <Link href="/shop" className="btn btn-gold">
                Shop the collection
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/engagement/build" className="btn btn-ghost-light">
                Design your ring
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>

      <div data-hero-cue aria-hidden className="absolute bottom-6 left-1/2 z-[3] hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/70 md:flex">
        <span className="eyebrow">Scroll into the stone</span>
        <span className="block h-10 w-px origin-top bg-gradient-to-b from-gold to-transparent [animation:cue_2.4s_var(--ease-in-out-soft)_infinite]" />
      </div>

      <div data-hero-flash aria-hidden className="pointer-events-none absolute inset-0 z-[4] bg-[radial-gradient(circle_at_62%_45%,#fff8e6,#e8d6a8_35%,transparent_75%)] opacity-0" />
      <div data-hero-night aria-hidden className="pointer-events-none absolute inset-0 z-[5] bg-ink opacity-0" />
    </section>
  );
}
