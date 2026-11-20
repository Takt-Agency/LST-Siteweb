/** Contenu du site LST Express (repris tel quel de la maquette HTML). */

import type { IconName } from "@/types";

export const contact = {
  phone: "+216 40 064 017",
  phoneHref: "tel:+21640064017",
  email: "commercial@lstexpress.tn",
  hours: "Lun–Ven 8h–17h, Sam 8h–13h",
  address: "Avenue Hédi Nouira, Immeuble Aïcha, 8000 Nabeul, Tunisie",
} as const;

export type NavChild = { href: string; label: string; description: string; icon: IconName };
export type NavEntry = { href: string; label: string; children?: NavChild[] };

/** Navigation principale (en-tête). « Services » ouvre un sous-menu. */
export const nav: NavEntry[] = [
  {
    href: "/services",
    label: "Services",
    children: [
      { label: "Transport terrestre", href: "/services/transport-terrestre", icon: "truck", description: "FTL, groupage, porte-à-porte" },
      { label: "Fret maritime", href: "/services/fret-maritime", icon: "ship", description: "FCL, LCL, import / export" },
      { label: "Fret aérien", href: "/services/fret-aerien", icon: "plane", description: "Envois urgents et sensibles" },
      { label: "Transit & douane", href: "/services/transit-douane", icon: "file-check", description: "Documents et formalités" },
      { label: "Solutions logistiques", href: "/services/solutions-logistiques", icon: "warehouse", description: "Coordination des flux" },
    ],
  },
  { href: "/consulting", label: "Consulting" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

/** Étapes du parcours animé (avion, route, mer) — textes des panneaux 01, 02, 03 de #journey. */
export const journeySteps = [
  {
    step: "01 Fret aérien",
    title: "Pour vos envois urgents ou de forte valeur.",
    text: "Avec nos partenaires, nous réservons la capacité, préparons la LTA et coordonnons l’envoi jusqu’au destinataire.",
    points: ["Envois express et urgents", "Fret aérien et groupage aérien", "Livraison depuis l’aéroport"],
  },
  {
    step: "02 Transit & transport terrestre",
    title: "Des formalités maîtrisées, puis la route.",
    text: "Nous suivons le dédouanement jusqu’à la mainlevée, puis organisons le transport en camion complet ou en groupage.",
    points: ["Contrôle des documents", "Camion complet ou groupage", "National et international"],
  },
  {
    step: "03 Fret maritime",
    title: "La solution économique pour les gros volumes.",
    text: "Conteneurs 20’, 40’ et 40’ HC ou groupage, à l’import comme à l’export, de la réservation au post-acheminement.",
    points: ["Conteneurs complets (FCL)", "Groupage (LCL)", "Pré et post-acheminement"],
  },
] as const;

/** Lien vers la page de devis, avec le besoin présélectionné (ex. /devis?besoin=fret-maritime). */
export const quoteHref = (besoin?: string) => (besoin ? `/devis?besoin=${besoin}` : "/devis");

export type ServiceArtKind = "truck" | "ship" | "plane" | "customs" | "logistics" | "consulting";

export type Service = {
  pill: string;
  title: string;
  description: string;
  points: string[];
  cta: string;
  /** Page détaillée du service (son dernier segment sert aussi à présélectionner le devis). */
  href: string;
  tone: "dark" | "gold" | "white";
  art: ServiceArtKind;
};

export const services: Service[] = [
  {
    pill: "Route",
    title: "Transport terrestre",
    description:
      "Camion complet ou groupage, en national comme à l’international. Un interlocuteur suit votre envoi du chargement à la livraison.",
    points: ["Camion complet (FTL)", "Groupage (LTL)", "Enlèvement et porte-à-porte"],
    cta: "Demander un devis",
    href: "/services/transport-terrestre",
    tone: "dark",
    art: "truck",
  },
  {
    pill: "Mer",
    title: "Fret maritime",
    description: "La solution économique pour les volumes importants, à l’import comme à l’export.",
    points: ["Conteneurs 20’, 40’ et 40’ HC", "Groupage (LCL)", "Pré et post-acheminement"],
    cta: "Demander un devis",
    href: "/services/fret-maritime",
    tone: "gold",
    art: "ship",
  },
  {
    pill: "Air",
    title: "Fret aérien",
    description: "Rapidité et sécurité pour les envois urgents ou de forte valeur, avec nos partenaires.",
    points: ["Envois express et urgents", "Groupage aérien", "Préparation de la LTA"],
    cta: "Demander un devis",
    href: "/services/fret-aerien",
    tone: "white",
    art: "plane",
  },
  {
    pill: "Douane",
    title: "Transit & douane",
    description: "Des formalités maîtrisées pour que vos marchandises circulent sans blocage.",
    points: ["Contrôle des documents", "Dédouanement avec partenaires agréés", "Conseil Incoterms"],
    cta: "Demander un devis",
    href: "/services/transit-douane",
    tone: "gold",
    art: "customs",
  },
  {
    pill: "Logistique",
    title: "Solutions logistiques",
    description:
      "Organiser, coordonner et optimiser vos flux de marchandises entre fournisseurs, transporteurs et destinataires.",
    points: ["Coordination multimodale", "Planification des flux", "Stockage via partenaires"],
    cta: "Demander un devis",
    href: "/services/solutions-logistiques",
    tone: "white",
    art: "logistics",
  },
  {
    pill: "Consulting",
    title: "Consulting",
    description: "Analyser, conseiller, optimiser : notre offre phare pour améliorer vos opérations.",
    points: ["Diagnostic", "Optimisation des coûts", "Développement international"],
    cta: "Demander un diagnostic",
    href: "/consulting",
    tone: "dark",
    art: "consulting",
  },
];

export const bandItems = [
  "Transport terrestre",
  "Fret maritime",
  "Fret aérien",
  "Transit & douane",
  "Solutions logistiques",
];

export const consultingDomains = [
  "Diagnostic de la chaîne logistique et des processus de transport",
  "Analyse et optimisation des coûts de transport",
  "Choix des modes de transport, des Incoterms et des partenaires",
  "Amélioration des processus et procédures internes",
  "Accompagnement du développement à l’international",
];

export const consultingChain = [
  { title: "Diagnostic", text: "Analyse de votre organisation transport et logistique actuelle." },
  { title: "Recommandations", text: "Des pistes d’amélioration chiffrées et priorisées." },
  { title: "Mise en œuvre", text: "Un accompagnement dans le déploiement des solutions retenues." },
  { title: "Suivi", text: "La mesure des résultats et des ajustements dans la durée." },
];

export const methodSteps = [
  { title: "Comprendre", text: "Nous écoutons votre contexte, vos contraintes et vos objectifs." },
  { title: "Étudier", text: "Nous comparons les modes de transport, les itinéraires et les partenaires." },
  { title: "Coordonner", text: "Nous organisons les envois et les formalités, avec un interlocuteur unique." },
  { title: "Accompagner", text: "Nous vous informons de l’avancement et ajustons les opérations si besoin." },
];

export const faq = [
  {
    q: "Camion complet ou groupage : que choisir ?",
    a: "Le camion complet est dédié à vos marchandises : il convient aux gros volumes et aux envois urgents. Le groupage partage l’espace avec d’autres expéditeurs et réduit le coût pour les volumes partiels.",
  },
  {
    q: "Conteneur complet (FCL) ou groupage (LCL) ?",
    a: "Le conteneur complet devient intéressant quand votre marchandise remplit une grande partie du conteneur. Le groupage vous permet de ne payer que le volume utilisé.",
  },
  {
    q: "Quels documents faut-il pour une importation ?",
    a: "Au minimum la facture commerciale, la liste de colisage et le titre de transport. Des certificats peuvent être exigés selon la marchandise et son origine.",
  },
  {
    q: "À quoi servent les Incoterms ?",
    a: "Ce sont des règles internationales qui répartissent les frais, les risques et les formalités entre le vendeur et l’acheteur. Ils ont un impact direct sur le transport et le dédouanement.",
  },
  {
    q: "Venez-vous chercher la marchandise chez le fournisseur ?",
    a: "Oui, nous proposons l’enlèvement chez le fournisseur et la livraison porte-à-porte, selon les zones desservies.",
  },
  {
    q: "Comment se passe un premier échange en consulting ?",
    a: "Vous décrivez votre contexte dans le formulaire, puis notre équipe vous contacte pour définir ensemble le périmètre du diagnostic. L’accompagnement s’adapte à la taille et aux priorités de votre entreprise.",
  },
];
