import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { categories, collections } from "@/content/catalog";
import { img } from "@/lib/images";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

const pick = (k: string) => {
  const i = img(k);
  return { src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt };
};

export default function NotFound() {
  return (
    <>
      <Header menu={{ categories: categories.map((c) => ({ slug: c.slug, name: c.name, img: pick(c.image) })), collections: collections.map((c) => ({ slug: c.slug, name: c.name })), feature: pick("proposal") }} />
      <main id="main" data-hero-dark className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-ink px-5 text-center text-ivory">
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="block size-[70vmin] rounded-full border-[3vmin] border-gold/15 [animation:spin-slow_40s_linear_infinite]" />
        </div>
        <div className="relative">
          <p className="eyebrow text-gold-pale">404 · lost in the light</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,9vw,8rem)] leading-[0.9]">This page slipped off the bench.</h1>
          <p className="mx-auto mt-6 max-w-md text-ivory/80">The link may be old, or the piece may have found its person. Try one of these instead.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="btn btn-gold">
              Shop the collection
            </Link>
            <Link href="/engagement" className="btn btn-ghost-light">
              Engagement rings
            </Link>
            <Link href="/" className="btn btn-ghost-light">
              Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
