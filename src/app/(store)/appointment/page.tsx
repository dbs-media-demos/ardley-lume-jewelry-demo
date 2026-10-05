import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { AppointmentPicker } from "@/components/forms/AppointmentPicker";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { AreaMap } from "@/components/ui/AreaMap";
import { site, fullAddress } from "@/content/site";
import { hoursRows } from "@/lib/hours";

export const metadata: Metadata = buildMetadata({
  title: "Book a showroom visit",
  description: "Book an engagement consultation, wedding band fitting, bespoke session or repair at our Knox-Henderson showroom, or a video call from anywhere.",
  path: "/appointment",
  eyebrow: "Appointments",
});

export default function AppointmentPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="Appointments"
        title="Book an hour with a jeweler."
        intro="Loupes on the table, stones side by side, no pressure. In our Knox-Henderson showroom, or on a video call from anywhere."
        crumbs={[{ name: "Book a visit", path: "/appointment" }]}
      />
      <div className="wrap grid gap-14 pb-24 lg:grid-cols-[1.6fr_1fr]">
        <AppointmentPicker />
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-bone p-6">
            <p className="eyebrow text-gold-ink">The showroom</p>
            <p className="mt-3">{fullAddress}</p>
            <OpenBadge className="mt-3" />
            <ul className="mt-3 space-y-0.5 text-sm text-taupe">
              {hoursRows().map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day}</span>
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              Parking behind the building · <a href={site.phoneHref} className="link-under">{site.phone}</a>
            </p>
          </div>
          <AreaMap onDark={false} />
        </aside>
      </div>
    </PageTransition>
  );
}
