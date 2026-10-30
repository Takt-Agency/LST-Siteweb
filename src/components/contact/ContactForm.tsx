"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCircleCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Field, controlClass } from "@/components/ui/Field";
import { contactSubjects } from "@/data/contact";
import { demoReference, simulateRequest } from "@/lib/simulate";
import { validateContact, type ContactFormValues } from "@/lib/validation";
import type { FormErrors } from "@/types";

const empty: ContactFormValues = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  consent: false,
};

type Status = { state: "idle" } | { state: "sending" } | { state: "sent"; reference: string } | { state: "error" };

/**
 * Contact form with client-side validation. SIMULATED: submitting goes through
 * `simulateRequest` — nothing is sent anywhere (see src/lib/simulate.ts).
 */
export function ContactForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<ContactFormValues>(empty);
  const [errors, setErrors] = useState<FormErrors<ContactFormValues>>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const id = (name: keyof ContactFormValues) => `${uid}-${name}`;
  const set = <K extends keyof ContactFormValues>(name: K, value: ContactFormValues[K]) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };
  const a11y = (name: keyof ContactFormValues) => ({
    id: id(name),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id(name)}-error` : undefined,
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    const first = Object.keys(found)[0] as keyof ContactFormValues | undefined;
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(first))}`)?.focus();
      return;
    }
    setStatus({ state: "sending" });
    try {
      await simulateRequest(values);
      setStatus({ state: "sent", reference: demoReference("MSG") });
      setValues(empty);
    } catch {
      setStatus({ state: "error" });
    }
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="rounded-xl border border-line bg-white p-8 lg:p-10">
        <FontAwesomeIcon icon={faCircleCheck} aria-hidden className="text-3xl text-brand-yellow" />
        <h2 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">Message bien reçu</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Merci pour votre message. Référence : <span className="font-medium text-ink">{status.reference}</span>.
        </p>
        <p className="mt-4 rounded-md bg-paper px-4 py-3 text-sm text-muted">
          Démonstration : aucun message n&apos;a été réellement envoyé.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ state: "idle" })}
          className="mt-8 font-medium underline decoration-line decoration-2 underline-offset-[6px] hover:decoration-brand-yellow"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  const sending = status.state === "sending";

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2" aria-busy={sending}>
      <Field id={id("fullName")} label="Nom et prénom" required error={errors.fullName}>
        <input {...a11y("fullName")} autoComplete="name" value={values.fullName} onChange={(e) => set("fullName", e.target.value)} className={controlClass(!!errors.fullName)} />
      </Field>
      <Field id={id("company")} label="Entreprise">
        <input {...a11y("company")} autoComplete="organization" value={values.company} onChange={(e) => set("company", e.target.value)} className={controlClass()} />
      </Field>
      <Field id={id("email")} label="E-mail" required error={errors.email}>
        <input {...a11y("email")} type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} className={controlClass(!!errors.email)} />
      </Field>
      <Field id={id("phone")} label="Téléphone" error={errors.phone}>
        <input {...a11y("phone")} type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className={controlClass(!!errors.phone)} />
      </Field>
      <Field id={id("subject")} label="Sujet" required error={errors.subject} className="sm:col-span-2">
        <select {...a11y("subject")} value={values.subject} onChange={(e) => set("subject", e.target.value)} className={controlClass(!!errors.subject)}>
          <option value="">Choisissez un sujet</option>
          {contactSubjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      <Field id={id("message")} label="Message" required error={errors.message} className="sm:col-span-2">
        <textarea {...a11y("message")} rows={6} value={values.message} onChange={(e) => set("message", e.target.value)} className={controlClass(!!errors.message)} />
      </Field>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
          <input
            {...a11y("consent")}
            type="checkbox"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-ink"
          />
          J&apos;accepte que LST Express utilise ces informations pour répondre à mon message.
        </label>
        {errors.consent && (
          <p id={`${id("consent")}-error`} className="mt-1.5 text-sm text-red-700">
            {errors.consent}
          </p>
        )}
      </div>

      {status.state === "error" && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800 sm:col-span-2">
          Une erreur est survenue. Merci de réessayer ou de nous appeler.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex h-12 items-center gap-3 rounded-md bg-ink px-6 font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-70"
        >
          {sending ? "Envoi en cours…" : "Envoyer le message"}
          <FontAwesomeIcon
            icon={sending ? faSpinner : faArrowRight}
            spin={sending}
            aria-hidden
            className="text-xs text-brand-yellow transition-transform group-hover:translate-x-0.5"
          />
        </button>
        <p className="text-sm text-muted">
          <span aria-hidden className="text-brand-yellow">*</span> Champs obligatoires
        </p>
      </div>
    </form>
  );
}
