import { Marquee } from "@/components/ui/Marquee";

const offers = [
  "Free insured shipping over $250",
  "On sale now: up to 20% off studio samples",
  "Free resizing for 60 days",
  "30-day returns, no questions",
  "Gift box & handwritten note, always free",
  "Use WELCOME10 for 10% off your first order",
];

/** Slim marquee of offers at the top of shop pages. */
export function OfferMarquee({ dark }: { dark?: boolean }) {
  return (
    <div className={dark ? "bg-forest text-gold-pale" : "bg-ink text-gold-pale"}>
      <Marquee speed={45} className="py-2.5">
        {offers.map((o) => (
          <span key={o} className="spec flex items-center gap-6 px-3 whitespace-nowrap uppercase">
            {o}
            <span aria-hidden className="text-gold">✦</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
