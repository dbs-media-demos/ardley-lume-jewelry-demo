import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { Facets } from "@/components/home/Facets";
import { Worlds, type World } from "@/components/home/Worlds";
import { ThroughTheRing } from "@/components/home/ThroughTheRing";
import { BuilderTeaser } from "@/components/home/BuilderTeaser";
import { MetalMorph } from "@/components/home/MetalMorph";
import { Bestsellers } from "@/components/home/Bestsellers";
import { Workshop } from "@/components/home/Workshop";
import { GiftEdit } from "@/components/home/GiftEdit";
import { ReviewsMarquee } from "@/components/home/ReviewsMarquee";
import { VisitScene } from "@/components/home/VisitScene";
import { catalog } from "@/lib/commerce";
import { img, productImg } from "@/lib/images";
import { toCard } from "@/lib/cards";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { fromPrice } from "@/lib/commerce/pricing";
import { workshopSteps } from "@/content/story";
import { PageTransition } from "@/components/layout/PageTransition";
import { Later } from "@/components/ui/Later";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} | Fine Jewelry & Engagement Rings, Dallas`,
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

const pick = (i: ReturnType<typeof img>) => ({ src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt });

export default async function HomePage() {
  const [products, categories, gifts] = await Promise.all([catalog.getProducts(), catalog.getCategories(), catalog.getCollection("gift-edit")]);
  const worlds: World[] = categories.map((c) => {
    const items = products.filter((p) => p.category === c.slug);
    return {
      slug: c.slug,
      name: c.name,
      blurb: c.blurb,
      count: items.length,
      img: pick(img(c.image)),
      from: Math.min(...items.map((p) => fromPrice(p).price)),
    };
  });
  const signet = products.find((p) => p.slug === "lume-signet")!;
  const golds = [
    { key: "y", name: "Yellow gold", note: "Warm and classic: 14k or 18k, the colour most people picture when they think of gold.", bg: "#efe8dc", img: pick(productImg(signet, "yellow")) },
    { key: "w", name: "White gold", note: "Cool and bright, rhodium-finished. The quiet choice next to diamonds.", bg: "#e4e6e7", img: pick(productImg(signet, "white")) },
    { key: "r", name: "Rose gold", note: "A blush of copper in the alloy. Flatters every skin tone, especially in candlelight.", bg: "#f0ddd4", img: pick(productImg(signet, "rose")) },
  ];
  const best = products.filter((p) => p.badges?.includes("bestseller")).slice(0, 4).map(toCard);

  return (
    <PageTransition>
      <HomeHero />
      <Later id="facets">
        <Facets />
      </Later>
      <Later id="worlds">
        <Worlds worlds={worlds} />
      </Later>
      <Later id="reviews">
        <ReviewsMarquee />
      </Later>
      <Later id="ring">
        <ThroughTheRing photo={pick(img("proposal"))} />
      </Later>
      <Later id="builder">
        <BuilderTeaser />
      </Later>
      <Later id="morph">
        <MetalMorph golds={golds} href="/product/lume-signet" />
      </Later>
      <Later id="best">
        <Bestsellers items={best} />
      </Later>
      <Later id="workshop">
        <Workshop steps={workshopSteps.map((s) => ({ ...s, img: pick(img(s.img)) }))} />
      </Later>
      <Later id="gifts">
        <GiftEdit items={(gifts?.products ?? []).map(toCard)} />
      </Later>
      <Later id="visit">
        <VisitScene />
      </Later>
    </PageTransition>
  );
}
