import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site, agency, agencyUrl } from "@/content/site";
import { LeadLogo } from "@/components/brand/LeadLogo";
import { areasFor, listOf, telOf, type Biz } from "@/lib/biz-core";
import { defaultBiz } from "@/lib/biz";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { Newsletter } from "@/components/forms/Newsletter";

const cols = [
  {
    title: "Shop",
    links: [
      ["Engagement rings", "/shop/engagement"],
      ["Wedding bands", "/shop/wedding-bands"],
      ["Rings", "/shop/rings"],
      ["Earrings", "/shop/earrings"],
      ["Necklaces", "/shop/necklaces"],
      ["Bracelets", "/shop/bracelets"],
      ["On sale now", "/collections/on-sale"],
      ["Gift cards", "/gift-cards"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Shipping & returns", "/shipping-returns"],
      ["Track an order", "/track"],
      ["Ring size guide", "/ring-size-guide"],
      ["Care & warranty", "/care"],
      ["Education", "/education"],
      ["FAQ", "/faq"],
    ],
  },
  {
    title: "Atelier",
    links: [
      ["Our story", "/about"],
      ["Ring builder", "/engagement/build"],
      ["Bespoke", "/bespoke"],
      ["Book a showroom visit", "/appointment"],
      ["Visit & contact", "/visit"],
      ["Reviews", "/reviews"],
    ],
  },
] as const;

/** The store's footer; a preview passes its business (their name, logo, towns, hours and number). */
export function Footer({ biz = defaultBiz }: { biz?: Biz }) {
  const tel = telOf(biz);
  const word = biz.preview ? biz.shortName : site.name;
  return (
    <footer data-dark data-cv="footer" style={{ ["--cv" as string]: "calc(1927px - 114vw)", ["--cv-s" as string]: "1537px", ["--cv-t" as string]: "1230px" }} className="relative overflow-hidden bg-ink pt-14 pb-36 text-ivory md:pt-20 md:pb-12">
      <div className="wrap">
        <div className="grid gap-10 border-b border-ivory/12 pb-10 md:gap-12 md:pb-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo onDark />
            <p className="mt-6 max-w-sm font-display text-3xl leading-tight text-ivory">Fine jewelry, made in the light, in {biz.area}.</p>
            <p className="mt-4 max-w-sm text-sm text-mist">
              Join the list for new pieces, bench notes and the occasional private sale. One email a month, never more.
            </p>
            <Newsletter />
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-10">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="eyebrow mb-4 text-mist">{c.title}</p>
                <ul className="space-y-1">
                  {c.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} prefetch={false} className="link inline-flex min-h-9 items-center text-[0.8rem] leading-tight text-ivory/90 hover:text-ivory sm:text-[0.95rem]">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="grid gap-8 py-10 text-sm text-mist md:grid-cols-3">
          <div>
            <p className="eyebrow mb-3">Showroom</p>
            <p className="text-ivory/90">{biz.address.full || biz.area}</p>
            <p>{biz.preview ? `Clients from ${listOf(biz, areasFor(biz))} · by appointment or walk-in` : `${site.address.neighborhood}, by appointment or walk-in`}</p>
          </div>
          {(biz.hours || biz.hoursSummary) && (
            <div>
              <p className="eyebrow mb-3">Hours</p>
              <OpenBadge onDark className="text-ivory/90" />
              {biz.hoursSummary && <p className="mt-1">{biz.hoursSummary}</p>}
            </div>
          )}
          <div>
            <p className="eyebrow mb-3">Talk to us</p>
            {tel && (
              <a href={tel} className="link flex min-h-9 w-fit items-center text-ivory/90">
                {biz.phoneDisplay}
              </a>
            )}
            {!biz.preview && (
              <a href={`mailto:${site.email}`} className="link flex min-h-9 w-fit items-center">
                {site.email}
              </a>
            )}
          </div>
        </div>

        {/* Decorative wordmark, drawn with CSS content so it isn't read or contrast-checked as text. */}
        {biz.logo ? (
          <div aria-hidden className="pointer-events-none pt-2 pb-8 text-ivory/[0.14] select-none">
            <LeadLogo svg={biz.logo.svg} className="h-[clamp(56px,10vw,150px)] max-w-full" />
          </div>
        ) : (
          <div
            aria-hidden
            data-word={word}
            style={{ fontSize: `${Math.min(18, 234 / Math.max(13, word.length)).toFixed(2)}vw` }}
            className="footer-wordmark pointer-events-none -mb-[0.18em] font-display leading-[0.8] tracking-[-0.03em] whitespace-nowrap text-ivory/[0.06] select-none"
          />
        )}

        <div className="flex flex-col gap-3 border-t border-ivory/12 pt-6 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p>
            {biz.preview ? `© ${new Date().getFullYear()} ${biz.name}. A concept site, prepared for ${biz.shortName}.` : `© ${new Date().getFullYear()} ${site.legalName}. A fictional business on a concept site.`}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" prefetch={false} className="link inline-flex min-h-9 items-center">
              Privacy
            </Link>
            <Link href="/terms" prefetch={false} className="link inline-flex min-h-9 items-center">
              Terms
            </Link>
            <a href={agencyUrl} target="_blank" rel="noopener" className="link inline-flex min-h-9 items-center text-ivory/90">
              Design &amp; development: {agency.name} ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
