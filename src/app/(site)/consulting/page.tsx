import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ConsultingApproach,
  ConsultingAreas,
  ConsultingAudiences,
  ConsultingBenefits,
  ConsultingCta,
  ConsultingFaq,
  ConsultingHero,
} from "@/components/consulting/ConsultingSections";
import { getService } from "@/data/services";

const consulting = getService("consulting");

export const metadata: Metadata = {
  title: "Consulting",
  description: consulting?.promise,
};

/** Dedicated consulting page (spec §06: distinctive treatment, 4-step approach, "Demander un diagnostic"). */
export default function ConsultingPage() {
  if (!consulting) notFound();
  return (
    <>
      <ConsultingHero service={consulting} />
      <ConsultingAudiences />
      <ConsultingAreas />
      <ConsultingApproach steps={consulting.steps ?? []} />
      <ConsultingBenefits benefits={consulting.benefits} />
      <ConsultingFaq />
      <ConsultingCta />
    </>
  );
}
