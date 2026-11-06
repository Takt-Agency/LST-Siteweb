import type { MediaRef } from "@/types";

/** Homepage hero content (signature from the specification §1.3, CTAs from §05-01). */
export const hero = {
  eyebrow: "Logistique internationale",
  title: "Connecter les marchés, optimiser",
  /** Last words of the title, underlined with a yellow highlighter stroke. */
  highlight: "vos opérations",
  text: {
    before: "Des solutions de transport, de logistique et de consulting pour accompagner la croissance ",
    strong: "de votre entreprise en Afrique",
    after: " et à l'international.",
  },
  primaryCta: { label: "Demander un devis", href: "/devis" },
  secondaryCta: { label: "Découvrir nos solutions", href: "/services" },
  image: {
    src: "/images/lst-hero-cover.png",
    alt: "Camion, avion cargo et porte-conteneurs sur un terminal portuaire au coucher du soleil, reliés par une flèche jaune",
    position: "60% center",
  } satisfies MediaRef,
};

export const heroFeatures = [
  { icon: "truck", title: "Transport international", text: "Fiable & sécurisé" },
  { icon: "package", title: "Solutions logistiques", text: "Sur mesure" },
  { icon: "chart", title: "Accompagnement & consulting", text: "Pour votre croissance" },
] as const;
