import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalNotice } from "@/data/legal";

export const metadata: Metadata = {
  alternates: { canonical: "/mentions-legales" },
  // Page légale : utile aux visiteurs, sans intérêt dans les résultats de recherche.
  robots: { index: false, follow: true },
  title: legalNotice.title,
  description: legalNotice.intro,
};

export default function Page() {
  return <LegalPage page={legalNotice} />;
}
