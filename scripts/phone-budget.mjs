// Phone budget on the production server: 375 px, 4× CPU slowdown, slow 4G (Lighthouse's mobile numbers).
//   npm run build && node scripts/with-server.mjs node scripts/phone-budget.mjs [route] [width]
// Prints LCP, CLS, TBT, first-load JS (compressed), every byte, and how many bytes of three.js arrived (must be 0).
import { chromium } from "playwright";
import path from "node:path";

const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe");
const base = process.env.URL ?? "http://localhost:4250";
const [route = "/", width = "375"] = process.argv.slice(2);
const w = Number(width);

const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext({ viewport: { width: w, height: 812 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36" });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const reqs = new Map();
cdp.on("Network.responseReceived", (e) => reqs.set(e.requestId, { url: e.response.url, type: e.type, bytes: 0 }));
cdp.on("Network.loadingFinished", (e) => {
  const r = reqs.get(e.requestId);
  if (r) r.bytes = e.encodedDataLength;
});
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));

await page.addInitScript(() => {
  window.__perf = { lcp: 0, cls: 0, long: [] };
  new PerformanceObserver((l) => l.getEntries().forEach((e) => ((window.__perf.lcp = e.startTime, window.__perf.lcpEl = (e.element?.tagName ?? "") + "." + String(e.element?.className ?? "").slice(0, 40) + " " + (e.url ?? "").slice(-40))))).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__perf.cls += e.value))).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__perf.long.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true });
});
await page.goto(base + route, { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(6000);
const perf = await page.evaluate(() => {
  const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
  const tbt = window.__perf.long.filter(([s]) => s >= fcp).reduce((a, [, d]) => a + Math.max(0, d - 50), 0);
  return { tasks: window.__perf.long.map(([s, d]) => `${Math.round(s)}+${Math.round(d)}`).join(" "), fcp: Math.round(fcp), lcp: Math.round(window.__perf.lcp), lcpEl: window.__perf.lcpEl, cls: +window.__perf.cls.toFixed(4), tbt: Math.round(tbt), longest: Math.round(Math.max(0, ...window.__perf.long.map(([, d]) => d))) };
});

let js = 0;
let all = 0;
let three = 0;
const threeFiles = [];
for (const [id, r] of reqs) {
  all += r.bytes;
  if (r.type !== "Script") continue;
  js += r.bytes;
  try {
    const { body, base64Encoded } = await cdp.send("Network.getResponseBody", { requestId: id });
    const text = base64Encoded ? Buffer.from(body, "base64").toString("utf8") : body;
    if (/WebGLRenderer|WebGLShadowMap|PMREMGenerator|three\.module/.test(text)) {
      three += r.bytes;
      threeFiles.push(r.url);
    }
  } catch {}
}
const scripts = [...reqs.values()].filter((r) => r.type === "Script").sort((a, b) => b.bytes - a.bytes).map((r) => `${r.url.replace(base, "").slice(-40)} ${(r.bytes / 1024).toFixed(1)} KB`);
const img = [...reqs.values()].filter((r) => r.type !== "Script" && !r.url.startsWith("data:")).map((r) => `${decodeURIComponent(r.url.replace(base, "")).slice(0, 90)} ${(r.bytes / 1024).toFixed(1)} KB`);
const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
const timing = process.env.VERBOSE
  ? await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => !r.name.startsWith("data:")).map((r) => `${Math.round(r.startTime)}→${Math.round(r.responseEnd)} ${r.name.split("/").pop().slice(0, 50)}`))
  : undefined;
console.log(JSON.stringify({ route, width: w, ...perf, jsKB: +(js / 1024).toFixed(1), totalKB: +(all / 1024).toFixed(1), threeBytes: three, threeFiles, overflowX, scripts: process.env.VERBOSE ? scripts : undefined, timing, images: img, errors }, null, 1));
await browser.close();
