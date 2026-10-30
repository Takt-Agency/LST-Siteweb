/**
 * Homepage content beyond the hero. Wording follows the specification
 * (§1.3 positioning, §03 site map, §05 homepage sections) — no invented
 * figures, clients or commercial claims.
 */

/** §05-02 — Bandeau de positionnement: the three pillars. */
export const positioning = {
  /** Accessible section name (visually hidden). */
  title: "Nos trois piliers : transport, logistique et consulting",
  pillars: [
    {
      icon: "truck",
      title: "Transport",
      text: "Route, mer et air pour acheminer vos marchandises.",
      href: "/services",
    },
    {
      icon: "logistics",
      /** Shown inverted (black card) between the two light ones. */
      inverted: true,
      title: "Logistique",
      text: "Coordination des flux, transit et douane.",
      href: "/services/solutions-logistiques",
    },
    {
      icon: "consulting",
      title: "Consulting",
      text: "Diagnostic et optimisation de vos opérations.",
      href: "/consulting",
    },
  ],
} as const;

/** §05-03 — Aperçu des services (cards come from `src/data/services.ts`). */
export const servicesOverview = {
  eyebrow: "Nos services",
  title: "Des solutions pour chaque étape de vos flux",
  link: { label: "Tous nos services", href: "/services" },
} as const;

/**
 * §05-04 — Section signature Consulting. Wording from the specification §06
 * (Consulting); the four-step approach comes from the consulting service data.
 */
export const consultingSignature = {
  eyebrow: "Consulting · notre signature",
  title: "L'expertise qui fait la différence :",
  highlight: "analyser, conseiller, optimiser.",
  text: "L'équipe analyse l'organisation transport et logistique de votre entreprise, identifie les axes d'amélioration et accompagne la mise en place de solutions concrètes.",
  focus: [
    { title: "Analyse des opérations", text: "Diagnostic de la chaîne logistique et des processus transport." },
    { title: "Optimisation des coûts", text: "Analyse et optimisation des coûts de transport." },
    { title: "Accompagnement stratégique", text: "Pour votre développement à l'international." },
  ],
  stepsTitle: "Notre démarche",
  cta: { label: "Demander un diagnostic", href: "/devis?besoin=consulting" },
  link: { label: "Découvrir le consulting", href: "/consulting" },
} as const;

/**
 * §05-05 — Notre méthode. The four steps come from `methodSteps`
 * (src/data/services.ts); wording must be validated against LST's real practices.
 */
export const method = {
  eyebrow: "Notre méthode",
  title: "Quatre étapes, de votre besoin à vos opérations",
  text: "Un parcours simple et lisible, de l'écoute de votre demande au suivi de vos opérations.",
} as const;

/**
 * §05-06 — Secteurs d'activité. Only sectors actually served and validated by
 * LST Express may be listed (spec). The section stays hidden while empty.
 */
export const sectors = {
  eyebrow: "Secteurs d'activité",
  title: "Les secteurs que nous accompagnons",
  items: [] as { name: string; text?: string }[],
};

/**
 * §05-07 — Pourquoi LST. Verifiable, qualitative arguments only — no reviews or
 * testimonials (spec §2.2). Items come from `reasons` in src/data/services.ts.
 */
export const whyLst = {
  eyebrow: "Pourquoi LST Express",
  title: "Un partenaire engagé à chaque étape",
  text: "Ce qui guide notre façon de travailler avec vous, au quotidien.",
  cta: { label: "Nous contacter", href: "/contact" },
} as const;

/** §05-08 — Chiffres clés: shown only once LST provides validated figures (`keyFigures` in site.ts). */
export const keyFiguresSection = {
  eyebrow: "LST Express en chiffres",
  title: "Notre réseau en quelques chiffres",
} as const;

/** §05-09 — Actualités / insights (latest articles from src/data/articles.ts). */
export const news = {
  eyebrow: "Actualités",
  title: "Conseils et informations métier",
  link: { label: "Toutes les actualités", href: "/actualites" },
  count: 6,
} as const;

/** §05-10 — CTA final: describe the need, then quote form or contact page. */
export const finalCta = {
  eyebrow: "Un projet, une question ?",
  title: "Décrivez-nous votre besoin, nous revenons vers vous.",
  text: "Transport, logistique ou consulting : précisez votre demande et recevez une réponse adaptée à vos opérations.",
  primary: { label: "Demander un devis", href: "/devis" },
  secondary: { label: "Nous contacter", href: "/contact" },
} as const;
