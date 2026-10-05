import Image from "next/image";
import type { CardImg } from "@/lib/card-types";
import type { Tone } from "@/lib/commerce/types";

const METAL: Record<Tone, [string, string, string]> = {
  yellow: ["#f6e2a6", "#c9a55c", "#7d5f26"],
  white: ["#ffffff", "#c9ccd0", "#7f858c"],
  rose: ["#f7d6c6", "#d39a83", "#8f5b49"],
};

/*
 * "See it on a hand": the hand photo is 1331×2000. Its ring finger crosses
 * x≈770, y≈865 and is ≈70 px wide there, i.e. ≈4.1 px per millimetre for a
 * size-6 finger (≈17 mm). The band is drawn at that true scale.
 */
const PX_PER_MM = 4.1;

type Props = { kind: "ring" | "other"; mm: number; stoneMm?: number; hand: CardImg; tone: Tone; name: string };

export function HandScale({ kind, mm, stoneMm, hand, tone, name }: Props) {
  const [hi, mid, lo] = METAL[tone];
  if (kind === "other") return <ActualSize mm={mm} tone={tone} name={name} />;

  const bandMm = stoneMm ? 2 : Math.min(mm, 11);
  const bandPx = bandMm * PX_PER_MM;
  const stonePx = (stoneMm ?? 0) * PX_PER_MM;

  return (
    <figure className="relative overflow-hidden bg-[#dcdcda] md:rounded-2xl">
      <div className="relative mx-auto aspect-[1331/2000] max-h-[80vh]">
        <Image src={hand.src} alt="A relaxed hand against a plain grey background" fill sizes="(min-width: 1024px) 40vw, 100vw" quality={75} className="object-contain" />
        <svg viewBox="0 0 1331 2000" className="absolute inset-0 size-full" role="img" aria-label={`${name} drawn at true scale on a size 6 ring finger`}>
          <defs>
            <linearGradient id="hs-metal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={lo} />
              <stop offset="0.3" stopColor={hi} />
              <stop offset="0.55" stopColor={mid} />
              <stop offset="0.8" stopColor={hi} />
              <stop offset="1" stopColor={lo} />
            </linearGradient>
            <radialGradient id="hs-stone" cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.6" stopColor="#e8eef2" />
              <stop offset="1" stopColor="#9fb0bb" />
            </radialGradient>
          </defs>
          <g transform="translate(771 866) rotate(11)">
            <rect x={-41} y={-bandPx / 2} width={82} height={bandPx} rx={Math.min(bandPx / 2, 10)} fill="url(#hs-metal)" opacity="0.96" />
            <rect x={-41} y={-bandPx / 2} width={82} height={Math.max(1.5, bandPx * 0.22)} rx="1" fill="#fff" opacity="0.35" />
            {stoneMm ? (
              <g>
                <circle r={stonePx / 2 + 3} fill={mid} />
                <circle r={stonePx / 2} fill="url(#hs-stone)" stroke="#9db0bc" strokeWidth="1" />
                <circle r={stonePx / 4} fill="none" stroke="#b7c5ce" strokeWidth="1" />
              </g>
            ) : null}
          </g>
        </svg>
      </div>
      <figcaption className="absolute inset-x-4 bottom-4 rounded-xl bg-ivory/90 px-4 py-3 text-sm backdrop-blur">
        <span className="font-medium">True scale on a size 6 hand.</span>{" "}
        <span className="text-taupe">
          {stoneMm ? `${stoneMm} mm stone on a 2 mm band.` : `${bandMm} mm wide.`} Want to try it on? Book a showroom visit or order a free sizer.
        </span>
      </figcaption>
    </figure>
  );
}

/** Earrings, pendants, bracelets: the key dimension drawn in CSS millimetres next to a US quarter. */
function ActualSize({ mm, tone, name }: { mm: number; tone: Tone; name: string }) {
  const [hi, mid, lo] = METAL[tone];
  return (
    <figure className="flex aspect-[4/5] flex-col items-center justify-center gap-10 bg-bone p-8 md:rounded-2xl">
      <div className="flex items-end justify-center gap-12">
        <div className="flex flex-col items-center gap-3">
          <div className="grid place-items-center rounded-full border border-ink/25 bg-[radial-gradient(circle_at_35%_30%,#f2f2f2,#b9bcbf)] text-[2.4mm] font-semibold text-ink/60" style={{ width: "24.26mm", height: "24.26mm" }}>
            25¢
          </div>
          <span className="spec text-taupe">US quarter · 24.3 mm</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-full"
            style={{ width: `${mm}mm`, height: `${mm}mm`, background: `conic-gradient(from 200deg, ${lo}, ${hi}, ${mid}, ${hi}, ${lo})`, mask: "radial-gradient(circle, transparent 58%, #000 60%)", WebkitMask: "radial-gradient(circle, transparent 58%, #000 60%)" }}
            role="img"
            aria-label={`${name}: about ${mm} millimetres across`}
          />
          <span className="spec text-taupe">{name} · {mm} mm</span>
        </div>
      </div>
      <figcaption className="max-w-xs text-center text-sm text-taupe">Drawn at approximately actual size on most screens. Hold a quarter up to compare.</figcaption>
    </figure>
  );
}
