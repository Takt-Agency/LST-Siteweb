import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CallButton } from "@/components/layout/CallButton";
import { MotionProvider } from "@/components/motion/MotionProvider";

/** Pages intérieures : en-tête opaque, contenu sous la barre fixe, pied de page commun. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <MotionProvider>
      <Header solid />
      <main id="contenu" className="page-main">
        {children}
      </main>
      <Footer />
      <CallButton always />
    </MotionProvider>
  );
}
