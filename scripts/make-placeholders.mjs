#!/usr/bin/env node
/**
 * Frames PLACEHOLDER (silhouettes simples) pour faire tourner le site de bout en bout
 * en attendant les rendus Blender (scripts/blender/render_sequences.py).
 *
 * Produit les mêmes fichiers que Blender : assets-src/renders/<séquence>[-<livrée>]/frame_000.png…
 * (+ wheels.json pour truck-side). Ensuite : `npm run assets:encode`.
 *
 *   node scripts/make-placeholders.mjs [--only=truck-rotate,ship-top]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(await readFile(join(ROOT, "scripts/sequences.config.json"), "utf8"));
const OUT = join(ROOT, "assets-src/renders");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");

const monogram = `data:image/png;base64,${(await readFile(join(ROOT, "public/brand/lst-monogramme.png"))).toString("base64")}`;
const MONO_RATIO = 277 / 124;

const f = (n) => n.toFixed(1);
const pts = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");
const easeInOut = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(Math.min(255, Math.max(0, v * k))));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
function rng(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const svgDoc = (w, h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  `<defs><filter id="blur" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="12"/></filter>` +
  `<filter id="blurS" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="4"/></filter>` +
  `<linearGradient id="vol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>` +
  `${defs}</defs>${body}</svg>`;

async function writeFrame(name, i, svg) {
  const dir = join(OUT, name);
  await mkdir(dir, { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toFile(join(dir, `frame_${String(i).padStart(3, "0")}.png`));
}

/* =========================================================================
 * Camion (tracteur + remorque porte-conteneur 40'), caméra orthographique
 * en élévation θ : 0 = vue de côté, π/2 = vue du dessus. Mètres → pixels.
 * X : longueur (avant du camion vers +X), Y : profondeur (vers la caméra), Z : hauteur.
 * ========================================================================= */
function truckModel(cab) {
  return {
    boxes: [
      { x: [-8.2, 4.7], z: [1.0, 1.3], w: 2.5, side: "#2a2e33", top: "#33373d" },
      { x: [4.3, 8.1], z: [0.55, 1.0], w: 2.4, side: "#1f2226", top: "#2a2e33" },
      { x: [4.72, 5.05], z: [1.0, 3.3], w: 2.2, side: "#2a2e33", top: "#3a3f45" },
      { x: [-8.1, 4.1], z: [1.3, 3.9], w: 2.44, side: "#f2f3f5", top: "#e8eaed", kind: "container" },
      { x: [5.05, 7.95], z: [0.9, 3.65], w: 2.5, side: cab, top: shade(cab, 1.12), kind: "cab" },
    ],
    wheels: [-6.9, -5.6, -4.3, 4.9, 7.25].map((x) => ({ x, z: 0.5, r: 0.5 })),
    length: [-8.3, 8.2],
  };
}

function projector({ s, cx, cy, zc, theta }) {
  const c = Math.cos(theta), sn = Math.sin(theta);
  return {
    c, sn,
    p: (X, Y, Z) => [cx + X * s, cy - ((Z - zc) * c - Y * sn) * s],
    /** Matrice SVG du plan vertical Y = y0 (coordonnées locales : X, −Z), en mètres. */
    sideMatrix: (y0) => `matrix(${s} 0 0 ${s * c} ${cx} ${cy + s * zc * c + s * y0 * sn})`,
    /** Matrice SVG du plan horizontal Z = z0 (coordonnées locales : X, Y). */
    topMatrix: (z0) => `matrix(${s} 0 0 ${s * sn} ${cx} ${cy - (z0 - zc) * c * s})`,
  };
}

