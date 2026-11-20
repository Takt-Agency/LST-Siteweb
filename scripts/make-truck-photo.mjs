/**
 * Camion à partir de deux images détourées (fond transparent, cabine à droite), à la place des rendus Blender :
 *
 *   node scripts/make-truck-photo.mjs
 *   node scripts/encode-frames.mjs --only=truck-side-yellow,truck-side-black,truck-top-yellow,truck-top-black,truck-rotate-yellow,truck-rotate-black
 *
 * Entrées : assets-src/photos/truck-side.png (vue de côté) et truck-top.png (vue du dessus).
 * Sorties (cadre 1920×1080, mêmes emplacements que les rendus 3D, identiques pour les deux livrées) :
 *  - truck-side-<livrée>/frame_000.png + wheels.json ; chaque roue est découpée dans la photo
 *    (public/sequences/truck-side-photo/wheel-<n>.webp) et tourne au défilement (RotatingWheel) ;
 *  - truck-top-<livrée>/frame_000.png ;
 *  - truck-rotate-<livrée>/frame_000…059.png : bascule côté → dessus en « retournement de carte » (voir frameAt).
 *    Une projection de boîte, avec deux images plates, montrait le toit empilé sur la vue de côté :
 *    on croyait voir deux camions superposés.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const FRAME = { w: 1920, h: 1080 };
const ROT_FRAMES = 60;
const VARIANTS = ["yellow", "black"];

/** Mesures en pixels des images sources. */
const SIDE = {
  src: "assets-src/photos/truck-side.png",
  body: { left: 81, right: 2121 }, // emprise opaque
  container: { left: 84, top: 142 },
  ground: 633,
  wheels: [
    { x: 456.5, y: 559, r: 72 },
    { x: 613.5, y: 559, r: 72 },
    { x: 772.5, y: 559, r: 72 },
    { x: 1441, y: 554, r: 77 },
    { x: 1914, y: 556, r: 76 },
  ],
};
const TOP = {
  src: "assets-src/photos/truck-top.png",
  container: { left: 47, right: 1671, top: 226, bottom: 533 },
};
const SIDE_CONTAINER_LEN = 1691 - SIDE.container.left;

/** Comme le rendu 3D : camion sur ~68 % de la largeur, centré ; sol à 703 px (même ligne que l'ancien rendu). */
const TRUCK_WIDTH = 0.679 * FRAME.w;
const GROUND_Y = 703;
/** Seule la jante et le flanc tournent : le bord du pneu (uniforme) et les garde-boue restent fixes. */
const SPIN_RATIO = 0.8;

const sS = TRUCK_WIDTH / (SIDE.body.right - SIDE.body.left);
// Même échelle de conteneur dans les deux vues : la longueur du camion ne change pas pendant la bascule.
const sT = (SIDE_CONTAINER_LEN * sS) / (TOP.container.right - TOP.container.left);
const sideMeta = await sharp(SIDE.src).metadata();
const topMeta = await sharp(TOP.src).metadata();
const sideLeft = FRAME.w / 2 - ((SIDE.body.left + SIDE.body.right) / 2) * sS;
const containerX = sideLeft + SIDE.container.left * sS;
const topLeft = containerX - TOP.container.left * sT;
const sideW = Math.round(sideMeta.width * sS);
const topW = Math.round(topMeta.width * sT);

/*
 * Bascule en « retournement de carte », t ∈ [0, 1] :
 *  - les deux vues tournent autour d'un même axe horizontal, qui glisse du milieu du camion de côté (t = 0,
 *    sol à GROUND_Y, identique à truck-side) au centre du cadre (t = 1, identique à truck-top) ;
 *  - 1re moitié : la vue de côté s'aplatit sur cet axe (et s'assombrit, comme une face qui se détourne
 *    de la lumière) ; 2e moitié : la vue du dessus se déplie depuis le même axe (et s'éclaircit) ;
 *  - autour de t = 0,5, quand les deux sont fines, fondu court de l'une à l'autre (FADE_IN, FADE_OUT).
 * Les deux images ne sont jamais empilées l'une au-dessus de l'autre.
 */
