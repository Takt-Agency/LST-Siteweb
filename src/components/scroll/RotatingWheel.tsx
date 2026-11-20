"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/motion-prefs";

type Props = {
  /** Image de la roue (rendue à part, fond transparent, centrée). */
  src: string;
  /**
   * Distance parcourue en pixels écran (ex. décalage de la route sous le camion),
   * lue à chaque image. Par défaut : défilement vertical de la page × `scrollFactor`.
   */
  distance?: { readonly current: number };
  scrollFactor?: number;
  /** Sens de la marche : 1 = vers la droite (rotation horaire), -1 = vers la gauche. */
  direction?: 1 | -1;
  /**
   * Position et taille, en % du conteneur du rendu (le conteneur doit avoir le ratio des frames) :
   * centre de la roue et diamètre rapporté à la largeur.
   */
  x: number;
  y: number;
  diameter: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Roue superposée au rendu du véhicule. Rotation = distance / rayon (roulement sans glissement :
 * un tour complet tous les 2πr pixels parcourus). Décorative.
 */
export function RotatingWheel({
  src,
  distance,
  scrollFactor = 1,
  direction = 1,
  x,
  y,
  diameter,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const live = useRef({ distance, scrollFactor, direction });
  useEffect(() => {
    live.current = { distance, scrollFactor, direction };
  });

  useEffect(() => {
    const img = ref.current;
    if (!img || prefersReducedMotion()) return;
    let raf = 0;
    let lastAngle = NaN;

    const tick = () => {
      const { distance: d, scrollFactor: f, direction: dir } = live.current;
      const r = img.clientWidth / 2;
      if (r > 0) {
        const dist = d ? d.current : window.scrollY * f;
        const deg = ((dir * dist) / r) * (180 / Math.PI);
        const a = Math.round((deg % 360) * 10) / 10;
        if (a !== lastAngle) {
          img.style.transform = `translate(-50%, -50%) rotate(${a}deg)`;
          lastAngle = a;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(tick);
      else if (!e.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(img);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- petite image décorative positionnée en % du rendu
    <img
      ref={ref}
      src={src}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={className}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${diameter}%`,
        height: "auto",
        transform: "translate(-50%, -50%)",
        willChange: "transform",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