function drawTruck(model, P, { wheels = true, dx = 0 } = {}) {
  const { p, c, sn } = P;
  let out = "";
  // Ombre de contact au sol (Z = 0), décalée vers la lumière en vue du dessus.
  const [x0, x1] = model.length;
  out += `<polygon points="${pts([p(x0 + dx + 0.4 * sn, -1.4 + 0.5 * sn, 0), p(x1 + dx + 0.4 * sn, -1.4 + 0.5 * sn, 0), p(x1 + dx + 0.4 * sn, 1.5 + 0.5 * sn, 0), p(x0 + dx + 0.4 * sn, 1.5 + 0.5 * sn, 0)])}" fill="#000" opacity="${0.28 + 0.12 * sn}" filter="url(#blur)"/>`;
  out += `<polygon points="${pts([p(x0 + dx + 0.6, 0, 0), p(x1 + dx - 0.4, 0, 0), p(x1 + dx - 0.4, 1.3, 0), p(x0 + dx + 0.6, 1.3, 0)])}" fill="#000" opacity="${0.35 * c}" filter="url(#blurS)"/>`;

  if (wheels) {
    for (const wh of model.wheels) {
      const [wx, wy] = p(wh.x + dx, 1.12, wh.z);
      const rx = wh.r * P.s, ry = wh.r * P.s * c;
      if (ry > 0.5) {
        out += `<ellipse cx="${f(wx)}" cy="${f(wy)}" rx="${f(rx)}" ry="${f(ry)}" fill="#15171a"/>`;
        out += `<ellipse cx="${f(wx)}" cy="${f(wy)}" rx="${f(rx * 0.56)}" ry="${f(ry * 0.56)}" fill="#8d949c"/>`;
        out += `<ellipse cx="${f(wx)}" cy="${f(wy)}" rx="${f(rx * 0.2)}" ry="${f(ry * 0.2)}" fill="#2a2e33"/>`;
      }
      // Bande de roulement visible d'en haut.
      if (sn > 0.05) {
        const a = p(wh.x + dx - wh.r, 0.85, wh.z + wh.r), b = p(wh.x + dx + wh.r, 1.3, wh.z + wh.r);
        out += `<rect x="${f(a[0])}" y="${f(Math.min(a[1], b[1]))}" width="${f(b[0] - a[0])}" height="${f(Math.abs(b[1] - a[1]))}" fill="#15171a" opacity="${sn}"/>`;
      }
    }
  }

  const boxes = [...model.boxes].sort((a, b) => a.z[1] - b.z[1]);
  for (const b of boxes) {
    const [bx0, bx1] = [b.x[0] + dx, b.x[1] + dx];
    const [z0, z1] = b.z, hw = b.w / 2;
    // Face latérale (Y = +w/2).
    if (c > 0.01) {
      const face = [p(bx0, hw, z0), p(bx1, hw, z0), p(bx1, hw, z1), p(bx0, hw, z1)];
      out += `<polygon points="${pts(face)}" fill="${b.side}"/>`;
      out += `<g transform="${P.sideMatrix(hw)}">`;
      if (b.kind === "container") {
        for (let x = bx0 + 0.3; x < bx1 - 0.1; x += 0.28)
          out += `<line x1="${f(x)}" y1="${-z1 + 0.08}" x2="${f(x)}" y2="${-z0 - 0.08}" stroke="#000" stroke-opacity=".07" stroke-width=".05"/>`;
        out += `<rect x="${bx0}" y="${-z0 - 0.32}" width="${bx1 - bx0}" height="0.14" fill="#f8b80b"/>`;
        const lw = 4.8, lh = lw / MONO_RATIO;
        out += `<image href="${monogram}" x="${f(bx0 + 3.4)}" y="${-(z0 + z1) / 2 - lh / 2 - 0.05}" width="${lw}" height="${lh}"/>`;
      }
      if (b.kind === "cab") {
        out += `<path d="M${bx1 - 1.05} ${-z1 + 0.25}H${bx1 - 0.08}V${-z1 + 1.15}H${bx1 - 1.25}Z" fill="#1b2330"/>`;
        out += `<path d="M${bx1 - 0.95} ${-z1 + 0.3}H${bx1 - 0.55}L${bx1 - 0.9} ${-z1 + 1.05}H${bx1 - 1.1}Z" fill="#fff" opacity=".12"/>`;
        out += `<path d="M${bx0 + 0.9} ${-z1 + 0.3}V${-z0 - 0.3}" stroke="#000" stroke-opacity=".18" stroke-width=".04"/>`;
        out += `<rect x="${bx1 - 0.12}" y="${-z0 - 0.75}" width="0.12" height="0.3" fill="#fff6d8"/>`;
        out += `<rect x="${bx0 + 0.2}" y="${-z0 - 0.05}" width="${bx1 - bx0 - 0.2}" height="0.25" fill="#15171a" transform="translate(0 -0.15)"/>`;
      }
      out += `</g>`;
      out += `<polygon points="${pts(face)}" fill="url(#vol)"/>`;
    }
    // Face supérieure (Z = z1).
    if (sn > 0.01) {
      const top = [p(bx0, -hw, z1), p(bx1, -hw, z1), p(bx1, hw, z1), p(bx0, hw, z1)];
      out += `<polygon points="${pts(top)}" fill="${b.top}"/>`;
      out += `<g transform="${P.topMatrix(z1)}">`;
      if (b.kind === "container") {
        for (let x = bx0 + 0.5; x < bx1 - 0.2; x += 0.6)
          out += `<line x1="${f(x)}" y1="${-hw + 0.06}" x2="${f(x)}" y2="${hw - 0.06}" stroke="#000" stroke-opacity=".06" stroke-width=".06"/>`;
        const lw = 4, lh = lw / MONO_RATIO;
        out += `<image href="${monogram}" x="${f(bx0 + 4)}" y="${-lh / 2}" width="${lw}" height="${lh}"/>`;
      }
      if (b.kind === "cab") {
        out += `<rect x="${bx0 + 0.6}" y="${-hw + 0.35}" width="1.3" height="${b.w - 0.7}" rx=".15" fill="#000" opacity=".08"/>`;
        out += `<rect x="${bx1 - 0.25}" y="${-hw + 0.1}" width="0.18" height="${b.w - 0.2}" fill="#1b2330" opacity=".7"/>`;
      }
      out += `</g>`;
      out += `<polygon points="${pts(top)}" fill="#fff" opacity="${0.06 * sn}"/>`;
    }
  }
  return out;
}

