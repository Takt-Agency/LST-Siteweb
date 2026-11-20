import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ServiceDetailView } from "@/components/services/ServiceDetailView";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { JsonLd } from "@/components/seo/JsonLd";
import { getService, transportServices } from "@/data/services";
import { absUrl, metaDescription, ORG_ID } from "@/lib/seo";

/** Prerender every service page (consulting has its own route, /consulting). */
export function generateStaticParams() {
  return transportServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service || slug === "consulting") return {};
  return {
    title: service.title,
    description: metaDescription(service.description),
    alternates: { canonical: `/services/${slug}` },
  };
}

/** Params are read inside <Suspense> so client navigations get an instant shell. */
export default function ServicePage({ params }: PageProps<"/services/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ServiceContent params={params} />
    </Suspense>
  );
}

async function ServiceContent({ params }: { params: PageProps<"/services/[slug]">["params"] }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service || slug === "consulting") notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          serviceType: service.title,
          description: service.description,
          url: absUrl(`/services/${slug}`),
          provider: { "@id": ORG_ID },
          areaServed: ["Tunisie", "Afrique", "International"],
        }}
      />
      <ServiceDetailView
        service={service}
        crumbs={[{ label: "Accueil", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]}
      />
    </>
  );
}
