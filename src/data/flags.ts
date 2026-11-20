/**
 * Sections de l'accueil préparées pour du contenu réel futur, masquées tant que LST Express
 * ne les a pas validées. Une section ne s'affiche que si son drapeau est vrai ET que ses données
 * (src/data/social-proof.ts, src/data/articles.ts) ne sont pas vides.
 */
export const homeFlags = {
  /** TODO(client) : activer quand des témoignages réels et autorisés seront fournis. */
  testimonials: false,
  /** TODO(client) : activer quand les logos partenaires (avec accord d'usage) seront fournis. */
  partners: false,
  /** TODO(client) : activer quand les articles de démonstration seront remplacés par de vrais articles. */
  news: false,
} as const;
