"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion-prefs";

/**
 * Apparition décalée des enfants directs (ou de `selector`) quand le bloc entre à l'écran.
 * Le contenu est rendu visible côté serveur : il n'est masqué qu'au montage, sous la ligne de flottaison,
 * et jamais en reduced-motion.
 */
export function Stagger({
  children,
  className,
  selector = ":scope > *",
  y = 32,
  stagger = 0.12,
}: {
  children: ReactNode;
  className?: string;
  selector?: string;
  y?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const items = el.querySelectorAll(selector);
      gsap.from(items, {
        opacity: 0,
        y,
        duration: 0.8,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });
    },
    { scope: ref, dependencies: [selector, y, stagger] },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
