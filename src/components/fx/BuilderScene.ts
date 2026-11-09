import * as THREE from "three";
import type { Shape } from "@/lib/builder";
import type { Tone } from "@/lib/commerce/types";
import { buildRing, METAL_COLOR, studio } from "./ring-kit";

/*
 * The ring builder's live preview: the same procedural solitaire as the hero, standing
 * on an ivory surface in a pale studio. Two layers of shadow ground it: a soft
 * shadow-mapped one from the key light and a contact shadow right under the band.
 * Drag to turn it (with inertia); otherwise it turns slowly while on screen. Changing
 * the stone re-seats the head; changing the metal blends the colour. `still` draws
 * single frames for the phone images (scripts/ring-stills.mjs).
 */

export type BuilderHandle = {
  set: (shape: Shape, tone: Tone) => void;
  setVisible: (v: boolean) => void;
  snapshot: (shape: Shape, tone: Tone) => string;
  dispose: () => void;
};

const BG = "#efe8dc"; // the card's bone colour

function contactTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(40,30,18,0.55)");
  grad.addColorStop(0.35, "rgba(40,30,18,0.22)");
  grad.addColorStop(1, "rgba(40,30,18,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createBuilderScene(canvas: HTMLCanvasElement, initial: { shape: Shape; tone: Tone }, opts: { still?: boolean } = {}): BuilderHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: !!opts.still });
  renderer.setPixelRatio(opts.still ? 2 : Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  const light = studio(renderer, "light");
  scene.environment = light.env;

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  camera.position.set(0.3, 1.9, 8.1);
  const target = new THREE.Vector3(0.15, 0.32, 0);
  camera.lookAt(target);

  const kit = buildRing(initial.shape, initial.tone, light.cube);
  const ring = kit.ring;
  // A diamond throws light, not a dark blot: everything but the stone casts a shadow.
  const castShadows = () => ring.traverse((o) => void ((o as THREE.Mesh).isMesh && (o.castShadow = !o.userData.gem)));
  castShadows();
  const floorY = -1.1;
  ring.position.y = 0; // band bottom (outer radius 1.1) rests on the floor at y = -1.1
  scene.add(ring);

  // Layer 1: soft key-light shadow.
  const key = new THREE.DirectionalLight(0xfff4e4, 2.2);
  key.position.set(-3.2, 6, 3.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 22;
  key.shadow.radius = 14;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 48), new THREE.ShadowMaterial({ color: 0x2a1f12, opacity: 0.22 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  floor.receiveShadow = true;
  scene.add(floor);

  // Layer 2: contact shadow where the band touches the surface.
  const contactTex = contactTexture();
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false, toneMapped: false }));
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = floorY + 0.002;
  contact.scale.set(2.3, 0.55, 1);
  scene.add(contact);

  const fill = new THREE.DirectionalLight(0xe9f0ff, 0.6);
  fill.position.set(4, 2, -2);
  scene.add(fill);

  // Turn: idle turntable + drag velocity with inertia.
  const IDLE = 0.22;
  let angle = -0.55;
  let vel = 0;
  let dragging = false;
  let lastX = 0;
  let visible = true;
  let raf = 0;
  let prev = 0;
  let seat = 1; // 0..1, re-seat animation after a stone change
  const tint = { from: new THREE.Color(METAL_COLOR[initial.tone]), to: new THREE.Color(METAL_COLOR[initial.tone]), t: 1 };
  let shape = initial.shape;
  let tone = initial.tone;

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

  const pose = (dt: number) => {
    if (!dragging) {
      angle += (IDLE + vel) * dt;
      vel *= Math.pow(0.12, dt);
    }
    ring.rotation.y = angle;
    if (seat < 1) seat = Math.min(1, seat + dt * 1.6);
    const e = 1 - Math.pow(1 - seat, 3);
    kit.mount.scale.setScalar(0.82 + 0.18 * e);
    kit.mount.position.y = 1.56 + (1 - e) * 0.18;
    if (tint.t < 1) {
      tint.t = Math.min(1, tint.t + dt * 2.2);
      kit.metal.color.copy(tint.from).lerp(tint.to, tint.t);
    }
    // The contact shadow lies along the band's footprint and turns with it.
    contact.rotation.z = angle;
  };

  const loop = (now: number) => {
    raf = 0;
    if (!visible) {
      prev = 0;
      return;
    }
    const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0;
    prev = now;
    pose(dt);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };

  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    vel = 0;
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    angle += dx * 0.012;
    vel = (dx * 0.012) / 0.016 - IDLE;
  };
  const onUp = (e: PointerEvent) => {
    dragging = false;
    vel = Math.max(-6, Math.min(6, vel));
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  if (!opts.still) {
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    raf = requestAnimationFrame(loop);
  }

  const apply = (nextShape: Shape, nextTone: Tone, animate: boolean) => {
    if (nextShape !== shape) {
      kit.setShape(nextShape);
      castShadows();
      shape = nextShape;
      seat = animate ? 0 : 1;
      if (animate) vel += 2.4; // a little flourish as the new stone settles
    }
    if (nextTone !== tone) {
      tone = nextTone;
      tint.from.copy(kit.metal.color);
      tint.to.set(METAL_COLOR[nextTone]);
      kit.metal.roughness = nextTone === "white" ? 0.1 : 0.13;
      tint.t = animate ? 0 : 1;
      if (!animate) kit.metal.color.copy(tint.to);
    }
  };

  return {
    set(nextShape, nextTone) {
      apply(nextShape, nextTone, true);
    },
    setVisible(v) {
      visible = v;
      if (v && !raf && !opts.still) raf = requestAnimationFrame(loop);
    },
    snapshot(nextShape, nextTone) {
      apply(nextShape, nextTone, false);
      angle = -0.55;
      vel = 0;
      seat = 1;
      pose(0);
      renderer.render(scene, camera);
      return canvas.toDataURL("image/png");
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      kit.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      contact.geometry.dispose();
      (contact.material as THREE.Material).dispose();
      contactTex.dispose();
      light.dispose();
      renderer.dispose();
    },
  };
}
