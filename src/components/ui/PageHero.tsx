import Image from "next/image";
import type { ReactNode } from "react";
import clsx from "clsx";
import { img } from "@/lib/images";
import { Breadcrumbs } from "./Breadcrumbs";
import { LetterTitle } from "./LetterTitle";

type Props = {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  crumbs: { name: string; path: string }[];
  /** Image key for a dark, full-bleed photo hero. Without it the hero is light and typographic. */
  image?: string;
  position?: string;
  children?: ReactNode;
};

/**
 * Inner-page hero. CSS-only intro (transform-only, so LCP isn't delayed): the
 * title assembles letter by letter and the photo settles from a slight zoom.
 */
export function PageHero({ eyebrow, title, intro, crumbs, image, position = "50% 50%", children }: Props) {
  if (!image) {
    return (
      <section className="wrap pt-32 pb-12 md:pt-40 md:pb-16">
        <Breadcrumbs items={crumbs} />
        <p className="eyebrow rise mt-8 text-gold-ink">{eyebrow}</p>
        <LetterTitle text={title} className="mt-4 max-w-5xl text-[clamp(3rem,8vw,7.2rem)] leading-[0.92] tracking-[-0.03em]" />
        {intro ? (
          <div className="rise mt-6 max-w-2xl text-lg text-taupe" style={{ ["--d" as string]: "0.3s" }}>
            {intro}
          </div>
        ) : null}
        {children}
      </section>
    );
  }
  const im = img(image);
  return (
    <section data-hero-dark className="relative flex min-h-[86svh] items-end overflow-hidden bg-ink text-ivory">
      <div className="zoom-settle absolute inset-0">
        <Image src={im.src} alt={im.alt} fill preload sizes="100vw" quality={75} className="object-cover" style={{ objectPosition: position }} placeholder="blur" blurDataURL={im.blur} />
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
      <div className="wrap relative pt-32 pb-16 md:pb-20">
        <Breadcrumbs items={crumbs} onDark />
        <p className="eyebrow rise mt-8 text-gold-pale">{eyebrow}</p>
        <LetterTitle text={title} className={clsx("mt-4 max-w-5xl text-[clamp(3rem,8vw,7.2rem)] leading-[0.92] tracking-[-0.03em]")} />
        {intro ? (
          <div className="rise mt-6 max-w-2xl text-lg text-ivory/85" style={{ ["--d" as string]: "0.3s" }}>
            {intro}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
