"use client";

import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

const REDUCED = "(prefers-reduced-motion: reduce)";
const MOBILE = "(max-width: 767px)";

/** Vrai si le visiteur demande de réduire les animations (lu au moment de l'appel, côté client). */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED).matches;

export const isMobileViewport = () => typeof window !== "undefined" && window.matchMedia(MOBILE).matches;

function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * Préférence « réduire les animations », réactive.
 * Côté serveur (et à l'hydratation) : `true`, c'est-à-dire le rendu statique, sans mouvement.
 */
export const useReducedMotion = () => useMedia(REDUCED, true);

/** Écran étroit (< 768 px), réactif. Côté serveur : `false`. */
export const useIsMobile = () => useMedia(MOBILE, false);

/* ---- Instance Lenis partagée (créée par <Providers>) ---- */
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
/** Instance Lenis active, ou `null` (reduced-motion, avant le montage, pages sans défilement doux). */
export const getLenis = () => lenis;
