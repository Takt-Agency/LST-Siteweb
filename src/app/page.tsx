import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CallButton } from "@/components/layout/CallButton";
import { Journey } from "@/components/landing/journey/Journey";
import { Services } from "@/components/landing/services/Services";
import { ServicesBand } from "@/components/landing/ServicesBand";
import { Consulting } from "@/components/landing/Consulting";
import { About } from "@/components/landing/About";
import { Method } from "@/components/landing/Method";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Header />
      <main className="home">
        <Journey />
        <Services />
        <ServicesBand />
        <Consulting />
        <About />
        <Method />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <CallButton />
    </>
  );
}
