import type { Service, ServiceSlug } from "@/types";

/**
 * Service catalogue — editorial structure from the specification (§6.1, §6.2).
 * `pendingValidation: true` reflects the spec: LST Express must confirm each
 * service's real scope before publication.
 */
export const services: Service[] = [
  {
    slug: "transport-terrestre",
    order: 1,
    category: "transport",
    icon: "truck",
    title: "Transport terrestre",
    summary: "Des solutions routières fiables, du national à l'international.",
    promise: "Des solutions routières fiables, du national à l'international.",
    description:
      "LST Express organise le transport routier de marchandises pour les entreprises, en national comme à l'international. Selon le volume et l'urgence, l'expédition est réalisée en camion complet ou en groupage, avec un suivi assuré par un interlocuteur dédié, du chargement jusqu'à la livraison.",
    offerings: [
      "Camion complet (FTL) pour les volumes importants.",
      "Groupage et lots partiels (LTL) pour optimiser les coûts.",
      "Enlèvement chez le fournisseur et livraison porte-à-porte.",
      "Transport national et international.",
      "Planification des enlèvements et livraisons selon les créneaux du client.",
    ],
    benefits: [
      "Coûts maîtrisés grâce à une solution adaptée au volume.",
      "Délais fiables et rendez-vous planifiés.",
      "Interlocuteur unique et information sur l'avancement.",
      "Flexibilité pour les envois réguliers ou ponctuels.",
    ],
    faq: [
      {
        question: "Quelle différence entre camion complet (FTL) et groupage (LTL) ?",
        answer:
          "Le camion complet est dédié à votre marchandise : il convient aux volumes importants et aux envois sensibles au délai. Le groupage mutualise l'espace avec d'autres expéditeurs, ce qui réduit le coût pour les volumes partiels.",
      },
      {
        question: "Pouvez-vous organiser l'enlèvement chez mon fournisseur ?",
        answer:
          "Oui, l'enlèvement chez le fournisseur et la livraison porte-à-porte font partie des prestations proposées, selon les zones desservies confirmées.",
      },
    ],
    ctaLabel: "Demander un devis transport terrestre",
    image: { src: "/images/services/transport-terrestre.webp", alt: "Camion semi-remorque sur l'autoroute au coucher du soleil", position: "center" },
    pendingValidation: true,
  },
  {
    slug: "fret-maritime",
    order: 2,
    category: "transport",
    icon: "ship",
    title: "Fret maritime",
    summary: "La solution économique pour les volumes importants, à l'import comme à l'export.",
    promise: "La solution économique pour les volumes importants, à l'import comme à l'export.",
    description:
      "Le fret maritime permet d'acheminer des volumes importants à coût optimisé. LST Express coordonne les expéditions en conteneur complet ou en groupage, de la réservation auprès des compagnies maritimes jusqu'à l'organisation du pré- et post-acheminement.",
    offerings: [
      "Conteneur complet (FCL) : 20', 40' et 40' HC.",
      "Groupage maritime (LCL) pour les petits volumes.",
      "Réservation auprès des compagnies et suivi des départs.",
      "Coordination portuaire, pré- et post-acheminement.",
      "Opérations d'import et d'export.",
    ],
    benefits: [
      "Coût par unité transportée réduit pour les gros volumes.",
      "Adapté aux marchandises lourdes ou volumineuses.",
      "Coordination de bout en bout, du port de départ à la livraison finale.",
      "Visibilité sur les dates de départ et d'arrivée.",
    ],
    steps: [
      { title: "Cotation", text: "Analyse du volume, de la marchandise et de l'itinéraire." },
      { title: "Réservation", text: "Réservation de l'espace auprès de la compagnie maritime." },
      { title: "Acheminement", text: "Pré-acheminement, chargement et suivi du départ." },
      { title: "Livraison", text: "Formalités d'arrivée et post-acheminement jusqu'au destinataire." },
    ],
    faq: [
      {
        question: "FCL ou LCL : comment choisir ?",
        answer:
          "Le conteneur complet (FCL) est généralement intéressant dès que votre marchandise occupe une large part d'un conteneur. En dessous, le groupage (LCL) permet de ne payer que le volume utilisé.",
      },
    ],
    ctaLabel: "Demander une cotation maritime",
    image: { src: "/images/services/fret-maritime.webp", alt: "Porte-conteneurs chargé quittant un terminal portuaire au coucher du soleil", position: "center" },
    pendingValidation: true,
  },
  {
    slug: "fret-aerien",
    order: 3,
    category: "transport",
    icon: "plane",
    title: "Fret aérien",
    summary: "Rapidité et sécurité pour les envois urgents ou à forte valeur.",
    promise: "Rapidité et sécurité pour les envois urgents ou à forte valeur.",
    description:
      "Pour les expéditions urgentes, sensibles ou à forte valeur ajoutée, LST Express propose des solutions de fret aérien en s'appuyant sur ses partenaires. Le service couvre la réservation, la préparation documentaire et la coordination jusqu'à la remise au destinataire.",
    offerings: [
      "Expéditions express et urgentes.",
      "Fret aérien standard et groupage aérien.",
      "Réservation des capacités auprès des compagnies et partenaires.",
      "Préparation des documents de transport (LTA).",
      "Acheminement de l'aéroport à la destination finale.",
    ],
    benefits: [
      "Délais de transit les plus courts.",
      "Sécurité renforcée pour les marchandises de valeur.",
      "Réactivité face aux besoins imprévus (pièces, échantillons…).",
      "Large choix de destinations via les partenaires.",
    ],
    ctaLabel: "Demander un devis fret aérien",
    image: { src: "/images/services/fret-aerien.webp", alt: "Chargement de palettes dans la soute d'un avion cargo sur le tarmac", position: "center" },
    pendingValidation: true,
  },
  {
    slug: "transit-douane",
    order: 4,
    category: "logistique",
    icon: "file-check",
    title: "Transit & douane",
    summary: "Des formalités maîtrisées pour des marchandises qui circulent sans blocage.",
    promise: "Des formalités maîtrisées pour des marchandises qui circulent sans blocage.",
    description:
      "Les opérations d'import-export impliquent de nombreuses formalités. LST Express accompagne ses clients dans la préparation et la vérification des documents, la coordination avec les intervenants et le suivi des opérations de dédouanement, dans le cadre de son périmètre autorisé.",
    offerings: [
      "Coordination des opérations de transit import / export.",
      "Préparation et contrôle des documents (facture, liste de colisage, certificats…).",
      "Accompagnement aux formalités de dédouanement, directement ou via des partenaires agréés.",
      "Conseil sur les Incoterms et les documents requis.",
      "Suivi des marchandises jusqu'à la mainlevée.",
    ],
    benefits: [
      "Moins de risques de retard ou de blocage en douane.",
      "Documents conformes dès le départ.",
      "Gain de temps pour les équipes du client.",
      "Vision claire des étapes et des coûts associés.",
    ],
    steps: [
      { title: "Documents", text: "Collecte et contrôle de la facture, de la liste de colisage et des certificats." },
      { title: "Déclaration", text: "Préparation de la déclaration avec les intervenants habilités." },
      { title: "Contrôle", text: "Suivi des vérifications et réponses aux demandes éventuelles." },
      { title: "Mainlevée", text: "Libération des marchandises et organisation de la suite du transport." },
    ],
    faq: [
      {
        question: "Quels documents prévoir pour une opération d'import ?",
        answer:
          "Au minimum la facture commerciale, la liste de colisage et le document de transport. Selon la marchandise et l'origine, des certificats (origine, conformité, sanitaires…) peuvent être exigés.",
      },
      {
        question: "Que sont les Incoterms ?",
        answer:
          "Ce sont des règles internationales qui répartissent les frais, les risques et les formalités entre vendeur et acheteur. Le choix de l'Incoterm a un impact direct sur l'organisation du transport et du dédouanement.",
      },
    ],
    ctaLabel: "Être accompagné pour mes formalités",
    image: { src: "/images/services/transit-douane.webp", alt: "Agent des douanes contrôlant des documents devant un porte-conteneurs à quai", position: "center" },
    pendingValidation: true,
  },
  {
    slug: "solutions-logistiques",
    order: 5,
    category: "logistique",
    icon: "warehouse",
    title: "Solutions logistiques",
    summary: "Organiser, coordonner et optimiser les flux de marchandises.",
    promise: "Organiser, coordonner et optimiser les flux de marchandises.",
    description:
      "Au-delà du transport, LST Express aide les entreprises à organiser l'ensemble de leurs flux : planification des expéditions, coordination entre fournisseurs, transporteurs et destinataires, et recherche de solutions pour gagner en efficacité.",
    offerings: [
      "Coordination des expéditions multi-fournisseurs et multimodales.",
      "Organisation et planification des flux entrants et sortants.",
      "Gestion des approvisionnements et des livraisons.",
      "Stockage et entreposage via partenaires, selon l'offre confirmée.",
      "Reporting et suivi des opérations.",
    ],
    benefits: [
      "Flux mieux organisés et plus prévisibles.",
      "Réduction des coûts logistiques globaux.",
      "Un seul partenaire pour coordonner plusieurs modes de transport.",
      "Meilleure disponibilité des marchandises.",
    ],
    ctaLabel: "Parler de mes flux logistiques",
    image: { src: "/images/services/solutions-logistiques-entrepot.webp", alt: "Entrepôt logistique avec rayonnages et chariots élévateurs, camion à quai, porte-conteneurs et avion cargo", position: "center" },
    pendingValidation: true,
  },
  {
    slug: "consulting",
    order: 6,
    category: "conseil",
    icon: "chart-line",
    title: "Consulting",
    summary: "L'expertise qui fait la différence : analyser, conseiller, optimiser.",
    promise: "L'expertise qui fait la différence : analyser, conseiller, optimiser.",
    description:
      "Le consulting est l'expertise différenciante de LST Express. L'équipe analyse l'organisation transport et logistique de l'entreprise, identifie les axes d'amélioration et accompagne la mise en place de solutions concrètes pour réduire les coûts et fiabiliser les opérations.",
    offerings: [
      "Diagnostic de la chaîne logistique et des processus transport.",
      "Analyse et optimisation des coûts de transport.",
      "Conseil sur le choix des modes de transport, des Incoterms et des partenaires.",
      "Amélioration des processus et procédures internes.",
      "Accompagnement stratégique pour le développement à l'international.",
    ],
    benefits: [
      "Économies mesurables sur les coûts logistiques.",
      "Processus plus fluides et mieux maîtrisés.",
      "Décisions appuyées sur une analyse objective.",
      "Accompagnement personnalisé, adapté à la taille de l'entreprise.",
    ],
    steps: [
      { title: "Diagnostic", text: "Analyse de votre organisation transport et logistique actuelle." },
      { title: "Recommandations", text: "Axes d'amélioration chiffrés et priorisés." },
      { title: "Mise en œuvre", text: "Accompagnement dans le déploiement des solutions retenues." },
      { title: "Suivi", text: "Mesure des résultats et ajustements dans la durée." },
    ],
    ctaLabel: "Demander un diagnostic",
    image: { src: "/images/services/consulting.webp", alt: "Réunion de conseil devant un ordinateur affichant une carte des flux, avec vue sur un terminal portuaire au coucher du soleil", position: "center" },
    pendingValidation: true,
  },
];

