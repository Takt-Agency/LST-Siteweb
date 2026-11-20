#!/usr/bin/env node
/**
 * Carte du monde en points (pied de page) : terres Natural Earth (world-atlas, land-110m),
 * projection équirectangulaire recadrée (80°N → 56°S). Sortie :
 *   public/images/world-dots.svg  — un seul <path> (points = segments de longueur nulle à bouts ronds)
 *   src/data/world-dots.json      — cadrage, pour placer des marqueurs (ex. Nabeul) en %.
 *   node scripts/make-dot-map.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { feature } from "topojson-client";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const topo = JSON.parse(await readFile(join(ROOT, "node_modules/world-atlas/land-110m.json"), "utf8"));
const land = feature(topo, topo.objects.land);

const LAT_TOP = 80, LAT_BOTTOM = -56;
const W = 1000, H = Math.round(((LAT_TOP - LAT_BOTTOM) / 360) * W);
const MW = 2000, MH = MW * (H / W);
const px = (lon) => ((lon + 180) / 360) * MW, py = (lat) => ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * MH;

let d = "";
for (const f of land.features) {
  const g = f.geometry;
  const polys = g.type === "MultiPolygon" ? g.coordinates : [g.coordinates];
  for (const poly of polys) for (const ring of poly) d += ring.map(([lo, la], i) => `${i ? "L" : "M"}${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join("") + "Z";
}
const mask = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${MW}" height="${MH}"><rect width="100%" height="100%" fill="#000"/><path d="${d}" fill="#fff" fill-rule="evenodd"/></svg>`))
  .greyscale().raw().toBuffer({ resolveWithObject: true });
const isLand = (x, y) => mask.data[Math.min(mask.info.height - 1, Math.round(y)) * mask.info.width + Math.min(mask.info.width - 1, Math.round(x))] > 127;

const STEP = 7; // unités du viewBox entre deux points
let path = "", n = 0;
for (let y = STEP / 2; y < H; y += STEP) {
  const row = Math.round(y / STEP);
  for (let x = STEP / 2 + (row % 2) * (STEP / 2); x < W; x += STEP) {
    if (isLand((x / W) * MW, (y / H) * MH)) {
      path += `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
      n++;
    }
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path d="${path}" stroke="#9aa4af" stroke-width="3.2" stroke-linecap="round" fill="none"/></svg>`;
await mkdir(join(ROOT, "public/images"), { recursive: true });
await writeFile(join(ROOT, "public/images/world-dots.svg"), svg);
await writeFile(join(ROOT, "src/data/world-dots.json"), `${JSON.stringify({ width: W, height: H, latTop: LAT_TOP, latBottom: LAT_BOTTOM }, null, 2)}\n`);
console.log(`world-dots.svg : ${n} points, ${(svg.length / 1024).toFixed(0)} Ko`);
