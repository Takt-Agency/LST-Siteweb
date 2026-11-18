import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { site } from "@/data/site";
import "./globals.css";

// La CSS de Font Awesome est importée ci-dessus : ne pas l'injecter une seconde fois au chargement.
config.autoAddCss = false;

/** Inter (police variable, auto-hébergée par next/font au moment du build). */
const inter = Inter({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html lang="fr" className={`${inter.variable} antialiased`}>
      {/* Des extensions (ex. ColorZilla) ajoutent des attributs à <body> avant l'hydratation. */}
      <body suppressHydrationWarning>
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
