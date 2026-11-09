// What the long tasks on a phone load are made of (production build, 375 px, 4× CPU, slow 4G).
//   node scripts/with-server.mjs node scripts/phone-trace.mjs [route]
// For every main-thread task over 50 ms: when, how long, and the biggest pieces inside it.
import { chromium } from "playwright";
import path from "node:path";

const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe");
const base = process.env.URL ?? "http://localhost:4250";
const [route = "/"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const events = [];
cdp.on("Tracing.dataCollected", (e) => events.push(...e.value));
const done = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
await cdp.send("Tracing.start", { categories: "devtools.timeline,disabled-by-default-devtools.timeline", transferMode: "ReportEvents" });
await page.goto(base + route, { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(6000);
await cdp.send("Tracing.end");
await done;

const nav = events.find((e) => e.name === "navigationStart" || e.name === "TracingStartedInBrowser");
const t0 = Math.min(...events.filter((e) => e.ts > 0).map((e) => e.ts));
const mainPid = events.find((e) => e.name === "ParseHTML")?.pid;
const mainTid = events.find((e) => e.name === "ParseHTML")?.tid;
const onMain = events.filter((e) => e.pid === mainPid && e.tid === mainTid && e.ph === "X");
const tasks = onMain.filter((e) => e.name === "RunTask" && e.dur > 50000);
for (const t of tasks) {
  const inside = onMain.filter((e) => e !== t && e.ts >= t.ts && e.ts + (e.dur ?? 0) <= t.ts + t.dur && e.dur > 8000 && e.name !== "RunTask");
  const label = (e) => {
    const d = e.args?.data ?? e.args?.beginData ?? {};
    const what = d.url ? d.url.split("/").pop().slice(0, 30) : d.functionName || d.type || d.stackTrace?.[0]?.functionName || "";
    return `${e.name}${what ? `(${what})` : ""} ${(e.dur / 1000).toFixed(0)}`;
  };
  const top = inside.sort((a, b) => b.dur - a.dur).slice(0, 7).map(label).join(" | ");
  console.log(`${((t.ts - t0) / 1000).toFixed(0)}ms +${(t.dur / 1000).toFixed(0)}  ${top}`);
}
void nav;
await browser.close();
