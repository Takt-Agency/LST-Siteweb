/**
 * Consulting page content (/consulting).
 *
 * Sources: specification §06 (Consulting: offerings, benefits, 4-step approach,
 * "Demander un diagnostic") and §1.2 (target audiences). The short explanatory
 * lines under each area are descriptive only (no figures or guarantees) and
 * must be validated by LST Express before publication.
 */

export const consultingPage = {
  hero: {
    eyebrow: "Consulting",
    title: "L'expertise qui fait la différence :",
    highlight: "analyser, conseiller, optimiser.",
    text: "Le consulting est l'expertise différenciante de LST Express. L'équipe analyse l'organisation transport et logistique de votre entreprise, identifie les axes d'amélioration et accompagne la mise en place de solutions concrètes pour réduire les coûts et fiabiliser les opérations.",
    cta: { label: "Demander un diagnostic", href: "/devis?besoin=consulting" },
    secondary: { label: "Découvrir la démarche", href: "#demarche" },
  },

  audiences: {
    eyebrow: "Pour qui ?",
    title: "Un accompagnement pensé pour les décideurs",
    items: [
      { icon: "leaders", title: "Dirigeants et décideurs", text: "Qui recherchent un regard extérieur sur leur organisation transport et logistique." },
      { icon: "operations", title: "Achats, supply chain et opérations", text: "Les responsables qui pilotent les flux, les prestataires et les coûts au quotidien." },
      { icon: "trade", title: "Importateurs et exportateurs", text: "Les entreprises dont l'activité dépend de flux internationaux bien organisés." },
      { icon: "industry", title: "Entreprises industrielles et commerciales", text: "Ayant des besoins réguliers de transport ou de logistique." },
    ],
  },

  areas: {
    eyebrow: "Domaines d'intervention",
    title: "Ce que nous analysons avec vous",
    items: [
      {
        icon: "diagnostic",
        title: "Diagnostic de la chaîne logistique et des processus transport",
        text: "Un état des lieux de votre organisation : flux, prestataires, outils et points de friction.",
      },
      {
        icon: "costs",
        title: "Analyse et optimisation des coûts de transport",
        text: "Identifier les principaux postes de coût et les leviers d'optimisation : modes, consolidation, contrats.",
      },
      {
        icon: "modes",
        title: "Choix des modes de transport, des Incoterms et des partenaires",
        text: "Retenir les solutions adaptées à vos volumes, vos délais et vos contraintes.",
      },
      {
        icon: "process",
        title: "Amélioration des processus et procédures internes",
        text: "Clarifier les rôles, fiabiliser les procédures et fluidifier les échanges entre services.",
      },
      {
        icon: "international",
        title: "Accompagnement stratégique pour le développement à l'international",
        text: "Structurer vos flux pour accompagner l'ouverture de nouveaux marchés.",
      },
    ],
  },

  approach: {
    eyebrow: "Notre démarche",
    title: "Quatre étapes, du diagnostic au suivi",
  },

  benefits: {
    eyebrow: "Vos bénéfices",
    title: "Des décisions éclairées, des opérations mieux maîtrisées",
  },

  faq: {
    eyebrow: "FAQ",
    title: "Questions fréquentes",
    items: [
      {
        question: "À qui s'adresse l'accompagnement consulting ?",
        answer:
          "Aux dirigeants, aux responsables achats, supply chain ou opérations, ainsi qu'aux importateurs et exportateurs qui souhaitent mieux organiser leurs flux de transport et de logistique.",
      },
      {
        question: "Comment se déroule le premier échange ?",
        answer:
          "Vous décrivez votre contexte et vos objectifs via le formulaire de demande. L'équipe revient vers vous pour préciser le besoin et définir ensemble le périmètre du diagnostic.",
      },
      {
        question: "Le consulting est-il adapté à la taille de mon entreprise ?",
        answer: "L'accompagnement est personnalisé et construit selon la taille de l'entreprise, son activité et ses priorités.",
      },
    ],
  },

  cta: {
    eyebrow: "Passons à l'action",
    title: "Faites le point sur votre organisation logistique.",
    text: "Décrivez votre contexte : l'équipe revient vers vous pour définir le périmètre de votre diagnostic.",
    primary: { label: "Demander un diagnostic", href: "/devis?besoin=consulting" },
    secondary: { label: "Nous contacter", href: "/contact" },
  },
};