export const serviceCategories = [
  { id: "tous", label: "Tous" },
  { id: "transport", label: "Transport" },
  { id: "logistique", label: "Logistique" },
  { id: "conseil", label: "Conseil" },
] as const;

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/** Services with their own page under /services (consulting lives at /consulting). */
export const transportServices = services.filter((s) => s.slug !== "consulting");

export function serviceHref(slug: ServiceSlug): string {
  return slug === "consulting" ? "/consulting" : `/services/${slug}`;
}

export const methodSteps = [
  { title: "Comprendre", text: "Écouter votre contexte, vos contraintes et vos objectifs avant de proposer une solution." },
  { title: "Étudier", text: "Comparer les modes de transport, les itinéraires et les partenaires adaptés à votre besoin." },
  { title: "Coordonner", text: "Organiser l'expédition et les formalités avec un interlocuteur unique." },
  { title: "Accompagner", text: "Informer sur l'avancement et ajuster l'organisation au fil de vos opérations." },
];

/** Trust arguments — qualitative only, no testimonials (spec §2.2, §05-07). */
export const reasons = [
  { title: "Accompagnement", text: "Un interlocuteur dédié qui suit votre dossier du devis à la livraison." },
  { title: "Solutions adaptées", text: "Une organisation construite selon votre volume, votre urgence et votre budget." },
  { title: "Réactivité", text: "Des réponses rapides pour les besoins réguliers comme pour les urgences." },
  { title: "Vision globale", text: "Transport, logistique et conseil réunis pour une approche cohérente de vos flux." },
];

/** Services overview page (/services). */
export const servicesPage = {
  eyebrow: "Nos services",
  title: "Des solutions pour chaque étape de vos flux",
  intro:
    "Transport terrestre, maritime et aérien, transit et douane, solutions logistiques et consulting : une offre structurée pour accompagner vos opérations.",
} as const;

/** Display label of a service category. */
export const categoryLabels: Record<Service["category"], string> = {
  transport: "Transport",
  logistique: "Logistique",
  conseil: "Conseil",
};
