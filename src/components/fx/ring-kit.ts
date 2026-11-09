import * as THREE from "three";
import type { Shape } from "@/lib/builder";
import type { Tone } from "@/lib/commerce/types";

/*
 * The procedural ring both 3D scenes share (hero + builder). Everything is built
 * from primitives, no model files: a faceted stone grown from its outline (round,
 * oval and pear as brilliants, emerald as a step cut), cathedral claws and a basket
 * that follow that outline, a comfort-fit band and physically based metals lit by
 * a jeweller's light box.
 */

export const GEM_R = 0.42; // girdle "radius" of a 1 ct stone on a ring with inner radius 1

type V2 = [number, number];

/** Point on the stone's outline (x across the finger, z along it), u in [0,1). Unit-ish size, tip of the pear at +z. */
function outline(shape: Shape, u: number): V2 {
  const t = u * Math.PI * 2;
  switch (shape) {
    case "round":
      return [Math.sin(t), Math.cos(t)];
    case "oval":
      return [Math.sin(t) * 0.84, Math.cos(t) * 1.2];
    case "pear":
      return [Math.sin(t) * Math.sin(t / 2) * 1.14, Math.cos(t) * 1.22 + 0.08];
    case "emerald":
      return emerald(u);
  }
}

/** Emerald outline: a long rectangle with cut corners, walked by perimeter fraction. */
const EM = (() => {
  const w = 0.74;
  const h = 1.04;
  const c = 0.22;
  const v: V2[] = [
    [w - c, h],
    [w, h - c],
    [w, -h + c],
    [w - c, -h],
    [-w + c, -h],
    [-w, -h + c],
    [-w, h - c],
    [-w + c, h],
  ];
  const len = v.map((p, i) => Math.hypot(v[(i + 1) % 8][0] - p[0], v[(i + 1) % 8][1] - p[1]));
  const total = len.reduce((a, b) => a + b, 0);
  const at: number[] = [];
  len.reduce((acc, l) => (at.push(acc / total), acc + l), 0);
  return { v, at, len, total };
})();

