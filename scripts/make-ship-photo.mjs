/**
 * Navire vu du dessus à partir d'une photo détourée (assets-src/photos/ship-top.png, proue vers la droite),
 * à la place du placeholder :
 *
 *   node scripts/make-ship-photo.mjs && node scripts/encode-frames.mjs --only=ship-top
 *
 * - seule la coque est gardée : l'écume et le sillage de la photo sont retirés (le sillage est dessiné par
 *   l'océan WebGL, et il n'y en a pas quand le navire est à quai) ; une ombre douce est ajoutée dessous ;
 * - deux cases (un 40') sont vidées sur le pont, avec des repères jaunes : le conteneur LST du camion y est
 *   posé à l'embarquement ;
 * - écrit src/data/ship-slot.json (poupe, axe, emplacement libre, en fractions du cadre), lu par la timeline.
 *
 * Mesures en pixels de la photo : à remesurer si l'image change.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SRC = "assets-src/photos/ship-top.png";
const OUT = "assets-src/renders/ship-top";
/** Contour de la coque : poupe à coins arrondis, flancs droits, étrave en ogive. */
const HULL = "M455 292 Q455 267 480 267 L1760 268 C1850 275 1915 330 1938 391 C1915 452 1850 500 1760 505 L480 505 Q455 505 455 480 Z";
const STERN = 455, BOW = 1938, AXIS = 387;
/** Emplacement libre : deux premières baies (après la passerelle), rangée juste au-dessus de l'axe. */
const SLOT = { x0: 712, x1: 779, y0: 369, y1: 382 };
const DECK = { r: 34, g: 38, b: 46 };
/** Cadre de sortie (rapport 4:1), coque centrée, à la résolution de la photo. */
const FRAME = { w: 1600, h: 400 };

const { width, height } = await sharp(SRC).metadata();
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`);

// Case vide (pont) + repères jaunes aux coins, peints sur la photo.
const corners = [[SLOT.x0, SLOT.y0, 1, 1], [SLOT.x1, SLOT.y0, -1, 1], [SLOT.x0, SLOT.y1, 1, -1], [SLOT.x1, SLOT.y1, -1, -1]]
  .map(([x, y, dx, dy]) => `<path d="M${x + dx * 7} ${y}H${x}V${y + dy * 5}" fill="none" stroke="#f8b80b" stroke-width="1.6"/>`)
  .join("");
const slot = svg(
  `<rect x="${SLOT.x0}" y="${SLOT.y0}" width="${SLOT.x1 - SLOT.x0}" height="${SLOT.y1 - SLOT.y0}" fill="rgb(${DECK.r},${DECK.g},${DECK.b})"/>` +
    `<rect x="${SLOT.x0}" y="${SLOT.y0}" width="${SLOT.x1 - SLOT.x0}" height="${SLOT.y1 - SLOT.y0}" fill="none" stroke="#000" stroke-opacity=".35"/>${corners}`,
);
const painted = await sharp(SRC).ensureAlpha().composite([{ input: slot }]).png().toBuffer();

// Coque seule (masque du contour, bord adouci d'un demi-pixel).
const mask = svg(`<path d="${HULL}" fill="#fff"/>`);
const hull = await sharp(painted).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
// Ombre : silhouette de la coque, floutée et décalée.
const shadow = await sharp(svg(`<path d="${HULL}" fill="#000" fill-opacity=".45" transform="translate(9 13)"/>`)).blur(9).png().toBuffer();

const dx = Math.round(FRAME.w / 2 - (STERN + BOW) / 2), dy = Math.round(FRAME.h / 2 - AXIS);
const layer = async (buf) => {
  // Recadre la photo (pleine taille) sur le cadre de sortie, décalée de (dx, dy).
  const left = -dx, top = -dy;
  return sharp(buf).extract({ left, top, width: FRAME.w, height: FRAME.h }).png().toBuffer();
};
await mkdir(OUT, { recursive: true });
await sharp({ create: { width: FRAME.w, height: FRAME.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: await layer(shadow) }, { input: await layer(hull) }])
  .png()
  .toFile(`${OUT}/frame_000.png`);

const r5 = (v) => +v.toFixed(5);
const geo = {
  stern: r5((STERN + dx) / FRAME.w),
  axis: r5((AXIS + dy) / FRAME.h),
  slot: { x: r5(((SLOT.x0 + SLOT.x1) / 2 + dx) / FRAME.w), y: r5(((SLOT.y0 + SLOT.y1) / 2 + dy) / FRAME.h), len: r5((SLOT.x1 - SLOT.x0) / FRAME.w) },
};
await writeFile("src/data/ship-slot.json", JSON.stringify(geo, null, 2) + "\n");
console.log(`ship-top (photo) : coque ${BOW - STERN} px dans ${FRAME.w}×${FRAME.h}`, geo);
