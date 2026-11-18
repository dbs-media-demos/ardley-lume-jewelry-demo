// Desktop check of a homepage version: three.js requests, the hero moving in the first 3 s, cursor + scroll, console errors.
//   npm run build && node scripts/with-server.mjs node scripts/v2-check.mjs [route] [outDir] [cpuRate]
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.URL ?? "http://localhost:4250";
const [route = "/v2", out = "C:/tmp/v2", rate = "1"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page);
if (+rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: +rate });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
const scripts = [];
page.on("response", async (r) => {
  if (r.request().resourceType() !== "script") return;
  try {
    const t = await r.text();
    scripts.push({ url: r.url(), bytes: t.length, three: /WebGLRenderer|PMREMGenerator|three\.module/.test(t) });
  } catch {}
});
const t0 = Date.now();
await page.goto(base + route, { waitUntil: "commit" });
const hashes = [];
for (const ms of [300, 1000, 2000, 3000, 4500]) {
  await page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
  const buf = await page.screenshot({ path: `${out}/t${ms}.png` });
  hashes.push(buf.toString("base64").length);
}
await page.mouse.move(1300, 200);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/mouse-right.png` });
await page.mouse.move(200, 400);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/mouse-left.png` });
await page.mouse.wheel(0, 350);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/scroll-350.png` });
await page.mouse.wheel(0, 700);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/scroll-1050.png` });
const marks = await page.evaluate(() => performance.getEntriesByType("mark").map((m) => `${m.name}@${Math.round(m.startTime)}`).filter((m) => /light|3d/.test(m)));
const fps = await page.evaluate(() => new Promise((res) => { window.scrollTo(0, 0); let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 2000) requestAnimationFrame(f); else res(Math.round(n / 2)); }; requestAnimationFrame(f); }));
console.log(JSON.stringify({ route, sizes: hashes, fps, marks, scripts: scripts.length, threeFiles: scripts.filter((s) => s.three).map((s) => s.url), errors }, null, 1));
await browser.close();
