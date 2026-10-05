import type { Tone } from "@/lib/commerce/types";

const METAL: Record<Tone, [string, string]> = {
  yellow: ["#f3dc9b", "#a8823b"],
  white: ["#f2f3f5", "#8f949a"],
  rose: ["#f4d0c0", "#a86d59"],
};

/** The inside of a band, seen at an angle, with the engraving following its curve. */
export function EngravingPreview({ text, tone = "yellow" }: { text: string; tone?: Tone }) {
  const [hi, lo] = METAL[tone];
  return (
    <svg viewBox="0 0 320 120" className="w-full" role="img" aria-label={text ? `Engraving preview: ${text}` : "Engraving preview"}>
      <defs>
        <linearGradient id={`eng-${tone}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={lo} />
          <stop offset="0.3" stopColor={hi} />
          <stop offset="0.7" stopColor={hi} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <path id="eng-path" d="M 46 66 A 114 34 0 0 0 274 66" />
      </defs>
      <ellipse cx="160" cy="60" rx="130" ry="44" fill="none" stroke={`url(#eng-${tone})`} strokeWidth="22" />
      <ellipse cx="160" cy="60" rx="119" ry="35" fill="none" stroke={lo} strokeOpacity="0.35" strokeWidth="1" />
      <text fontFamily="var(--font-display), serif" fontSize="15" fill={lo} letterSpacing="2.5">
        <textPath href="#eng-path" startOffset="50%" textAnchor="middle">
          {text || "Your words, inside the band"}
        </textPath>
      </text>
    </svg>
  );
}
