"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faCircleCheck,
  faFileArrowUp,
  faPaperclip,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Field, controlClass } from "@/components/ui/Field";
import { needOptions, shipmentOptions } from "@/data/quote";
import { demoReference, simulateRequest } from "@/lib/simulate";
import { cn, formatFileSize } from "@/lib/utils";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_FILES,
  errorsForStep,
  needsShippingDetails,
  quoteSteps,
  validateAttachment,
  validateQuote,
  type QuoteStepId,
} from "@/lib/validation";
import type { FormErrors, NeedType, QuoteFormValues } from "@/types";

const empty: QuoteFormValues = {
  needType: "",
  shipmentType: "",
  origin: "",
  destination: "",
  goods: "",
  weight: "",
  volume: "",
  desiredDate: "",
  description: "",
  fullName: "",
  company: "",
  email: "",
  phone: "",
  consent: false,
};

const isNeed = (v: string | null): v is NeedType => !!v && needOptions.some((o) => o.value === v);

/** Reads `?besoin=…` to preselect the need (wrap in <Suspense>). */
export function QuoteFormWithParams() {
  const besoin = useSearchParams().get("besoin");
  return <QuoteForm key={besoin ?? ""} initialNeed={isNeed(besoin) ? besoin : ""} />;
}

type Sent = { reference: string; values: QuoteFormValues; files: File[] };

/**
 * Multi-step quote request (spec §7.1–7.2) with client-side validation and
 * attachment previews. SIMULATED: submission goes through `simulateRequest`,
 * nothing is sent (no e-mail, no storage). The hidden "website" field is a
 * honeypot placeholder for the future server-side anti-spam check.
 */
