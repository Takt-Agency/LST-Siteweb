import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { cookiePolicy } from "@/data/legal";

export const metadata: Metadata = {
  title: cookiePolicy.title,
  description: cookiePolicy.intro,
};

export default function Page() {
  return <LegalPage page={cookiePolicy} />;
}
