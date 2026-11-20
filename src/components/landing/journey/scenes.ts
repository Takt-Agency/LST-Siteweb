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
  sea: [18, 23.5],
} as const satisfies Record<string, readonly [number, number]>;

export const TOTAL = SCENES.sea[1];

/**
 * Embarquement, à cheval sur la fin de la ville et le début de la mer : le camion s'arrête au bord du quai,
 * son conteneur est posé dans un emplacement libre du navire amarré pendant que la caméra recule jusqu'au
 * cadrage de la mer ; le navire appareille ensuite.
 */
export const BOARD = [SCENES.sea[0] - 0.3, SCENES.sea[0] + 2.1] as const;

/** Mode d'affichage : statique (SSR, sans JS, reduced-motion) ou animé. */
export type JourneyMode = "static" | "live";

/**
 * Fondu d'entrée de la scène « Air », en unités de la timeline : le parcours remonte d'autant
 * sur la fin du hero (marge négative, cf. journey.css) et la scène apparaît en fondu par-dessus
 * le hero encore épinglé, au lieu d'entrer par le bas avec un bord net.
 */
export const AIR_FADE = 0.6;
