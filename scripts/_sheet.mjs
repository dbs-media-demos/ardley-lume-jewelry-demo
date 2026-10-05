import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const [,, outFile, ...dirs] = process.argv;
const files = dirs.flatMap(d => fs.readdirSync(d).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).map(f => path.join(d, f)));
const W = 260, H = 300, cols = 6;
const rows = Math.ceil(files.length / cols);
const tiles = await Promise.all(files.map(async (f, i) => {
  const img = await sharp(f).resize(W, H - 30, { fit: "cover" }).toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="30"><rect width="100%" height="100%" fill="#111"/><text x="6" y="20" font-size="14" fill="#fff" font-family="Arial">${path.basename(f).slice(0, 32)}</text></svg>`);
  return [{ input: img, left: (i % cols) * W, top: Math.floor(i / cols) * H }, { input: label, left: (i % cols) * W, top: Math.floor(i / cols) * H + H - 30 }];
}));
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: "#222" } }).composite(tiles.flat()).jpeg({ quality: 80 }).toFile(outFile);
console.log(files.length, "files");