const TRUCK_VIEW = { s: 80, cx: 960, cy: 540, zc: 2.0 };

async function truckSequences(variant) {
  const cab = config.liveries[variant].cab;
  const model = truckModel(cab);
  const [W, H] = config.sequences["truck-rotate"].resolution;
  const n = config.sequences["truck-rotate"].frames;
  const jobs = [];

  if (want("truck-rotate"))
    for (let i = 0; i < n; i++) {
      const P = { ...projector({ ...TRUCK_VIEW, theta: (Math.PI / 2) * easeInOut(i / (n - 1)) }), s: TRUCK_VIEW.s };
      jobs.push(writeFrame(`truck-rotate-${variant}`, i, svgDoc(W, H, drawTruck(model, P))));
    }

  if (want("truck-side")) {
    const P = { ...projector({ ...TRUCK_VIEW, theta: 0 }), s: TRUCK_VIEW.s };
    jobs.push(writeFrame(`truck-side-${variant}`, 0, svgDoc(W, H, drawTruck(model, P, { wheels: false }))));
    // Position des roues, en % du cadre (même format que la sortie Blender).
    const wheels = model.wheels.map((wh) => {
      const [x, y] = P.p(wh.x, 1.12, wh.z);
      return { x: +((x / W) * 100).toFixed(3), y: +((y / H) * 100).toFixed(3), d: +(((2 * wh.r * P.s) / W) * 100).toFixed(3) };
    });
    await mkdir(join(OUT, `truck-side-${variant}`), { recursive: true });
    await writeFile(join(OUT, `truck-side-${variant}`, "wheels.json"), JSON.stringify(wheels, null, 2));
  }

  if (want("truck-top")) {
    const P = { ...projector({ ...TRUCK_VIEW, theta: Math.PI / 2 }), s: TRUCK_VIEW.s };
    jobs.push(writeFrame(`truck-top-${variant}`, 0, svgDoc(W, H, drawTruck(model, P))));
  }

  if (want("reachstacker-load")) {
    const m = config.sequences["reachstacker-load"].frames;
    const view = { s: 48, cx: 960, cy: 640, zc: 2.0, theta: 0 };
    const P = { ...projector(view), s: view.s };
    const truckDx = 9;
    // Remorque vide : le conteneur est porté par la grue.
    const empty = { ...model, boxes: model.boxes.filter((b) => b.kind !== "container") };
    const container = model.boxes.find((b) => b.kind === "container");
    const len = container.x[1] - container.x[0], hgt = container.z[1] - container.z[0];
    const endX = container.x[0] + truckDx; // position finale (sur la remorque)
    const startX = -11.4;
    for (let i = 0; i < m; i++) {
      const t = i / (m - 1);
      // Trajectoire : prise (0–0,15), levée (–0,4), translation (–0,72), dépose (–0,9), repli.
      const lift = easeInOut(Math.min(1, Math.max(0, (t - 0.12) / 0.26)));
      const move = easeInOut(Math.min(1, Math.max(0, (t - 0.36) / 0.36)));
      const drop = easeInOut(Math.min(1, Math.max(0, (t - 0.72) / 0.18)));
      const release = easeInOut(Math.min(1, Math.max(0, (t - 0.9) / 0.1)));
      const cxm = startX + (endX - startX) * move;
      const z0 = 0 + 5.4 * lift - (5.4 - container.z[0]) * drop;
      const machineDx = (endX - startX) * move - 1.2 * release;

      let body = "";
      // Grue (derrière le camion) : châssis, contrepoids, cabine, flèche jaune, palonnier.
      const mx = (x) => x + machineDx + 1.5;
      const rb = [
        { x: [mx(-21), mx(-14.2)], z: [0.7, 2.8], c: "#33373d" },
        { x: [mx(-21.6), mx(-20.2)], z: [0.9, 3.2], c: "#26292e" },
        { x: [mx(-17.2), mx(-15.4)], z: [2.8, 5.0], c: "#2a2e33" },
      ];
      body += `<ellipse cx="${f(P.p(mx(-17.5), 0, 0)[0])}" cy="${f(P.p(0, 0, 0)[1])}" rx="${f(5 * P.s)}" ry="10" fill="#000" opacity=".35" filter="url(#blurS)"/>`;
      for (const b of rb) {
        const q = [P.p(b.x[0], 0, b.z[0]), P.p(b.x[1], 0, b.z[0]), P.p(b.x[1], 0, b.z[1]), P.p(b.x[0], 0, b.z[1])];
        body += `<polygon points="${pts(q)}" fill="${b.c}"/><polygon points="${pts(q)}" fill="url(#vol)"/>`;
      }
      const glass = [P.p(mx(-16.9), 0, 3.3), P.p(mx(-15.6), 0, 3.3), P.p(mx(-15.6), 0, 4.7), P.p(mx(-16.9), 0, 4.7)];
      body += `<polygon points="${pts(glass)}" fill="#1b2330"/>`;
      for (const wx of [-19.6, -15.4]) {
        const [x, y] = P.p(mx(wx), 0, 0.9);
        body += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.9 * P.s)}" fill="#15171a"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(0.45 * P.s)}" fill="#8d949c"/>`;
      }
      const pivot = P.p(mx(-19.8), 0, 3.4);
      const tip = P.p(cxm + len / 2, 0, z0 + hgt + 0.7 + 0.5 * release);
      const ang = Math.atan2(tip[1] - pivot[1], tip[0] - pivot[0]);
      const bw = 0.42 * P.s, nx = -Math.sin(ang) * bw, ny = Math.cos(ang) * bw;
      body += `<polygon points="${pts([[pivot[0] + nx, pivot[1] + ny], [tip[0] + nx * 0.7, tip[1] + ny * 0.7], [tip[0] - nx * 0.7, tip[1] - ny * 0.7], [pivot[0] - nx, pivot[1] - ny]])}" fill="#f8b80b"/>`;
      body += `<polygon points="${pts([[pivot[0] + nx, pivot[1] + ny], [tip[0] + nx * 0.7, tip[1] + ny * 0.7], [tip[0], tip[1]], [pivot[0], pivot[1]]])}" fill="#000" opacity=".12"/>`;
      const sp = [P.p(cxm + 0.3, 0, z0 + hgt + 0.15 + 0.5 * release), P.p(cxm + len - 0.3, 0, z0 + hgt + 0.15 + 0.5 * release), P.p(cxm + len - 0.3, 0, z0 + hgt + 0.55 + 0.5 * release), P.p(cxm + 0.3, 0, z0 + hgt + 0.55 + 0.5 * release)];
      body += `<polygon points="${pts(sp)}" fill="#2a2e33"/>`;

      body += drawTruck(empty, P, { dx: truckDx });

      // Conteneur porté (même rendu que sur la remorque).
      const carried = { boxes: [{ ...container, x: [cxm, cxm + len], z: [z0, z0 + hgt] }], wheels: [], length: [cxm, cxm + len] };
      const shadowY = P.p(0, 0, 0)[1];
      body += `<ellipse cx="${f(P.p(cxm + len / 2, 0, 0)[0])}" cy="${f(shadowY)}" rx="${f((len / 2) * P.s)}" ry="${f(8 + z0 * 2)}" fill="#000" opacity="${f(0.3 - Math.min(0.2, z0 * 0.03))}" filter="url(#blurS)"/>`;
      body += drawTruck(carried, P, { wheels: false }).replace(/<polygon[^>]*filter="url\(#blur\)"\/>/, "").replace(/<polygon[^>]*filter="url\(#blurS\)"\/>/, "");
      jobs.push(writeFrame(`reachstacker-load-${variant}`, i, svgDoc(W, H, body)));
    }
  }
  await Promise.all(jobs);
}

