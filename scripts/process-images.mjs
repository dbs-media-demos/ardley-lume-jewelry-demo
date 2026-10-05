/*
 * Image pipeline: raw downloads (public/images/raw, git-ignored) → art-directed,
 * consistent web images + a typed registry with blur placeholders.
 *
 *   node scripts/process-images.mjs            # everything
 *   node scripts/process-images.mjs lume-signet # only files whose name contains this
 *
 * - Product heroes: cropped to 4:5 around the piece, background normalised to one
 *   warm "bone" tone so the catalog reads as one shoot, then recoloured into the
 *   other metal tones (yellow / white / rose) for the swatch morph.
 * - On-model shots: 4:5 crop, gentle warm grade.
 * - Scenes: keep their aspect; workshop frames share a warm duotone-ish grade.
 * Writes src/content/images.ts and public/images/SOURCES.md.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crops, alts, sceneSizes } from "./image-config.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = path.join(ROOT, "public/images/raw");
const OUT = path.join(ROOT, "public/images");
const only = process.argv[2];

const manifests = fs
  .readdirSync(RAW)
  .filter((f) => f.startsWith("manifest-") && f.endsWith(".json"))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(RAW, f), "utf8")))
  .filter((e) => !e.file.endsWith(".mp4") && !e.file.includes("video"));
// Derived crops of an existing photo (e.g. a portrait hero for phones).
const heroB = manifests.find((e) => e.file === "scenes/hero-b.jpg");
if (heroB) manifests.push({ ...heroB, file: "scenes/hero-b.jpg", as: "hero-portrait" });

const BG = [234, 227, 216]; // target background (warm bone)

/* ---------------- colour helpers ---------------- */
function rgb2hsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max];
}
function hsv2rgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const hueDist = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/** Recolour metal-looking pixels from one gold tone to another. */
async function recolor(buf, from, to) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  const srcHue = from === "rose" ? 18 : 40;
  for (let i = 0; i < data.length; i += info.channels) {
    const [h, s, v] = rgb2hsv(data[i], data[i + 1], data[i + 2]);
    const hw = clamp01(1 - (hueDist(h, srcHue) - 14) / 16);
    const w = clamp01((s - 0.17) / 0.2) * hw * clamp01((v - 0.08) / 0.15);
    if (w <= 0.001) continue;
    let nh = h, ns = s, nv = v;
    if (to === "white") {
      ns = s * (1 - 0.9 * w);
      nv = Math.min(1, v * (1 + 0.05 * w));
    } else if (to === "rose") {
      nh = h + w * (17 - h);
      ns = s * (1 - 0.32 * w);
      nv = Math.min(1, v * (1 + 0.04 * w));
    } else if (to === "yellow") {
      nh = h + w * (41 - h);
      ns = Math.min(1, s * (1 + 0.08 * w));
    }
    let [r, g, b] = hsv2rgb((nh + 360) % 360, ns, nv);
    if (to === "white") {
      // a whisper of cool in the highlights so it reads as white gold, not grey
      b = Math.min(255, b + 6 * w);
      r = Math.max(0, r - 2 * w);
    }
    out[i] = r; out[i + 1] = g; out[i + 2] = b;
  }
  return sharp(out, { raw: info }).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}

/** Per-channel gains that map the average corner colour onto the target background. */
async function normaliseBg(img) {
  const { data, info } = await img.clone().resize(200, 250, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const sum = [0, 0, 0];
  let n = 0;
  const patch = 26;
  for (const [x0, y0] of [[0, 0], [info.width - patch, 0], [0, info.height - patch], [info.width - patch, info.height - patch]]) {
    for (let y = y0; y < y0 + patch; y++)
      for (let x = x0; x < x0 + patch; x++) {
        const i = (y * info.width + x) * info.channels;
        sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; n++;
      }
  }
  const avg = sum.map((s) => s / n);
  const lum = (0.2126 * avg[0] + 0.7152 * avg[1] + 0.0722 * avg[2]) / 255;
  if (lum < 0.5) return img; // dark set: leave it
  const gains = avg.map((a, i) => Math.max(0.78, Math.min(1.3, BG[i] / a)));
  return img.linear(gains, [0, 0, 0]);
}

const SEPIA = [[0.393, 0.769, 0.189], [0.349, 0.686, 0.168], [0.272, 0.534, 0.131]];
const warmMatrix = (k) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === c ? 1 - k : 0) + k * SEPIA[r][c]));

/** Crop a 4:5 (or given aspect) window, `zoom`× tighter than the largest one, centred at (cx, cy). */
async function cropTo(file, { zoom = 1, cx = 0.5, cy = 0.5, aspect = 0.8 } = {}) {
  const meta = await sharp(file).metadata();
  const W = meta.width, H = meta.height;
  let bw, bh;
  if (W / H > aspect) { bh = H; bw = H * aspect; } else { bw = W; bh = W / aspect; }
  bw /= zoom; bh /= zoom;
  const left = Math.round(Math.max(0, Math.min(W - bw, cx * W - bw / 2)));
  const top = Math.round(Math.max(0, Math.min(H - bh, cy * H - bh / 2)));
  return sharp(file).rotate().extract({ left, top, width: Math.round(bw), height: Math.round(bh) });
}

