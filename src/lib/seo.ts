import { contact, site } from "@/data/site";
import { NABEUL } from "@/data/hero";

/** Meta description ≤ 158 caractères (au-delà, Google la tronque), coupée sur un mot. */
export function metaDescription(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.–-]+$/, "")}…`;
}

/** URL absolue sur le domaine de production. */
export const absUrl = (path: string) => new URL(path, site.url).toString();

/** Identifiant schema.org de l'entreprise (référencé par les autres blocs JSON-LD). */
export const ORG_ID = `${site.url}/#organisation`;

/** Entreprise locale (siège de Nabeul) : coordonnées issues de src/data/site.ts. */
export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": ORG_ID,
  name: site.name,
  description: site.description,
  url: site.url,
  logo: absUrl("/brand/lst-express-logo.png"),
  image: absUrl("/opengraph-image.jpg"),
  telephone: contact.phones[0]?.replace(/\s+/g, ""),
  email: contact.email ?? undefined,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Avenue Hédi Nouira, Immeuble Aïcha",
    postalCode: "8000",
    addressLocality: "Nabeul",
    addressCountry: "TN",
  },
  geo: { "@type": "GeoCoordinates", latitude: NABEUL.lat, longitude: NABEUL.lon },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "13:00" },
  ],
  areaServed: ["Tunisie", "Afrique", "International"],
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: site.url,
  name: site.name,
  inLanguage: "fr",
  publisher: { "@id": ORG_ID },
};
