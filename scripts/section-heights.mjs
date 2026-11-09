// Measures the home page's sections at phone widths, to set the heights content-visibility holds for them.
//   node scripts/with-server.mjs node scripts/section-heights.mjs
import { chromium } from "playwright";
import path from "node:path";

const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe");
const base = process.env.URL ?? "http://localhost:4250";
const browser = await chromium.launch({ executablePath: exe });
for (const w of [320, 360, 375, 390, 412, 430, 768]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.addStyleTag({ content: "[data-cv]{content-visibility:visible!important}" });
  await page.waitForTimeout(800);
  const hs = await page.evaluate(() => [...document.querySelectorAll("[data-cv]")].map((e) => `${e.getAttribute("data-cv")}=${Math.round(e.getBoundingClientRect().height)}`).join(" "));
  console.log(w, hs);
  await ctx.close();
}
await browser.close();