export function QuoteForm({ initialNeed = "" }: { initialNeed?: NeedType | "" }) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<QuoteFormValues>({ ...empty, needType: initialNeed });
  const [errors, setErrors] = useState<FormErrors<QuoteFormValues>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);

  const stepId: QuoteStepId = quoteSteps[step].id;
  const shipping = needsShippingDetails(values);
  const id = (name: keyof QuoteFormValues) => `${uid}-${name}`;

  const set = <K extends keyof QuoteFormValues>(name: K, value: QuoteFormValues[K]) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };
  const a11y = (name: keyof QuoteFormValues) => ({
    id: id(name),
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id(name)}-error` : undefined,
  });

  const goTo = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  /** Validates the current step; focuses the first invalid field. */
  const checkStep = () => {
    const found = errorsForStep(stepId, validateQuote(values));
    setErrors(found);
    const first = Object.keys(found)[0] as keyof QuoteFormValues | undefined;
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    return !first;
  };

  function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const problems: string[] = [];
    const accepted = [...files];
    for (const file of picked) {
      const error = validateAttachment(file);
      if (error) problems.push(`${file.name} : ${error}`);
      else if (accepted.length >= ATTACHMENT_MAX_FILES) problems.push(`${file.name} : ${ATTACHMENT_MAX_FILES} fichiers maximum.`);
      else accepted.push(file);
    }
    setFiles(accepted);
    setFileErrors(problems);
    e.target.value = "";
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!checkStep()) return;
    if (step < quoteSteps.length - 1) return goTo(step + 1);

    // Honeypot: bots fill hidden fields — a real server must reject these too.
    if (new FormData(e.currentTarget).get("website")) return;

    setSending(true);
    setFailed(false);
    try {
      await simulateRequest({ values, files: files.map((f) => f.name) });
      setSent({ reference: demoReference("DEV"), values, files });
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  if (sent) return <Confirmation sent={sent} />;

  const needLabel = needOptions.find((o) => o.value === values.needType)?.label;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-busy={sending}>
      {/* Stepper */}
      <ol className="grid grid-cols-3 gap-2" aria-label="Étapes de la demande">
        {quoteSteps.map((s, i) => (
          <li key={s.id} aria-current={i === step ? "step" : undefined}>
            <span className={cn("block h-1 rounded-full transition-colors", i <= step ? "bg-ink" : "bg-line")} />
            <span className={cn("mt-3 flex items-center gap-2 text-sm", i === step ? "font-medium text-ink" : "text-muted")}>
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs",
                  i < step ? "bg-brand-yellow text-ink" : i === step ? "bg-ink text-white" : "border border-line",
                )}
              >
                {i < step ? <FontAwesomeIcon icon={faCheck} aria-hidden className="text-[0.6rem]" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </span>
          </li>
        ))}
      </ol>

      <h2 ref={headingRef} tabIndex={-1} className="mt-10 scroll-mt-28 text-2xl font-semibold tracking-[-0.02em] outline-none">
        <span className="text-muted">
          {step + 1}/{quoteSteps.length} ·{" "}
        </span>
        {quoteSteps[step].label}
      </h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {stepId === "besoin" && (
          <>
            <fieldset className="sm:col-span-2">
              <legend className="mb-3 text-sm font-medium">
                Type de besoin <span aria-hidden className="text-brand-yellow">*</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {needOptions.map((o, i) => (
                  <label
                    key={o.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors",
                      values.needType === o.value ? "border-ink bg-ink text-white" : "border-line hover:border-ink/40",
                    )}
                  >
                    <input
                      type="radio"
                      name="needType"
                      value={o.value}
                      checked={values.needType === o.value}
                      onChange={() => set("needType", o.value)}
                      aria-describedby={errors.needType && i === 0 ? `${id("needType")}-error` : undefined}
                      className="accent-brand-yellow"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
              {errors.needType && (
                <p id={`${id("needType")}-error`} className="mt-1.5 text-sm text-red-700">
                  {errors.needType}
                </p>
              )}
            </fieldset>

            {shipping && (
              <Field id={id("shipmentType")} label="Type d'expédition" required error={errors.shipmentType} className="sm:col-span-2">
                <select {...a11y("shipmentType")} value={values.shipmentType} onChange={(e) => set("shipmentType", e.target.value as QuoteFormValues["shipmentType"])} className={controlClass(!!errors.shipmentType)}>
                  <option value="">Choisissez</option>
                  {shipmentOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field id={id("description")} label="Description du besoin" required error={errors.description} hint="Nature de la demande, contraintes, fréquence…" className="sm:col-span-2">
              <textarea {...a11y("description")} rows={6} value={values.description} onChange={(e) => set("description", e.target.value)} className={controlClass(!!errors.description)} />
            </Field>
          </>
        )}

        {stepId === "expedition" && (
          <>
            {shipping ? (
              <>
                <Field id={id("origin")} label="Lieu de départ" required error={errors.origin}>
                  <input {...a11y("origin")} value={values.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Ville, pays" className={controlClass(!!errors.origin)} />
                </Field>
                <Field id={id("destination")} label="Destination" required error={errors.destination}>
                  <input {...a11y("destination")} value={values.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Ville, pays" className={controlClass(!!errors.destination)} />
                </Field>
                <Field id={id("goods")} label="Marchandise" className="sm:col-span-2">
                  <input {...a11y("goods")} value={values.goods} onChange={(e) => set("goods", e.target.value)} placeholder="Nature, conditionnement…" className={controlClass()} />
                </Field>
                <Field id={id("weight")} label="Poids (kg)" error={errors.weight}>
                  <input {...a11y("weight")} inputMode="decimal" value={values.weight} onChange={(e) => set("weight", e.target.value)} className={controlClass(!!errors.weight)} />
                </Field>
                <Field id={id("volume")} label="Volume (m³)" error={errors.volume}>
                  <input {...a11y("volume")} inputMode="decimal" value={values.volume} onChange={(e) => set("volume", e.target.value)} className={controlClass(!!errors.volume)} />
                </Field>
              </>
            ) : (
              <p className="rounded-md bg-paper px-4 py-3 text-sm text-muted sm:col-span-2">
                Pour une demande « {needLabel ?? "autre"} », les informations d&apos;expédition ne sont pas nécessaires. Vous pouvez joindre des documents utiles.
              </p>
            )}
            <Field id={id("desiredDate")} label="Date ou délai souhaité" className="sm:col-span-2">
              <input {...a11y("desiredDate")} value={values.desiredDate} onChange={(e) => set("desiredDate", e.target.value)} placeholder="Ex. : fin novembre, sous 2 semaines…" className={controlClass()} />
            </Field>

            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium">
                Pièces jointes <span className="font-normal text-muted">(facultatif)</span>
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line px-6 py-8 text-center transition-colors hover:border-ink focus-within:border-ink">
                <FontAwesomeIcon icon={faFileArrowUp} aria-hidden className="text-xl text-muted" />
                <span className="font-medium">Ajouter des fichiers</span>
                <span className="text-sm text-muted">PDF, images, Excel ou Word · 10 Mo max · {ATTACHMENT_MAX_FILES} fichiers max</span>
                <input type="file" multiple accept={ATTACHMENT_ACCEPT} onChange={onFiles} className="sr-only" />
              </label>
              {files.length > 0 && (
                <ul className="mt-3 divide-y divide-line rounded-md border border-line">
                  {files.map((f) => (
                    <li key={f.name + f.size} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <FontAwesomeIcon icon={faPaperclip} aria-hidden className="text-muted" />
                      <span className="min-w-0 flex-1 truncate">{f.name}</span>
                      <span className="text-muted">{formatFileSize(f.size)}</span>
                      <button type="button" onClick={() => setFiles((list) => list.filter((x) => x !== f))} aria-label={`Retirer ${f.name}`} className="grid size-7 place-items-center rounded-full hover:bg-paper">
                        <FontAwesomeIcon icon={faXmark} aria-hidden className="text-xs" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {fileErrors.length > 0 && (
                <ul role="alert" className="mt-2 space-y-1 text-sm text-red-700">
                  {fileErrors.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {stepId === "coordonnees" && (
          <>
            <Field id={id("fullName")} label="Nom et prénom" required error={errors.fullName}>
              <input {...a11y("fullName")} autoComplete="name" value={values.fullName} onChange={(e) => set("fullName", e.target.value)} className={controlClass(!!errors.fullName)} />
            </Field>
            <Field id={id("company")} label="Entreprise" required error={errors.company}>
              <input {...a11y("company")} autoComplete="organization" value={values.company} onChange={(e) => set("company", e.target.value)} className={controlClass(!!errors.company)} />
            </Field>
            <Field id={id("email")} label="E-mail professionnel" required error={errors.email}>
              <input {...a11y("email")} type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} className={controlClass(!!errors.email)} />
            </Field>
            <Field id={id("phone")} label="Téléphone" error={errors.phone} hint="Avec l'indicatif si vous êtes hors de Tunisie">
              <input {...a11y("phone")} type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className={controlClass(!!errors.phone)} />
            </Field>
            <div className="sm:col-span-2">
              <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                <input {...a11y("consent")} type="checkbox" checked={values.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-ink" />
                <span>
                  J&apos;accepte que LST Express traite ces informations pour répondre à ma demande, conformément à la{" "}
                  <Link href="/confidentialite" target="_blank" className="text-ink underline underline-offset-2">
                    politique de confidentialité
                  </Link>
                  .
                </span>
              </label>
              {errors.consent && (
                <p id={`${id("consent")}-error`} className="mt-1.5 text-sm text-red-700">
                  {errors.consent}
                </p>
              )}
            </div>
            {/* Honeypot (hidden from people and assistive tech) */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          </>
        )}
      </div>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          Une erreur est survenue. Merci de réessayer ou de nous appeler.
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        {step > 0 ? (
          <button type="button" onClick={() => goTo(step - 1)} className="group inline-flex h-12 items-center gap-3 font-medium">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden className="text-xs transition-transform group-hover:-translate-x-0.5" />
            Retour
          </button>
        ) : (
          <p className="text-sm text-muted">
            <span aria-hidden className="text-brand-yellow">*</span> Champs obligatoires
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex h-12 items-center gap-3 rounded-md bg-ink px-6 font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-70"
        >
          {sending ? "Envoi en cours…" : step < quoteSteps.length - 1 ? "Continuer" : "Envoyer ma demande"}
          <FontAwesomeIcon
            icon={sending ? faSpinner : faArrowRight}
            spin={sending}
            aria-hidden
            className="text-xs text-brand-yellow transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </form>
  );
}

/** Confirmation screen shown after a (simulated) successful submission. */
function Confirmation({ sent }: { sent: Sent }) {
  const v = sent.values;
  const rows: [string, string][] = [
    ["Besoin", needOptions.find((o) => o.value === v.needType)?.label ?? "—"],
    ["Expédition", shipmentOptions.find((o) => o.value === v.shipmentType)?.label ?? "—"],
    ["Trajet", v.origin || v.destination ? `${v.origin || "?"} → ${v.destination || "?"}` : "—"],
    ["Délai souhaité", v.desiredDate || "—"],
    ["Pièces jointes", sent.files.length ? sent.files.map((f) => f.name).join(", ") : "—"],
    ["Contact", `${v.fullName} · ${v.company} · ${v.email}`],
  ];

  return (
    <div role="status" className="rounded-xl border border-line p-8 lg:p-10">
      <FontAwesomeIcon icon={faCircleCheck} aria-hidden className="text-4xl text-brand-yellow" />
      <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">Demande bien reçue</h2>
      <p className="mt-3 text-lg leading-relaxed text-muted">
        Merci {v.fullName.split(" ")[0]}. Votre demande porte la référence <span className="font-semibold text-ink">{sent.reference}</span>. L&apos;équipe
        commerciale revient vers vous rapidement.
      </p>
      <dl className="mt-8 border-t border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="break-words">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 rounded-md bg-paper px-4 py-3 text-sm text-muted">
        Démonstration : aucune demande n&apos;a été réellement envoyée ni enregistrée.
      </p>
      <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4">
        <Link href="/" className="inline-flex h-12 items-center rounded-md bg-ink px-6 font-medium text-white hover:bg-ink-soft">
          Retour à l&apos;accueil
        </Link>
        <Link href="/services" className="inline-flex h-12 items-center font-medium underline decoration-line decoration-2 underline-offset-[6px] hover:decoration-brand-yellow">
          Découvrir nos services
        </Link>
      </div>
    </div>
  );
}
