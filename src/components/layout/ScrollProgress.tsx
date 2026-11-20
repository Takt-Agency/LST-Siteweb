"use client";

import { useEffect, useRef } from "react";

const R = 15;
const C = 2 * Math.PI * R;

/** Indicateur de progression de lecture : petit cercle en haut à droite (décoratif). */
export function ScrollProgress() {
  const arc = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = arc.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const v = Math.round(p * 1000) / 1000;
      if (v !== last) {
        el.style.strokeDashoffset = String(C * (1 - v));
        last = v;
      }
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
  }, []);

  return (
    <svg className="scroll-progress" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r={R} className="sp-track" />
      <circle
        ref={arc}
        cx="18"
        cy="18"
        r={R}
        className="sp-arc"
        strokeDasharray={C}
        strokeDashoffset={C}
        transform="rotate(-90 18 18)"
      />
    </svg>
  );
}
