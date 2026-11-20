import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

/** 404 en français, avec la navigation du site (au lieu de la page anglaise par défaut). */
export default function NotFound() {
  return (
    <>
      <Header solid />
      <main id="contenu" className="page-main">
        <section className="border-b border-line bg-white pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="container-site">
            <p className="mono text-sm text-muted">Erreur 404</p>
            <h1 className="mt-5 max-w-3xl text-[2.4rem] leading-[1.04] font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Page introuvable
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              La page demandée n’existe pas ou a été déplacée. Voici quelques pistes pour continuer.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link className="btn" href="/">
                Retour à l’accueil
              </Link>
              <Link href="/services" className="underline-offset-4 hover:underline">
                Nos services
              </Link>
              <Link href="/contact" className="underline-offset-4 hover:underline">
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
