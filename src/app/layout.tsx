import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { site } from "@/data/site";
import "./globals.css";

// Font Awesome's CSS is imported above, so don't inject it again at runtime (no icon flash on SSR).
config.autoAddCss = false;

/** Inter — site typeface (variable font, self-hosted by next/font at build time). */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.signature}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    images: [{ url: "/images/lst-hero-logistique.png", width: 1672, height: 941 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F3F5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body>
          before hydration; ignore those attribute mismatches on this element only. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
