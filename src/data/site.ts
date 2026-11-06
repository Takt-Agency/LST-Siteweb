import type { ContactInfo, KeyFigure, MediaRef, NavItem, NavLink } from "@/types";

/**
 * Global site configuration.
 *
 * Contact details and key figures are deliberately empty: the specification
 * (§12, §16) states they must be supplied and validated by LST Express.
 * Components render an explicit "à confirmer" placeholder for `null` values.
 */

export const site = {
  name: "LST Express",
  baseline: "Logistique · Service · Transport",
  signature: "Connecter les marchés. Optimiser vos opérations.",
  description:
    "LST Express accompagne les entreprises avec des solutions de transport, de logistique et de consulting, en Afrique et à l'international.",
  url: "https://www.lstexpress.tn",
  agency: { name: "Takt Agency", label: "Développé par", url: "https://takt-agency.net/" },
  /** News/blog: shown as "Bientôt" until LST Express publishes real articles. */
  newsEnabled: false,
} as const;

export const contact: ContactInfo = {
  phones: ["+216 40 064 017"],
  email: "commercial@lstexpress.tn",
  address: "Avenue Hédi Nouira, Immeuble Aïcha, 8000 Nabeul, Tunisie",
  openingHours: "Lun–Ven 8h–17h · Sam 8h–13h",
  /** Google Maps search for the address — replace with the exact pin/Business Profile link when available. */
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Immeuble Aïcha, Avenue Hédi Nouira, 8000 Nabeul, Tunisie"),
};

/** Only populated once LST Express provides validated data (spec §05-08). */
export const keyFigures: KeyFigure[] = [];

/** Social links — empty until official accounts are confirmed (spec §4.3). */
export const socialLinks: { label: string; href: string }[] = [];

export const logos = {
  light: { src: "/brand/lst-express-logo-light.png", width: 859, height: 174 },
  dark: { src: "/brand/lst-express-logo-dark.png", width: 859, height: 174 },
} as const;

const HERO = "/images/lst-hero-logistique.png";

/**
 * A single approved photograph is currently available. Art-directed crops of it
 * illustrate the different sections until LST Express supplies more imagery.
 */
export const photos = {
  hero: {
    src: HERO,
    alt: "Responsable logistique LST Express supervisant un terminal portuaire au coucher du soleil, avec camion et avion cargo",
    position: "62% 40%",
  },
  truck: { src: HERO, alt: "Camion LST Express sur une plateforme logistique", position: "64% 70%", zoom: 2.1 },
  plane: { src: HERO, alt: "Avion cargo au décollage au-dessus du port", position: "80% 18%", zoom: 2.4 },
  port: { src: HERO, alt: "Portiques et conteneurs d'un terminal maritime", position: "72% 42%", zoom: 1.8 },
  containers: { src: HERO, alt: "Piles de conteneurs sur un terminal", position: "8% 35%", zoom: 1.9 },
  tablet: { src: HERO, alt: "Suivi des flux sur tablette avec une carte des échanges internationaux", position: "60% 88%", zoom: 2.4 },
  expert: { src: HERO, alt: "Expert LST Express analysant les opérations sur le terrain", position: "30% 35%", zoom: 1.6 },
} satisfies Record<string, MediaRef>;

export const mainNav: NavItem[] = [
  { label: "Accueil", href: "/" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Transport terrestre", href: "/services/transport-terrestre", icon: "truck", description: "FTL, groupage, porte-à-porte" },
      { label: "Fret maritime", href: "/services/fret-maritime", icon: "ship", description: "FCL, LCL, import / export" },
      { label: "Fret aérien", href: "/services/fret-aerien", icon: "plane", description: "Envois urgents et sensibles" },
      { label: "Transit & douane", href: "/services/transit-douane", icon: "file-check", description: "Documents et formalités" },
      { label: "Solutions logistiques", href: "/services/solutions-logistiques", icon: "warehouse", description: "Coordination des flux" },
    ],
  },
  { label: "Consulting", href: "/consulting" },
  { label: "À propos", href: "/a-propos" },
  { label: "Actualités", href: "/actualites", soon: true },
  { label: "Contact", href: "/contact" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Consulting", href: "/consulting" },
      { label: "Actualités", href: "/actualites", soon: true },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Transport terrestre", href: "/services/transport-terrestre" },
      { label: "Fret maritime", href: "/services/fret-maritime" },
      { label: "Fret aérien", href: "/services/fret-aerien" },
      { label: "Transit & douane", href: "/services/transit-douane" },
      { label: "Solutions logistiques", href: "/services/solutions-logistiques" },
    ],
  },
];

export const legalNav: NavLink[] = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Cookies", href: "/cookies" },
];

export const languages = [
  { code: "fr", label: "Français", available: true },
  { code: "en", label: "English", available: false },
  { code: "ar", label: "العربية", available: false },
] as const;
