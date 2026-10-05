import clsx from "clsx";
import type { Setting, Shape } from "@/lib/builder";
import type { Tone } from "@/lib/commerce/types";

const METAL: Record<Tone, [string, string, string]> = {
  yellow: ["#f6e2a6", "#c9a55c", "#7d5f26"],
  white: ["#ffffff", "#cfd2d6", "#80858c"],
  rose: ["#f7d6c6", "#d39a83", "#8f5b49"],
};

/** Stone outline for a shape, centred at (0,0), "radius" r. */
function stonePath(shape: Shape, r: number) {
  switch (shape) {
    case "round":
      return `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
    case "oval": {
      const rx = r * 0.8;
      const ry = r * 1.18;
      return `M ${-rx} 0 A ${rx} ${ry} 0 1 0 ${rx} 0 A ${rx} ${ry} 0 1 0 ${-rx} 0 Z`;
    }
    case "emerald": {
      const w = r * 0.82;
      const h = r * 1.2;
      const c = r * 0.26;
      return `M ${-w + c} ${-h} L ${w - c} ${-h} L ${w} ${-h + c} L ${w} ${h - c} L ${w - c} ${h} L ${-w + c} ${h} L ${-w} ${h - c} L ${-w} ${-h + c} Z`;
    }
    case "pear": {
      const w = r * 0.86;
      return `M 0 ${-r * 1.32} C ${w * 0.6} ${-r * 0.7} ${w} ${-r * 0.1} ${w} ${r * 0.35} A ${w} ${w} 0 1 1 ${-w} ${r * 0.35} C ${-w} ${-r * 0.1} ${-w * 0.6} ${-r * 0.7} 0 ${-r * 1.32} Z`;
    }
  }
}

/** Facet lines inside the stone, so it reads as a cut gem, not a blob. */
function facets(shape: Shape, r: number) {
  if (shape === "emerald") {
    const w = r * 0.82;
    const h = r * 1.2;
    return [0.72, 0.45].map((k, i) => (
      <rect key={i} x={-w * k} y={-h * k} width={w * 2 * k} height={h * 2 * k} rx={r * 0.06 * k} fill="none" />
    ));
  }
  const sx = shape === "oval" ? 0.8 : shape === "pear" ? 0.86 : 1;
  const sy = shape === "oval" ? 1.18 : shape === "pear" ? 1.05 : 1;
  const oy = shape === "pear" ? r * 0.12 : 0;
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(a) * r * 0.52 * sx, Math.sin(a) * r * 0.52 * sy + oy];
  });
  const outer = Array.from({ length: 8 }, (_, i) => {
    const a = ((i + 0.5) / 8) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(a) * r * 0.86 * sx, Math.sin(a) * r * 0.86 * sy + oy];
  });
  return (
    <>
      <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="none" />
      {pts.map((p, i) => (
        <polyline key={i} points={`${p.join(",")} ${outer[i].join(",")} ${pts[(i + 1) % 8].join(",")}`} fill="none" />
      ))}
    </>
  );
}

type Props = { setting: Setting; shape: Shape; carat: number; tone: Tone; className?: string; title?: string; engraving?: string };

/**
 * Layered, live ring preview: band in perspective, the setting, the stone.
 * Every layer transitions, so changing a choice glides rather than snaps.
 */
export function RingPreview({ setting, shape, carat, tone, className, title, engraving }: Props) {
  const [hi, mid, lo] = METAL[tone];
  const r = 30 * Math.cbrt(carat);
  const cy = 168 - r * 0.85;
  const uid = `rp-${tone}`;

  const claws = setting === "solitaire" || setting === "three-stone";
  const clawAngles = shape === "emerald" ? [45, 135, 225, 315] : shape === "pear" ? [-90, 30, 150, 90] : [30, 90, 150, 210, 270, 330];

  return (
    <svg viewBox="0 0 400 360" className={clsx("overflow-visible", className)} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={lo} />
          <stop offset="0.25" stopColor={hi} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="0.75" stopColor={hi} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <radialGradient id={`${uid}-stone`} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#eef3f6" />
          <stop offset="0.8" stopColor="#c9d3da" />
          <stop offset="1" stopColor="#9fb0bb" />
        </radialGradient>
        <linearGradient id={`${uid}-glint`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* shadow */}
      <ellipse cx="200" cy="344" rx="120" ry="10" fill="#0e1311" opacity="0.1" />

      {/* band, back half (behind the head) */}
      <path d="M 78 252 A 122 78 0 0 1 322 252" fill="none" stroke={`url(#${uid}-band)`} strokeWidth="9" opacity="0.7" className="transition-[stroke] duration-700" />
      {engraving ? (
        <text x="200" y="196" textAnchor="middle" fontSize="11" fill={lo} fontFamily="var(--font-display)" letterSpacing="2" opacity="0.85">
          {engraving}
        </text>
      ) : null}

      {/* head: a small cathedral basket rising from the band */}
      <path
        d={`M ${200 - r * 0.62} ${cy + r * 0.55} L ${200 - 10} 184 L ${200 + 10} 184 L ${200 + r * 0.62} ${cy + r * 0.55} Z`}
        fill={`url(#${uid}-band)`}
        opacity="0.95"
      />
      {/* side stones */}
      <g className={clsx("transition-opacity duration-500", setting === "three-stone" ? "opacity-100" : "opacity-0")}>
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${200 + d * (r * 1.05 + 20)} ${cy + 6})`}>
            <circle r={r * 0.5} fill={`url(#${uid}-stone)`} stroke={mid} strokeWidth="1.5" />
            <circle r={r * 0.26} fill="none" stroke="#aebcc6" strokeWidth="0.7" />
          </g>
        ))}
      </g>

      <g transform={`translate(200 ${cy})`} className="transition-transform duration-700">
        {/* halo */}
        <g className={clsx("transition-opacity duration-500", setting === "halo" ? "opacity-100" : "opacity-0")}>
          <path d={stonePath(shape, r + 9)} fill="none" stroke={mid} strokeWidth="8" />
          <path d={stonePath(shape, r + 9)} fill="none" stroke="#f4f7f9" strokeWidth="4.5" strokeDasharray="0.1 6.2" strokeLinecap="round" />
        </g>
        {/* bezel */}
        <path d={stonePath(shape, r + 3)} fill="none" stroke={`url(#${uid}-band)`} strokeWidth="7" className={clsx("transition-opacity duration-500", setting === "bezel" ? "opacity-100" : "opacity-0")} />

        {/* the stone */}
        <path d={stonePath(shape, r)} fill={`url(#${uid}-stone)`} stroke="#9fb0bb" strokeWidth="1" />
        <g stroke="#9db0bc" strokeWidth="0.8" opacity="0.8">
          {facets(shape, r)}
        </g>
        <clipPath id={`${uid}-clip-${shape}`}>
          <path d={stonePath(shape, r)} />
        </clipPath>
        <g clipPath={`url(#${uid}-clip-${shape})`}>
          <rect x={-r * 1.4} y={-r * 1.6} width={r * 2.8} height={r * 3.2} fill={`url(#${uid}-glint)`} className="[transform-box:fill-box] [animation:stone-glint_4.5s_ease-in-out_infinite]" />
        </g>

        {/* claws */}
        <g className={clsx("transition-opacity duration-500", claws ? "opacity-100" : "opacity-0")}>
          {clawAngles.map((a) => {
            const rad = (a * Math.PI) / 180;
            const sx = shape === "oval" ? 0.8 : shape === "emerald" ? 0.82 * 1.25 : shape === "pear" ? 0.86 : 1;
            const sy = shape === "oval" ? 1.18 : shape === "emerald" ? 1.2 * 1.25 : 1;
            return <circle key={a} cx={Math.cos(rad) * r * sx * 0.98} cy={Math.sin(rad) * r * sy * 0.98} r="4.2" fill={`url(#${uid}-band)`} stroke={lo} strokeWidth="0.6" />;
          })}
        </g>
      </g>

      {/* front of the band */}
      <path d="M 78 252 A 122 78 0 0 0 322 252" fill="none" stroke={`url(#${uid}-band)`} strokeWidth="16" className="transition-[stroke] duration-700" />
      <path d="M 92 262 A 108 64 0 0 0 308 262" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" />

      {/* sparkle */}
      <g className="[animation:sparkle_3.2s_ease-in-out_infinite]" style={{ transformOrigin: `${200 + r * 0.5}px ${cy - r * 0.7}px` }}>
        <path d={`M ${200 + r * 0.5} ${cy - r * 0.7 - 12} l 2.5 9.5 l 9.5 2.5 l -9.5 2.5 l -2.5 9.5 l -2.5 -9.5 l -9.5 -2.5 l 9.5 -2.5 Z`} fill="#fff" />
      </g>
    </svg>
  );
}
