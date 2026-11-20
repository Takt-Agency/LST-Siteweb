/**
 * Avion vu du dessus à partir d'une image détourée (fond transparent, nez vers la droite),
 * à la place du rendu Blender.
 *
 *   node scripts/make-plane-photo.mjs && node scripts/encode-frames.mjs --only=plane-top
 *
 * Entrée : assets-src/photos/plane-top.webp. Sortie : assets-src/renders/plane-top/frame_000.png,
 * cadre carré 1600×1600 (sequences.config.json) : l'avion occupe la même longueur que l'ancien rendu
 * (96,5 % de la largeur), centré. L'ombre portée de la scène réutilise la même image.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "assets-src/photos/plane-top.webp";
const OUT = "assets-src/renders/plane-top";
const SIZE = 1600;
const LENGTH = Math.round(0.965 * SIZE);

const plane = await sharp(SRC).trim({ threshold: 0 }).resize({ width: LENGTH, kernel: "lanczos3" }).png().toBuffer();
const { width, height } = await sharp(plane).metadata();
await mkdir(OUT, { recursive: true });
await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: plane, left: Math.round((SIZE - width) / 2), top: Math.round((SIZE - height) / 2) }])
  .png()
  .toFile(`${OUT}/frame_000.png`);
console.log(`plane-top (photo) : ${width}×${height} px centré dans ${SIZE}×${SIZE}`);
