import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CallButton } from "@/components/layout/CallButton";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Hero } from "@/components/landing/hero/Hero";
import { Journey } from "@/components/landing/journey/Journey";
import { Services } from "@/components/landing/services/Services";
import { ServicesBand } from "@/components/landing/ServicesBand";
import { Consulting } from "@/components/landing/Consulting";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Testimonials } from "@/components/home/extra/Testimonials";
import { Partners } from "@/components/home/extra/Partners";
import { HomeNews } from "@/components/home/extra/HomeNews";

export default function Home() {
  return (
    <>
      <Header />
      <main className="home">
        <Hero />
        <Journey />
        <Services />
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
