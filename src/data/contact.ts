/**
 * Contact page content (spec §03 site map, §7.3 contact).
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
};

export const contactSubjects = [
  "Demande d'information",
  "Transport et logistique",
  "Consulting",
  "Partenariat",
  "Autre",
];
