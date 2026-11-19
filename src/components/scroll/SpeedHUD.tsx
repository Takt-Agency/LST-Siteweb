"use client";

import { useEffect, useRef } from "react";
import { getLenis, prefersReducedMotion } from "@/lib/motion-prefs";

type Props = {
  /** Facteur vitesse de défilement (px par image) → km/h. */
  k?: number;
  /** Vitesse affichée maximale. */
  max?: number;
  /** Lissage (0 → 1) : part de l'écart rattrapée à chaque image. */
  smoothing?: number;
  className?: string;
};

/**
 * Compteur « 00 KM/H » lié à la vitesse de défilement (|lenis.velocity| × k), lissé, plafonné,
 * qui redescend à 00 à l'arrêt. Sans Lenis (reduced-motion), la vitesse est mesurée sur window.scrollY.
 * Décoratif (aria-hidden). La boucle ne tourne que lorsque le compteur est à l'écran.
 */
export function SpeedHUD({ k = 1.1, max = 90, smoothing = 0.12, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const out = valueRef.current;
    if (!el || !out) return;
    if (prefersReducedMotion()) return; // reste à 00

    let raf = 0;
    let shown = 0;
    let lastText = "00";
    let lastY = window.scrollY;

    const tick = () => {
      const lenis = getLenis();
      const y = window.scrollY;
      const v = lenis ? lenis.velocity : y - lastY;
      lastY = y;
      const target = Math.min(max, Math.abs(v) * k);
      shown += (target - shown) * smoothing;
      if (target === 0 && shown < 0.5) shown = 0;
      const text = String(Math.round(shown)).padStart(2, "0");
      if (text !== lastText) {
        out.textContent = text;
        lastText = text;
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) {
        lastY = window.scrollY;
        raf = requestAnimationFrame(tick);
      } else if (!e.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [k, max, smoothing]);

  return (
    <div ref={ref} className={`speed-hud mono ${className ?? ""}`} aria-hidden="true">
      <span ref={valueRef} className="speed-hud-v">
        00
      </span>
      <span className="speed-hud-u">km/h</span>
    </div>
  );
}
