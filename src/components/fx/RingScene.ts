import * as THREE from "three";

/*
 * The light hero: a procedural ring. A lathed comfort-fit band in a PBR gold,
 * four claws, and a faceted brilliant with physical transmission, dispersion and a
 * high IOR, lit by a room environment plus a point light that follows the cursor.
 * `setDive(p)` (0..1) flies the camera into the stone, and every scroll step
 * also spins the ring faster (the spin then eases back to a slow idle turn).
 */

export type RingHandle = {
  setPointer: (x: number, y: number) => void;
  setDive: (p: number) => void;
  setVisible: (v: boolean) => void;
  dispose: () => void;
};

/** A dark jeweller's light box: black room, a few long softboxes. High contrast = sparkle. */
function studio() {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: 0x0b0d0c, side: THREE.BackSide }));
  env.add(room);
  const box = (w: number, h: number, intensity: number, color: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  box(14, 2.2, 6, 0xfff3dc, [0, 9, 3]); // key strip overhead
  box(2, 10, 4, 0xffe6bf, [-9, 1, 2]); // warm side strip
  box(2, 10, 3, 0xdfe9ff, [9, 0, -1]); // cool side strip
  box(6, 3, 5, 0xffffff, [2, -2, 9]); // front fill
  box(3, 3, 9, 0xffffff, [-4, 4, -8]); // back kicker
  return env;
}

function bandGeometry() {
  // Cross-section of a soft D-profile band, revolved around the Y axis.
  const pts: THREE.Vector2[] = [];
  const inner = 1.0;
  const width = 0.24;
  const thick = 0.11;
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI;
    // outer dome
    pts.push(new THREE.Vector2(inner + thick * 0.35 + Math.sin(t) * thick * 0.65, -Math.cos(t) * (width / 2)));
  }
  for (let i = 0; i <= 10; i++) {
    const t = (i / 10) * Math.PI;
    // slightly rounded comfort-fit inside
    pts.push(new THREE.Vector2(inner + thick * 0.35 - Math.sin(t) * 0.035, Math.cos(t) * (width / 2)));
  }
  return new THREE.LatheGeometry(pts, 220);
}

function gemGeometry() {
  // A brilliant-ish profile: table, crown, girdle, pavilion. Few segments = visible facets.
  const r = 0.42;
  const pts = [
    new THREE.Vector2(0.0001, 0.17),
    new THREE.Vector2(r * 0.56, 0.17), // table edge
    new THREE.Vector2(r * 0.86, 0.1), // star/kite
    new THREE.Vector2(r, 0.02), // girdle top
    new THREE.Vector2(r, -0.01), // girdle bottom
    new THREE.Vector2(r * 0.55, -0.2),
    new THREE.Vector2(0.0001, -0.43), // culet
  ];
  const g = new THREE.LatheGeometry(pts, 16);
  return g.toNonIndexed();
}

