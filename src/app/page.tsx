import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CallButton } from "@/components/layout/CallButton";
import { Hero } from "@/components/landing/hero/Hero";
import { Journey } from "@/components/landing/journey/Journey";
import { Services } from "@/components/landing/services/Services";
import { ServicesBand } from "@/components/landing/ServicesBand";
import { Consulting } from "@/components/landing/Consulting";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/home/FinalCta";

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
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <CallButton />
    </>
  );
}
