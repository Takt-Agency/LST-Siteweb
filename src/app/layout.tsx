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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${fontVariables} antialiased`}>
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
