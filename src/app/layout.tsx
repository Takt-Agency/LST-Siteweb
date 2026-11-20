import type { Metadata, Viewport } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { site } from "@/data/site";
import { fontVariables } from "./fonts";
import { Providers } from "./providers";
import "./globals.css";

// La CSS de Font Awesome est importée ci-dessus : ne pas l'injecter une seconde fois au chargement.
config.autoAddCss = false;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: "Transport, logistique et consulting pour les entreprises, en Afrique et à l’international.",
  openGraph: { type: "website", locale: "fr_FR", siteName: site.name },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0e1012",
};

const MOTION_SCRIPT =
  "try{document.documentElement.classList.add(matchMedia('(prefers-reduced-motion: reduce)').matches?'motion-off':'motion-on')}catch(e){}";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning : le script ci-dessous ajoute une classe à <html> avant l'hydratation.
    <html lang="fr" className={`${fontVariables} antialiased`} suppressHydrationWarning>
      <head>
        {/* Mode d'animation choisi avant la première peinture (pas de relayout à l'hydratation) :
            « motion-on » = scènes animées ; sans JavaScript ou en reduced-motion → version statique. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
      </head>
      {/* Des extensions (ex. ColorZilla) ajoutent des attributs à <body> avant l'hydratation. */}
      <body suppressHydrationWarning>
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
