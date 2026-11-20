import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { privacyPolicy } from "@/data/legal";

export const metadata: Metadata = {
  alternates: { canonical: "/confidentialite" },
  // Page légale : utile aux visiteurs, sans intérêt dans les résultats de recherche.
  robots: { index: false, follow: true },
  title: privacyPolicy.title,
  description: privacyPolicy.intro,
};

export default function Page() {
  return <LegalPage page={privacyPolicy} />;
}
