import manifest from "./sequences.json";
import type { FrameSet } from "@/components/scroll/frames";

/**
 * Séquences d'images réalistes (rendus 3D pré-calculés). Le manifeste sequences.json est généré par
 * `npm run assets:encode` (voir docs/assets.md) : ne pas l'éditer à la main.
 */
type Manifest = typeof manifest;
type Entry = Manifest[keyof Manifest];
export type SequenceName = keyof Manifest;

/** Livrée de la cabine du camion. TODO(client) : choisir entre « yellow » (#f8b80b) et « black ». */
export const TRUCK_LIVERY: "yellow" | "black" = "yellow";

export type Box = { x: number; y: number; w: number; h: number };
export type Wheel = { x: number; y: number; d: number };

export type Sequence = {
  frames: FrameSet;
  mobileFrames: FrameSet;
  aspect: number;
  /** Emprise du sujet (pixels non transparents) dans la première et la dernière frame, en % du cadre. */
  bbox: { first: Box; last: Box };
  wheels: Wheel[];
};

export function sequence(name: SequenceName): Sequence {
  const m: Entry = manifest[name];
  return {
    frames: { ...m.desktop, aspect: m.aspect },
    mobileFrames: { ...m.mobile, aspect: m.aspect },
    aspect: m.aspect,
    bbox: m.bbox,
    wheels: "wheels" in m ? (m.wheels as Wheel[]) : [],
  };
}

/** Séquence d'un véhicule décliné en livrées (truck-*, reachstacker-load). */
export const truckSequence = (base: "truck-side" | "truck-rotate" | "truck-top" | "reachstacker-load") =>
  sequence(`${base}-${TRUCK_LIVERY}` as SequenceName);

/** URL de la roue (WebP : universellement supporté, petite image). */
export const WHEEL_SRC = "/sequences/wheel/desktop/frame_000.webp";