function emerald(u: number): V2 {
  const x = ((u % 1) + 1) % 1;
  let i = 7;
  while (i > 0 && EM.at[i] > x) i--;
  const f = (x - EM.at[i]) / (EM.len[i] / EM.total);
  const a = EM.v[i];
  const b = EM.v[(i + 1) % 8];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/** Rough centre of the outline (the pear's sits toward its round end). */
function centre(shape: Shape): V2 {
  let x = 0;
  let z = 0;
  for (let i = 0; i < 64; i++) {
    const p = outline(shape, i / 64);
    x += p[0];
    z += p[1];
  }
  return [x / 64, z / 64];
}

type Level = { y: number; s: number; n: number; off: number };

const BRILLIANT: Level[] = [
  { y: 0.34, s: 0, n: 1, off: 0 }, // table centre
  { y: 0.34, s: 0.56, n: 8, off: 0 }, // table
  { y: 0.25, s: 0.77, n: 8, off: 0.5 }, // star points
  { y: 0.13, s: 0.93, n: 16, off: 0.25 }, // upper girdle
  { y: 0.03, s: 1, n: 32, off: 0 }, // girdle
  { y: -0.03, s: 1, n: 32, off: 0 },
  { y: -0.24, s: 0.8, n: 16, off: 0.25 }, // lower girdle
  { y: -0.52, s: 0.4, n: 8, off: 0.5 }, // pavilion mains
  { y: -0.86, s: 0, n: 1, off: 0 }, // culet
];

const STEP: Level[] = [
  { y: 0.26, s: 0, n: 1, off: 0 },
  { y: 0.26, s: 0.64, n: 8, off: 0 }, // table
  { y: 0.17, s: 0.83, n: 8, off: 0 }, // crown step
  { y: 0.03, s: 1, n: 8, off: 0 }, // girdle
  { y: -0.03, s: 1, n: 8, off: 0 },
  { y: -0.26, s: 0.74, n: 8, off: 0 }, // pavilion steps
  { y: -0.5, s: 0.44, n: 8, off: 0 },
  { y: -0.66, s: 0.14, n: 8, off: 0 }, // keel
  { y: -0.68, s: 0, n: 1, off: 0 },
];

/** The stone's corner params for the emerald (so step facets meet the corners). */
const emU = (k: number) => EM.at[k];

/** Faceted stone: rings of points at each level, zipped together, flat-shaded. */
export function gemGeometry(shape: Shape) {
  const levels = shape === "emerald" ? STEP : BRILLIANT;
  const c = centre(shape);
  const rings = levels.map((lv) => {
    const us = Array.from({ length: lv.n }, (_, k) => (shape === "emerald" && lv.n === 8 ? emU(k) : (k + lv.off) / lv.n));
    const pts = us.map((u) => {
      const p = outline(shape, u);
      return new THREE.Vector3((c[0] + (p[0] - c[0]) * lv.s) * GEM_R, lv.y * GEM_R, (c[1] + (p[1] - c[1]) * lv.s) * GEM_R);
    });
    return { us, pts };
  });

  const pos: number[] = [];
  const mid = new THREE.Vector3(c[0] * GEM_R, 0, c[1] * GEM_R);
  const tri = (a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3) => {
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(d, a));
    if (n.lengthSq() < 1e-12) return;
    const centroid = new THREE.Vector3().add(a).add(b).add(d).multiplyScalar(1 / 3);
    // Outward facing, whatever order the zipper produced.
    if (n.dot(centroid.sub(mid)) < 0) pos.push(a.x, a.y, a.z, d.x, d.y, d.z, b.x, b.y, b.z);
    else pos.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
  };
  for (let r = 0; r < rings.length - 1; r++) {
    const A = rings[r];
    const B = rings[r + 1];
    const na = A.pts.length;
    const nb = B.pts.length;
    const ua = (i: number) => A.us[i % na] + Math.floor(i / na);
    const ub = (j: number) => B.us[j % nb] + Math.floor(j / nb);
    let i = 0;
    let j = 0;
    while (i < na || j < nb) {
      const nextA = i < na ? ua(i + 1) : Infinity;
      const nextB = j < nb ? ub(j + 1) : Infinity;
      if (nextA <= nextB) {
        tri(A.pts[i % na], B.pts[j % nb], A.pts[(i + 1) % na]);
        i++;
      } else {
        tri(A.pts[i % na], B.pts[j % nb], B.pts[(j + 1) % nb]);
        j++;
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Where the claws stand, per shape (outline params). */
const CLAWS: Record<Shape, number[]> = {
  round: [1, 3, 5, 7, 9, 11].map((k) => k / 12),
  oval: [0.09, 0.41, 0.59, 0.91],
  pear: [0, 0.3, 0.43, 0.57, 0.7],
  emerald: [0, 2, 4, 6].map((k) => (EM.at[k] + EM.at[k + 1]) / 2),
};

/** Head: slim claws that rise from the shank and fold over the girdle, plus one basket rail under the stone. */
export function headGroup(shape: Shape, metal: THREE.Material) {
  const head = new THREE.Group();
  const c = centre(shape);
  const at = (u: number, s: number, y: number) => {
    const p = outline(shape, u);
    return new THREE.Vector3((c[0] + (p[0] - c[0]) * s) * GEM_R, y, (c[1] + (p[1] - c[1]) * s) * GEM_R);
  };
  const r = 0.017;
  for (const u of CLAWS[shape]) {
    const top = at(u, 0.95, 0.07);
    const curve = new THREE.CubicBezierCurve3(at(u, 0.28, -0.5), at(u, 0.62, -0.38), at(u, 1.05, -0.12), top);
    head.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, r, 8, false), metal));
    const tip = new THREE.Mesh(new THREE.SphereGeometry(r * 1.35, 12, 8), metal);
    tip.position.copy(top);
    tip.scale.set(1, 0.75, 1);
    head.add(tip);
  }
  const pts = Array.from({ length: 48 }, (_, k) => at(k / 48, 0.8, -0.15));
  head.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, "centripetal"), 96, 0.014, 8, true), metal));
  return head;
}

/** Comfort-fit band: a soft D profile revolved around Y (stand it up by rotating x = π/2). */
export function bandGeometry(width = 0.22, thick = 0.105) {
  const pts: THREE.Vector2[] = [];
  const inner = 1.0;
  for (let i = 0; i <= 28; i++) {
    const t = (i / 28) * Math.PI;
    pts.push(new THREE.Vector2(inner + thick * 0.35 + Math.sin(t) * thick * 0.65, -Math.cos(t) * (width / 2)));
  }
  for (let i = 0; i <= 10; i++) {
    const t = (i / 10) * Math.PI;
    pts.push(new THREE.Vector2(inner + thick * 0.35 - Math.sin(t) * 0.035, Math.cos(t) * (width / 2)));
  }
  return new THREE.LatheGeometry(pts, 240);
}

