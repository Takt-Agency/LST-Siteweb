"use client";

import { useEffect, useRef } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Cartes empilées : en défilant, chaque carte rétrécit et s'assombrit légèrement
 * quand la suivante vient la recouvrir.
 * Pose aussi `.seen` (la carte est entrée à l'écran : animations d'entrée) et `.on`
 * (carte au premier plan : seules ses illustrations sont animées).
 */
export function ServiceStack({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".svc"));
    const svgs = cards.map((c) => c.querySelector<SVGSVGElement>(".art svg"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((c) => c.classList.add("seen"));
      svgs.forEach((s) => s?.pauseAnimations());
      return;
    }

    root.classList.add("js");
    let tops: number[] = [];
    const measure = () => {
      tops = cards.map((c) => parseFloat(getComputedStyle(c).top) || 0);
    };

    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const next = cards[i + 1];
        const inner = card.firstElementChild as HTMLElement | null;
        let p = 0;
        if (next && inner) {
          p = clamp((vh - next.getBoundingClientRect().top) / (vh - tops[i]));
          inner.style.transform = `scale(${1 - p * 0.06})`;
          inner.style.filter = `brightness(${1 - p * 0.3})`;
        }

        const visible = rect.top < vh * 0.85 && rect.bottom > 0;
        if (visible) card.classList.add("seen");
        const on = visible && p < 0.75;
        if (on !== card.classList.contains("on")) {
          card.classList.toggle("on", on);
          const svg = svgs[i];
          if (on) svg?.unpauseAnimations();
          else svg?.pauseAnimations();
        }
      });
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      request();
    };

    svgs.forEach((s) => s?.pauseAnimations());
    measure();
    tick();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="svc-stack" ref={ref}>
      {children}
    </div>
  );
}
