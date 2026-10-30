import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getService, transportServices } from "@/data/services";

/** Prerender every service page (consulting has its own route, /consulting). */
export function generateStaticParams() {
  return transportServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service || slug === "consulting") return {};
  return { title: service.title, description: service.promise };
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
    <ServiceDetail
      service={service}
      crumbs={[{ label: "Accueil", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]}
    />
  );
}
