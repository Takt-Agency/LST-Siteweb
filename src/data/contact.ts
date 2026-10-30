/**
 * Contact page content (spec §03 site map, §7.3 contact & Google Maps).
 * Contact details themselves live in `contact` (src/data/site.ts).
 */

export const contactPage = {
  eyebrow: "Contact",
  title: "Parlons de vos opérations",
  intro:
    "Une question sur nos services, un projet de transport ou un besoin de conseil ? Écrivez-nous ou appelez-nous, l'équipe vous répond.",
  formTitle: "Écrivez-nous",
  detailsTitle: "Coordonnées",
  quote: {
    title: "Besoin d'un devis ?",
    text: "Pour une demande chiffrée, le formulaire de devis recueille directement les informations utiles.",
    cta: { label: "Demander un devis", href: "/devis" },
  },
  location: {
    eyebrow: "Nous trouver",
    title: "Localisation et informations pratiques",
    /** Accès, stationnement… — only if supplied by LST Express (spec §7.3). */
    practical: [] as string[],
  },
};

export const contactSubjects = [
  "Demande d'information",
  "Transport et logistique",
  "Consulting",
  "Partenariat",
  "Autre",
];
