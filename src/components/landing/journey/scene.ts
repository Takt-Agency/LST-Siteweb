/**
 * Géométrie déterministe de la carte (ville, conteneurs, nuages).
 * Le générateur pseudo-aléatoire et l'ordre des tirages reproduisent exactement la maquette HTML.
 */

export type Rect = { x: number; y: number; width: number; height: number; fill: string; opacity?: number };
export type Road = { d: string; strokeWidth: number };
export type IntroCloud = { x: number; y: number; r: number; sp: number };

const shades = ["#222428", "#25272b", "#202226", "#282a2f"];
const containerColors = ["#F8B80B", "#F2F3F5", "#5c6169", "#3d4148", "#7a7f88"];

function buildScene() {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const shade = () => shades[(rnd() * 4) | 0];
  const color = () => containerColors[(rnd() * containerColors.length) | 0];

  const xs = [1900, 1980, 2140, 2290, 2440, 2600, 2760, 2990];
  const ys = [300, 880, 1040, 1200, 1360, 1540, 1700, 1860, 2020, 2180, 2400];
  const major = new Set([1040, 1540, 2440]);

  const roads: Road[] = [
    ...xs.slice(1, -1).map((x) => ({ d: `M${x} 300V2400`, strokeWidth: major.has(x) ? 22 : 12 })),
    ...ys.slice(1, -1).map((y) => ({ d: `M1900 ${y}H2990`, strokeWidth: major.has(y) ? 22 : 12 })),
  ];

  const blocks: Rect[] = [];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i] + 16, x1 = xs[i + 1] - 16, y0 = ys[j] + 16, y1 = ys[j + 1] - 16;
      if (x0 > 2690 && y0 > 1370 && y1 < 1820) continue; // emplacement du port
      if (x1 - x0 < 30 || y1 - y0 < 30) continue;
      const n = rnd() < 0.6 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        const w = (x1 - x0 - (n - 1) * 12) / n;
        const bx = x0 + k * (w + 12);
        if (rnd() < 0.5) {
          const h = (y1 - y0 - 12) / 2;
          blocks.push({ x: bx, y: y0, width: w, height: h, fill: shade() });
          blocks.push({ x: bx, y: y0 + h + 12, width: w, height: h, fill: shade() });
        } else {
          blocks.push({ x: bx, y: y0, width: w, height: y1 - y0, fill: shade() });
        }
      }
    }
  }

  // Banlieue à l'ouest de l'aéroport.
  for (let q = 0; q < 26; q++) {
    const x = 1120 + rnd() * 700, y = 1120 + rnd() * 1200, width = 40 + rnd() * 90, height = 30 + rnd() * 70;
    blocks.push({ x, y, width, height, fill: shade(), opacity: 0.8 });
  }
  roads.push({ d: "M1100 1500H1900M1500 1040V2400", strokeWidth: 12 });

  // Conteneurs empilés sur le port.
  const stacks: Rect[] = [];
  for (let sy = 1400; sy < 1780; sy += 30) {
    if (sy > 1505 && sy < 1575) continue;
    for (let sx = 2720; sx < 2980; sx += 46) {
      if (rnd() < 0.18) continue;
      stacks.push({ x: sx, y: sy, width: 40, height: 22, fill: color(), opacity: 0.85 });
    }
  }

  // Conteneurs sur le bateau.
  const boxes: Rect[] = [];
  for (let bx = -104; bx < 92; bx += 24) {
    for (let by = -24; by < 24; by += 12) boxes.push({ x: bx, y: by, width: 22, height: 11, fill: color() });
  }

  // Nuages de l'introduction (ils s'écartent au début du défilement).
  const introClouds: IntroCloud[] = [];
  for (let n = 0; n < 16; n++) introClouds.push({ x: rnd(), y: rnd(), r: 110 + rnd() * 230, sp: 0.6 + rnd() * 0.8 });

  return { roads, blocks, stacks, boxes, introClouds };
}

export const scene = buildScene();

/** Nuages au-dessus de la carte pendant le vol : [x, y, taille] en coordonnées de la carte. */
export const skyClouds: [number, number, number][] = [
  [200, 900, 420], [520, 1500, 520], [760, 620, 360], [380, 300, 460], [980, 1200, 380],
  [60, 1300, 300], [640, 2100, 480], [1150, 420, 300], [900, 1750, 340],
];
