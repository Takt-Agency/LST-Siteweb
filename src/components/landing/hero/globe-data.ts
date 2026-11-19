import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { MultiPolygon, Polygon, Position } from "geojson";

const RAD = Math.PI / 180;

/**
 * Coordonnées géographiques → point de la sphère (rayon r).
 * Longitude 0 face à la caméra (+Z), latitude vers +Y.
 */
export function latLonToVec(lat: number, lon: number, r = 1): [number, number, number] {
  const la = lat * RAD, lo = lon * RAD;
  return [r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo)];
}

/** Masque terre / mer (projection équirectangulaire) dessiné à partir de Natural Earth (world-atlas, land-110m). */
async function landMask(width: number) {
  const topo = (await import("world-atlas/land-110m.json")).default as unknown as Topology<{
    land: GeometryCollection;
  }>;
  const land = feature(topo, topo.objects.land);
  const height = width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const ring = (coords: Position[]) => {
    coords.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * width, y = ((90 - lat) / 180) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  };
  ctx.fillStyle = "#fff";
  const geoms = land.features.map((f) => f.geometry);
  for (const g of geoms) {
    const polys = g.type === "MultiPolygon" ? (g as MultiPolygon).coordinates : [(g as Polygon).coordinates];
    for (const poly of polys) {
      ctx.beginPath();
      poly.forEach(ring);
      ctx.fill("evenodd");
    }
  }
  const data = ctx.getImageData(0, 0, width, height).data;
  return (lat: number, lon: number) => {
    const x = Math.min(width - 1, Math.floor(((lon + 180) / 360) * width));
    const y = Math.min(height - 1, Math.floor(((90 - lat) / 180) * height));
    return data[(y * width + x) * 4] > 127;
  };
}

/**
 * Points des terres émergées, en rangées régulières (espacement constant à la surface).
 * `step` : écart entre points, en degrés (≈ 0,9 desktop, 1,4 mobile).
 */
export async function landDots(step: number): Promise<Float32Array> {
  const isLand = await landMask(1440);
  const out: number[] = [];
  for (let lat = -84; lat <= 84; lat += step) {
    const n = Math.max(1, Math.round((360 * Math.cos(lat * RAD)) / step));
    const offset = (Math.round(lat / step) % 2) * 0.5; // quinconce
    for (let k = 0; k < n; k++) {
      const lon = -180 + ((k + offset) / n) * 360;
      if (isLand(lat, lon)) out.push(...latLonToVec(lat, lon, 1));
    }
  }
  return new Float32Array(out);
}

/** Interpolation sphérique entre deux points unitaires, soulevée au milieu (arc au-dessus du globe). */
export function arcPoints(a: [number, number, number], b: [number, number, number], segments = 64) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const lift = 0.06 + 0.32 * (omega / Math.PI);
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const s0 = Math.sin((1 - t) * omega) / Math.sin(omega), s1 = Math.sin(t * omega) / Math.sin(omega);
    const r = 1.003 + lift * Math.sin(Math.PI * t);
    pts.push([(a[0] * s0 + b[0] * s1) * r, (a[1] * s0 + b[1] * s1) * r, (a[2] * s0 + b[2] * s1) * r]);
  }
  return pts;
}
