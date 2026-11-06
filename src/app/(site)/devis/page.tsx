import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteForm, QuoteFormWithParams } from "@/components/quote/QuoteForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { quotePage } from "@/data/quote";
import { contact } from "@/data/site";
import { PhoneLinks } from "@/components/ui/PhoneLinks";

export const metadata: Metadata = {
  title: "Demande de devis",
  description: quotePage.intro,
};

export default function QuotePage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Accueil", href: "/" }, { label: "Demande de devis" }]} eyebrow={quotePage.eyebrow} title={quotePage.title}>
        <p>{quotePage.intro}</p>
      </PageHeader>

      <section aria-label="Formulaire de demande de devis" className="bg-white py-14 lg:py-20">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            {/* `?besoin=` preselects the need; the plain form is the prerendered fallback. */}
            <Suspense fallback={<QuoteForm />}>
              <QuoteFormWithParams />
            </Suspense>
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-xl bg-paper p-7">
                <h2 className="text-lg font-semibold">{quotePage.aside.title}</h2>
                <ol className="mt-5 space-y-4">
                  {quotePage.aside.steps.map((s, i) => (
                    <li key={s} className="flex gap-4 text-sm leading-relaxed">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs text-white">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              {contact.phones.length > 0 && (
                <div className="rounded-xl bg-ink p-7 text-white">
                  <p className="text-sm text-white/70">Vous préférez en parler ?</p>
                  <div className="mt-2 space-y-1 text-2xl font-semibold">
                    <PhoneLinks stacked linkClassName="hover:text-brand-yellow" />
                  </div>
                  {contact.openingHours && <p className="mt-2 text-sm text-white/70">{contact.openingHours}</p>}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
