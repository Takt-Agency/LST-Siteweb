/**
 * Découpage du parcours, en hauteurs d'écran de défilement (1 = 100svh).
 * La section mesure (TOTAL + 1) écrans ; la timeline GSAP a une durée de TOTAL.
 * Sur mobile, le CSS raccourcit la section (--scale) : toutes les scènes raccourcissent d'autant.
 */
export const SCENES = {
  air: [0, 3],
  intro: [3, 4.5],
  load: [4.5, 7],
  side: [7, 12],
  rotate: [12, 13.5],
  city: [13.5, 18],
  sea: [18, 21.5],
} as const satisfies Record<string, readonly [number, number]>;

export const TOTAL = SCENES.sea[1];

/** Mode d'affichage : statique (SSR, sans JS, reduced-motion) ou animé. */
export type JourneyMode = "static" | "live";
