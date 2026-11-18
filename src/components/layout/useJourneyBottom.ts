"use client";

import { useEffect, useState } from "react";

/**
 * Indique si le bas de la section « parcours » (#journey) est remonté au-dessus d'une limite.
 * `limit` reçoit la hauteur de la fenêtre et renvoie la limite en pixels.
 */
export function useJourneyPassed(limit: (viewportHeight: number) => number) {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const journey = document.getElementById("journey");
      if (!journey) return;
      setPassed(journey.getBoundingClientRect().bottom < limit(window.innerHeight));
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
    // `limit` is a constant arrow passed by each caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return passed;
}
