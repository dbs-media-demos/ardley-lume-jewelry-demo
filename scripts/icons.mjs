import sharp from "sharp";
import fs from "node:fs";
const svg = fs.readFileSync("src/app/icon.svg");
await sharp(svg, { density: 600 }).resize(180, 180).png().toFile("src/app/apple-icon.png");
await sharp(svg, { density: 600 }).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(svg, { density: 600 }).resize(512, 512).png().toFile("public/icon-512.png");
// favicon.ico with a single 32px PNG entry
const png = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
const dir = Buffer.alloc(16); dir.writeUInt8(32, 0); dir.writeUInt8(32, 1); dir.writeUInt8(0, 2); dir.writeUInt8(0, 3); dir.writeUInt16LE(1, 4); dir.writeUInt16LE(32, 6); dir.writeUInt32LE(png.length, 8); dir.writeUInt32LE(22, 12);
fs.writeFileSync("src/app/favicon.ico", Buffer.concat([header, dir, png]));
console.log("icons ok");
