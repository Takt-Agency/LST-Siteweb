/**
 * Témoignages et partenaires de l'accueil. VIDES volontairement : aucun avis, nom ou logo ne doit
 * être inventé. TODO(client) : fournir des contenus réels, avec l'accord des personnes et des entreprises.
 */
export type Testimonial = { quote: string; author: string; role?: string; company?: string };
export type Partner = { name: string; logo: { src: string; width: number; height: number }; href?: string };

export const testimonials: Testimonial[] = [];
export const partners: Partner[] = [];
