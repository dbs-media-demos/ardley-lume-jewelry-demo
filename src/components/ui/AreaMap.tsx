import clsx from "clsx";

/**
 * Stylised schematic of Knox-Henderson (not to scale, not a real business's
 * location): Central Expressway, Henderson Ave, Knox St, McKinney Ave and the
 * Katy Trail, with the showroom marked as a glint.
 */
export function AreaMap({ className, onDark = true }: { className?: string; onDark?: boolean }) {
  const road = onDark ? "#e8d6a8" : "#0e1311";
  const label = onDark ? "#efe8dc" : "#0e1311";
  return (
    <svg viewBox="0 0 600 440" className={clsx("w-full", className)} role="img" aria-label="Map sketch of the Knox-Henderson neighbourhood in Dallas, with the showroom on Henderson Avenue near Central Expressway">
      <rect width="600" height="440" fill={onDark ? "#3a171c" : "#efe8dc"} rx="18" />
      <g fill="none" strokeLinecap="round">
        {/* grid streets */}
        {Array.from({ length: 9 }, (_, i) => (
          <path key={`h${i}`} d={`M0 ${40 + i * 48} L600 ${10 + i * 48}`} stroke={road} strokeOpacity="0.08" strokeWidth="1" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <path key={`v${i}`} d={`M${30 + i * 56} 0 L${60 + i * 56} 440`} stroke={road} strokeOpacity="0.08" strokeWidth="1" />
        ))}
        {/* Katy Trail */}
        <path d="M40 420 C 160 330 210 260 300 200 S 470 90 560 20" stroke="#7f9b84" strokeOpacity="0.7" strokeWidth="3" strokeDasharray="2 7" />
        {/* McKinney Ave */}
        <path d="M0 330 C 150 300 300 250 600 140" stroke={road} strokeOpacity="0.35" strokeWidth="4" />
        {/* Knox St → Henderson Ave */}
        <path d="M70 120 L 330 230 L 600 360" stroke={road} strokeOpacity="0.85" strokeWidth="7" />
        {/* US-75 Central Expressway */}
        <path d="M380 0 C 390 120 400 260 430 440" stroke={road} strokeOpacity="0.55" strokeWidth="14" />
        <path d="M380 0 C 390 120 400 260 430 440" stroke={onDark ? "#3a171c" : "#efe8dc"} strokeWidth="2" strokeDasharray="10 10" />
      </g>
      <g fontFamily="var(--font-mono), monospace" fontSize="11" letterSpacing="2" fill={label} fillOpacity="0.85">
        <text x="96" y="104" transform="rotate(23 96 104)">KNOX ST</text>
        <text x="468" y="292" transform="rotate(25 468 292)">N HENDERSON AVE</text>
        <text x="408" y="40" transform="rotate(84 408 40)">US-75 CENTRAL EXPWY</text>
        <text x="40" y="318" transform="rotate(-11 40 318)">MCKINNEY AVE</text>
        <text x="190" y="300" transform="rotate(-36 190 300)" fill="#9fbaa4">KATY TRAIL</text>
      </g>
      {/* showroom */}
      <g transform="translate(452 286)">
        <circle r="26" fill="#c9a55c" fillOpacity="0.18">
          <animate attributeName="r" values="18;30;18" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <path d="M0 -14 C1 -4 4 -1 14 0 C4 1 1 4 0 14 C-1 4 -4 1 -14 0 C-4 -1 -1 -4 0 -14Z" fill="#c9a55c" />
      </g>
      <g transform="translate(470 330)">
        <rect x="-4" y="-16" width="122" height="26" rx="13" fill={onDark ? "#0e1311" : "#ffffff"} fillOpacity="0.85" />
        <text x="10" y="1" fontSize="12" fontFamily="var(--font-display), serif" fill={label}>
          Ardley &amp; Lume
        </text>
      </g>
      <text x="24" y="420" fontSize="10" fontFamily="var(--font-mono), monospace" fill={label} fillOpacity="0.55" letterSpacing="1.5">
        NOT TO SCALE
      </text>
    </svg>
  );
}
