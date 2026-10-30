import { ConsultingSignature } from "@/components/home/ConsultingSignature";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { KeyFigures } from "@/components/home/KeyFigures";
import { Method } from "@/components/home/Method";
import { Positioning } from "@/components/home/Positioning";
import { Sectors } from "@/components/home/Sectors";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { ServicesTicker } from "@/components/home/ServicesTicker";
import { WhyLst } from "@/components/home/WhyLst";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesTicker />
      <Positioning />
      <ServicesOverview />
      <ConsultingSignature />
      <Method />
      <Sectors />
      <WhyLst />
      <KeyFigures />
      <FinalCta />
    </>
  );
}
