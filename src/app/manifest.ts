import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/** Manifeste web (/manifest.webmanifest) : nom, couleurs et icônes à l'ajout sur l'écran d'accueil. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "LST Express",
    description: site.description,
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#0e1012",
    theme_color: "#0e1012",
    icons: [
      { src: "/icon.png", type: "image/png", sizes: "288x288" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
