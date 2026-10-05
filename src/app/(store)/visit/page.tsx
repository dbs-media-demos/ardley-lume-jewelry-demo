import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { img } from "@/lib/images";
import { site, fullAddress } from "@/content/site";
import { hoursRows } from "@/lib/hours";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHero } from "@/components/ui/PageHero";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { AreaMap } from "@/components/ui/AreaMap";
import { ContactForm } from "@/components/forms/ContactForm";
import { Parallax } from "@/components/ui/Reveal";

export const metadata: Metadata = buildMetadata({
  title: "Visit & contact: Knox-Henderson showroom",
  description: `Visit our fine-jewelry showroom at ${fullAddress}. Open Tue–Sun; walk in or book an appointment. Call ${site.phone}.`,
  path: "/visit",
  eyebrow: "Visit & contact",
  image: "/images/scenes/showroom.jpg",
});

export default function VisitPage() {
  const room = img("showroom-2");
  return (
    <PageTransition>
      <PageHero
        eyebrow="Visit & contact"
        title="Come and see it in the light."
        intro="A calm room off Henderson Avenue with north light, loupes on every table and the bench behind the glass."
        crumbs={[{ name: "Visit & contact", path: "/visit" }]}
        image="showroom"
      />
      <section className="wrap grid gap-12 py-20 lg:grid-cols-3" aria-label="Showroom details">
        <div>
          <p className="eyebrow text-gold-ink">Address</p>
          <p className="mt-3 text-lg">{fullAddress}</p>
          <p className="text-taupe">{site.address.neighborhood} · parking behind the building</p>
          <a href="https://www.google.com/maps/search/?api=1&query=Knox-Henderson%2C+Dallas%2C+TX" target="_blank" rel="noopener" className="btn btn-ghost mt-5" data-track="directions">
            Get directions ↗
          </a>
        </div>
        <div>
          <p className="eyebrow text-gold-ink">Hours</p>
          <OpenBadge className="mt-3" />
          <ul className="mt-3 space-y-1 text-sm">
            {hoursRows().map((h) => (
              <li key={h.day} className="flex justify-between gap-4 border-b border-ink/5 pb-1">
                <span>{h.day}</span>
                <span className="text-taupe">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold-ink">Talk to us</p>
          <a href={site.phoneHref} className="mt-3 block font-display text-3xl">
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="link mt-1 block w-fit text-taupe">
            {site.email}
          </a>
          <Link href="/appointment" className="btn btn-ink mt-5">
            Book an appointment
          </Link>
        </div>
      </section>
      <section className="wrap grid gap-12 pb-24 lg:grid-cols-2" aria-labelledby="contact-title">
        <div className="space-y-6">
          <AreaMap onDark={false} />
          <Parallax className="aspect-[16/10] rounded-2xl" amount={10}>
            <div className="absolute inset-0">
              <Image src={room.src} alt={room.alt} fill sizes="(min-width:1024px) 45vw, 92vw" quality={70} className="object-cover" />
            </div>
          </Parallax>
        </div>
        <div>
          <h2 id="contact-title" className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)]">
            Send us a note
          </h2>
          <p className="mt-2 text-taupe">We answer every message within one business day, usually much sooner.</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