const CY = FRAME.h / 2;
const SIDE_AXIS = (SIDE.container.top + SIDE.ground) / 2; // rangée source de l'axe, vue de côté
const TOP_AXIS = (TOP.container.top + TOP.container.bottom) / 2; // idem, vue du dessus
const AXIS_START = GROUND_Y - (SIDE.ground - SIDE_AXIS) * sS;
const MIN_K = 0.18; // épaisseur minimale d'une vue (fraction de sa hauteur)
// Fondu : la vue du dessus apparaît par-dessus la vue de côté encore opaque, puis celle-ci s'efface dessous (jamais de trou).
const FADE_IN = [0.38, 0.5];
const FADE_OUT = [0.5, 0.62];

const blank = () => sharp({ create: { width: FRAME.w, height: FRAME.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const x = clamp01((v - a) / (b - a)); return x * x * (3 - 2 * x); };
const easeIn = (x) => x * x;
const easeOut = (x) => 1 - (1 - x) * (1 - x);

/** Vue écrasée verticalement à k de sa hauteur autour de l'axe (rangée source `axis`), assombrie, en opacité `alpha`. */
async function layer(src, scale, width, srcH, axis, left, axisY, k, light, alpha) {
  const h = Math.round(srcH * scale * k);
  if (h < 2 || alpha <= 0.002) return null;
  const input = await sharp(src)
    .resize(width, h, { fit: "fill", kernel: "lanczos3" })
    .ensureAlpha()
    .linear([light, light, light, alpha], [0, 0, 0, 0])
    .png()
    .toBuffer();
  return { input, left: Math.round(left), top: Math.round(axisY - axis * scale * k) };
}

async function frameAt(t, topSrc = TOP.src) {
  const axisY = AXIS_START + (CY - AXIS_START) * (0.5 - Math.cos(Math.PI * t) / 2);
  const kSide = Math.max(MIN_K, 1 - (1 - MIN_K) * easeIn(clamp01(t / 0.5)));
  const kTop = Math.max(MIN_K, MIN_K + (1 - MIN_K) * easeOut(clamp01((t - 0.5) / 0.5)));
  const aTop = smooth(FADE_IN[0], FADE_IN[1], t);
  const aSide = 1 - smooth(FADE_OUT[0], FADE_OUT[1], t);
  const side = await layer(SIDE.src, sS, sideW, sideMeta.height, SIDE_AXIS, sideLeft, axisY, kSide, 0.62 + 0.38 * kSide, aSide);
  const roof = await layer(topSrc, sT, topW, topMeta.height, TOP_AXIS, topLeft, axisY, kTop, 0.72 + 0.28 * kTop, aTop);
  return blank()
    .composite([side, roof].filter(Boolean))
    .png()
    .toBuffer();
}

async function writeAll(name, i, buf) {
  for (const v of VARIANTS) {
    const dir = join("assets-src/renders", `${name}-${v}`);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `frame_${String(i).padStart(3, "0")}.png`), buf);
  }
}

// Vue de côté + roues.
const sideFrame = await frameAt(0);
await writeAll("truck-side", 0, sideFrame);
const pubDir = "public/sequences/truck-side-photo";
await mkdir(pubDir, { recursive: true });
const pct = (v, total) => Math.round((v / total) * 100000) / 1000;
const wheels = [];
for (const [i, wh] of SIDE.wheels.entries()) {
  const cx = sideLeft + wh.x * sS;
  const cy = GROUND_Y - (SIDE.ground - wh.y) * sS;
  const R = wh.r * sS * SPIN_RATIO;
  const size = Math.ceil(R * 2);
  const x0 = Math.round(cx - size / 2);
  const y0 = Math.round(cy - size / 2);
  // Disque à bord adouci (1,5 px) : la découpe se fond dans la photo, à l'arrêt comme en rotation.
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><defs><radialGradient id="g">` +
      `<stop offset="${((R - 1.5) / R).toFixed(3)}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>` +
      `</radialGradient></defs><circle cx="${size / 2}" cy="${size / 2}" r="${R}" fill="url(#g)"/></svg>`,
  );
  const disc = await sharp(sideFrame)
    .extract({ left: x0, top: y0, width: size, height: size })
    .composite([{ input: mask, blend: "dest-in" }])
    .webp({ quality: 90, alphaQuality: 100 })
    .toBuffer();
  const file = `wheel-${i}.webp`;
  await writeFile(join(pubDir, file), disc);
  wheels.push({ x: pct(x0 + size / 2, FRAME.w), y: pct(y0 + size / 2, FRAME.h), d: pct(size, FRAME.w), src: `/sequences/truck-side-photo/${file}` });
}
for (const v of VARIANTS) await writeFile(join("assets-src/renders", `truck-side-${v}`, "wheels.json"), JSON.stringify(wheels, null, 2) + "\n");