export function createRingScene(canvas: HTMLCanvasElement, opts: { lowPower: boolean }): RingHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.lowPower, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lowPower ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(studio(), 0.02);
  scene.environment = envRT.texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
  const camStart = new THREE.Vector3(0, 0.1, 8.6);
  camera.position.copy(camStart);

  const ring = new THREE.Group();
  scene.add(ring);

  const gold = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#e9c27c"),
    metalness: 1,
    roughness: 0.16,
    clearcoat: 0.4,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.6,
  });

  const band = new THREE.Mesh(bandGeometry(), gold);
  band.rotation.x = Math.PI / 2; // stand the ring up: axis along Z
  ring.add(band);

  // Head: gem sitting on top of the band with four claws.
  const head = new THREE.Group();
  head.position.set(0, 1.42, 0);
  ring.add(head);

  const gem = new THREE.Mesh(
    gemGeometry(),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: opts.lowPower ? 0.0 : 1,
      thickness: 0.9,
      ior: 2.42,
      dispersion: opts.lowPower ? 0 : 4,
      envMapIntensity: opts.lowPower ? 3.6 : 3.2,
      attenuationColor: new THREE.Color("#f4fbff"),
      attenuationDistance: 2,
      specularIntensity: 1,
      flatShading: true,
      transparent: opts.lowPower,
      opacity: opts.lowPower ? 0.92 : 1,
    }),
  );
  head.add(gem);

  const clawGeo = new THREE.CylinderGeometry(0.018, 0.03, 0.3, 10);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const claw = new THREE.Mesh(clawGeo, gold);
    claw.position.set(Math.cos(a) * 0.4, -0.1, Math.sin(a) * 0.4);
    claw.lookAt(Math.cos(a) * 0.46, 0.4, Math.sin(a) * 0.46);
    claw.rotateX(Math.PI / 2);
    head.add(claw);
  }
  const basket = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 10, 48), gold);
  basket.rotation.x = Math.PI / 2;
  basket.position.y = -0.22;
  head.add(basket);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.28, 24), gold);
  stem.position.y = -0.33;
  head.add(stem);

  ring.position.y = -0.55;
  ring.rotation.set(0.3, 0.5, 0);

  const glow = new THREE.PointLight(0xfff1d6, 18, 12, 1.6);
  glow.position.set(2, 2, 4);
  scene.add(glow);
  const rim = new THREE.DirectionalLight(0xffe2b0, 1.2);
  rim.position.set(-4, 3, -2);
  scene.add(rim);

  const pointer = { x: 0.3, y: -0.2, tx: 0.3, ty: -0.2 };
  let dive = 0;
  let visible = true;
  // Spin: a steady idle turn plus a velocity that scrolling pumps up and that eases off on its own.
  const IDLE_SPIN = 0.65; // rad/s
  let angle = 0.5;
  let spinVel = 0;
  let prevNow = 0;
  let raf = 0;
  let last = 0;
  const frameMs = opts.lowPower ? 1000 / 30 : 0;
  const t0 = performance.now();
  const gemWorld = new THREE.Vector3();

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

  const render = (now: number) => {
    raf = requestAnimationFrame(render);
    if (!visible) return;
    if (frameMs && now - last < frameMs) return;
    last = now;
    const t = (now - t0) / 1000;
    const dt = prevNow ? Math.min(0.05, (now - prevNow) / 1000) : 0;
    prevNow = now;
    angle += (IDLE_SPIN + spinVel) * dt;
    spinVel *= Math.pow(0.12, dt); // loses ~88% per second once scrolling stops
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    ring.rotation.y = angle + pointer.x * 0.35;
    ring.rotation.x = 0.3 + pointer.y * 0.18 - dive * 0.3;
    glow.position.set(pointer.x * 5, -pointer.y * 4 + 1.5, 4);
    gem.rotation.y = t * 0.15;

    // The dive: ease the camera toward the stone and narrow the lens.
    head.getWorldPosition(gemWorld);
    const e = dive * dive * (3 - 2 * dive);
    camera.position.set(
      camStart.x + (gemWorld.x - camStart.x) * e * 0.98,
      camStart.y + (gemWorld.y + 0.05 - camStart.y) * e * 0.98,
      camStart.z + (gemWorld.z + 0.32 - camStart.z) * e,
    );
    camera.lookAt(gemWorld.x * e, gemWorld.y * e + (1 - e) * 0.1, 0);
    camera.fov = 32 - e * 12;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(render);

  return {
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    setDive(p) {
      const next = Math.max(0, Math.min(1, p));
      // Scrolling spins the ring: forward when diving in, backward when scrolling back up.
      spinVel = Math.max(-16, Math.min(16, spinVel + (next - dive) * 38));
      dive = next;
    },
    setVisible(v) {
      visible = v;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
      });
      gold.dispose();
      (gem.material as THREE.Material).dispose();
      envRT.dispose();
      pmrem.dispose();
      // Never loseContext() here: it breaks StrictMode remounts.
      renderer.dispose();
    },
  };
}
