/** Hero de l'accueil (globe). Textes inchangés par rapport à la version précédente. */
export const hero = {
  title: "Connecter les marchés, optimiser vos opérations.",
  text: "Transport, logistique et consulting pour les entreprises, en Afrique et à l’international.",
  primary: { label: "Demander un devis", href: "/devis" },
  secondary: { label: "Découvrir nos solutions", href: "#services" },
  hint: "Faites défiler",
} as const;

export type GeoPoint = { name: string; lat: number; lon: number };

/** Siège LST Express (Avenue Hédi Nouira, Nabeul). */
export const NABEUL: GeoPoint = { name: "Nabeul", lat: 36.4561, lon: 10.7376 };

/**
 * TODO(client) : destinations des arcs animés sur le globe — à valider avec LST Express
 * (lignes réellement opérées / marchés prioritaires). Exemples provisoires, sans chiffres associés.
 */
export const DESTINATIONS: GeoPoint[] = [
  { name: "Marseille", lat: 43.2965, lon: 5.3698 },
  { name: "Gênes", lat: 44.4056, lon: 8.9463 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784 },
  { name: "Abidjan", lat: 5.3599, lon: -4.0083 },
  { name: "Dubaï", lat: 25.2048, lon: 55.2708 },
];
