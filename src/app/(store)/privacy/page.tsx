import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = buildMetadata({ title: "Privacy policy", description: `How ${site.name} collects, uses and protects your information.`, path: "/privacy" });

export default function PrivacyPage() {
  return (
    <PageTransition>
      <PageHero eyebrow="Last updated October 2026" title="Privacy policy" crumbs={[{ name: "Privacy", path: "/privacy" }]} />
      <div className="wrap pb-24">
        <Prose
          sections={[
            {
              h: "This is a concept site",
              body: (
                <p>
                  {site.name} is a fictional business on a demo store built by Scale by Noon. No orders are processed, no payments are taken, and the forms on this site don&apos;t send anything anywhere. Your bag, wishlist and recently viewed pieces are stored only in your own browser.
                </p>
              ),
            },
            {
              h: "What we would collect",
              body: (
                <>
                  <p>In a live store we would collect the information you give us to fulfil an order or answer a question: your name, email, phone, shipping address and order details. Card payments would be handled by our payment processor; card numbers never touch our servers.</p>
                  <ul>
                    <li>Order and contact information, to deliver and support your purchase</li>
                    <li>Appointment details, to prepare for your visit</li>
                    <li>Anonymous analytics, to understand which pages help people most</li>
                  </ul>
                </>
              ),
            },
            {
              h: "What we never do",
              body: <p>We don&apos;t sell or rent your information, and we don&apos;t share it with anyone except the couriers and processors needed to complete your order.</p>,
            },
            {
              h: "Your choices",
              body: (
                <p>
                  You can ask us to show, correct or delete your information at any time by emailing {site.email}. You can unsubscribe from emails with one click in any message.
                </p>
              ),
            },
          ]}
        />
      </div>
    </PageTransition>
  );
}