export const METAL_COLOR: Record<Tone, string> = { yellow: "#f2c66f", white: "#e4e6ea", rose: "#efb59a" };

export function metalMaterial(tone: Tone) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(METAL_COLOR[tone]),
    metalness: 1,
    roughness: tone === "white" ? 0.1 : 0.13,
    clearcoat: 0.3,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6,
  });
}

/**
 * The stone, drawn the way jewellery renderers fake a diamond cheaply and crisply:
 * the back facets show the studio refracted (a cube map with a diamond's index), and
 * the front facets add a Fresnel reflection on top. Flat facets turn that into the
 * mosaic of bright and dark that reads as brilliance.
 */
export function gemMeshes(geometry: THREE.BufferGeometry, cube: THREE.Texture) {
  const inner = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: cube, refractionRatio: 1 / 2.42, side: THREE.BackSide });
  const outer = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    metalness: 0,
    roughness: 0,
    ior: 2.42,
    specularIntensity: 1,
    envMapIntensity: 3.4,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    flatShading: true,
  });
  const back = new THREE.Mesh(geometry, inner);
  const front = new THREE.Mesh(geometry, outer);
  front.renderOrder = 1;
  back.userData.gem = front.userData.gem = true;
  const gem = new THREE.Group();
  gem.add(back, front);
  return { gem, back, front, materials: [inner, outer] };
}

/**
 * Compiles, in parallel and without blocking (KHR_parallel_shader_compile), the programs
 * the light box is built with: the room's materials as drawn into a render target, and
 * PMREM's own filter shaders (reached through its internals, which `fromScene` then reuses).
 * Without this, those compile synchronously on first use: half a second of frozen page on
 * a fast PC with a cold shader cache. If the internals ever change, it simply compiles less.
 */
async function precompile(renderer: THREE.WebGLRenderer, pmrem: THREE.PMREMGenerator, scenes: THREE.Scene[]) {
  const probe = new THREE.Scene();
  const internals = pmrem as unknown as {
    _setSize?: (size: number) => void;
    _allocateTargets?: () => THREE.WebGLRenderTarget;
    _blurMaterial?: THREE.Material;
    _ggxMaterial?: THREE.Material;
    _lodMeshes?: THREE.Mesh[];
  };
  try {
    internals._setSize?.(256); // fromScene's default size, so it reuses these targets and materials
    internals._allocateTargets?.().dispose();
    // Drawn on PMREM's own planes: the program depends on which attributes the geometry has.
    const planes = internals._lodMeshes?.[0]?.geometry;
    if (planes) for (const m of [internals._blurMaterial, internals._ggxMaterial]) if (m) probe.add(new THREE.Mesh(planes, m));
  } catch {}
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const camera = new THREE.PerspectiveCamera();
  const before = renderer.getRenderTarget();
  renderer.setRenderTarget(target); // the variant drawn off screen: no tone mapping, linear output
  const ready = Promise.all([probe, ...scenes].map((sc) => renderer.compileAsync(sc, camera)));
  renderer.setRenderTarget(before);
  await ready;
  target.dispose();
}

/**
 * A jeweller's light box, as a prefiltered environment (metal reflections) plus a
 * cube map (what the stone refracts). "dark": black room, long softboxes (hero).
 * "light": a pale tent with a few dark flags, so metal reads bright on an ivory page (builder).
 * Every shader this needs is compiled in parallel first (see `precompile`), so building it
 * never freezes the page.
 */
