import * as THREE from "three";
import { breathe } from "@/lib/three-gate";
import { abandon, gpuRenderer, onTabChange, warmUp } from "./gpu";
import { GEM_R, centre, gemGeometry, gemMeshes, metalMaterial, outline, studio } from "./ring-kit";

/*
 * The light hero: the Lume Drop, a pear diamond in a pavé halo, hanging from a bail on a
 * fine cable chain in a dark jeweller's light box. Everything is built from primitives (the
 * stones from ring-kit), no model files.
 * - Alive untouched: the necklace settles on its chain, the pendant turns slowly on its bail,
 *   and every few seconds a light sweeps across the gold and the stones (the studio's light box
 *   turns), setting off glints across the halo.
 * - The pointer: the pendant leans and turns toward it, swings when the mouse moves fast, and a
 *   warm light follows it. Scrolling turns it on its bail and sends a sweep over it.
 * - `setDive(p)` (0..1) flies the camera into the pear stone (the hero's scroll scene).
 * It resolves once warmed up (shaders compiled, one frame drawn unseen), or to null without a
 * real graphics chip, or when `proceed()` turns false during the warm-up (the page stuttered).
 * Frames are only drawn while `setVisible(true)` and the tab is shown; `onGap` hears each
 * frame's gap in ms. `still: true` draws the opening pose once (for the phone image).
 */

export type PendantHandle = {
  setPointer: (x: number, y: number) => void;
  setDive: (p: number) => void;
  setVisible: (v: boolean) => void;
  snapshot: () => string;
  /** Freezes on the current frame (before fading back to the still). */
  stop: () => void;
  /** `release` also gives the GPU context back (only when 3D is off for the visit). */
  dispose: (release?: boolean) => void;
};

const S = 1.46; // the pear's scale: about 1.5 units tall, a 3 ct look
const HALO_D = 0.112; // halo stone centres, outside the pear's girdle
const HALO_R = 0.064; // halo stone radius
const SWEEP_EVERY = 7.5; // s between light sweeps

/** The pear's girdle in the pendant's plane (point up, table facing the camera). */
function pearAt(u: number): THREE.Vector2 {
  const [ox, oz] = outline("pear", u);
  return new THREE.Vector2(-ox * GEM_R * S, oz * GEM_R * S);
}

/** Points along the halo line, spaced evenly by length. */
function haloPoints(n: number, d: number) {
  const c = centre("pear");
  const mid = new THREE.Vector2(-c[0] * GEM_R * S, c[1] * GEM_R * S);
  const M = 480;
  const raw: THREE.Vector2[] = [];
  for (let i = 0; i < M; i++) {
    const p = pearAt(i / M);
    const t = pearAt((i + 1) / M).sub(pearAt((i - 1 + M) / M));
    const nrm = new THREE.Vector2(t.y, -t.x).normalize();
    if (nrm.dot(p.clone().sub(mid)) < 0) nrm.negate();
    raw.push(p.add(nrm.multiplyScalar(d)));
  }
  const acc = [0];
  for (let i = 1; i <= M; i++) acc.push(acc[i - 1] + raw[i % M].distanceTo(raw[i - 1]));
  const total = acc[M];
  const count = n > 0 ? n : Math.round(total / -n);
  const out: THREE.Vector2[] = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const want = (k / count) * total;
    while (acc[j + 1] < want) j++;
    const f = (want - acc[j]) / (acc[j + 1] - acc[j] || 1);
    out.push(raw[j].clone().lerp(raw[(j + 1) % M], f));
  }
  return { pts: out, total, mid };
}

