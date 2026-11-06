/**
 * Shared domain types. They describe the shape the future API/CMS is expected
 * to return, so the mock data in `src/data` can later be swapped for real
 * fetches without touching components.
 */

export type ServiceSlug =
  | "transport-terrestre"
  | "fret-maritime"
  | "fret-aerien"
  | "transit-douane"
  | "solutions-logistiques"
  | "consulting";

export type ServiceCategory = "transport" | "logistique" | "conseil";

export type IconName =
  | "truck"
  | "ship"
  | "plane"
  | "file-check"
  | "warehouse"
  | "chart-line";

/** Image reference with a focal point so a single photo can be cropped per breakpoint. */
export interface MediaRef {
  src: string;
  alt: string;
  /** CSS object-position value, e.g. "70% 40%". */
  position?: string;
  /** Optional zoom factor used for art-directed crops of a shared photo. */
  zoom?: number;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  slug: ServiceSlug;
  order: number;
  category: ServiceCategory;
  icon: IconName;
  title: string;
  /** Short line used on cards. */
  summary: string;
  /** Promise shown in the detail hero. */
  promise: string;
  description: string;
  offerings: string[];
  benefits: string[];
  /** Operational steps — only displayed when confirmed by LST. */
  steps?: { title: string; text: string }[];
  faq?: ServiceFaq[];
  ctaLabel: string;
  image: MediaRef;
  /** True until LST Express confirms the service scope (spec §6.1). */
  pendingValidation: boolean;
}

export type ArticleCategory = "conseils" | "reglementation" | "transport" | "entreprise";

export interface ArticleBlock {
  type: "paragraph" | "heading" | "list" | "quote";
  text?: string;
  items?: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  publishedAt: string;
  readingMinutes: number;
  author: string;
  image: MediaRef;
  body: ArticleBlock[];
  status: "published" | "draft" | "scheduled";
}

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  icon?: IconName;
  /** Section not published yet: shows a "Bientôt" badge. */
  soon?: boolean;
}

export interface NavItem extends NavLink {
  children?: NavLink[];
}

export interface ContactInfo {
  /** `null` means "à confirmer par LST Express" — never invent contact details. */
  /** All phone numbers, main one first (empty = "à confirmer"). */
  phones: string[];
  email: string | null;
  address: string | null;
  openingHours: string | null;
  mapsUrl: string | null;
}

export interface KeyFigure {
  value: string;
  label: string;
  detail?: string;
}

/* ---------- Forms ---------- */

export type NeedType =
  | "transport-terrestre"
  | "fret-maritime"
  | "fret-aerien"
  | "solutions-logistiques"
  | "transit-douane"
  | "consulting"
  | "autre";

export type ShipmentType = "import" | "export" | "national" | "international" | "non-applicable";

export interface QuoteFormValues {
  needType: NeedType | "";
  shipmentType: ShipmentType | "";
  origin: string;
  destination: string;
  goods: string;
  weight: string;
  volume: string;
  desiredDate: string;
  description: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  consent: boolean;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

/* ---------- Administration ---------- */

export type QuoteStatus = "nouveau" | "en-cours" | "devis-envoye" | "gagne" | "perdu" | "archive";

export interface QuoteNote {
  id: string;
  author: string;
  createdAt: string;
  text: string;
}

export interface QuoteRequest {
  id: string;
  reference: string;
  createdAt: string;
  status: QuoteStatus;
  needType: NeedType;
  shipmentType: ShipmentType;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  goods: string;
  weight?: string;
  volume?: string;
  desiredDate?: string;
  description: string;
  attachments: { name: string; size: number }[];
  assignee?: string;
  notes: QuoteNote[];
}

export type UserRole = "administrateur" | "editeur" | "commercial";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "actif" | "invite" | "suspendu";
  lastLogin: string | null;
}

export interface MediaItem {
  id: string;
  name: string;
  src: string;
  alt: string;
  type: "image" | "document";
  size: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  folder: string;
}

export interface ManagedPage {
  id: string;
  title: string;
  path: string;
  status: "publie" | "brouillon";
  updatedAt: string;
  updatedBy: string;
  seoTitle: string;
  seoDescription: string;
  indexable: boolean;
}

export type PublishStatus = "publie" | "brouillon" | "programme";
