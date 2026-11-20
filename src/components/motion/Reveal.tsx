"use client";

import { createElement, useCallback, type ReactNode } from "react";

type Tag = "div" | "li" | "ul" | "ol" | "section" | "p";

const EASE = "cubic-bezier(.2,.7,.2,1)";

/**
 * Fades and slides its content in when it scrolls into view (once).
 * Usable from server components: pass `as` to keep the right element (e.g. "li").
 * Do not use on items of a horizontal scroller (off-screen items never intersect):
 * wrap the whole row instead. Below-the-fold only: the server HTML starts hidden until hydration (a <noscript>
 * rule in the root layout shows it when JavaScript is off).
 *
 * Implémentation légère (IntersectionObserver + transition CSS) : pas de bibliothèque d'animation dans le bundle.
 * Styles en ligne, comme auparavant, pour ne pas entrer en conflit avec les classes utilitaires de l'élément.
 */
export function Reveal({
  as = "div",
  delay = 0,
  y = 28,
  className,
  children,
}: {
  as?: Tag;
  delay?: number;
  y?: number;
  className?: string;
  children: ReactNode;
}) {
  // Ref de rappel (React 19 : la fonction renvoyée sert de nettoyage au démontage).
  const reveal = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      // Préférence « réduire les animations » : fondu seul, sans déplacement.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) el.style.transform = "none";
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          el.style.transition = `opacity .7s ${EASE} ${delay}s, transform .7s ${EASE} ${delay}s`;
          el.style.opacity = "1";
          el.style.transform = "none";
        },
        { threshold: 0.15 },
      );
      io.observe(el);
      return () => io.disconnect();
    },
    [delay],
  );

  return createElement(
    as,
    { ref: reveal, "data-reveal": "", className, style: { opacity: 0, transform: `translateY(${y}px)` } },
    children,
  );
}
