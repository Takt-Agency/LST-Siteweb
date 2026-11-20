import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { cookiePolicy } from "@/data/legal";

export const metadata: Metadata = {
  alternates: { canonical: "/cookies" },
  // Page légale : utile aux visiteurs, sans intérêt dans les résultats de recherche.
  robots: { index: false, follow: true },
  title: cookiePolicy.title,
  description: cookiePolicy.intro,
};

export default function Page() {
  return <LegalPage page={cookiePolicy} />;
}