/* ---------- Roue (vue de côté) ---------- */
async function wheel() {
  const [W] = config.sequences.wheel.resolution;
  const c = W / 2, r = W / 2 - 2;
  let b = `<circle cx="${c}" cy="${c}" r="${r}" fill="#15171a"/>`;
  b += `<circle cx="${c}" cy="${c}" r="${r * 0.86}" fill="none" stroke="#24272b" stroke-width="${r * 0.06}"/>`;
  b += `<circle cx="${c}" cy="${c}" r="${r * 0.58}" fill="#9aa1aa"/>`;
  b += `<circle cx="${c}" cy="${c}" r="${r * 0.58}" fill="url(#rim)"/>`;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    b += `<ellipse cx="${f(c + Math.cos(a) * r * 0.4)}" cy="${f(c + Math.sin(a) * r * 0.4)}" rx="${r * 0.09}" ry="${r * 0.05}" transform="rotate(${(a * 180) / Math.PI} ${f(c + Math.cos(a) * r * 0.4)} ${f(c + Math.sin(a) * r * 0.4)})" fill="#4a5058"/>`;
  }
  for (let k = 0; k < 10; k++) {
    const a = ((k + 0.5) / 10) * Math.PI * 2;
    b += `<circle cx="${f(c + Math.cos(a) * r * 0.24)}" cy="${f(c + Math.sin(a) * r * 0.24)}" r="${r * 0.03}" fill="#2a2e33"/>`;
  }
  b += `<circle cx="${c}" cy="${c}" r="${r * 0.14}" fill="#2a2e33"/>`;
  b += `<circle cx="${c + r * 0.5}" cy="${c}" r="${r * 0.035}" fill="#f8b80b"/>`;
  const defs = `<radialGradient id="rim" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient>`;
  await writeFrame("wheel", 0, svgDoc(W, W, b, defs));
}

