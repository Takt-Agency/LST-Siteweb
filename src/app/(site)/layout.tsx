import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar, NavbarWithPathname } from "@/components/layout/Navbar";
import { Topbar } from "@/components/layout/Topbar";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Topbar />
      <Suspense fallback={<Navbar pathname={null} />}>
        <NavbarWithPathname />
      </Suspense>
      <main id="contenu" data-page-root tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