/** A four-point star with a soft core: the glint a facet throws when it catches the light. */
function starTexture() {
  const s = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const g = cv.getContext("2d")!;
  const h = s / 2;
  const core = g.createRadialGradient(h, h, 0, h, h, h);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(0.08, "rgba(255,250,235,0.9)");
  core.addColorStop(0.25, "rgba(255,236,200,0.18)");
  core.addColorStop(1, "rgba(255,236,200,0)");
  g.fillStyle = core;
  g.fillRect(0, 0, s, s);
  const ray = (len: number, w: number, a: number, alpha: number) => {
    g.save();
    g.translate(h, h);
    g.rotate(a);
    const lg = g.createLinearGradient(-len, 0, len, 0);
    lg.addColorStop(0, "rgba(255,255,255,0)");
    lg.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
    lg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = lg;
    g.beginPath();
    g.moveTo(-len, 0);
    g.quadraticCurveTo(0, -w, len, 0);
    g.quadraticCurveTo(0, w, -len, 0);
    g.fill();
    g.restore();
  };
  ray(h, 2.4, 0, 1);
  ray(h, 2.4, Math.PI / 2, 1);
  ray(h * 0.45, 1.6, Math.PI / 4, 0.55);
  ray(h * 0.45, 1.6, -Math.PI / 4, 0.55);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** The pendant's soft shadow on the velvet behind it: its silhouette, blurred. */
function shadowTexture(halo: THREE.Vector2[], box: THREE.Box2) {
  const s = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const g = cv.getContext("2d")!;
  const size = box.getSize(new THREE.Vector2());
  const k = (s * 0.62) / Math.max(size.x, size.y);
  const cx = (box.min.x + box.max.x) / 2;
  const cy = (box.min.y + box.max.y) / 2;
  // Drawn off the canvas; only its blurred shadow lands on it (shadowBlur works everywhere).
  g.shadowColor = "rgba(0,0,0,0.9)";
  g.shadowBlur = 22;
  g.shadowOffsetX = s * 2;
  g.beginPath();
  halo.forEach((p, i) => {
    const x = s / 2 + (p.x - cx) * k - s * 2;
    const y = s / 2 - (p.y - cy) * k;
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
  });
  g.closePath();
  g.fillStyle = "#000";
  g.fill();
  const tex = new THREE.CanvasTexture(cv);
  return { tex, worldSize: s / k };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export async function createPendantScene(
  canvas: HTMLCanvasElement,
  opts: { still?: boolean; onGap?: (ms: number) => void; proceed?: () => boolean } = {},
): Promise<PendantHandle | null> {
  const go = () => !opts.proceed || opts.proceed();
  const renderer = gpuRenderer(canvas, { alpha: true, still: opts.still });
  if (!renderer) return null;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  await breathe();
  if (!go()) return abandon(renderer);
  const scene = new THREE.Scene();
  const light = await studio(renderer, "dark", true);
  await breathe();
  if (!go()) return abandon(renderer, light);
  scene.environment = light.env;

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);
  const metal = keep(metalMaterial("yellow"));

  // ---- The pendant, built around its pivot (where the chain runs through the bail) ----
  const halo = haloPoints(-(HALO_R * 2.18), HALO_D);
  const box = new THREE.Box2().setFromPoints(halo.pts);
  const topY = box.max.y + HALO_R;
  const jumpY = topY + 0.045;
  const bailY = jumpY + 0.13;
  const PIVOT = bailY + 0.06;

  const necklace = new THREE.Group(); // chain + pendant: settles on entrance
  scene.add(necklace);
  const swing = new THREE.Group(); // turns on the bail, sways like a pendulum
  swing.rotation.order = "ZXY";
  swing.position.y = PIVOT;
  necklace.add(swing);
  const body = new THREE.Group();
  body.position.y = -PIVOT;
  swing.add(body);

  // Pear: ring-kit's stone (table up, point at +z) turned to face the camera, point up.
  const pearGeo = keep(gemGeometry("pear", true));
  const pear = gemMeshes(pearGeo, light.cube);
  pear.materials.forEach(keep);
  const pearTilt = new THREE.Group();
  pearTilt.rotation.x = Math.PI / 2;
  pearTilt.scale.setScalar(S);
  pearTilt.add(pear.gem);
  const pearTurn = new THREE.Group();
  pearTurn.rotation.z = Math.PI;
  pearTurn.add(pearTilt);
  body.add(pearTurn);
  const pearMid = new THREE.Object3D();
  pearMid.position.set(halo.mid.x, halo.mid.y, 0.05);
  body.add(pearMid);

  // Halo: round brilliants on a gold seat, instanced (two draws for every stone at once).
  const roundGeo = keep(gemGeometry("round"));
  const small = gemMeshes(roundGeo, light.cube);
  small.materials.forEach(keep);
  // Pavé this small reads as glitter: lift what it refracts so no stone ever goes black.
  (small.materials[0] as THREE.MeshBasicMaterial).color.setScalar(2.3);
  (small.materials[1] as THREE.MeshPhysicalMaterial).envMapIntensity = 4.6;
  const n = halo.pts.length;
  const haloBack = new THREE.InstancedMesh(roundGeo, small.materials[0], n);
  const haloFront = new THREE.InstancedMesh(roundGeo, small.materials[1], n);
  haloFront.renderOrder = 1;
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  const k = HALO_R / GEM_R;
  halo.pts.forEach((p, i) => {
    // Each stone turned a little differently, so their facets never flash in step.
    const qi = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), i * 0.7));
    m4.compose(new THREE.Vector3(p.x, p.y, 0.022), qi, new THREE.Vector3(k, k, k));
    haloBack.setMatrixAt(i, m4);
    haloFront.setMatrixAt(i, m4);
  });
  body.add(haloBack, haloFront);

  const loop3 = (pts: THREE.Vector2[], z: number) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p.x, p.y, z)), true, "centripetal");
  const tube = (pts: THREE.Vector2[], z: number, r: number) => {
    const mesh = new THREE.Mesh(keep(new THREE.TubeGeometry(loop3(pts, z), 360, r, 10, true)), metal);
    body.add(mesh);
    return mesh;
  };
  tube(halo.pts, -0.07, HALO_R * 1.04).scale.z = 0.5; // the seat the halo stones sit in: a flat bezel, clean side-on
  tube(haloPoints(160, HALO_D + HALO_R * 0.98).pts, 0.0, 0.016); // outer rim
  tube(haloPoints(160, HALO_D - HALO_R - 0.008).pts, -0.012, 0.014); // inner rim, framing the pear

  // The basket behind the pear (what you see side-on): two rails and five struts down to the culet.
  const at = (u: number, sc: number) => pearAt(u).lerp(halo.mid, 1 - sc);
  const ring = (sc: number, z: number, r: number) => tube(Array.from({ length: 96 }, (_, i) => at(i / 96, sc)), z, r);
  ring(0.8, -0.19, 0.018);
  ring(0.42, -0.37, 0.016);
  for (const u of [0.0, 0.2, 0.4, 0.6, 0.8]) {
    const v = (sc: number, z: number) => {
      const p = at(u + 0.1, sc);
      return new THREE.Vector3(p.x, p.y, z);
    };
    const strut = new THREE.CatmullRomCurve3([v(1.12, -0.05), v(0.8, -0.2), v(0.42, -0.37), v(0.12, -0.5)]);
    body.add(new THREE.Mesh(keep(new THREE.TubeGeometry(strut, 24, 0.015, 8, false)), metal));
  }

  // Beads between the halo stones (inside and out), and the pear's three claws.
  const beadGeo = keep(new THREE.SphereGeometry(1, 12, 8));
  const outer = haloPoints(n * 2, HALO_D + HALO_R * 0.78).pts.filter((_, i) => i % 2 === 1);
  const inner = haloPoints(n * 2, HALO_D - HALO_R * 0.78).pts.filter((_, i) => i % 2 === 1);
  const beads = new THREE.InstancedMesh(beadGeo, metal, outer.length + inner.length + 3);
  let bi = 0;
  const bead = (x: number, y: number, z: number, r: number, sy = 1) => beads.setMatrixAt(bi++, m4.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(r, r * sy, r * 0.8)));
  outer.forEach((p) => bead(p.x, p.y, 0.05, 0.017));
  inner.forEach((p) => bead(p.x, p.y, 0.05, 0.015));
  const tip = pearAt(0);
  bead(tip.x, tip.y - 0.015, 0.06, 0.04, 1.5); // the V claw guarding the point
  for (const u of [0.36, 0.64]) {
    const p = pearAt(u);
    bead(p.x, p.y, 0.055, 0.036);
  }
  beads.count = bi;
  body.add(beads);

  // Jump ring and bail.
  const jump = new THREE.Mesh(keep(new THREE.TorusGeometry(0.055, 0.016, 12, 40)), metal);
  jump.position.set(0, jumpY, 0);
  body.add(jump);
  const bail = new THREE.Mesh(keep(new THREE.TorusGeometry(0.1, 0.026, 14, 48)), metal);
  bail.position.set(0, bailY, 0);
  bail.rotation.y = Math.PI / 2;
  bail.scale.set(1, 1.18, 1);
  body.add(bail);

  // ---- The chain: a fine cable chain in a V, up and back around an unseen neck ----
  const linkGeo = keep(new THREE.TorusGeometry(0.021, 0.0062, 6, 16));
  const strands = [-1, 1].map(
    (sx) =>
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(sx * 0.012, PIVOT, 0),
        new THREE.Vector3(sx * 0.42, PIVOT + 0.95, -0.05),
        new THREE.Vector3(sx * 1.55, PIVOT + 2.2, -0.9),
        new THREE.Vector3(sx * 2.05, PIVOT + 3.6, -2.2),
      ),
  );
  const PITCH = 0.044;
  const counts = strands.map((c) => Math.floor(c.getLength() / PITCH));
  const chain = new THREE.InstancedMesh(linkGeo, metal, counts[0] + counts[1]);
  {
    let li = 0;
    const T = new THREE.Vector3();
    const N = new THREE.Vector3();
    const B = new THREE.Vector3();
    const Z = new THREE.Vector3(0, 0, 1);
    strands.forEach((curve, si) => {
      for (let i = 0; i < counts[si]; i++) {
        const u = (i + 0.5) / counts[si];
        const pos = curve.getPointAt(u);
        curve.getTangentAt(u, T);
        N.crossVectors(T, Z).normalize();
        B.crossVectors(T, N).normalize();
        const x = i % 2 ? B : N;
        const z = new THREE.Vector3().crossVectors(x, T);
        m4.makeBasis(x, T, z).scale(new THREE.Vector3(1, 1.6, 1)).setPosition(pos);
        chain.setMatrixAt(li++, m4);
      }
    });
  }
  necklace.add(chain);

  // ---- Soft shadow on the velvet, and the glints ----
  const sh = shadowTexture(halo.pts, box);
  keep(sh.tex);
  const shadowMat = keep(new THREE.MeshBasicMaterial({ map: sh.tex, transparent: true, depthWrite: false, opacity: 0.5, color: 0x000000, toneMapped: false }));
  const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(sh.worldSize, sh.worldSize)), shadowMat);
  shadow.renderOrder = -1;
  necklace.add(shadow);

  const star = keep(starTexture());
  type Glint = { sprite: THREE.Sprite; size: number; a: number; b: number; w: number; ph: number };
  const glints: Glint[] = [];
  const glint = (x: number, y: number, z: number, size: number, i: number) => {
    const mat = keep(new THREE.SpriteMaterial({ map: star, color: 0xfff6e8, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true, toneMapped: false }));
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.renderOrder = 3;
    sprite.visible = false;
    body.add(sprite);
    // How this facet answers the turn of the pendant (a) and of the light (b): a different mix for each.
    glints.push({ sprite, size, a: 2.2 + ((i * 1.7) % 3.1), b: 1.6 + ((i * 2.3) % 2.6), w: 0.1 + ((i * 0.37) % 0.3), ph: i * 2.399 });
  };
  [0.08, 0.22, 0.4, 0.6, 0.78, 0.92].forEach((u, i) => {
    const p = pearAt(u).lerp(halo.mid, 0.42 + (i % 2) * 0.22);
    glint(p.x, p.y, 0.24, 0.62, i);
  });
  halo.pts.forEach((p, i) => i % 3 === 1 && glint(p.x, p.y, 0.06, 0.34, i + 7));

  // ---- Lights and camera ----
  const glow = new THREE.PointLight(0xfff1d6, 14, 12, 1.6);
  glow.position.set(2, 2, 4);
  scene.add(glow);
  const rim = new THREE.DirectionalLight(0xffe2b0, 1.2);
  rim.position.set(-4, 3, -2);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
  const camStart = new THREE.Vector3(0, 0.12, 8.6);
  const lookStart = new THREE.Vector3(0, 0.12, 0);
  camera.position.copy(camStart);

  // ---- Motion state ----
  const pointer = { x: 0.3, y: -0.2, tx: 0.3, ty: -0.2, px: 0.3 };
  let dive = 0;
  let visible = false;
  let stopped = false;
  let prevNow = 0;
  let raf = 0;
  let shown = -1; // time of the first frame anyone saw (s), for the entrance
  let clock = 0; // seconds drawn
  // Swivel on the bail (θ) and pendulum sway (φ): damped springs that pointer and scroll can kick.
  let th = -0.55;
  let thV = 0.25;
  let ph = 0;
  let phV = 0;
  let envA = -1.1; // the light box's turn: slow drift plus sweeps
  let boost = 0;
  const midW = new THREE.Vector3();

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  /** Where everything is at `t` seconds after the pendant first showed; `dt` steps the springs. */
  const pose = (t: number, dt: number) => {
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3.2);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3.2);
    const pv = dt ? Math.max(-6, Math.min(6, (pointer.x - pointer.px) / dt)) : 0;
    pointer.px = pointer.x;

    // The slow turn: about 30° either way every 12 s, leaning toward the pointer.
    const thT = Math.sin(t * ((Math.PI * 2) / 12)) * 0.5 + pointer.x * 0.38;
    thV += (-(th - thT) * 1.3 - thV * 1.1 + pv * 0.18) * dt;
    th += thV * dt;
    phV += (-ph * 5.5 - phV * 1.6 - pv * 0.05) * dt;
    ph += phV * dt;

    // The light: a slow drift, and every few seconds a sweep (the first just after it shows).
    const cyc = (t - 0.9 + SWEEP_EVERY) % SWEEP_EVERY;
    const sweep = Math.exp(-((cyc - 0.8) ** 2) / 0.18);
    envA += (0.07 + sweep * 1.35 + boost) * dt;
    boost *= Math.pow(0.2, dt);

    // Entrance: the necklace drops the last few millimetres onto its chain and settles.
    necklace.position.y = 0.32 * Math.exp(-2.6 * t) * Math.cos(4.4 * t) - dive * 0.04;
    swing.rotation.set(-0.06 + pointer.y * 0.1, th, ph * 0.6 - pointer.x * 0.03);

    const ry = envA + pointer.x * 0.5;
    scene.environmentRotation.set(pointer.y * 0.2, ry, 0);
    small.materials[0].envMapRotation.set(pointer.y * 0.2, ry, 0);
    pear.materials[0].envMapRotation.set(pointer.y * 0.2, ry * 1.4, 0);
    glow.position.set(pointer.x * 5, -pointer.y * 4 + 1.5, 4);

    // Glints: a facet flashes when the pendant's turn and the light's line up for it.
    const facing = smooth(0.35, 0.8, Math.cos(th));
    for (const g of glints) {
      const c = Math.cos(th * g.a + envA * g.b + t * g.w + g.ph);
      const v = c > 0.9 ? Math.pow((c - 0.9) / 0.1, 3) * facing * (1 - dive) : 0;
      g.sprite.visible = v > 0.01;
      if (!g.sprite.visible) continue;
      g.sprite.scale.setScalar(g.size * (0.35 + 0.65 * v));
      g.sprite.material.opacity = Math.min(1, v * 1.4);
      g.sprite.material.rotation = th * 0.4 + g.ph;
    }

    // The shadow follows the pendant, narrowing as it turns side-on.
    pearMid.getWorldPosition(midW);
    shadow.position.set(midW.x + 0.32, midW.y - 0.36 - necklace.position.y, -1.4);
    shadow.scale.set(0.3 + 0.7 * Math.abs(Math.cos(th)), 1, 1);
    shadowMat.opacity = 0.5 * (1 - dive);

    // The dive: ease the camera into the stone and narrow the lens.
    const e = dive * dive * (3 - 2 * dive);
    camera.position.set(camStart.x + (midW.x - camStart.x) * e * 0.98, camStart.y + (midW.y - camStart.y) * e * 0.98, camStart.z + (midW.z + 0.7 - camStart.z) * e);
    camera.lookAt(lookStart.x + (midW.x - lookStart.x) * e, lookStart.y + (midW.y - lookStart.y) * e, 0);
    camera.fov = 30 - e * 9;
    camera.updateProjectionMatrix();
  };

  const draw = (now: number) => {
    const dt = prevNow ? Math.min(0.05, (now - prevNow) / 1000) : 0;
    prevNow = now;
    clock += dt;
    if (shown < 0) shown = clock;
    pose(clock - shown, dt);
    renderer.render(scene, camera);
  };

  /** The opening frame, settled (warm-up and the stills): a three-quarter turn with a few glints lit. */
  const drawStill = () => {
    th = 0.32;
    thV = 0;
    ph = phV = 0;
    envA = 0.55;
    boost = 0;
    pointer.x = pointer.tx = pointer.px = 0.25;
    pointer.y = pointer.ty = -0.15;
    pose(6, 0);
    // A still can't twinkle: light a few glints so it never looks dead.
    [1, 4, 9, 13].forEach((i, j) => {
      const g = glints[i];
      if (!g) return;
      const v = [0.85, 0.5, 0.7, 0.45][j];
      g.sprite.visible = true;
      g.sprite.scale.setScalar(g.size * (0.35 + 0.65 * v));
      g.sprite.material.opacity = v;
    });
    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    raf = 0;
    if (!visible || stopped || document.hidden) {
      prevNow = 0;
      return;
    }
    const gap = prevNow ? now - prevNow : 0;
    draw(now);
    opts.onGap?.(gap);
    raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (visible && !stopped && !raf && !opts.still && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const offTab = onTabChange((hidden) => {
    if (!hidden) return kick();
    cancelAnimationFrame(raf);
    raf = 0;
    prevNow = 0;
  });

  await warmUp(renderer, scene, camera, drawStill);
  // The live scene starts from its entrance pose; the first frame anyone sees starts the clock.
  th = -0.55;
  thV = 0.25;
  envA = -1.1;
  prevNow = 0;

  const handle: PendantHandle = {
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    setDive(p) {
      const next = Math.max(0, Math.min(1, p));
      // Scrolling turns the pendant on its bail (back again on the way up) and sends the light across it.
      thV = Math.max(-2.4, Math.min(2.4, thV + (next - dive) * 7));
      boost = Math.min(3, boost + Math.abs(next - dive) * 9);
      dive = next;
    },
    setVisible(v) {
      visible = v;
      kick();
    },
    snapshot() {
      drawStill();
      return canvas.toDataURL("image/png");
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      raf = 0;
    },
    dispose(release) {
      stopped = true;
      cancelAnimationFrame(raf);
      offTab();
      ro.disconnect();
      haloBack.dispose();
      haloFront.dispose();
      beads.dispose();
      chain.dispose();
      disposables.forEach((d) => d.dispose());
      light.dispose();
      renderer.dispose();
      // Only when 3D is off for the visit: on a plain unmount it would break StrictMode remounts.
      if (release) renderer.forceContextLoss();
    },
  };
  if (!go()) {
    handle.dispose(true);
    return null;
  }
  return handle;
}