/* ---------- Porte-conteneurs vu du dessus (proue vers la droite) ---------- */
async function ship() {
  const [W, H] = config.sequences["ship-top"].resolution;
  const s = 7.4, cx = W / 2, cy = H / 2;
  const p = (x, y) => [cx + x * s, cy + y * s];
  const hull = [];
  hull.push(p(-150, -19), p(-148, -21.5), p(-140, -22.5));
  for (let x = -140; x <= 92; x += 4) hull.push(p(x, -22.5));
  for (let k = 0; k <= 16; k++) { const t = k / 16; hull.push(p(92 + 58 * Math.sin((t * Math.PI) / 2), -22.5 * Math.cos((t * Math.PI) / 2) ** 0.8)); }
  for (let k = 15; k >= 0; k--) { const t = k / 16; hull.push(p(92 + 58 * Math.sin((t * Math.PI) / 2), 22.5 * Math.cos((t * Math.PI) / 2) ** 0.8)); }
  for (let x = 92; x >= -140; x -= 4) hull.push(p(x, 22.5));
  hull.push(p(-148, 21.5), p(-150, 19));
  let b = `<polygon points="${pts(hull.map(([x, y]) => [x + 10, y + 14]))}" fill="#000" opacity=".35" filter="url(#blur)"/>`;
  b += `<polygon points="${pts(hull)}" fill="#2a2e33"/>`;
  b += `<polygon points="${pts(hull.map(([x, y]) => [cx + (x - cx) * 0.985, cy + (y - cy) * 0.93]))}" fill="#3b4047"/>`;
  const rand = rng(7);
  const palette = config.containerColors;
  for (let bx = -104; bx < 112; bx += 6.6) {
    const taper = bx > 80 ? Math.max(0, 1 - (bx - 80) / 40) : 1;
    const rows = Math.max(4, Math.round(16 * taper));
    for (let r = 0; r < rows; r++) {
      if (rand() < 0.05) continue;
      const y = -rows * 1.25 + r * 2.5;
      const col = palette[Math.floor(rand() * palette.length)];
      const [x0, y0] = p(bx, y + 0.1);
      b += `<rect x="${f(x0)}" y="${f(y0)}" width="${f(6.2 * s)}" height="${f(2.3 * s)}" fill="${col}"/>`;
      b += `<rect x="${f(x0)}" y="${f(y0)}" width="${f(6.2 * s)}" height="${f(2.3 * s)}" fill="url(#vol)"/>`;
    }
  }
  // Château (passerelle) près de la poupe, cheminée jaune LST.
  const [qx, qy] = p(-128, -20);
  b += `<rect x="${f(qx + 10)}" y="${f(qy + 12)}" width="${f(15 * s)}" height="${f(40 * s)}" fill="#000" opacity=".3" filter="url(#blurS)"/>`;
  b += `<rect x="${f(qx)}" y="${f(qy)}" width="${f(15 * s)}" height="${f(40 * s)}" rx="4" fill="#e9ebee"/>`;
  b += `<rect x="${f(qx + 1.5 * s)}" y="${f(qy + 4 * s)}" width="${f(12 * s)}" height="${f(32 * s)}" rx="3" fill="#d6d9de"/>`;
  const [fx, fy] = p(-140, -4);
  b += `<rect x="${f(fx)}" y="${f(fy)}" width="${f(7 * s)}" height="${f(8 * s)}" rx="6" fill="#f8b80b"/><rect x="${f(fx + 1.5 * s)}" y="${f(fy + 2 * s)}" width="${f(4 * s)}" height="${f(4 * s)}" rx="3" fill="#1c1e21"/>`;
  await writeFrame("ship-top", 0, svgDoc(W, H, b));
}

