import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site, agency, agencyUrl, fullAddress } from "@/content/site";
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

export function Footer() {
  return (
    <footer data-dark className="relative overflow-hidden bg-ink pt-20 pb-28 text-ivory md:pb-12">
      <div className="wrap">
        <div className="grid gap-12 border-b border-ivory/12 pb-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo onDark />
            <p className="mt-6 max-w-sm font-display text-3xl leading-tight text-ivory">Fine jewelry, made in the light, in Dallas.</p>
            <p className="mt-4 max-w-sm text-sm text-mist">
              Join the list for new pieces, bench notes and the occasional private sale. One email a month, never more.
            </p>
            <Newsletter />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="eyebrow mb-4 text-mist">{c.title}</p>
                <ul className="space-y-1">
                  {c.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} prefetch={false} className="link inline-flex min-h-9 items-center text-[0.95rem] text-ivory/90 hover:text-ivory">
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
            <p className="text-ivory/90">{fullAddress}</p>
            <p>{site.address.neighborhood}, by appointment or walk-in</p>
          </div>
          <div>
            <p className="eyebrow mb-3">Hours</p>
            <OpenBadge onDark className="text-ivory/90" />
            <p className="mt-1">Tue–Fri 11–7 · Sat 10–6 · Sun 12–5</p>
          </div>
          <div>
            <p className="eyebrow mb-3">Talk to us</p>
            <a href={site.phoneHref} className="link flex min-h-9 w-fit items-center text-ivory/90">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="link flex min-h-9 w-fit items-center">
              {site.email}
            </a>
          </div>
        </div>

        {/* Decorative wordmark, drawn with CSS content so it isn't read or contrast-checked as text. */}
        <div aria-hidden className="footer-wordmark pointer-events-none -mb-[0.18em] font-display text-[18vw] leading-[0.8] tracking-[-0.03em] whitespace-nowrap text-ivory/[0.06] select-none" />

        <div className="flex flex-col gap-3 border-t border-ivory/12 pt-6 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. A fictional business on a concept site.
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
