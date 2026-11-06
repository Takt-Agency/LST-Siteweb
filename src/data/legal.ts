/**
 * Legal pages (/mentions-legales, /confidentialite, /cookies) — spec §4.3, §03.
 *
 * TEMPLATE CONTENT: company identifiers that LST Express has not supplied yet
 * are written as `TODO` and rendered as visible "à compléter" markers. The texts
 * must be reviewed by LST Express (and ideally a legal adviser) before going live.
 */

/** Marker for information still to be supplied by LST Express. */
export const TODO = "__TODO__";

export interface LegalSection {
  title: string;
  /** Paragraphs; a `[label, value]` pair renders as a definition row. */
  content: (string | [string, string])[];
}

export interface LegalPageData {
  slug: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
}

const company: [string, string][] = [
  ["Raison sociale", "LST Express"],
  ["Forme juridique", TODO],
  ["Siège social", "Av. République, Immeuble Gallala, 2ème étage, 8030 Grombalia, Tunisie · BP 73"],
  ["Registre national des entreprises (RNE)", TODO],
  ["Matricule fiscal", TODO],
  ["Téléphone", "+216 54 673 321"],
  ["E-mail", "commercial@lstexpress.tn"],
  ["Directeur de la publication", TODO],
];

export const legalNotice: LegalPageData = {
  slug: "mentions-legales",
  title: "Mentions légales",
  intro: "Informations relatives à l'éditeur, à l'hébergeur et aux conditions d'utilisation du site.",
  updatedAt: "2026-10-30",
  sections: [
    { title: "Éditeur du site", content: ["Le présent site est édité par :", ...company] },
    {
      title: "Hébergement",
      content: [
        "Le site est hébergé par :",
        ["Hébergeur", "Topnet"],
        ["Adresse", TODO],
        ["Site web", "www.topnet.tn"],
      ],
    },
    {
      title: "Conception et développement",
      content: [
        ["Agence", "Takt Agency"],
        ["Site web", "takt-agency.net"],
      ],
    },
    {
      title: "Propriété intellectuelle",
      content: [
        "L'ensemble des éléments du site (textes, logo, visuels, mise en page) est la propriété de LST Express ou fait l'objet d'une autorisation d'utilisation. Toute reproduction, représentation ou adaptation, totale ou partielle, sans autorisation écrite préalable est interdite.",
      ],
    },
    {
      title: "Responsabilité",
      content: [
        "LST Express s'efforce de fournir des informations exactes et à jour. Les contenus du site sont fournis à titre indicatif et peuvent être modifiés à tout moment. LST Express ne saurait être tenue responsable d'une erreur, d'une omission ou d'une indisponibilité du site.",
        "Les liens vers des sites tiers sont proposés pour information ; LST Express n'exerce aucun contrôle sur leur contenu.",
      ],
    },
    {
      title: "Données personnelles et cookies",
      content: [
        "Le traitement des données personnelles et l'usage des cookies sont décrits dans la politique de confidentialité et la politique cookies du site.",
      ],
    },
    {
      title: "Droit applicable",
      content: ["Les présentes mentions sont soumises au droit tunisien. En cas de litige, les tribunaux tunisiens sont seuls compétents."],
    },
  ],
};

export const privacyPolicy: LegalPageData = {
  slug: "confidentialite",
  title: "Politique de confidentialité",
  intro: "Comment LST Express collecte, utilise et protège les données personnelles transmises via ce site.",
  updatedAt: "2026-10-30",
  sections: [
    {
      title: "Responsable du traitement",
      content: [
        "Le responsable du traitement des données collectées sur ce site est LST Express.",
        ["Adresse", "Av. République, Immeuble Gallala, 2ème étage, 8030 Grombalia, Tunisie · BP 73"],
        ["Contact", "commercial@lstexpress.tn"],
      ],
    },
    {
      title: "Données collectées",
      content: [
        "Les données sont collectées uniquement via les formulaires du site (contact et demande de devis) : nom et prénom, entreprise, e-mail, téléphone, informations relatives à votre demande et, le cas échéant, documents joints.",
      ],
    },
    {
      title: "Finalités",
      content: [
        "Ces données sont utilisées pour répondre à vos messages, établir et suivre vos demandes de devis, et assurer la relation commerciale. Elles ne sont ni vendues ni cédées à des tiers à des fins commerciales.",
      ],
    },
    {
      title: "Base légale",
      content: ["Le traitement repose sur votre consentement, recueilli lors de l'envoi d'un formulaire, et sur les mesures précontractuelles prises à votre demande."],
    },
    {
      title: "Destinataires",
      content: [
        "Les données sont destinées aux équipes de LST Express habilitées à traiter votre demande. Elles peuvent être transmises aux prestataires techniques du site (hébergement) dans la stricte limite de leur mission.",
      ],
    },
    {
      title: "Durée de conservation",
      content: [["Durée de conservation des demandes", TODO]],
    },
    {
      title: "Sécurité",
      content: ["LST Express met en œuvre des mesures techniques et organisationnelles adaptées pour protéger les données contre tout accès, modification ou divulgation non autorisés."],
    },
    {
      title: "Vos droits",
      content: [
        "Conformément à la loi organique n° 2004-63 du 27 juillet 2004 portant sur la protection des données à caractère personnel, vous disposez d'un droit d'accès, de rectification et d'opposition au traitement de vos données.",
        "Pour exercer ces droits, écrivez à commercial@lstexpress.tn. Vous pouvez également saisir l'Instance nationale de protection des données personnelles (INPDP).",
      ],
    },
  ],
};

export const cookiePolicy: LegalPageData = {
  slug: "cookies",
  title: "Politique cookies",
  intro: "Les cookies utilisés sur ce site et la manière de gérer vos préférences.",
  updatedAt: "2026-10-30",
  sections: [
    {
      title: "Qu'est-ce qu'un cookie ?",
      content: [
        "Un cookie est un petit fichier enregistré sur votre appareil lors de la consultation d'un site. Il permet notamment de mémoriser des préférences ou de mesurer l'audience.",
      ],
    },
    {
      title: "Cookies strictement nécessaires",
      content: ["Indispensables au fonctionnement du site (sécurité, navigation). Ils ne nécessitent pas votre consentement."],
    },
    {
      title: "Mesure d'audience",
      content: [
        "Si un outil de mesure d'audience est mis en place, il ne sera activé qu'après votre accord. Il permet de comprendre l'utilisation du site afin de l'améliorer.",
        ["Outil utilisé", TODO],
      ],
    },
    {
      title: "Services tiers : Google Maps",
      content: [
        "La page Contact peut afficher une carte Google Maps. Ce service est susceptible de déposer des cookies ; la carte n'est chargée qu'avec votre accord. À défaut, un lien vers Google Maps est proposé.",
      ],
    },
    {
      title: "Gérer vos préférences",
      content: [
        "Vous pouvez à tout moment accepter ou refuser les cookies non nécessaires, et configurer votre navigateur pour bloquer ou supprimer les cookies. Le refus des cookies non nécessaires n'empêche pas l'accès au site.",
      ],
    },
    {
      title: "Durée de validité",
      content: ["Votre choix est conservé pour une durée limitée, au terme de laquelle il vous sera de nouveau demandé.", ["Durée de conservation du choix", TODO]],
    },
  ],
};

export const legalPages = [legalNotice, privacyPolicy, cookiePolicy];
