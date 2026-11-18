import type { Metadata } from "next";
import { FinalCta } from "@/components/home/FinalCta";
import { ServicesMethod } from "@/components/home/ServicesMethod";
import { ServicesCatalog } from "@/components/services/ServicesCatalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { serviceCategories, serviceHref, services, servicesPage } from "@/data/services";

export const metadata: Metadata = {
  title: "Nos services",
  description: servicesPage.intro,
};

export default function ServicesPage() {
  const rows = services.map((s) => ({
    slug: s.slug,
    href: serviceHref(s.slug),
    icon: s.icon,
    title: s.title,
    summary: s.summary,
    category: s.category,
  }));

  return (
    <>
      <PageHeader crumbs={[{ label: "Accueil", href: "/" }, { label: "Services" }]} eyebrow={servicesPage.eyebrow} title={servicesPage.title}>
        <p>{servicesPage.intro}</p>
      </PageHeader>
      <section aria-label="Liste des services" className="bg-white py-14 lg:py-20">
        <div className="container-site">
          <ServicesCatalog items={rows} categories={serviceCategories} />
        </div>
      </section>
      <div className="border-t border-line">
        <ServicesMethod />
      </div>
      <FinalCta />
    </>
  );
}
