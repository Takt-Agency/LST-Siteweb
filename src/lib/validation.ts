import type { FormErrors, QuoteFormValues } from "@/types";

/*
 * Client-side validation only. The spec (§7.2) also requires server-side
 * validation and anti-spam protection, which belong to the future backend.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ().-]{8,20}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isPhone(value: string): boolean {
  return PHONE_RE.test(value.trim());
}

export const quoteSteps = [
  { id: "besoin", label: "Votre besoin" },
  { id: "expedition", label: "Expédition" },
  { id: "coordonnees", label: "Coordonnées" },
] as const;

export type QuoteStepId = (typeof quoteSteps)[number]["id"];

const stepFields: Record<QuoteStepId, (keyof QuoteFormValues)[]> = {
  besoin: ["needType", "shipmentType", "description"],
  expedition: ["origin", "destination", "goods", "weight", "volume", "desiredDate"],
  coordonnees: ["fullName", "company", "email", "phone", "consent"],
};

/** Services for which the route/goods details are expected. */
const shippingNeeds = new Set(["transport-terrestre", "fret-maritime", "fret-aerien", "transit-douane"]);

export function needsShippingDetails(values: QuoteFormValues): boolean {
  return shippingNeeds.has(values.needType);
}

export function validateQuote(values: QuoteFormValues): FormErrors<QuoteFormValues> {
  const errors: FormErrors<QuoteFormValues> = {};

  if (!values.needType) errors.needType = "Sélectionnez le type de besoin.";
  if (values.description.trim().length < 20)
    errors.description = "Décrivez votre besoin en quelques phrases (20 caractères minimum).";

  if (needsShippingDetails(values)) {
    if (!values.shipmentType) errors.shipmentType = "Précisez le type d'expédition.";
    if (!values.origin.trim()) errors.origin = "Indiquez le lieu de départ.";
    if (!values.destination.trim()) errors.destination = "Indiquez la destination.";
  }

  if (values.weight && Number.isNaN(Number(values.weight.replace(",", "."))))
    errors.weight = "Le poids doit être un nombre.";
  if (values.volume && Number.isNaN(Number(values.volume.replace(",", "."))))
    errors.volume = "Le volume doit être un nombre.";

  if (!values.fullName.trim()) errors.fullName = "Indiquez votre nom et prénom.";
  if (!values.company.trim()) errors.company = "Indiquez le nom de votre entreprise.";
  if (!isEmail(values.email)) errors.email = "Saisissez une adresse e-mail valide.";
  if (values.phone && !isPhone(values.phone)) errors.phone = "Numéro de téléphone invalide.";
  if (!values.consent) errors.consent = "Votre accord est nécessaire pour traiter la demande.";

  return errors;
}

export function errorsForStep(
  step: QuoteStepId,
  errors: FormErrors<QuoteFormValues>,
): FormErrors<QuoteFormValues> {
  const result: FormErrors<QuoteFormValues> = {};
  for (const field of stepFields[step]) {
    if (errors[field]) result[field] = errors[field];
  }
  return result;
}

export interface ContactFormValues {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
}

export function validateContact(values: ContactFormValues): FormErrors<ContactFormValues> {
  const errors: FormErrors<ContactFormValues> = {};
  if (!values.fullName.trim()) errors.fullName = "Indiquez votre nom.";
  if (!isEmail(values.email)) errors.email = "Saisissez une adresse e-mail valide.";
  if (values.phone && !isPhone(values.phone)) errors.phone = "Numéro de téléphone invalide.";
  if (!values.subject) errors.subject = "Choisissez un sujet.";
  if (values.message.trim().length < 10) errors.message = "Votre message est trop court.";
  if (!values.consent) errors.consent = "Votre accord est nécessaire pour répondre à votre message.";
  return errors;
}

/* ---------- Attachments (spec §7.1: formats and size limited) ---------- */

export const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.docx,.doc";
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_MAX_FILES = 3;

const allowedExtensions = ATTACHMENT_ACCEPT.split(",");

export function validateAttachment(file: File): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!allowedExtensions.includes(ext)) return `Format non accepté (${ext}).`;
  if (file.size > ATTACHMENT_MAX_BYTES) return "Fichier trop volumineux (10 Mo maximum).";
  return null;
}