export async function studio(renderer: THREE.WebGLRenderer, mood: "dark" | "light") {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16),
    new THREE.MeshBasicMaterial({ color: mood === "dark" ? 0x0b0d0c : 0xb9b2a6, side: THREE.BackSide }),
  );
  env.add(room);
  const box = (w: number, h: number, intensity: number, color: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  if (mood === "dark") {
    box(14, 2.2, 6, 0xfff3dc, [0, 9, 3]); // key strip overhead
    box(2, 10, 4, 0xffe6bf, [-9, 1, 2]); // warm side strip
    box(2, 10, 3, 0xdfe9ff, [9, 0, -1]); // cool side strip
    box(8, 4, 2.2, 0xffe2b0, [0, 1, 12]); // big warm front card: the gold reads as gold
    box(16, 5, 1.4, 0xc9a55c, [0, -9, 2]); // warm bounce from below
    box(3, 3, 9, 0xffffff, [-4, 4, -8]); // back kicker
    box(1.2, 1.2, 16, 0xffffff, [5, 6, 6]); // small hard spots: the sparkle in the stone
    box(1, 1, 14, 0xfff4e0, [-6, 5, 5]);
    box(0.8, 0.8, 14, 0xffffff, [2, 8, -6]);
  } else {
    box(16, 5, 3.4, 0xfffaf0, [0, 10, 2]); // big overhead softbox
    box(3, 12, 2.6, 0xfff1dc, [-10, 2, 3]);
    box(3, 12, 2.2, 0xf2f6ff, [10, 1, 1]);
    box(12, 6, 1.6, 0xfff6ea, [0, 2, 12]); // front fill
    box(10, 1.6, 0.04, 0x000000, [0, -1.5, 10]); // dark flags: contrast lines in the metal, dark facets in the stone
    box(1.6, 9, 0.04, 0x000000, [6, 1, -8]);
    box(1.4, 6, 0.04, 0x000000, [-7, 3, 6]);
    box(1.2, 1.2, 14, 0xffffff, [4, 7, 7]);
    box(1, 1, 12, 0xffffff, [-5, 6, 6]);
  }
  // What the stone refracts: a dark tent studded with bright panels (a few warm, a few cool),
  // so every facet lands on either light or dark. That contrast is what reads as brilliance.
  const facets = new THREE.Scene();
  facets.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 8), new THREE.MeshBasicMaterial({ color: mood === "dark" ? 0x34322e : 0x5e5a53, side: THREE.BackSide })));
  const tints = [0xffffff, 0xfff1d8, 0xffffff, 0xdfe9ff, 0xffffff, 0xffe4d6, 0xf2ffe8, 0xffffff];
  for (let i = 0; i < 64; i++) {
    const y = 1 - ((i + 0.5) / 64) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    const size = 2.4 + ((i * 7) % 5) * 0.4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color: new THREE.Color(tints[i % tints.length]).multiplyScalar(0.7 + ((i * 13) % 7) * 0.5), side: THREE.DoubleSide }));
    m.position.set(Math.cos(a) * r * 10, y * 10, Math.sin(a) * r * 10);
    m.lookAt(0, 0, 0);
    facets.add(m);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  await precompile(renderer, pmrem, [env, facets]);
  const rt = pmrem.fromScene(env, 0.02);
  pmrem.dispose();
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  cubeRT.texture.mapping = THREE.CubeRefractionMapping;
  new THREE.CubeCamera(0.1, 50, cubeRT).update(renderer, facets);
  [env, facets].forEach((sc) => sc.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    (m.material as THREE.Material | undefined)?.dispose();
  }));
  return {
    env: rt.texture,
    cube: cubeRT.texture,
    dispose() {
      rt.dispose();
      cubeRT.dispose();
    },
  };
}

/** A complete solitaire: band (axis along Z, standing up) with the head on top. */
export function buildRing(shape: Shape, tone: Tone, cube: THREE.Texture) {
  const metal = metalMaterial(tone);
  const ring = new THREE.Group();
  const band = new THREE.Mesh(bandGeometry(), metal);
  band.rotation.x = Math.PI / 2;
  ring.add(band);
  const mount = new THREE.Group();
  mount.position.y = 1.56;
  ring.add(mount);
  let head = headGroup(shape, metal);
  const stone = gemMeshes(gemGeometry(shape), cube);
  mount.add(head, stone.gem);

  return {
    ring,
    mount,
    gem: stone.gem,
    metal,
    setShape(next: Shape) {
      mount.remove(head);
      head.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      head = headGroup(next, metal);
      mount.add(head);
      stone.back.geometry.dispose();
      stone.back.geometry = stone.front.geometry = gemGeometry(next);
    },
    dispose() {
      ring.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      metal.dispose();
      stone.materials.forEach((m) => m.dispose());
    },
  };
}
