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
import { fromPrice } from "@/lib/commerce/pricing";
import { workshopSteps } from "@/content/story";
import { PageTransition } from "@/components/layout/PageTransition";
import { Later } from "@/components/ui/Later";
import { defaultBiz, type Biz } from "@/lib/biz";

/** On a preview the bench is theirs: the concept store's jewelers aren't named. */
const generic = (t: string) => t.replace("Margot carves", "We carve").replace("Theo raises", "the setter raises").replace("his bench", "the bench");

const pick = (i: ReturnType<typeof img>) => ({ src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt });

/**
 * The homepage, shared by `/` (the 3D hero) and `/v2` (the same page without any 3D:
 * a lighter hero and the ring builder on its stills). One tree, one `hero` switch, so a
 * change to any section lands in both. A personalised preview (/for/<token>) passes its business.
 */
export async function HomePage({ hero, biz = defaultBiz }: { hero: "3d" | "v2"; biz?: Biz }) {
  const v2 = hero === "v2";
  const [products, categories, gifts] = await Promise.all([catalog.getProducts(), catalog.getCategories(), catalog.getCollection("gift-edit")]);
  const worlds: World[] = categories.map((c) => {
    const items = products.filter((p) => p.category === c.slug);
    return {
      slug: c.slug,
      name: c.name,
      blurb: biz.preview ? c.blurb.replace("in Dallas", `in ${biz.area}`).replace("Dallas keeps", `${biz.area} keeps`) : c.blurb,
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
      <HomeHero variant={hero} biz={biz} />
      <Later id="facets">
        <Facets contained={v2} />
      </Later>
      <Later id="worlds">
        <Worlds worlds={worlds} />
      </Later>
      <Later id="reviews">
        <ReviewsMarquee biz={biz} />
      </Later>
      <Later id="ring">
        <ThroughTheRing photo={pick(img("proposal"))} />
      </Later>
      <Later id="builder">
        <BuilderTeaser live3d={!v2} />
      </Later>
      <Later id="morph">
        <MetalMorph golds={golds} href="/product/lume-signet" />
      </Later>
      <Later id="best">
        <Bestsellers items={best} area={biz.area} />
      </Later>
      <Later id="workshop">
        <Workshop steps={workshopSteps.map((s) => ({ ...s, body: biz.preview ? generic(s.body) : s.body, img: pick(img(s.img)) }))} />
      </Later>
      <Later id="gifts">
        <GiftEdit items={(gifts?.products ?? []).map(toCard)} />
      </Later>
      <Later id="visit">
        <VisitScene biz={biz} />
      </Later>
    </PageTransition>
  );
}