// Vue du dessus.
await writeAll("truck-top", 0, await frameAt(1));

// Embarquement (vue du dessus, même cadrage que truck-top) : le conteneur seul, et le camion sans conteneur
// (châssis de la remorque dessiné à sa place).
{
  const { data, info } = await sharp(TOP.src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const C = TOP.container;
  // Conteneur : son emprise exacte ; camion vide : emprise élargie (pièces de coin et pneus qui dépassent).
  const inBox = (x, y, m) => x >= C.left - m && x <= C.right + m && y >= C.top - m && y <= C.bottom + m;
  const box = Buffer.alloc(data.length), empty = Buffer.from(data);
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      // (3 px rognés en long : des bouts de pneus de la photo dépassent sous les bords.)
      if (inBox(x, y, 0) && y >= C.top + 3 && y <= C.bottom - 3) data.copy(box, i, i, i + 4);
      if (inBox(x, y, 8)) empty[i + 3] = 0;
    }
  const raw = (buf) => sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  // Châssis vu du dessus : longerons, traverses, essieux (3, sous l'arrière) et pivot d'attelage.
  const W = C.right - C.left, H = C.bottom - C.top, y0 = C.top, x0 = C.left;
  const axles = SIDE.wheels.slice(0, 3).map((w) => x0 + ((w.x - SIDE.container.left) * W) / SIDE_CONTAINER_LEN);
  let svg = "";
  for (const ax of axles)
    for (const ty of [y0 + 4, y0 + H - 40])
      svg += `<rect x="${ax - 36}" y="${ty}" width="72" height="36" rx="8" fill="#15171a"/><rect x="${ax - 30}" y="${ty + 6}" width="60" height="24" rx="5" fill="#24272b"/>`;
  for (let x = x0 + 40; x < C.right - 20; x += 120) svg += `<rect x="${x}" y="${y0 + 30}" width="12" height="${H - 60}" fill="#3a3f45"/>`;
  for (const f of [0.3, 0.7]) svg += `<rect x="${x0 + 10}" y="${y0 + H * f - 11}" width="${W - 20}" height="22" rx="3" fill="#2a2e33"/>`;
  svg += `<rect x="${x0}" y="${y0 + 22}" width="22" height="${H - 44}" rx="4" fill="#2a2e33"/>`; // pare-chocs arrière
  svg += `<rect x="${x0 + 2}" y="${y0 + 26}" width="10" height="26" fill="#c0392b"/><rect x="${x0 + 2}" y="${y0 + H - 52}" width="10" height="26" fill="#c0392b"/>`;
  svg += `<rect x="${C.right - 230}" y="${y0 + 40}" width="220" height="${H - 80}" rx="8" fill="#4a5058"/>`; // plateau avant
  const chassis = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}">${svg}</svg>`);
  const emptyPng = await sharp(await raw(empty)).composite([{ input: chassis }]).png().toBuffer();
  for (const [name, src] of [["truck-top-empty", emptyPng], ["container-top", await raw(box)]]) {
    const dir = join("assets-src/renders", name);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "frame_000.png"), await frameAt(1, src));
  }
}

// Bascule de caméra (les easings sont dans frameAt).
for (let i = 0; i < ROT_FRAMES; i++) await writeAll("truck-rotate", i, await frameAt(i / (ROT_FRAMES - 1)));

console.log(`camion (photos) : côté ${sideW} px (×${sS.toFixed(3)}), dessus ${topW} px (×${sT.toFixed(3)}), ${ROT_FRAMES} frames de bascule, ${wheels.length} roues`);
