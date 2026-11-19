"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion-prefs";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Opacité de départ des mots. */
  from?: number;
  /** Bornes ScrollTrigger (sur l'élément lui-même). */
  start?: string;
  end?: string;
  /** Lissage du suivi du défilement (true = immédiat, nombre = secondes de rattrapage). */
  scrub?: boolean | number;
};

/**
 * Texte qui « se remplit » au défilement : chaque mot passe de 30 % à 100 % d'opacité.
 * Le texte est rendu côté serveur, entier et lisible (SEO, sans JavaScript) ; le découpage en mots
 * (SplitText) n'a lieu qu'au montage, et pas du tout en reduced-motion.
 * SplitText pose aria-label sur l'élément et masque les mots aux lecteurs d'écran.
 */
export function RevealText({
  as: Tag = "p",
  children,
  className,
  id,
  from = 0.3,
  start = "top 85%",
  end = "bottom 45%",
  scrub = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const split = SplitText.create(el, {
        type: "words",
        aria: "auto",
        autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(
            self.words,
            { opacity: from },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: { trigger: el, start, end, scrub },
            },
          );
        },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [from, start, end, scrub] },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
