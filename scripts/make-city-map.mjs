#!/usr/bin/env node
/**
 * Carte urbaine sombre vue du ciel pour la scène « Route » de l'accueil (procédurale, déterministe).
 *   public/images/journey/city-map.svg  — îlots bâtis, parcs, rues, tracé principal, quai
 *   src/data/city-route.json            — tracé principal (pour MotionPath), jalons, dimensions
 *
 *   node scripts/make-city-map.mjs
 * Unités : 1 unité ≈ 7,5 cm (camion de 16,5 m = 220 unités, chaussée de 2 voies = 120 unités).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 5400, H = 3200;
const ROAD = 124;
const TRUCK = 220;

let seed = 2024;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const f = (n) => Math.round(n * 10) / 10;

/* ---------- Tracé principal (M / L / C absolus) ---------- */
const segs = [
  ["M", [-400, 1500]],
  ["L", [1350, 1500]],
  ["C", [1650, 1500], [1760, 1420], [1880, 1240]],
  ["C", [2000, 1060], [2130, 980], [2420, 980]],
  ["L", [3000, 980]],
  ["C", [3260, 980], [3380, 1080], [3460, 1290]],
  ["C", [3540, 1500], [3660, 1720], [3980, 1720]],
  ["L", [4980, 1720]],
];
const d = segs.map(([c, ...p]) => `${c}${p.map((q) => q.join(" ")).join(" ")}`).join(" ");

function sample(step = 6) {
  const pts = [];
  let cur;
  const bez = (a, b, c, e, t) => {
    const u = 1 - t;
    return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * e[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * e[1]];
  };
  for (const [c, ...p] of segs) {
    if (c === "M") { cur = p[0]; pts.push(cur); continue; }
    const n = 120;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      pts.push(c === "L" ? [cur[0] + (p[0][0] - cur[0]) * t, cur[1] + (p[0][1] - cur[1]) * t] : bez(cur, p[0], p[1], p[2], t));
    }
    cur = p[p.length - 1];
  }
  // Rééchantillonnage à pas constant + longueur cumulée.
  const out = [{ x: pts[0][0], y: pts[0][1], s: 0 }];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    out.push({ x: pts[i][0], y: pts[i][1], s: acc });
  }
  return { pts: out.filter((_, i) => i % Math.max(1, Math.round(step / 4)) === 0), length: acc };
}
const { pts: route, length: routeLength } = sample();
const at = (t) => {
  const s = t * routeLength;
  let i = route.findIndex((p) => p.s >= s);
  if (i <= 0) i = 1;
  const a = route[i - 1], b = route[i];
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  return { x: b.x, y: b.y, ang };
};
const rectNearRoute = (x, y, w, h, margin) => {
  for (const p of route) {
    const dx = Math.max(x - p.x, 0, p.x - (x + w)), dy = Math.max(y - p.y, 0, p.y - (y + h));
    if (dx * dx + dy * dy < margin * margin) return true;
  }
  return false;
};

/* ---------- Texture d'asphalte (bruit) embarquée ---------- */
async function noiseTile(size, base, spread, blur) {
  const buf = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    const v = Math.max(0, Math.min(255, base + (rnd() - 0.5) * spread + (rnd() < 0.015 ? 26 : 0)));
    buf[i * 3] = buf[i * 3 + 1] = buf[i * 3 + 2] = v;
  }
  const img = await sharp(buf, { raw: { width: size, height: size, channels: 3 } }).blur(blur).png({ compressionLevel: 9, palette: true, colours: 24 }).toBuffer();
  return `data:image/png;base64,${img.toString("base64")}`;
}
const asphalt = await noiseTile(160, 30, 20, 0.6);
const ground = await noiseTile(160, 24, 14, 0.9);

/* ---------- Composition ---------- */
const out = [];
out.push(`<rect width="${W}" height="${H}" fill="url(#ground)"/>`);
out.push(`<rect width="${W}" height="${H}" fill="#14161a" opacity=".55"/>`);