/* ---------- Avion cargo vu du dessus (nez vers la droite) ---------- */
async function plane() {
  const [W] = config.sequences["plane-top"].resolution;
  const s = 24, c = W / 2;
  const p = (x, y) => [c + x * s, c + y * s];
  const wing = (sg) => [p(6, 3 * sg), p(-13, 30 * sg), p(-17, 30 * sg), p(-9, 3 * sg)];
  const stab = (sg) => [p(-24, 2 * sg), p(-31, 11 * sg), p(-33.5, 11 * sg), p(-30, 2 * sg)];
  let b = "";
  const body = (dx, dy, fill) => {
    let o = "";
    for (const sg of [-1, 1]) o += `<polygon points="${pts(wing(sg).map(([x, y]) => [x + dx, y + dy]))}" fill="${fill ?? "#dfe2e6"}"/>`;
    for (const sg of [-1, 1]) o += `<polygon points="${pts(stab(sg).map(([x, y]) => [x + dx, y + dy]))}" fill="${fill ?? "#dfe2e6"}"/>`;
    const [x0, y0] = p(-33, -3);
    o += `<rect x="${f(x0 + dx)}" y="${f(y0 + dy)}" width="${f(64 * s)}" height="${f(6 * s)}" rx="${f(3 * s)}" fill="${fill ?? "#f2f3f5"}"/>`;
    return o;
  };
  b += `<g opacity=".0">${body(0, 0, "#000")}</g>`;
  b += body(0, 0);
  for (const sg of [-1, 1]) for (const [ex, ey] of [[-1, 10], [-7.5, 18.5]]) {
    const [x, y] = p(ex, ey * sg - 1);
    b += `<rect x="${f(x)}" y="${f(y)}" width="${f(5.5 * s)}" height="${f(2 * s)}" rx="${f(1 * s)}" fill="#9aa1aa"/><rect x="${f(x + 4.6 * s)}" y="${f(y + 0.2 * s)}" width="${f(0.9 * s)}" height="${f(1.6 * s)}" rx="${f(0.5 * s)}" fill="#33373d"/>`;
  }
  const [tx, ty] = p(-33, -0.6);
  b += `<rect x="${f(tx)}" y="${f(ty)}" width="${f(12 * s)}" height="${f(1.2 * s)}" rx="${f(0.6 * s)}" fill="#f8b80b"/>`;
  const [kx, ky] = p(26.5, -2);
  b += `<path d="M${f(kx)} ${f(ky)}q${f(2.2 * s)} ${f(2 * s)} 0 ${f(4 * s)}" fill="none" stroke="#1b2330" stroke-width="${f(0.8 * s)}" stroke-linecap="round"/>`;
  const lw = 9 * s, lh = lw / MONO_RATIO, [lx, ly] = p(-8, 0);
  b += `<image href="${monogram}" x="${f(lx)}" y="${f(ly - lh / 2)}" width="${f(lw)}" height="${f(lh)}" opacity=".9"/>`;
  b += `<rect x="${f(p(-33, -3)[0])}" y="${f(p(0, -3)[1])}" width="${f(64 * s)}" height="${f(6 * s)}" rx="${f(3 * s)}" fill="url(#cyl)"/>`;
  const defs = `<linearGradient id="cyl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".35" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>`;
  await writeFrame("plane-top", 0, svgDoc(W, W, b, defs));
}

function want(name) {
  return !only || only.includes(name);
}

const t0 = Date.now();
for (const v of Object.keys(config.liveries)) await truckSequences(v);
if (want("wheel")) await wheel();
if (want("ship-top")) await ship();
if (want("plane-top")) await plane();
console.log(`Placeholders écrits dans assets-src/renders/ en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
