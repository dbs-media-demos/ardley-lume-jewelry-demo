/*
 * A round brilliant in numbers, for the /v2 hero (no WebGL, no three.js: plain maths
 * shared by the server SVG and the canvas 2D loop).
 * - The stone: an ideal cut (table 56 %, crown 34.5°, pavilion 40.75°), 57 facets as
 *   polygons in model space (girdle radius 1, y up), projected orthographically.
 * - The light: a bundle of rays traced through the stone's cross-section with Snell's
 *   law, total internal reflection and diamond's dispersion (n 2.407 red … 2.451 violet).
 *   What comes back out of the top is the stone's brilliance and fire; what leaks out of
 *   the pavilion is counted, so the "light returned" figure is a real result.
 */

const D = Math.PI / 180;
export const TABLE = 0.56;
const GT = 0.02; // half the girdle thickness
const CROWN_H = (1 - TABLE) * Math.tan(34.5 * D);
const PAV_H = Math.tan(40.75 * D);
export const Y_TABLE = GT + CROWN_H;
export const Y_CULET = -GT - PAV_H;

export type V3 = [number, number, number];
type P2 = [number, number];

const crownY = (r: number) => GT + (CROWN_H * (1 - r)) / (1 - TABLE);
const pavY = (r: number) => -GT - PAV_H * (1 - r);
const at = (r: number, deg: number, y: number): V3 => [r * Math.cos(deg * D), y, r * Math.sin(deg * D)];

/* Vertices */
const verts: V3[] = [];
const add = (v: V3) => verts.push(v) - 1;
const T = Array.from({ length: 8 }, (_, i) => add(at(TABLE, i * 45, Y_TABLE)));
const S = Array.from({ length: 8 }, (_, i) => add(at(0.78, i * 45 + 22.5, crownY(0.78))));
const GU = Array.from({ length: 16 }, (_, k) => add(at(1, k * 22.5, GT)));
const GD = Array.from({ length: 16 }, (_, k) => add(at(1, k * 22.5, -GT)));
const L = Array.from({ length: 8 }, (_, i) => add(at(0.23, i * 45 + 22.5, pavY(0.23))));
const C = add([0, Y_CULET, 0]);

/* Faces */
const m8 = (i: number) => (i + 8) % 8;
const m16 = (k: number) => (k + 16) % 16;
const faces: number[][] = [T.slice()];
for (let i = 0; i < 8; i++) {
  faces.push([T[i], T[m8(i + 1)], S[i]]); // star
  faces.push([T[i], S[i], GU[2 * i], S[m8(i - 1)]]); // bezel (kite)
  faces.push([S[i], GU[2 * i], GU[2 * i + 1]], [S[i], GU[2 * i + 1], GU[m16(2 * i + 2)]]); // upper girdle
  faces.push([GD[2 * i], L[i], C, L[m8(i - 1)]]); // pavilion main
  faces.push([GD[2 * i], GD[2 * i + 1], L[i]], [GD[2 * i + 1], GD[m16(2 * i + 2)], L[i]]); // lower girdle
}
for (let k = 0; k < 16; k++) faces.push([GU[k], GU[m16(k + 1)], GD[m16(k + 1)], GD[k]]); // girdle
export const FACES = faces;
/** A stable per-facet tint, so the mosaic of the stone never looks flat. */
export const FACE_TINT = faces.map((_, i) => 0.025 + ((i * 37) % 11) / 220);

/* Outward normals (Newell), and unique edges with the faces either side. */
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const NORMALS: V3[] = faces.map((f) => {
  const n: V3 = [0, 0, 0];
  const c: V3 = [0, 0, 0];
  f.forEach((vi, j) => {
    const a = verts[vi];
    const b = verts[f[(j + 1) % f.length]];
    n[0] += (a[1] - b[1]) * (a[2] + b[2]);
    n[1] += (a[2] - b[2]) * (a[0] + b[0]);
    n[2] += (a[0] - b[0]) * (a[1] + b[1]);
    c[0] += a[0] / f.length;
    c[1] += a[1] / f.length;
    c[2] += a[2] / f.length;
  });
  const out = sub(c, [0, -0.15, 0]);
  const s = Math.sign(n[0] * out[0] + n[1] * out[1] + n[2] * out[2]) || 1;
  const len = Math.hypot(...n) || 1;
  return [(s * n[0]) / len, (s * n[1]) / len, (s * n[2]) / len];
});

const edgeMap = new Map<string, { a: number; b: number; faces: number[] }>();
faces.forEach((f, fi) =>
  f.forEach((a, j) => {
    const b = f[(j + 1) % f.length];
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    const e = edgeMap.get(key) ?? { a, b, faces: [] };
    e.faces.push(fi);
    edgeMap.set(key, e);
  }),
);
export const EDGES = [...edgeMap.values()];

/** The stone turned by `phi` about its axis and tipped `tilt` towards the viewer (screen units, y down). */
export function project(phi: number, tilt: number) {
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const rot = ([x, y, z]: V3): V3 => {
    const x1 = x * cp + z * sp;
    const z1 = -x * sp + z * cp;
    return [x1, y * ct - z1 * st, y * st + z1 * ct];
  };
  const pts: P2[] = verts.map((v) => {
    const r = rot(v);
    return [r[0], -r[1]];
  });
  const normals = NORMALS.map(rot);
  const front = normals.map((n) => n[2] > 0);
  return { pts, normals, front };
}

/* ---------------------------------------------------------------- light */

