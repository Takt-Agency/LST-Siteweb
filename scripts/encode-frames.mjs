#!/usr/bin/env node
/**
 * Encode les rendus PNG (assets-src/renders/<séquence>/frame_000.png…) pour le web :
 *   public/sequences/<séquence>/desktop/frame_000.avif|webp  (≤ 1920 px, toutes les frames)
 *   public/sequences/<séquence>/mobile/frame_000.avif|webp   (≤ 960 px, une frame sur deux)
 * AVIF avec alpha (qualité ~50) + WebP de secours. Écrit aussi src/data/sequences.json
 * (nombre de frames, ratio, emprise du sujet, positions des roues) lu par le site.
 *
 *   node scripts/encode-frames.mjs [--only=truck-rotate-yellow,ship-top] [--strict]
 * --strict : code de sortie 1 si un budget (6 Mo desktop / 2 Mo mobile par séquence) est dépassé.
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(await readFile(join(ROOT, "scripts/sequences.config.json"), "utf8"));
const SRC = join(ROOT, "assets-src/renders");
const PUBLIC = join(ROOT, "public/sequences");
const MANIFEST = join(ROOT, "src/data/sequences.json");
const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const strict = args.includes("--strict");
const D = config.defaults;
const POOL = Math.max(2, Math.floor(availableParallelism() / 2));
const MB = 1024 * 1024;

async function pool(items, fn) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(POOL, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i], i);
      }
    }),
  );
}

/** Emprise des pixels non transparents, en % du cadre (x, y, w, h). */
async function alphaBox(file) {
  const meta = await sharp(file).metadata();
  try {
    const { info } = await sharp(file).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
    const x = -(info.trimOffsetLeft ?? 0), y = -(info.trimOffsetTop ?? 0);
    const pct = (v, t) => +((v / t) * 100).toFixed(3);
    return { x: pct(x, meta.width), y: pct(y, meta.height), w: pct(info.width, meta.width), h: pct(info.height, meta.height) };
  } catch {
    return { x: 0, y: 0, w: 100, h: 100 };
  }
}

async function encodeSet(name, seq) {
  const dir = join(SRC, name);
  if (!existsSync(dir)) {
    console.warn(`  ⚠ ${name} : aucun rendu dans assets-src/renders/${name} (lancer Blender ou npm run assets:placeholders)`);
    return null;
  }
  const files = (await readdir(dir)).filter((f) => /^frame_\d+\.png$/.test(f)).sort();
  if (!files.length) return null;
  if (files.length !== seq.frames) console.warn(`  ⚠ ${name} : ${files.length} frames trouvées, ${seq.frames} attendues`);

  const desktopWidth = seq.desktopWidth ?? D.desktopWidth;
  const mobileWidth = seq.mobileWidth ?? D.mobileWidth;
  const step = files.length > 1 ? (seq.mobileStep ?? D.mobileStep) : 1;
  const out = join(PUBLIC, name);
  await rm(out, { recursive: true, force: true });
  await mkdir(join(out, "desktop"), { recursive: true });
  await mkdir(join(out, "mobile"), { recursive: true });

  const sizes = { desktop: { avif: 0, webp: 0 }, mobile: { avif: 0, webp: 0 } };
  const jobs = [];
  files.forEach((f, i) => jobs.push({ src: join(dir, f), target: "desktop", index: i, width: desktopWidth }));
  files.forEach((f, i) => {
    if (i % step === 0) jobs.push({ src: join(dir, f), target: "mobile", index: i / step, width: mobileWidth });
  });

  await pool(jobs, async ({ src, target, index, width }) => {
    const base = join(out, target, `frame_${String(index).padStart(3, "0")}`);
    const img = sharp(src).resize({ width, withoutEnlargement: true });
    await img.clone().avif({ quality: seq.avifQuality ?? D.avifQuality, effort: D.avifEffort, chromaSubsampling: "4:2:0" }).toFile(`${base}.avif`);
    await img.clone().webp({ quality: seq.webpQuality ?? D.webpQuality, alphaQuality: 90, effort: 5 }).toFile(`${base}.webp`);
    sizes[target].avif += (await stat(`${base}.avif`)).size;
    sizes[target].webp += (await stat(`${base}.webp`)).size;
  });

  const meta = await sharp(join(dir, files[0])).metadata();
  const entry = {
    aspect: +(meta.width / meta.height).toFixed(5),
    desktop: { pattern: `/sequences/${name}/desktop/frame_{i}.{ext}`, count: files.length },
    mobile: { pattern: `/sequences/${name}/mobile/frame_{i}.{ext}`, count: Math.ceil(files.length / step) },
    bbox: { first: await alphaBox(join(dir, files[0])), last: await alphaBox(join(dir, files[files.length - 1])) },
    bytes: sizes,
  };
  const wheels = join(dir, "wheels.json");
  if (existsSync(wheels)) entry.wheels = JSON.parse(await readFile(wheels, "utf8"));

  const fmt = (b) => `${(b / MB).toFixed(2)} Mo`;
  const over = [];
  if (sizes.desktop.avif > D.budgetDesktopMB * MB) over.push(`desktop ${fmt(sizes.desktop.avif)} > ${D.budgetDesktopMB} Mo`);
  if (sizes.mobile.avif > D.budgetMobileMB * MB) over.push(`mobile ${fmt(sizes.mobile.avif)} > ${D.budgetMobileMB} Mo`);
  console.log(
    `  ${over.length ? "✗" : "✓"} ${name.padEnd(26)} ${String(files.length).padStart(3)} frames  ` +
      `desktop ${fmt(sizes.desktop.avif)} (webp ${fmt(sizes.desktop.webp)})  mobile ${fmt(sizes.mobile.avif)}` +
      (over.length ? `  BUDGET DÉPASSÉ : ${over.join(", ")}` : ""),
  );
  return { entry, over: over.length > 0 };
}

const manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
let failed = false;
const t0 = Date.now();
for (const [name, seq] of Object.entries(config.sequences)) {
  const names = seq.variants ? seq.variants.map((v) => `${name}-${v}`) : [name];
  for (const n of names) {
    if (only && !only.includes(n) && !only.includes(name)) continue;
    const res = await encodeSet(n, seq);
    if (!res) continue;
    manifest[n] = res.entry;
    failed ||= res.over;
  }
}
const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
await writeFile(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Manifeste : src/data/sequences.json — ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (failed && strict) process.exit(1);
