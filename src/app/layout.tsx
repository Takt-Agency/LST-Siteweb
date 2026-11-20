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
  description: site.description,
  // Image de partage : src/app/opengraph-image.jpg et twitter-image.jpg (conventions de fichiers Next).
  openGraph: { type: "website", locale: "fr_FR", siteName: site.name },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0e1012",
};

/*
 * Exécuté pendant l'analyse du <head>, avant l'hydratation :
 * 1. retire les commentaires HTML (et les blancs) du <head> : un hébergeur peut en injecter un (Netlify ajoute
 *    « This site is hosted on Netlify… » juste après <meta charset>). React ne l'attend pas, l'hydratation
 *    échoue (erreur #418), toute la page est re-rendue côté client et la classe ci-dessous est perdue ;
 * 2. choisit le mode d'animation (classe sur <html>).
 */
const MOTION_SCRIPT =
  "try{var h=document.head,n=h.firstChild,x;while(n){x=n.nextSibling;if(n.nodeType===8||(n.nodeType===3&&!n.data.trim()))h.removeChild(n);n=x}}catch(e){}" +
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
