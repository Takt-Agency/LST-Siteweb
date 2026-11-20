import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CallButton } from "@/components/layout/CallButton";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Hero } from "@/components/landing/hero/Hero";
import { Journey } from "@/components/landing/journey/Journey";
import { ServicesBand } from "@/components/landing/ServicesBand";
import { Consulting } from "@/components/landing/Consulting";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Testimonials } from "@/components/home/extra/Testimonials";
import { Partners } from "@/components/home/extra/Partners";
import { HomeNews } from "@/components/home/extra/HomeNews";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/data/site";
import { organizationLd, websiteLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "LST Express | Transport, logistique et transit à Nabeul, Tunisie" },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />
      <Header />
      <main className="home">
        <Hero />
        <Journey />
        <ServicesBand />
        <Consulting />
        {/* Masquées tant que src/data/flags.ts ne les active pas (contenus réels requis). */}
        <Testimonials />
        <Partners />
        <HomeNews />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <CallButton />
      <ScrollProgress />
    </>
  );
}
