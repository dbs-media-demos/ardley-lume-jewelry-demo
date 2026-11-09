import * as THREE from "three";
import { buildRing, studio } from "./ring-kit";

/*
 * The light hero: a procedural solitaire (see ring-kit) in a dark jeweller's light
 * box, with a warm point light that follows the cursor. `setDive(p)` (0..1) flies the
 * camera into the stone, and every scroll step also spins the ring faster (the spin
 * then eases back to a slow idle turn). Frames are only drawn while the hero is on
 * screen. `still: true` draws one frame at the opening pose (for the phone image).
 */

export type RingHandle = {
  setPointer: (x: number, y: number) => void;
  setDive: (p: number) => void;
  setVisible: (v: boolean) => void;
  snapshot: () => string;
  dispose: () => void;
};

export function createRingScene(canvas: HTMLCanvasElement, opts: { still?: boolean } = {}): RingHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: !!opts.still });
  renderer.setPixelRatio(opts.still ? 2 : Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const light = studio(renderer, "dark");
  scene.environment = light.env;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
  const camStart = new THREE.Vector3(0, 0.55, 8.6);
  camera.position.copy(camStart);

  const kit = buildRing("round", "yellow", light.cube);
  const ring = kit.ring;
  scene.add(ring);
  ring.position.y = -0.62;
  ring.rotation.set(0.22, 0.5, 0);

  const glow = new THREE.PointLight(0xfff1d6, 18, 12, 1.6);
  glow.position.set(2, 2, 4);
  scene.add(glow);
  const rim = new THREE.DirectionalLight(0xffe2b0, 1.4);
  rim.position.set(-4, 3, -2);
  scene.add(rim);

  const pointer = { x: 0.3, y: -0.2, tx: 0.3, ty: -0.2 };
  let dive = 0;
  let visible = true;
  // Spin: a steady idle turn plus a velocity that scrolling pumps up and that eases off on its own.
  const IDLE_SPIN = 0.45; // rad/s
  let angle = 0.5;
  let spinVel = 0;
  let prevNow = 0;
  let raf = 0;
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

  const draw = (now: number) => {
    const t = (now - t0) / 1000;
    const dt = prevNow ? Math.min(0.05, (now - prevNow) / 1000) : 0;
    prevNow = now;
    angle += (IDLE_SPIN + spinVel) * dt;
    spinVel *= Math.pow(0.25, dt); // eases back to the idle turn over a second or two
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    ring.rotation.y = angle + pointer.x * 0.35;
    ring.rotation.x = 0.22 + pointer.y * 0.16 - dive * 0.22;
    glow.position.set(pointer.x * 5, -pointer.y * 4 + 1.5, 4);
    kit.gem.rotation.y = t * 0.15;

    // The dive: ease the camera toward the stone and narrow the lens.
    kit.mount.getWorldPosition(gemWorld);
    const e = dive * dive * (3 - 2 * dive);
    camera.position.set(
      camStart.x + (gemWorld.x - camStart.x) * e * 0.98,
      camStart.y + (gemWorld.y + 0.12 - camStart.y) * e * 0.98,
      camStart.z + (gemWorld.z + 0.34 - camStart.z) * e,
    );
    camera.lookAt(gemWorld.x * e, gemWorld.y * e + (1 - e) * 0.05, 0);
    camera.fov = 30 - e * 10;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    raf = 0;
    if (!visible) {
      prevNow = 0;
      return;
    }
    draw(now);
    raf = requestAnimationFrame(loop);
  };
  if (opts.still) draw(t0);
  else raf = requestAnimationFrame(loop);

  return {
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    setDive(p) {
      const next = Math.max(0, Math.min(1, p));
      // Scrolling spins the ring: forward when diving in, backward when scrolling back up.
      spinVel = Math.max(-2.2, Math.min(2.2, spinVel + (next - dive) * 6));
      dive = next;
    },
    setVisible(v) {
      visible = v;
      if (v && !raf && !opts.still) raf = requestAnimationFrame(loop);
    },
    snapshot() {
      draw(t0);
      return canvas.toDataURL("image/png");
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      kit.dispose();
      light.dispose();
      // Never loseContext() here: it breaks StrictMode remounts.
      renderer.dispose();
    },
  };
}
