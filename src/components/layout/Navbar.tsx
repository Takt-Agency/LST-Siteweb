"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBars,
  faChevronDown,
  faClock,
  faEnvelope,
  faPhone,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { contact, languages, mainNav } from "@/data/site";
import { isActive } from "@/lib/nav";
import { cn, telHref } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { SoonBadge } from "@/components/ui/SoonBadge";

/** Reads the pathname (may suspend under cacheComponents) — wrap in <Suspense>. */
export function NavbarWithPathname() {
  return <Navbar pathname={usePathname()} />;
}

/** Closes a popover on outside click / Escape, and when the route is hidden by <Activity>. */
function useDismiss(open: boolean, setOpen: (v: boolean) => void) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => () => setOpen(false), [setOpen]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);
  return ref;
}

/** White main navigation bar; sticks to the top once the topbar has scrolled away. */
export function Navbar({ pathname }: { pathname: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Stable callback: the drawer effects depend on it and must not re-run on every navbar render.
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 44);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href="#contenu"
        className="sr-only rounded-md bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70]"
      >
        Aller au contenu
      </a>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-line transition-colors duration-300",
          scrolled ? "bg-white/90 backdrop-blur-md" : "bg-white",
        )}
      >
        <div className="container-site flex h-16 items-center gap-6 lg:h-20">
          <Logo className="w-32 shrink-0 lg:w-36" onNavigate={closeMenu} />

          <nav aria-label="Navigation principale" className="mx-auto hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-3">
              {mainNav.map((item) => (
                <li key={item.href}>
                  {item.children ? (
                    <ServicesDropdown pathname={pathname} />
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className={navLinkClass(isActive(pathname, item.href))}
                    >
                      {item.label}
                      {item.soon && <SoonBadge />}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:gap-4">
            <LanguageSelect className="hidden sm:block lg:hidden min-[90rem]:block" />
            <Link
              href="/devis"
              className="group hidden h-11 items-center gap-2.5 rounded-md bg-ink px-5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-ink-soft md:inline-flex"
            >
              <span className="lg:hidden xl:inline">Demander un devis</span>
              <span className="hidden lg:inline xl:hidden">Devis</span>
              <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs text-brand-yellow transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              aria-label="Ouvrir le menu"
              className="grid size-11 place-items-center rounded-md border border-line text-ink transition-colors hover:border-ink lg:hidden"
            >
              <FontAwesomeIcon icon={faBars} aria-hidden className="text-base" />
            </button>
          </div>
        </div>
      </header>
      {/* Keyed on open state so the drawer (e.g. the services sub-menu) starts fresh each time */}
      <MobileDrawer key={menuOpen ? "open" : "closed"} open={menuOpen} onClose={closeMenu} pathname={pathname} />
    </>
  );
}

function navLinkClass(active: boolean) {
  return cn(
    "relative inline-flex h-20 items-center gap-1.5 px-2.5 text-[0.95rem] whitespace-nowrap transition-colors xl:px-3",
    "after:absolute after:bottom-5 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-brand-yellow after:transition-opacity",
    active ? "font-medium text-ink after:opacity-100" : "text-ink/65 after:opacity-0 hover:text-ink",
  );
}

function ServicesDropdown({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, setOpen);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();
  const item = mainNav.find((i) => i.children)!;

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => {
        if (timer.current) clearTimeout(timer.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        timer.current = setTimeout(() => setOpen(false), 150);
      }}
      onBlur={(e) => !ref.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={navLinkClass(isActive(pathname, item.href) || open)}
      >
        {item.label}
        <FontAwesomeIcon icon={faChevronDown} aria-hidden className={cn("text-[0.6rem] transition-transform", open && "rotate-180")} />
      </button>
      <div id={panelId} hidden={!open} className="absolute top-[calc(100%-0.75rem)] left-0 w-80 overflow-hidden rounded-lg border border-line bg-white shadow-[0_20px_40px_-24px_rgb(22_22_22/0.3)]">
        <ul className="py-2">
          {item.children!.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onNavigate={() => setOpen(false)}
                aria-current={pathname === child.href ? "page" : undefined}
                className="group flex items-center gap-3 px-4 py-2.5 text-[0.95rem] transition-colors hover:bg-paper aria-[current=page]:bg-paper"
              >
                {child.icon && (
                  <span className="grid size-8 shrink-0 place-items-center text-muted transition-colors group-hover:text-ink">
                    <Icon name={child.icon} className="text-sm" />
                  </span>
                )}
                <span className="flex-1">{child.label}</span>
                <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={item.href}
          onNavigate={() => setOpen(false)}
          className="flex items-center justify-between border-t border-line px-4 py-3 text-sm font-medium hover:bg-paper"
        >
          Voir tous les services
          <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs" />
        </Link>
      </div>
    </div>
  );
}

/** Language selector — French only for now; EN/AR planned for phase 2 (spec §15). */
function LanguageSelect({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, setOpen);
  const listId = useId();
  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Langue : Français"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-11 items-center gap-1.5 px-1 text-sm text-ink/65 transition-colors hover:text-ink"
      >
        FR
        <FontAwesomeIcon icon={faChevronDown} aria-hidden className={cn("text-[0.6rem] transition-transform", open && "rotate-180")} />
      </button>
      <ul id={listId} hidden={!open} className="absolute top-full right-0 mt-2 w-44 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-[0_20px_40px_-24px_rgb(22_22_22/0.3)]">
        {languages.map((l) => (
          <li key={l.code}>
            <button
              type="button"
              disabled={!l.available}
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-paper disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent"
            >
              {l.label}
              {!l.available && <span className="text-xs">Bientôt</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileDrawer({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string | null }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const page = document.querySelectorAll<HTMLElement>("[data-page-root]");
    page.forEach((el) => (el.inert = true));
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      page.forEach((el) => (el.inert = false));
      document.documentElement.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && onClose();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [onClose]);

  return (
    <div hidden={!open} className="fixed inset-0 z-[60] lg:hidden">
      <div aria-hidden className="absolute inset-0 bg-ink/60" onClick={onClose} />
      <div
        id="menu-mobile"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Logo className="w-32" onNavigate={onClose} />
          <button type="button" onClick={onClose} aria-label="Fermer le menu" className="grid size-11 place-items-center rounded-md border border-line">
            <FontAwesomeIcon icon={faXmark} aria-hidden className="text-lg" />
          </button>
        </div>
        <nav aria-label="Navigation mobile" className="px-5 py-4">
          <ul className="divide-y divide-line">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              const cls = cn(
                "flex min-h-14 w-full items-center justify-between text-left text-lg",
                active ? "font-medium text-ink" : "text-ink/70",
              );
              return (
                <li key={item.href}>
                  {item.children ? (
                    <>
                      <button type="button" aria-expanded={servicesOpen} aria-controls="mm-services" onClick={() => setServicesOpen((o) => !o)} className={cls}>
                        {item.label}
                        <FontAwesomeIcon icon={faChevronDown} aria-hidden className={cn("text-sm transition-transform", servicesOpen && "rotate-180")} />
                      </button>
                      <ul id="mm-services" hidden={!servicesOpen} className="pb-3">
                        {[...item.children, { label: "Tous les services", href: item.href }].map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} onNavigate={onClose} className="flex min-h-11 items-center gap-3 pl-3 text-[0.95rem] text-muted hover:text-ink">
                              <span aria-hidden className="size-1 bg-brand-yellow" />
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link href={item.href} onNavigate={onClose} aria-current={active ? "page" : undefined} className={cls}>
                      <span className="flex items-center gap-2">
                        {item.label}
                        {item.soon && <SoonBadge />}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto grid gap-4 border-t border-line px-5 py-6 text-sm">
          <Link href="/devis" onNavigate={onClose} className="inline-flex h-12 items-center justify-center rounded-md bg-ink font-medium text-white">
            Demander un devis
          </Link>
          <ContactRow icon={<FontAwesomeIcon icon={faPhone} className="text-sm" />} value={contact.phone} href={contact.phone ? telHref(contact.phone) : undefined} fallback="Téléphone à confirmer" />
          <ContactRow icon={<FontAwesomeIcon icon={faEnvelope} className="text-sm" />} value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} fallback="E-mail à confirmer" />
          <ContactRow icon={<FontAwesomeIcon icon={faClock} className="text-sm" />} value={contact.openingHours} fallback="Horaires à confirmer" />
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, value, href, fallback }: { icon: ReactNode; value: string | null; href?: string; fallback: string }) {
  return (
    <p className="flex items-center gap-3">
      <span aria-hidden className="text-muted">
        {icon}
      </span>
      {value ? (
        href ? (
          <a href={href} className="hover:underline">
            {value}
          </a>
        ) : (
          value
        )
      ) : (
        <span className="text-muted italic">{fallback}</span>
      )}
    </p>
  );
}
