import { Accordion } from "./Accordion";
import { JsonLd } from "./JsonLd";
import { faqSchema } from "@/lib/schema";
import type { Faq } from "@/content/faqs";

/** FAQ accordion + FAQPage JSON-LD. */
export function FaqList({ items, schema = true, defaultOpen = 0 }: { items: Pick<Faq, "q" | "a">[]; schema?: boolean; defaultOpen?: number | null }) {
  return (
    <>
      <Accordion items={items.map((f) => ({ title: f.q, body: <p>{f.a}</p> }))} defaultOpen={defaultOpen} />
      {schema && <JsonLd data={faqSchema(items)} />}
    </>
  );
}
