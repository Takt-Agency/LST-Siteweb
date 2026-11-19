"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/motion-prefs";

/**
 * Défilement doux global : Lenis, synchronisé avec ScrollTrigger via le ticker de GSAP
 * (une seule boucle d'animation pour tout le site).
 * Désactivé — défilement natif — quand le visiteur demande de réduire les animations,
 * y compris si la préférence change pendant la visite.
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    const raf = (time: number) => lenis?.raf(time * 1000);

    const start = () => {
      if (lenis || mq.matches) return;
      lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
    };
    const stop = () => {
      if (!lenis) return;
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenis = null;
      setLenis(null);
    };
    const onChange = () => {
      if (mq.matches) stop();
      else start();
      ScrollTrigger.refresh();
    };

    start();
    mq.addEventListener("change", onChange);
    // Les polices changent la hauteur des blocs : recalculer les déclencheurs une fois chargées.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      mq.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return children;
}