async function blurOf(buf) {
  const b = await sharp(buf).resize(12, null).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${b.toString("base64")}`;
}

/* ---------------- main ---------------- */
const registry = {};
const regFile = path.join(ROOT, "src/content/images.ts");
if (only && fs.existsSync(path.join(ROOT, "scripts/.registry.json"))) Object.assign(registry, JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/.registry.json"), "utf8")));

fs.mkdirSync(path.join(OUT, "p"), { recursive: true });
fs.mkdirSync(path.join(OUT, "scenes"), { recursive: true });

for (const e of manifests) {
  const name = e.as ?? path.basename(e.file, path.extname(e.file));
  if (only && !name.includes(only)) continue;
  const src = path.join(RAW, e.file);
  if (!fs.existsSync(src)) { console.warn("missing", e.file); continue; }
  const isScene = e.file.startsWith("scenes/");
  const cfg = crops[name] ?? {};
  const alt = alts[name] ?? e.desc;

  if (isScene) {
    const size = sceneSizes[name] ?? 2000;
    let img = cfg.zoom || cfg.aspect ? await cropTo(src, { aspect: cfg.aspect ?? 0.8, ...cfg }) : sharp(src).rotate();
    img = img.resize({ width: size, height: size, fit: "inside", withoutEnlargement: true });
    if (/^(step-|bench-)/.test(name)) img = img.recomb(warmMatrix(0.32)).modulate({ saturation: 0.9 });
    const buf = await img.jpeg({ quality: name.startsWith("hero") ? 80 : 82, mozjpeg: true }).toBuffer();
    const meta = await sharp(buf).metadata();
    fs.writeFileSync(path.join(OUT, "scenes", `${name}.jpg`), buf);
    registry[name] = { src: `/images/scenes/${name}.jpg`, w: meta.width, h: meta.height, blur: await blurOf(buf), alt };
    console.log("scene", name, meta.width, meta.height, Math.round(buf.length / 1024) + "KB");
    continue;
  }

  // product image
  let img = (await cropTo(src, cfg)).resize(1400, 1750, { fit: "cover" });
  const isHero = name.endsWith("-1");
  if (isHero && !cfg.noNormalise) img = await normaliseBg(img);
  if (!isHero) img = img.recomb(warmMatrix(0.06));
  if (cfg.brightness) img = img.modulate({ brightness: cfg.brightness });
  const buf = await img.jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  fs.writeFileSync(path.join(OUT, "p", `${name}.jpg`), buf);
  registry[name] = { src: `/images/p/${name}.jpg`, w: 1400, h: 1750, blur: await blurOf(buf), alt };
  console.log("product", name, Math.round(buf.length / 1024) + "KB");

  if (isHero) {
    const tone = cfg.tone ?? (e.metal === "rose" ? "rose" : e.metal === "white" || e.metal === "silver" ? "white" : "yellow");
    registry[`${name}@${tone}`] = registry[name];
    if (tone !== "white" && !cfg.noRecolor) {
      for (const to of ["yellow", "white", "rose"].filter((t) => t !== tone)) {
        const vbuf = await recolor(buf, tone, to);
        fs.writeFileSync(path.join(OUT, "p", `${name}--${to}.jpg`), vbuf);
        registry[`${name}@${to}`] = { src: `/images/p/${name}--${to}.jpg`, w: 1400, h: 1750, blur: await blurOf(vbuf), alt: alt.replace(/yellow[- ]gold|rose[- ]gold|gold/i, `${to} gold`) };
      }
    }
  }
}

fs.writeFileSync(path.join(ROOT, "scripts/.registry.json"), JSON.stringify(registry));
const sorted = Object.fromEntries(Object.entries(registry).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(
  regFile,
  `// Generated by scripts/process-images.mjs. Do not edit by hand.\nexport type Img = { src: string; w: number; h: number; blur: string; alt: string };\nexport const images: Record<string, Img> = ${JSON.stringify(sorted, null, 0).replace(/},"/g, '},\n"')};\n`,
);

// Credits
const lines = ["# Image & video sources", "", "All photos are from Unsplash (Unsplash License) unless marked Pexels (Pexels License). Processed (cropped, colour-graded, metal tones recoloured) by scripts/process-images.mjs.", "", "| File | Source | Photographer |", "|---|---|---|"];
for (const e of manifests) {
  const name = path.basename(e.file, path.extname(e.file));
  const out = e.file.startsWith("scenes/") ? `images/scenes/${name}.jpg` : e.file.endsWith(".mp4") ? e.file : `images/p/${name}.jpg`;
  lines.push(`| ${out} | ${e.url} | ${e.photographer ?? e.creator ?? ""} |`);
}
fs.writeFileSync(path.join(OUT, "SOURCES.md"), lines.join("\n") + "\n");
console.log("registry", Object.keys(registry).length, "entries");