// Eau et quai à droite (fin du parcours, enchaîne sur la mer).
const QUAY_X = 4720;
out.push(`<rect x="${QUAY_X + 360}" y="0" width="${W - QUAY_X - 360}" height="${H}" fill="#0b2e4c"/>`);
out.push(`<rect x="${QUAY_X + 360}" y="0" width="70" height="${H}" fill="#123f63" opacity=".8"/>`);
out.push(`<rect x="${QUAY_X - 380}" y="0" width="740" height="${H}" fill="#2f3237"/>`);
out.push(`<rect x="${QUAY_X + 340}" y="0" width="22" height="${H}" fill="#6b7078"/>`);
for (let y = 60; y < H; y += 180) out.push(`<rect x="${QUAY_X + 346}" y="${y}" width="10" height="14" fill="#f8b80b"/>`);
// Piles de conteneurs sur le quai (hors chaussée).
const palette = ["#f8b80b", "#f2f3f5", "#33373d", "#8d949c"];
for (let bx = QUAY_X - 340; bx < QUAY_X + 300; bx += 92) {
  for (let by = 80; by < H - 80; by += 34) {
    if (Math.abs(by - 1720) < 210) continue;
    if (rnd() < 0.18) continue;
    out.push(`<rect x="${bx + 6}" y="${by + 6}" width="80" height="28" fill="#000" opacity=".35"/>`);
    out.push(`<rect x="${bx}" y="${by}" width="80" height="28" fill="${pick(palette)}"/>`);
  }
}
// Portiques (grues) jaunes au bord du quai.
for (const gy of [520, 1180, 2380, 2900]) {
  out.push(`<rect x="${QUAY_X + 210}" y="${gy + 20}" width="300" height="40" fill="#000" opacity=".35"/>`);
  out.push(`<rect x="${QUAY_X + 190}" y="${gy}" width="300" height="40" fill="#f8b80b"/><rect x="${QUAY_X + 190}" y="${gy}" width="300" height="40" fill="url(#vol)"/>`);
  out.push(`<rect x="${QUAY_X + 220}" y="${gy - 30}" width="36" height="100" fill="#d99f06"/><rect x="${QUAY_X + 400}" y="${gy - 30}" width="36" height="100" fill="#d99f06"/>`);
}

// Quartiers : grille de rues secondaires + îlots bâtis / parcs.
const PITCH = 300, STREET = 54;
const streets = [];
for (let x = -100; x < QUAY_X - 420; x += PITCH) streets.push(`<rect x="${x}" y="0" width="${STREET}" height="${H}" fill="url(#asphalt)"/>`);
for (let y = 40; y < H; y += PITCH) streets.push(`<rect x="0" y="${y}" width="${QUAY_X - 380}" height="${STREET}" fill="url(#asphalt)"/>`);
out.push(...streets);
for (let x = -100; x < QUAY_X - 420; x += PITCH) for (let y = 40; y < H; y += PITCH) {
  // marquage central discret des rues secondaires
  out.push(`<line x1="${x + STREET / 2}" y1="${y + STREET}" x2="${x + STREET / 2}" y2="${y + PITCH}" stroke="#4a4e55" stroke-width="2" stroke-dasharray="14 18" opacity=".6"/>`);
}
const roofs = ["#2a2e33", "#30343a", "#262a2f", "#383c42", "#2d3136", "#3e4249"];
for (let x = -100 + STREET; x < QUAY_X - 420; x += PITCH) for (let y = 40 + STREET; y < H; y += PITCH) {
  const bw = PITCH - STREET, bh = PITCH - STREET;
  if (rectNearRoute(x, y, bw, bh, ROAD / 2 + 40)) {
    // îlot partiellement traversé par le tracé : trottoir seulement
    out.push(`<rect x="${x + 4}" y="${y + 4}" width="${bw - 8}" height="${bh - 8}" rx="10" fill="#1c1f23"/>`);
    continue;
  }
  out.push(`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="12" fill="#3a3e44"/>`); // trottoir
  out.push(`<rect x="${x + 8}" y="${y + 8}" width="${bw - 16}" height="${bh - 16}" rx="8" fill="#202328"/>`);
  if (rnd() < 0.14) {
    // parc
    out.push(`<rect x="${x + 10}" y="${y + 10}" width="${bw - 20}" height="${bh - 20}" rx="8" fill="#1b2a21"/>`);
    for (let k = 0; k < 16; k++) {
      const tx = x + 30 + rnd() * (bw - 60), ty = y + 30 + rnd() * (bh - 60), r = 12 + rnd() * 16;
      out.push(`<circle cx="${f(tx + 6)}" cy="${f(ty + 8)}" r="${f(r)}" fill="#0c120e" opacity=".6"/><circle cx="${f(tx)}" cy="${f(ty)}" r="${f(r)}" fill="${pick(["#23392b", "#2a4433", "#1f3326"])}"/>`);
    }
    continue;
  }
  // bâtiments
  let yy = y + 16;
  while (yy < y + bh - 40) {
    const rh = 40 + rnd() * 70;
    let xx = x + 16;
    while (xx < x + bw - 40) {
      const rw = 40 + rnd() * 90;
      const ww = Math.min(rw, x + bw - 16 - xx), hh = Math.min(rh, y + bh - 16 - yy);
      if (ww > 24 && hh > 24) {
        const roof = pick(roofs);
        out.push(`<rect x="${f(xx + 7)}" y="${f(yy + 10)}" width="${f(ww)}" height="${f(hh)}" fill="#0b0c0e" opacity=".7"/>`);
        out.push(`<rect x="${f(xx)}" y="${f(yy)}" width="${f(ww - 4)}" height="${f(hh - 4)}" rx="2" fill="${roof}"/>`);
        if (rnd() < 0.4) out.push(`<rect x="${f(xx + ww * 0.3)}" y="${f(yy + hh * 0.3)}" width="${f(ww * 0.25)}" height="${f(hh * 0.25)}" fill="#4a4f56" opacity=".55"/>`);
      }
      xx += rw + 6;
    }
    yy += rh + 6;
  }
}

