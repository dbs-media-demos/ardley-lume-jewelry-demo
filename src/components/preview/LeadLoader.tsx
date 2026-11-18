import { LeadLogo } from "@/components/brand/LeadLogo";
import { loaderSvg } from "@/lib/lead-logo";
import { loaderScript } from "@/lib/loader";

/** How long the exit takes in globals.css (the navy panel wiping up like the mobile menu) */
const EXIT_MS = 760;

/**
 * A preview's first view in a tab opens on the business's own logo, on the hero's night navy: the mark's
 * outlines draw themselves, their fills come in, the name slides out of a mask, and the navy wipes up off
 * the page (the mobile menu's move) as the hero comes in. ~2.3 s; a click or key skips it; reduced motion
 * shows the finished logo for 0.6 s, then fades. It's in the server HTML, so it's the first paint; the
 * inline script before it skips it on a reload in the same tab and times it (lib/loader.ts). The CSS
 * hides it at 3 s whatever happens.
 */
export function LeadLoader({ token, svg }: { token: string; svg: string }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: loaderScript(token, EXIT_MS) }} />
      <div className="lead-loader" aria-hidden>
        <div className="lead-loader__glow" />
        <LeadLogo svg={loaderSvg(svg)} className="lead-loader__logo" />
      </div>
    </>
  );
}
