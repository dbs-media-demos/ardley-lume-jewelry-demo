import * as THREE from "three";
import { breathe } from "@/lib/three-gate";

/*
 * The renderer both scenes start from, and their warm-up. A live scene only gets a
 * real graphics chip: `failIfMajorPerformanceCaveat` refuses a context the browser
 * would draw in software, and a software renderer that slips through anyway
 * (SwiftShader, llvmpipe, Microsoft Basic Render) is turned away too. Either way the
 * caller gets null and the still stays. Stills for the phone images (`still`) take
 * whatever GPU there is and render at 2× with a readable drawing buffer.
 */

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function gpuRenderer(canvas: HTMLCanvasElement, opts: { alpha?: boolean; still?: boolean } = {}) {
  const still = !!opts.still;
  const attrs: WebGLContextAttributes = {
    alpha: !!opts.alpha,
    antialias: true,
    depth: true,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: !still,
    preserveDrawingBuffer: still,
  };
  // Asking the canvas first (rather than letting three.js throw) keeps the console clean on machines without one.
  const gl = canvas.getContext("webgl2", attrs);
  if (!gl) return null;
  if (!still) {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
    if (SOFTWARE.test(name)) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return null;
    }
  }
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, ...attrs });
  renderer.setPixelRatio(still ? 2 : Math.min(window.devicePixelRatio, 1.5));
  return renderer;
}

/**
 * Compiles every shader the scene needs without blocking (KHR_parallel_shader_compile),
 * then draws one frame while the canvas is still invisible: that uploads the geometry and
 * builds the shadow-map programs, so the first frame anyone sees costs no more than any other.
 */
export async function warmUp(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, frame: () => void) {
  await renderer.compileAsync(scene, camera);
  await breathe();
  frame();
}

/** Drops a half-built scene when the warm-up was too slow: frees what exists and gives the GPU context back. */
export function abandon(renderer: THREE.WebGLRenderer, ...built: { dispose: () => void }[]) {
  built.forEach((b) => b.dispose());
  renderer.dispose();
  renderer.forceContextLoss();
  return null;
}

/** Calls `fn` when the tab is hidden or shown again. Returns an unsubscribe. */
export function onTabChange(fn: (hidden: boolean) => void) {
  const h = () => fn(document.hidden);
  document.addEventListener("visibilitychange", h);
  return () => document.removeEventListener("visibilitychange", h);
}
