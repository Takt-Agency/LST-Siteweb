"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { hero } from "@/data/hero";
import { gsap, useGSAP } from "@/lib/gsap";
import { useIsMobile, useReducedMotion } from "@/lib/motion-prefs";
import "./hero.css";

/** WebGL chargé après l'hydratation, uniquement côté client : le texte reste l'élément LCP. */
const Globe = dynamic(() => import("./Globe"), { ssr: false });

/**
 * Hero : globe en points centré sur la Méditerranée, puis « entrée dans l'atmosphère »
 * au défilement (nuit → bleu ciel → gris clair), qui enchaîne sur le parcours (#journey).
 * Titre, sous-titre et boutons sont rendus côté serveur et visibles avant le WebGL.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  // Objet stable lu par la boucle WebGL (écrit par ScrollTrigger, sans re-rendu).
  const [progress] = useState(() => ({ current: 0 }));
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  useGSAP(
    () => {
      if (reduced || !root.current) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
      });
      tl.to(".hero-copy", { autoAlpha: 0, y: -90, duration: 0.28 }, 0)
        .to(".hero-hint", { autoAlpha: 0, duration: 0.05 }, 0)
        .fromTo(".hero-stage", { backgroundColor: "#05070d" }, { backgroundColor: "#0b2e4c", duration: 0.35 }, 0)
        .to(".hero-stage", { backgroundColor: "#4f8fc4", duration: 0.3 }, 0.35)
        .to(".hero-stage", { backgroundColor: "#dfe6ec", duration: 0.35 }, 0.65)
        .fromTo(".hero-haze", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.5)
        .to(".hero-globe", { opacity: 0, duration: 0.2 }, 0.8);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section id="hero" ref={root} className="hero" aria-labelledby="hero-t">
      <div className="hero-stage">
        <div className="hero-globe">
          <Globe progress={progress} reduced={reduced} mobile={mobile} />
        </div>
        <div className="hero-haze" aria-hidden="true" />
        <div className="hero-frame">
          <div className="hero-copy">
            <p className="hero-kicker mono">
              <i aria-hidden="true" />
              Transport · Logistique · Consulting
            </p>
            <h1 id="hero-t" className="display">
              {hero.title}
            </h1>
            <p className="hero-text">{hero.text}</p>
            <div className="hero-acts">
              <Link className="btn" href={hero.primary.href}>
                {hero.primary.label}
              </Link>
              <a className="link" href={hero.secondary.href}>
                {hero.secondary.label}
              </a>
            </div>
          </div>
          <div className="hero-hint mono" aria-hidden="true">
            <span>{hero.hint}</span>
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}