// Tracé principal : bordures, chaussée texturée, lignes de rive, axe discontinu.
out.push(`<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="${ROAD + 46}" stroke-linecap="butt" stroke-linejoin="round" transform="translate(6 9)"/>`);
out.push(`<path d="${d}" fill="none" stroke="#45494f" stroke-width="${ROAD + 30}" stroke-linejoin="round"/>`);
out.push(`<path d="${d}" fill="none" stroke="url(#asphalt)" stroke-width="${ROAD}" stroke-linejoin="round"/>`);
out.push(`<path d="${d}" fill="none" stroke="#e8eaed" stroke-opacity=".75" stroke-width="${ROAD - 14}" stroke-linejoin="round"/>`);
out.push(`<path d="${d}" fill="none" stroke="url(#asphalt)" stroke-width="${ROAD - 22}" stroke-linejoin="round"/>`);
out.push(`<path d="${d}" fill="none" stroke="#f2f3f5" stroke-opacity=".8" stroke-width="4" stroke-dasharray="44 40"/>`);
// Passages piétons le long du tracé.
// (pas d'îlot central : le camion roule sur l'axe du tracé)
for (const t of [0.05, 0.3, 0.58, 0.86]) {
  const p = at(t), deg = (p.ang * 180) / Math.PI;
  let z = "";
  for (let k = -ROAD / 2 + 12; k < ROAD / 2 - 12; k += 16) z += `<rect x="-22" y="${k}" width="44" height="9" fill="#f2f3f5" opacity=".7"/>`;
  out.push(`<g transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f(deg)})">${z}</g>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<pattern id="asphalt" width="160" height="160" patternUnits="userSpaceOnUse"><image href="${asphalt}" width="160" height="160"/></pattern>
<pattern id="ground" width="160" height="160" patternUnits="userSpaceOnUse"><image href="${ground}" width="160" height="160"/></pattern>
<linearGradient id="vol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
</defs>
${out.join("\n")}
</svg>`;

// Jalons (les 4 étapes de la méthode) : de part et d'autre de la route.
const milestones = [0.2, 0.42, 0.63, 0.83].map((t, i) => {
  const p = at(t);
  const side = i % 2 === 0 ? -1 : 1;
  const nx = -Math.sin(p.ang) * side, ny = Math.cos(p.ang) * side;
  return { t, x: f(p.x + nx * 230), y: f(p.y + ny * 230), side };
});

await mkdir(join(ROOT, "public/images/journey"), { recursive: true });
await writeFile(join(ROOT, "public/images/journey/city-map.svg"), svg);
await writeFile(
  join(ROOT, "src/data/city-route.json"),
  `${JSON.stringify({ width: W, height: H, road: d, roadWidth: ROAD, truckLength: TRUCK, length: f(routeLength), quayX: QUAY_X, milestones }, null, 2)}\n`,
);
console.log(`city-map.svg : ${(svg.length / 1024).toFixed(0)} Ko, tracé ${routeLength.toFixed(0)} unités`);
