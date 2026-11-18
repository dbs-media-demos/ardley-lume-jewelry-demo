import type { ReactNode } from "react";
import { Header, type MenuData } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { categories, collections } from "@/content/catalog";
import { img } from "@/lib/images";
import { JsonLd } from "@/components/ui/JsonLd";
import { storeSchema, websiteSchema } from "@/lib/schema";
import type { Biz } from "@/lib/biz-core";

const pick = (key: string) => {
  const i = img(key);
  return { src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt };
};

/** Header, page, footer and the phone bar: the store pages and a personalised preview share it. */
export function StoreChrome({ children, biz }: { children: ReactNode; biz?: Biz }) {
  const menu: MenuData = {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, img: pick(c.image) })),
    collections: collections.map((c) => ({ slug: c.slug, name: c.name })),
    feature: pick("proposal"),
  };
  return (
    <>
      <Header menu={menu} />
      <main id="main">{children}</main>
      <Footer biz={biz} />
      <MobileBar />
      {/* The concept store's structured data; a preview is never indexed. */}
      {!biz?.preview && <JsonLd data={[storeSchema(), websiteSchema()]} />}
    </>
  );
}
