import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalNotice } from "@/data/legal";

export const metadata: Metadata = {
  title: legalNotice.title,
  description: legalNotice.intro,
};

export default function Page() {
  return <LegalPage page={legalNotice} />;
}
