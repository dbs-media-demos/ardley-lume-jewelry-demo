import { EXIT, FACES, FACE_TINT, SPECTRUM, STONE, project, trace } from "@/components/fx/brilliant";
import { LightStone } from "./LightStone";

/** 1×1 transparent GIF: desktops take this source, so they never download the phone still. */
const NOTHING = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const K = 3.4; // the SVG spans ±K stone radii around the girdle's centre
const SW = 0.0055; // ≈ 1 px at the usual stone size
const f = (n: number) => +n.toFixed(3);

/**
 * The /v2 hero's centrepiece: light passing through a round brilliant. No WebGL anywhere.
 * - Phones and tablets: the same ring still as `/` (so /v2 on a phone is `/`).
 * - Desktop, first paint: an SVG of the stone and the light's path through it, drawn by
 *   CSS (moving before any JavaScript has run).
 * - Desktop, after load: LightStone takes over in canvas 2D: the stone turns, the light
 *   follows the cursor and the scroll, and the rays are traced live.
 */
export function HeroLight({ phoneStill }: { phoneStill: string }) {
  const { alpha, tilt } = STONE;
  const { pts, front } = project(0, tilt);
  const { rays } = trace(alpha);
  const { returned } = trace(alpha, 48);
  const ct = Math.cos(tilt);
  const P = ([x, y]: [number, number]) => `${f(x)},${f(-y * ct)}`;
  const poly = (fi: number) => FACES[fi].map((v) => `${f(pts[v][0])},${f(pts[v][1])}`).join(" ");
  const order = FACES.map((_, i) => i);

  return (
    <div
      data-hero-canvas
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-[3.5rem] z-[2] h-[35%] [container-type:size] lg:inset-x-auto lg:top-0 lg:right-0 lg:h-full lg:w-[62%] lg:[mask-image:linear-gradient(to_right,transparent,#000_24%)]"
    >
      <picture className="lg:hidden">
        <source media="(min-width: 1024px)" srcSet={NOTHING} />
        <img src={phoneStill} alt="" decoding="async" className="absolute inset-0 size-full object-contain object-[64%_50%]" />
      </picture>

      <LightStone returned={Math.round(returned * 100)}>
        <svg
          viewBox={`${-K} ${-K} ${2 * K} ${2 * K}`}
          className="absolute"
          style={{
            width: `calc(var(--r) * ${2 * K})`,
            left: `calc(${STONE.x * 100}cqw - var(--r) * ${K})`,
            top: `calc(${STONE.y * 100}cqh - var(--r) * ${K})`,
          }}
        >
          <defs>
            <radialGradient id="ls-glow">
              <stop offset="0" stopColor="#e8d6a8" stopOpacity="0.2" />
              <stop offset="1" stopColor="#e8d6a8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ls-fade-g">
              <stop offset="0.15" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </radialGradient>
            <mask id="ls-fade" maskUnits="userSpaceOnUse" x={-K} y={-K} width={2 * K} height={2 * K}>
              <rect x={-K} y={-K} width={2 * K} height={2 * K} fill="url(#ls-fade-g)" />
            </mask>
          </defs>
          <circle r="2.6" cy="-0.1" fill="url(#ls-glow)" />
          {/* Behind the glass: the far facets, faint. */}
          <g fill="none" stroke="#e8d6a8" strokeOpacity="0.16" strokeWidth={SW} strokeLinejoin="round">
            {order
              .filter((i) => !front[i])
              .map((i) => (
                <polygon key={i} points={poly(i)} pathLength={1} className="draw-in" style={{ "--d": "0.5s" } as React.CSSProperties} />
              ))}
          </g>
          {/* The light inside. */}
          <g fill="none" stroke="#fff4d6" strokeOpacity="0.55" strokeWidth={SW} strokeLinejoin="round" mask="url(#ls-fade)">
            {rays.map((r, i) => (
              <polyline key={i} points={r.path.map(P).join(" ")} pathLength={1} className="draw-in" style={{ "--d": `${1 + i * 0.05}s`, "--t": "1.6s" } as React.CSSProperties} />
            ))}
          </g>
          {/* The near facets. */}
          <g stroke="#e8d6a8" strokeOpacity="0.62" strokeWidth={SW} strokeLinejoin="round">
            {order
              .filter((i) => front[i])
              .map((i, j) => (
                <polygon key={i} points={poly(i)} fill="#c9a55c" fillOpacity={FACE_TINT[i]} pathLength={1} className="draw-in" style={{ "--d": `${0.1 + j * 0.012}s` } as React.CSSProperties} />
              ))}
          </g>
          {/* What comes back out: fire. */}
          <g mask="url(#ls-fade)" strokeWidth={SW * 1.3} className="fade-late" style={{ "--d": "2.1s" } as React.CSSProperties}>
            {rays.flatMap((r, i) =>
              r.out
                ? r.out.dirs.map((d, j) => {
                    const len = r.top ? EXIT.top : EXIT.leak;
                    const [x, y] = r.out!.at;
                    return <line key={`${i}-${j}`} x1={f(x)} y1={f(-y * ct)} x2={f(x + d[0] * len)} y2={f(-(y + d[1] * len) * ct)} stroke={`rgb(${SPECTRUM[j].color})`} strokeOpacity={r.top ? 0.7 : 0.22} />;
                  })
                : [],
            )}
          </g>
        </svg>
      </LightStone>
    </div>
  );
}
