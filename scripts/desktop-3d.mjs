// Desktop 3D on the production server: when each scene appeared, whether its first frames
// were smooth, and whether it fell back to its still. Headless Chrome on the real GPU.
//   npm run build && node scripts/with-server.mjs node scripts/desktop-3d.mjs [cpu-slowdown] [still]
// ("still" starts the visit as if a scene had already been too slow: the baseline without 3D.)
// Loads the home page at 1440×900, waits for the scenes, then wheels down past the builder,
// recording every frame gap from navigation on.
import { chromium } from "playwright";

const base = process.env.URL ?? "http://localhost:4250";
const rate = Number(process.argv[2] ?? 1);
const startStill = process.argv[3] === "still";

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
const cdp = await ctx.newCDPSession(page);
if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });

if (startStill) await page.addInitScript(() => sessionStorage.setItem("al:3d", "still"));
await page.addInitScript(() => {
  const w = window;
  w.__gaps = [];
  w.__long = [];
  let last = 0;
  const tick = (now) => {
    if (last) w.__gaps.push([Math.round(last), +(now - last).toFixed(1)]);
    last = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__long.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: "longtask", buffered: true });
});

await page.goto(base + "/", { waitUntil: "load", timeout: 120000 });
const gpu = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  const ext = gl?.getExtension("WEBGL_debug_renderer_info");
  return gl ? gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) : "no WebGL";
});

const marks = () => page.evaluate(() => Object.fromEntries(performance.getEntriesByType("mark").filter((m) => m.name.startsWith("3d:")).map((m) => [m.name, Math.round(m.startTime)])));
// Wait for the hero's verdict (or 12 s), then for the builder to warm up.
await page.waitForFunction(() => performance.getEntriesByType("mark").some((m) => /3d:hero:(smooth|slow)/.test(m.name)), null, { timeout: 12000 }).catch(() => {});
await page.waitForFunction(() => performance.getEntriesByType("mark").some((m) => m.name === "3d:builder:ready") || sessionStorage.getItem("al:3d") === "still", null, { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(1000);
const scrollFrom = await page.evaluate(() => performance.now());

// Wheel down to the builder, sit on it for 3 s (its own 2 s watch), then on down the page.
const builderY = await page.evaluate(() => document.querySelector("[data-cv=builder]").getBoundingClientRect().top + scrollY);
await page.mouse.move(700, 450);
while ((await page.evaluate(() => scrollY)) < builderY - 50) {
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(3500);
for (let i = 0; i < 25; i++) {
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(800);

const m = await marks();
const data = await page.evaluate(() => ({ gaps: window.__gaps, long: window.__long, still: sessionStorage.getItem("al:3d"), heroLive: document.getElementById("hero")?.dataset.ring === "on" }));
const stats = (from, to) => {
  const g = data.gaps.filter(([t]) => t >= from && t < to).map(([, d]) => d);
  if (!g.length) return null;
  const sum = g.reduce((a, b) => a + b, 0);
  return { fps: +((g.length * 1000) / sum).toFixed(1), worstMs: Math.max(...g), over50: g.filter((d) => d > 50).length, frames: g.length };
};
const end = data.gaps.at(-1)?.[0] ?? 0;
const heroDone = m["3d:hero:smooth"] ?? m["3d:hero:slow"] ?? (m["3d:hero:ready"] ?? 0) + 2000;
console.log(
  JSON.stringify(
    {
      cpuSlowdown: rate,
      gpu,
      marks: m,
      heroAppearedMs: m["3d:hero:ready"],
      heroWarmMs: m["3d:hero:ready"] && m["3d:hero:ready"] - m["3d:hero:start"],
      builderAppearedMs: m["3d:builder:ready"],
      builderWarmMs: m["3d:builder:ready"] && m["3d:builder:ready"] - m["3d:builder:start"],
      fellBackToStill: data.still === "still",
      heroLiveAtEnd: data.heroLive,
      frames: {
        loadToHeroReady: stats(0, m["3d:hero:ready"] ?? scrollFrom),
        heroFirst2s: m["3d:hero:ready"] ? stats(m["3d:hero:ready"], heroDone) : null,
        idleBeforeScroll: stats(heroDone, scrollFrom),
        scrolling: stats(scrollFrom, end),
      },
      longTasksOver50: data.long.filter(([, d]) => d > 50),
      gapsOver40: data.gaps.filter(([, d]) => d > 40),
      errors,
    },
    null,
    1,
  ),
);
await browser.close();
