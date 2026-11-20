import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";

/** /robots.txt : tout le site est explorable ; renvoie vers le plan du site. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absUrl("/sitemap.xml"),
  };
}