/** Diamond's refractive index across the visible spectrum, red to violet, with the colour each is drawn in. */
export const SPECTRUM: { n: number; color: string }[] = [
  { n: 2.407, color: "255,92,74" },
  { n: 2.413, color: "255,168,80" },
  { n: 2.418, color: "255,228,130" },
  { n: 2.426, color: "128,226,160" },
  { n: 2.436, color: "112,186,255" },
  { n: 2.451, color: "170,140,255" },
];
const N_MID = 2.417;
/** Fire is drawn a little wider than life (×2.4), so it reads on a shared screen. */
const FIRE = 2.4;

/** Where the stone sits in the hero's art box and how it is lit before anyone moves the mouse. */
export const STONE = {
  /** Centre of the girdle, as a share of the box's width and height. */
  x: 0.58,
  y: 0.55,
  /** Girdle radius: the smaller of these shares of the box's width and height. */
  rw: 0.24,
  rh: 0.22,
  alpha: 12 * D,
  tilt: 9 * D,
  rays: 10,
};
/** How far the light that leaves is drawn, in girdle radii (it fades out over that length). */
export const EXIT = { top: 2.3, leak: 0.7 };

/** The cross-section through two opposite pavilion mains, clockwise (y up). */
const PROFILE: P2[] = [
  [-TABLE, Y_TABLE],
  [TABLE, Y_TABLE],
  [1, GT],
  [1, -GT],
  [0, Y_CULET],
  [-1, -GT],
  [-1, GT],
];
const SEGS = PROFILE.map((a, i) => {
  const b = PROFILE[(i + 1) % PROFILE.length];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  return { a, b, n: [-dy / len, dx / len] as P2 };
});

const dot = (a: P2, b: P2) => a[0] * b[0] + a[1] * b[1];

/** Nearest hit of a ray with the outline; `inside` picks the edges it can leave through. */
function hit(o: P2, d: P2, inside: boolean) {
  let best: { t: number; i: number } | null = null;
  SEGS.forEach((s, i) => {
    const facing = dot(d, s.n);
    if (inside ? facing <= 0 : facing >= 0) return;
    const ex = s.b[0] - s.a[0];
    const ey = s.b[1] - s.a[1];
    const den = d[0] * ey - d[1] * ex;
    if (Math.abs(den) < 1e-9) return;
    const t = ((s.a[0] - o[0]) * ey - (s.a[1] - o[1]) * ex) / den;
    const u = ((s.a[0] - o[0]) * d[1] - (s.a[1] - o[1]) * d[0]) / den;
    if (t > 1e-6 && u >= 0 && u <= 1 && (!best || t < best.t)) best = { t, i };
  });
  return best as { t: number; i: number } | null;
}

/** Refraction through a surface whose normal `n` faces the incoming ray; null on total internal reflection. */
function refract(d: P2, n: P2, eta: number): P2 | null {
  const cosi = -dot(n, d);
  const k = 1 - eta * eta * (1 - cosi * cosi);
  if (k < 0) return null;
  const f = eta * cosi - Math.sqrt(k);
  return [eta * d[0] + f * n[0], eta * d[1] + f * n[1]];
}
const reflect = (d: P2, n: P2): P2 => {
  const k = 2 * dot(d, n);
  return [d[0] - k * n[0], d[1] - k * n[1]];
};

export type Ray = {
  /** Where the ray starts (far above) and every point it touches inside the stone. */
  path: P2[];
  /** The point where it leaves, and the leaving direction per colour (red → violet). */
  out: { at: P2; dirs: P2[] } | null;
  /** Left through the crown (returned to the eye) rather than leaking out of the pavilion. */
  top: boolean;
  /** Light glancing off the surface where it went in. */
  glare: { at: P2; dir: P2 };
};

/**
 * Traces `count` parallel rays arriving `alpha` radians off vertical (positive: from
 * the upper left). Returns the paths and the share of light that came back out the top.
 */
export function trace(alpha: number, count = STONE.rays, spread = 0.86) {
  const d: P2 = [Math.sin(alpha), -Math.cos(alpha)];
  const p: P2 = [Math.cos(alpha), Math.sin(alpha)];
  const rays: Ray[] = [];
  let returned = 0;
  for (let r = 0; r < count; r++) {
    const s = count === 1 ? 0 : -spread + (2 * spread * r) / (count - 1);
    const o: P2 = [p[0] * s - d[0] * 3.2, 0.12 + p[1] * s - d[1] * 3.2];
    const h0 = hit(o, d, false);
    if (!h0) continue;
    const entry: P2 = [o[0] + d[0] * h0.t, o[1] + d[1] * h0.t];
    const n0 = SEGS[h0.i].n;
    let dir = refract(d, n0, 1 / N_MID);
    if (!dir) continue;
    const path: P2[] = [o, entry];
    let pos = entry;
    let out: Ray["out"] = null;
    let top = false;
    for (let bounce = 0; bounce < 8 && !out; bounce++) {
      const h = hit(pos, dir, true);
      if (!h) break;
      pos = [pos[0] + dir[0] * h.t, pos[1] + dir[1] * h.t];
      path.push(pos);
      const inward: P2 = [-SEGS[h.i].n[0], -SEGS[h.i].n[1]];
      const leave = refract(dir, inward, N_MID);
      if (!leave) {
        dir = reflect(dir, inward);
        continue;
      }
      const cur = dir;
      const mid = Math.atan2(leave[1], leave[0]);
      const dirs = SPECTRUM.map((c): P2 => {
        const e = refract(cur, inward, c.n) ?? leave;
        const a = mid + (Math.atan2(e[1], e[0]) - mid) * FIRE;
        return [Math.cos(a), Math.sin(a)];
      });
      top = pos[1] > GT + 1e-4;
      out = { at: pos, dirs };
    }
    if (top) returned++;
    rays.push({ path, out, top, glare: { at: entry, dir: reflect(d, n0) } });
  }
  return { rays, returned: rays.length ? returned / rays.length : 0 };
}
