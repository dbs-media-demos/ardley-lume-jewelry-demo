import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/content/site";

/** Checkout stays calm: no navigation, no motion beyond gentle step slides. */
export default function CheckoutLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-ivory">
      <header className="border-b border-ink/10 bg-ivory">
        <div className="wrap flex h-16 items-center justify-between">
          <Link href="/" aria-label={`${site.name}, home`} className="flex min-h-11 items-center">
            <Logo compact />
          </Link>
          <p className="flex items-center gap-2 text-sm text-taupe">
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
              <rect x="4" y="9" width="12" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 9V6.5a3 3 0 016 0V9" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Secure checkout
          </p>
        </div>
      </header>
      <div role="note" className="bg-forest px-5 py-2.5 text-center text-sm text-ivory">
        <strong className="font-semibold text-gold-pale">Demo store, no payment is taken.</strong> Test card 4242 4242 4242 4242. The card form is a design only: nothing you type leaves your browser.
      </div>
      <main id="main" className="wrap py-10 md:py-14">
        {children}
      </main>
      <footer className="wrap flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 py-6 text-xs text-taupe">
        <p>
          © {new Date().getFullYear()} {site.name} · <Link href="/shipping-returns" className="link-under">Shipping &amp; returns</Link> · <Link href="/privacy" className="link-under">Privacy</Link> ·{" "}
          <Link href="/terms" className="link-under">Terms</Link>
        </p>
        <p>
          Need help? <a href={site.phoneHref} className="link-under">{site.phone}</a>
        </p>
      </footer>
    </div>
  );
}
