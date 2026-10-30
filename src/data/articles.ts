import type { Article, ArticleCategory } from "@/types";
import { photos } from "./site";

/**
 * DEMO CONTENT — placeholder articles used to build the news templates.
 * They contain general logistics guidance only (no claims about LST Express)
 * and must be replaced by articles written/validated by LST Express.
 */

export const articleCategories: { id: ArticleCategory | "tous"; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "conseils", label: "Conseils" },
  { id: "reglementation", label: "Réglementation" },
  { id: "transport", label: "Transport" },
  { id: "entreprise", label: "Entreprise" },
];

export const categoryLabel: Record<ArticleCategory, string> = {
  conseils: "Conseils",
  reglementation: "Réglementation",
  transport: "Transport",
  entreprise: "Entreprise",
};

export const articles: Article[] = [
  {
    slug: "optimiser-couts-transport",
    title: "Cinq leviers pour mieux maîtriser vos coûts de transport",
    excerpt:
      "Mode de transport, consolidation, planification, Incoterms : les leviers concrets pour réduire la facture logistique sans dégrader le service.",
    category: "conseils",
    publishedAt: "2026-10-14",
    readingMinutes: 6,
    author: "Équipe LST Express",
    image: photos.truck,
    status: "published",
    body: [
      {
        type: "paragraph",
        text: "Le transport représente souvent une part importante du coût de revient d'un produit. Pourtant, une partie de ces coûts peut être optimisée sans remettre en cause la qualité de service, à condition de regarder la chaîne dans son ensemble.",
      },
      { type: "heading", text: "1. Choisir le bon mode de transport" },
      {
        type: "paragraph",
        text: "Route, mer ou air : chaque mode a son équilibre entre coût, délai et sécurité. Réserver l'aérien aux envois réellement urgents et planifier les flux réguliers en maritime ou en routier permet souvent des gains significatifs.",
      },
      { type: "heading", text: "2. Consolider les envois" },
      {
        type: "paragraph",
        text: "Regrouper plusieurs petites expéditions en une seule permet de passer d'un tarif de groupage à un chargement plus complet, et de réduire le nombre de manipulations.",
      },
      { type: "heading", text: "3. Anticiper" },
      {
        type: "list",
        items: [
          "Planifier les enlèvements et les créneaux de livraison.",
          "Réserver les capacités suffisamment tôt en période de forte demande.",
          "Préparer les documents avant le départ de la marchandise.",
        ],
      },
      { type: "heading", text: "4. Clarifier les Incoterms" },
      {
        type: "paragraph",
        text: "Un Incoterm mal choisi peut transférer des frais inattendus. Il est utile de le revoir au regard de votre capacité à organiser le transport et les formalités.",
      },
      { type: "quote", text: "Une analyse objective des flux est souvent le premier levier d'économie." },
      { type: "heading", text: "5. Mesurer" },
      {
        type: "paragraph",
        text: "Suivre quelques indicateurs simples — coût par envoi, délai réel, taux de litiges — permet d'objectiver les décisions et de suivre les progrès.",
      },
    ],
  },
  {
    slug: "incoterms-bien-choisir",
    title: "Incoterms : bien les choisir pour éviter les mauvaises surprises",
    excerpt:
      "EXW, FOB, CIF, DAP… Les Incoterms répartissent frais, risques et formalités. Tour d'horizon pour faire un choix éclairé.",
    category: "reglementation",
    publishedAt: "2026-09-30",
    readingMinutes: 5,
    author: "Équipe LST Express",
    image: photos.tablet,
    status: "published",
    body: [
      {
        type: "paragraph",
        text: "Les Incoterms sont des règles internationales qui précisent, dans un contrat de vente, qui paie quoi et à quel moment le risque est transféré du vendeur à l'acheteur.",
      },
      { type: "heading", text: "Pourquoi c'est important" },
      {
        type: "paragraph",
        text: "L'Incoterm détermine qui organise le transport principal, qui supporte l'assurance et qui réalise les formalités douanières. Un mauvais choix peut entraîner des coûts imprévus ou des retards.",
      },
      { type: "heading", text: "Les questions à se poser" },
      {
        type: "list",
        items: [
          "Qui est le mieux placé pour organiser le transport principal ?",
          "Qui peut réaliser les formalités d'export et d'import ?",
          "À quel moment souhaitez-vous transférer le risque ?",
        ],
      },
    ],
  },
  {
    slug: "fcl-ou-lcl",
    title: "Fret maritime : conteneur complet ou groupage ?",
    excerpt: "Comprendre la différence entre FCL et LCL pour choisir la solution adaptée à votre volume et à vos délais.",
    category: "transport",
    publishedAt: "2026-09-12",
    readingMinutes: 4,
    author: "Équipe LST Express",
    image: photos.port,
    status: "published",
    body: [
      {
        type: "paragraph",
        text: "En fret maritime, deux grandes options existent : réserver un conteneur entier (FCL) ou partager un conteneur avec d'autres expéditeurs (LCL).",
      },
      { type: "heading", text: "Le conteneur complet (FCL)" },
      {
        type: "paragraph",
        text: "Il est dédié à votre marchandise. Il limite les manipulations et convient aux volumes importants.",
      },
      { type: "heading", text: "Le groupage (LCL)" },
      {
        type: "paragraph",
        text: "Vous ne payez que le volume occupé. C'est une solution adaptée aux petits volumes, avec un délai parfois plus long lié à la consolidation.",
      },
    ],
  },
  {
    slug: "preparer-documents-import",
    title: "Import : les documents à préparer avant l'arrivée de la marchandise",
    excerpt: "Facture, liste de colisage, certificats : la bonne préparation documentaire limite les blocages en douane.",
    category: "reglementation",
    publishedAt: "2026-08-28",
    readingMinutes: 5,
    author: "Équipe LST Express",
    image: photos.containers,
    status: "published",
    body: [
      {
        type: "paragraph",
        text: "La majorité des blocages en douane s'expliquent par des documents incomplets ou incohérents. Une vérification en amont permet de gagner un temps précieux.",
      },
      {
        type: "list",
        items: [
          "Facture commerciale détaillée.",
          "Liste de colisage cohérente avec la facture.",
          "Document de transport (connaissement, LTA, CMR).",
          "Certificats éventuels : origine, conformité, sanitaires.",
        ],
      },
    ],
  },
  {
    slug: "fret-aerien-quand-choisir",
    title: "Quand privilégier le fret aérien ?",
    excerpt: "Urgence, valeur, fragilité : les situations où l'aérien reste la meilleure option malgré son coût.",
    category: "transport",
    publishedAt: "2026-08-10",
    readingMinutes: 3,
    author: "Équipe LST Express",
    image: photos.plane,
    status: "published",
    body: [
      {
        type: "paragraph",
        text: "Le fret aérien est plus coûteux que les autres modes, mais il reste incontournable pour certaines situations : pièces de rechange urgentes, échantillons, marchandises de forte valeur ou à durée de vie courte.",
      },
    ],
  },
  {
    slug: "diagnostic-logistique",
    title: "Pourquoi réaliser un diagnostic de sa chaîne logistique",
    excerpt: "Un regard extérieur permet d'identifier les coûts cachés et les points de friction dans vos opérations.",
    category: "conseils",
    publishedAt: "2026-07-22",
    readingMinutes: 4,
    author: "Équipe LST Express",
    image: photos.expert,
    status: "published",
    body: [
      {
        type: "paragraph",
        text: "Avec le temps, les organisations logistiques se construisent par ajouts successifs. Un diagnostic permet de prendre du recul, de cartographier les flux et de prioriser les améliorations.",
      },
    ],
  },
  {
    slug: "planifier-flux-fin-annee",
    title: "Anticiper les pics d'activité de fin d'année",
    excerpt: "Capacités tendues, délais allongés : comment planifier vos flux pour traverser la haute saison sereinement.",
    category: "conseils",
    publishedAt: "2026-07-05",
    readingMinutes: 4,
    author: "Équipe LST Express",
    image: photos.hero,
    status: "published",
    body: [
      {
        type: "paragraph",
        text: "En fin d'année, la demande de transport augmente fortement. Réserver tôt, lisser les volumes et préparer les documents en avance sont les meilleures protections contre les retards.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: Article, count = 3): Article[] {
  const sameCategory = articles.filter((a) => a.slug !== article.slug && a.category === article.category);
  const others = articles.filter((a) => a.slug !== article.slug && a.category !== article.category);
  return [...sameCategory, ...others].slice(0, count);
}

/** Published articles, newest first. */
export const publishedArticles = articles
  .filter((a) => a.status === "published")
  .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt));

/** News listing page (/actualites). */
export const newsPage = {
  eyebrow: "Actualités",
  title: "Conseils et informations métier",
  intro: "Transport, réglementation, logistique : des repères concrets pour mieux organiser vos opérations.",
} as const;
