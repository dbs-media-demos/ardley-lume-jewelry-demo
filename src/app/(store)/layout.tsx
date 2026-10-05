import { Header, type MenuData } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { categories, collections } from "@/content/catalog";
import { img } from "@/lib/images";
import { JsonLd } from "@/components/ui/JsonLd";
import { storeSchema, websiteSchema } from "@/lib/schema";

const pick = (key: string) => {
  const i = img(key);
  return { src: i.src, blur: i.blur, w: i.w, h: i.h, alt: i.alt };
};

export default function StoreLayout({ children }: LayoutProps<"/">) {
  const menu: MenuData = {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, img: pick(c.image) })),
    collections: collections.map((c) => ({ slug: c.slug, name: c.name })),
    feature: pick("proposal"),
  };
  return (
    <>
      <Header menu={menu} />
      <main id="main">{children}</main>
      <Footer />
      <MobileBar />
      <JsonLd data={[storeSchema(), websiteSchema()]} />
    </>
  );
}
