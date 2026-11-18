// Renders the stills phones see in place of the 3D scenes, straight from the live three.js scenes.
//   npm run build && node scripts/with-server.mjs node scripts/ring-stills.mjs [hero]   ("hero": the hero stills only)
// Hero: public/images/3d/hero-pendant-desktop.webp (the opening frame, for the crossfade) and
// hero-pendant-phone.webp (same frame, trimmed). Builder: builder-<shape>-<tone>.webp for every choice.
import { chromium } from "playwright";
import sharp from "sharp";
import path from "node:path";
import { mkdirSync } from "node:fs";

const heroOnly = process.argv[2] === "hero";
const base = process.env.URL ?? "http://localhost:4250";
const out = "public/images/3d";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const log = (file, info) => console.log(`${file}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
const png = (url) => Buffer.from(url.split(",")[1], "base64");

async function hero(size, fn) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error(`[hero] ${e.message}`));
  await page.goto(`${base}/?still=${size}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForFunction(() => typeof window.__pendantStill === "function", null, { timeout: 90000 });
  await page.evaluate(() => window.__pendantStill());
  const url = await page.evaluate(() => window.__pendantStill());
  await fn(png(url));
  await page.close();
}

// Desktop: same size and framing as the live canvas (height-fit), so the crossfade is seamless.
await hero("1600x1000", async (buf) => {
  const file = "hero-pendant-desktop.webp";
  log(file, await sharp(buf).resize({ width: 2000 }).webp({ quality: 80, alphaQuality: 85, effort: 6 }).toFile(path.join(out, file)));
});
// Phones: the same frame, trimmed to the ring.
await hero("1400x1400", async (buf) => {
  const file = "hero-pendant-phone.webp";
  // The chain leaves the frame at the top: fade its top third out, so on a phone it rises out of the dark.
  const trimmed = await sharp(buf).trim({ threshold: 4 }).toBuffer();
  const { width: tw, height: th } = await sharp(trimmed).metadata();
  const fade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.34" stop-color="#fff" stop-opacity="1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#f)"/></svg>`);
  const faded = await sharp(trimmed).composite([{ input: fade, blend: "dest-in" }]).png().toBuffer();
  log(file, await sharp(faded).resize({ height: 760, withoutEnlargement: true }).extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 78, alphaQuality: 80, effort: 6 }).toFile(path.join(out, file)));
});

if (heroOnly) {
  await browser.close();
  process.exit(0);
}
const page = await ctx.newPage();
page.on("pageerror", (e) => console.error(`[builder] ${e.message}`));
await page.goto(`${base}/?builderStill`, { waitUntil: "load", timeout: 120000 });
await page.waitForFunction(() => typeof window.__builderStill === "function", null, { timeout: 90000 });
for (const shape of ["round", "oval", "emerald", "pear"]) {
  for (const tone of ["yellow", "white", "rose"]) {
    await page.evaluate(([s, t]) => window.__builderStill(s, t), [shape, tone]);
    const url = await page.evaluate(([s, t]) => window.__builderStill(s, t), [shape, tone]);
    const file = `builder-${shape}-${tone}.webp`;
    log(file, await sharp(png(url)).resize({ width: 1200 }).webp({ quality: 80, effort: 6 }).toFile(path.join(out, file)));
  }
}
await browser.close();
