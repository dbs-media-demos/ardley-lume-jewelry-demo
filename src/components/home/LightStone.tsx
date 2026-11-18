"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EDGES, EXIT, FACES, FACE_TINT, SPECTRUM, STONE, project, trace, type Ray } from "@/components/fx/brilliant";
import { afterLoad, prefersReducedMotion } from "@/lib/motion";

const DEG = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * The live half of the /v2 hero, canvas 2D only (desktop, no reduced motion). Once the
 * page has loaded and the CSS drawing of the stone has finished, the canvas takes over
 * from it, frame-identical: the stone turns, the light follows the cursor (the readout
 * is the real share of light the cut sends back up), and the first scroll swings the
 * light and turns the stone while the photo eases in. It stops off screen, and if the
 * first two seconds run slow it simply stays on the last frame.
 */
export function LightStone({ returned, children }: { returned: number; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv || prefersReducedMotion() || !window.matchMedia("(min-width: 1024px)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const hero = document.getElementById("hero");
    const photo = hero?.querySelector<HTMLElement>("[data-hero-photo]");

    let w = 0;
    let h = 0;
    let dpr = 1;
    const size = () => {
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();

    // Light from the cursor: left of the stone lights it from the upper left, and so on.
    let alphaT = STONE.alpha;
    let tiltT = STONE.tilt;
    let alpha = alphaT;
    let tilt = tiltT;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const sx = r.left + r.width * STONE.x;
      alphaT = clamp(((sx - e.clientX) / (window.innerWidth * 0.5)) * 22, -26, 26) * DEG;
      tiltT = (STONE.tilt / DEG + (e.clientY / window.innerHeight - 0.5) * 8) * DEG;
    };

    let raf = 0;
    let t0 = 0;
    let onScreen = true;
    let running = false;
    let shownPct = returned;
    let eased = returned;
    let target = returned;
    let frame = 0;
    let frames = 0;
    let slowFrames = 0;
    let last = 0;
    let gaveUp = false;
    let lastScroll = -1;

    const tick = (now: number) => {
      raf = 0;
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;
      // The first two seconds are watched: a machine that can't keep up keeps this frame.
      if (last && t < 2.4) {
        frames++;
        if (now - last > 34) slowFrames++;
        if (t > 2 && slowFrames / frames > 0.3) {
          gaveUp = true;
          performance.mark("light:slow");
        }
      }
      last = now;
      const s = clamp(window.scrollY / window.innerHeight, 0, 1);
      alpha += (alphaT - s * 24 * DEG - alpha) * 0.06;
      tilt += (tiltT - tilt) * 0.06;
      const a = alpha + 6 * DEG * Math.sin(t * 0.45);
      const phi = t * 0.2 + s * 2.4;
      const tr = trace(a);
      draw(ctx, w, h, dpr, t, phi, a, tilt, tr.rays);
      // The readout: a finer trace (48 rays) every few frames, eased so it counts rather than jumps.
      if (frame++ % 4 === 0) target = trace(a, 48).returned * 100;
      eased += (target - eased) * 0.12;
      const pct = Math.round(eased);
      if (pct !== shownPct && readout.current) readout.current.textContent = `${(shownPct = pct)}%`;
      if (s !== lastScroll) {
        lastScroll = s;
        el.style.transform = s ? `translate3d(0, ${(s * 16).toFixed(2)}%, 0)` : "";
        if (photo) photo.style.transform = s ? `scale(${(1 + s * 0.1).toFixed(4)})` : "";
        if (cue.current) cue.current.style.opacity = s ? String(Math.max(0, 1 - s * 4)) : "";
      }
      if (gaveUp) {
        running = false;
        return;
      }
      if (running) raf = requestAnimationFrame(tick);
    };
    const play = () => {
      if (running || gaveUp || !onScreen || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) play();
      else pause();
    });
    const onVis = () => (document.hidden ? pause() : play());

    let fadeTimer = 0;
    // After load and idle, and never before the CSS drawing has finished (~2.4 s in).
    const cancel = afterLoad(() => {
      fadeTimer = window.setTimeout(
        () => {
          size();
          draw(ctx, w, h, dpr, 0, 0, alpha, tilt, trace(alpha).rays);
          setLive(true);
          performance.mark("light:live");
          window.addEventListener("pointermove", onMove, { passive: true });
          document.addEventListener("visibilitychange", onVis);
          if (hero) io.observe(hero);
          play();
        },
        Math.max(0, 2400 - performance.now()),
      );
    }, 1500);

    return () => {
      cancel();
      window.clearTimeout(fadeTimer);
      pause();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      el.style.transform = "";
      if (photo) photo.style.transform = "";
    };
    // `returned` is only the server's first figure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={root} className="absolute inset-0 [--r:min(22cqw,20cqh)] max-lg:hidden">
      <div className={`absolute inset-0 transition-opacity duration-[1.2s] ${live ? "opacity-0" : "opacity-100"}`}>{children}</div>
      <canvas ref={canvas} className={`absolute inset-0 size-full transition-opacity duration-[1.2s] ${live ? "opacity-100" : "opacity-0"}`} />
      <div ref={cue} className="absolute bottom-[7.5rem] flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/70" style={{ left: `${STONE.x * 100}%` }}>
        <span className="eyebrow motion-reduce:hidden">Move the light</span>
        <span className="spec text-[0.68rem] whitespace-nowrap text-gold-pale/80">
          Ideal cut · <span ref={readout}>{returned}%</span> of the light returned through the top
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ drawing */

function glint(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, a: number) {
  if (a <= 0.01 || size <= 0.5) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, size);
  g.addColorStop(0, `rgba(255,252,240,${a})`);
  g.addColorStop(0.25, `rgba(255,236,190,${a * 0.35})`);
  g.addColorStop(1, "rgba(255,236,190,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - size, y - size, size * 2, size * 2);
  ctx.strokeStyle = `rgba(255,250,235,${a * 0.8})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 1.6, y);
  ctx.lineTo(x + size * 1.6, y);
  ctx.moveTo(x, y - size * 1.6);
  ctx.lineTo(x, y + size * 1.6);
  ctx.stroke();
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number, t: number, phi: number, alpha: number, tilt: number, rays: Ray[]) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, w, h);
  const R = Math.min(w * STONE.rw, h * STONE.rh);
  const cx = w * STONE.x;
  const cy = h * STONE.y;
  const ct = Math.cos(tilt);
  const X = (x: number) => cx + x * R;
  const Y = (y: number) => cy - y * ct * R; // the light's cross-section (y up)
  const { pts, normals, front } = project(phi, tilt);
  const SX = (i: number) => cx + pts[i][0] * R;
  const SY = (i: number) => cy + pts[i][1] * R;

  // Halo
  const glow = ctx.createRadialGradient(cx, cy - 0.1 * R, 0, cx, cy - 0.1 * R, 2.6 * R);
  glow.addColorStop(0, "rgba(232,214,168,0.2)");
  glow.addColorStop(1, "rgba(232,214,168,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 2.6 * R, cy - 2.7 * R, 5.2 * R, 5.2 * R);

  // Light from the source (toward it) and the half-vector to the eye, for facet flashes.
  const lx = -Math.sin(alpha);
  const ly = Math.cos(alpha);
  const lz = 0.45;
  const ll = Math.hypot(lx, ly, lz);
  let hx = lx / ll;
  let hy = ly / ll;
  let hz = lz / ll + 1;
  const hl = Math.hypot(hx, hy, hz);
  hx /= hl;
  hy /= hl;
  hz /= hl;
  const face = (fi: number) => {
    const f = FACES[fi];
    ctx.beginPath();
    ctx.moveTo(SX(f[0]), SY(f[0]));
    for (let j = 1; j < f.length; j++) ctx.lineTo(SX(f[j]), SY(f[j]));
    ctx.closePath();
  };
  const flashes: [number, number, number][] = [];

  // Far facets, seen through the stone.
  for (let i = 0; i < FACES.length; i++) {
    if (front[i]) continue;
    const n = normals[i];
    const spec = Math.pow(Math.max(0, -(n[0] * hx + n[1] * hy + n[2] * hz)), 14);
    if (spec < 0.02) continue;
    face(i);
    ctx.fillStyle = `rgba(255,240,210,${(0.18 * spec).toFixed(3)})`;
    ctx.fill();
  }
  ctx.beginPath();
  for (const e of EDGES) {
    if (e.faces.some((fi) => front[fi])) continue;
    ctx.moveTo(SX(e.a), SY(e.a));
    ctx.lineTo(SX(e.b), SY(e.b));
  }
  ctx.strokeStyle = "rgba(232,214,168,0.16)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.globalCompositeOperation = "lighter";
  // The incoming beam: a soft shaft, then each ray.
  const ins = rays.filter((r) => r.path.length > 1);
  if (ins.length > 1) {
    const a0 = ins[0].path;
    const a1 = ins[ins.length - 1].path;
    const shaft = ctx.createLinearGradient(X(a0[0][0]), Y(a0[0][1]), X(a0[1][0]), Y(a0[1][1]));
    shaft.addColorStop(0, "rgba(255,240,205,0)");
    shaft.addColorStop(1, "rgba(255,240,205,0.07)");
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(X(a0[0][0]), Y(a0[0][1]));
    ctx.lineTo(X(a1[0][0]), Y(a1[0][1]));
    ctx.lineTo(X(a1[1][0]), Y(a1[1][1]));
    ctx.lineTo(X(a0[1][0]), Y(a0[1][1]));
    ctx.closePath();
    ctx.fill();
  }
  ctx.lineWidth = 1;
  for (const r of ins) {
    const [o, e] = r.path;
    const g = ctx.createLinearGradient(X(o[0]), Y(o[1]), X(e[0]), Y(e[1]));
    g.addColorStop(0, "rgba(255,244,214,0)");
    g.addColorStop(1, "rgba(255,244,214,0.38)");
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(X(o[0]), Y(o[1]));
    ctx.lineTo(X(e[0]), Y(e[1]));
    ctx.stroke();
  }
  // Inside: the bounces, with a soft bloom.
  const inside = () => {
    ctx.beginPath();
    for (const r of ins) {
      ctx.moveTo(X(r.path[1][0]), Y(r.path[1][1]));
      for (let j = 2; j < r.path.length; j++) ctx.lineTo(X(r.path[j][0]), Y(r.path[j][1]));
    }
  };
  inside();
  ctx.strokeStyle = "rgba(255,226,160,0.07)";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,244,214,0.5)";
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // Near facets: the mosaic, the flashes as the stone turns, then the edges.
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < FACES.length; i++) {
    if (!front[i]) continue;
    const n = normals[i];
    const spec = Math.pow(Math.max(0, n[0] * hx + n[1] * hy + n[2] * hz), 26);
    face(i);
    ctx.fillStyle = `rgba(201,165,92,${FACE_TINT[i].toFixed(3)})`;
    ctx.fill();
    if (spec > 0.04) {
      ctx.fillStyle = `rgba(255,248,230,${(0.5 * spec).toFixed(3)})`;
      ctx.fill();
      if (spec > 0.45) {
        const f = FACES[i];
        let mx = 0;
        let my = 0;
        for (const v of f) {
          mx += SX(v) / f.length;
          my += SY(v) / f.length;
        }
        flashes.push([mx, my, spec]);
      }
    }
  }
  ctx.beginPath();
  for (const e of EDGES) {
    if (!e.faces.some((fi) => front[fi])) continue;
    ctx.moveTo(SX(e.a), SY(e.a));
    ctx.lineTo(SX(e.b), SY(e.b));
  }
  ctx.strokeStyle = "rgba(232,214,168,0.62)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // What comes back out: fire through the crown, a little leak through the pavilion.
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 1.3;
  rays.forEach((r, i) => {
    if (!r.out) return;
    const [x, y] = r.out.at;
    const len = r.top ? EXIT.top : EXIT.leak;
    const peak = r.top ? 0.75 : 0.2;
    r.out.dirs.forEach((d, j) => {
      const x2 = x + d[0] * len;
      const y2 = y + d[1] * len;
      const g = ctx.createLinearGradient(X(x), Y(y), X(x2), Y(y2));
      g.addColorStop(0, `rgba(${SPECTRUM[j].color},${peak})`);
      g.addColorStop(1, `rgba(${SPECTRUM[j].color},0)`);
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(X(x), Y(y));
      ctx.lineTo(X(x2), Y(y2));
      ctx.stroke();
    });
    if (r.top) glint(ctx, X(x), Y(y), R * (0.05 + 0.05 * (0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7))), 0.85);
  });
  // Glare off the surface where the light goes in.
  ctx.lineWidth = 1;
  for (const r of rays) {
    const [x, y] = r.glare.at;
    const [dx, dy] = r.glare.dir;
    const g = ctx.createLinearGradient(X(x), Y(y), X(x + dx * 1.4), Y(y + dy * 1.4));
    g.addColorStop(0, "rgba(255,248,230,0.16)");
    g.addColorStop(1, "rgba(255,248,230,0)");
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(X(x), Y(y));
    ctx.lineTo(X(x + dx * 1.4), Y(y + dy * 1.4));
    ctx.stroke();
  }
  for (const [x, y, s] of flashes) glint(ctx, x, y, R * 0.09 * s, 0.7 * s);
  ctx.globalCompositeOperation = "source-over";
}
