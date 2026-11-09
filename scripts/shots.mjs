// Screenshots of the production build, scrolling top to bottom like a visitor.
//   npm run build && node scripts/with-server.mjs node scripts/shots.mjs <outDir> [desktop|phone|both] [route]
// Desktop: 1440×900 frames every ~0.9 screens. Phone: 375×812 viewport frames + one full-page image.
// Also prints console errors, horizontal overflow and the document height in screens.
import { chromium } from "playwright";
import path from "node:path";
import { mkdirSync } from "node:fs";

const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe");
const base = process.env.URL ?? "http://localhost:4250";
const [out = "shots", which = "both", route = "/"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: exe, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });

async function run(name, ctxOpts, step) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + route, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(name === "desktop" ? 4500 : 2500);
  await page.screenshot({ path: path.join(out, `${name}-00.png`) });
  if (name === "desktop") await page.mouse.move(900, 400);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = ctxOpts.viewport.height;
  let i = 1;
  for (let y = step * vh; y < H - vh * 0.5; y += step * vh, i++) {
    await page.evaluate((top) => (window.__lenis ? window.__lenis.scrollTo(top, { immediate: true }) : window.scrollTo(0, top)), y);
    await page.waitForTimeout(name === "desktop" ? 1100 : 450);
    await page.screenshot({ path: path.join(out, `${name}-${String(i).padStart(2, "0")}.png`) });
  }
  const info = await page.evaluate(() => ({ H: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth - innerWidth }));
  if (name === "phone") {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(out, `phone-full.png`), fullPage: true });
  }
  console.log(JSON.stringify({ name, screens: +(info.H / vh).toFixed(1), overflowX: info.overflowX, frames: i, errors }));
  await ctx.close();
}

if (which !== "phone") await run("desktop", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, 0.9);
if (which !== "desktop")
  await run("phone", { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36" }, 1);
await browser.close();
