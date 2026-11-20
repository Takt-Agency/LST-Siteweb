"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, type NavEntry } from "@/data/landing";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { useJourneyPassed } from "./useJourneyBottom";
import "./header.css";

const afterJourney = () => 80;

/** Vrai dès que la page a défilé de quelques pixels. */
function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);
  return scrolled;
}

/** Lien actif : la page elle-même ou l'une de ses sous-pages (ex. /services/fret-aerien). */
const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Barre de navigation fixe, toujours lisible :
 * - en haut de l'accueil, transparente sur le visuel ;
 * - dès le premier défilement, effet verre (fond sombre translucide + flou) au-dessus du parcours animé ;
 * - après le parcours et sur les pages intérieures (`solid`), opaque.
 * Sous 820 px, les liens passent dans un menu.
 */
export function Header({ solid: alwaysSolid = false }: { solid?: boolean }) {
  const passed = useJourneyPassed(afterJourney);
  const scrolled = useScrolled();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const solid = alwaysSolid || passed || open;
  const state = solid ? "bar solid" : scrolled ? "bar glass" : "bar";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={state}>
      <div className="bar-in">
        <Link className="brand" href="/" prefetch={false} aria-label="LST Express, accueil" onClick={close}>
          <Image
            className="logo"
            src="/brand/lst-express-logo.png"
            width={859}
            height={174}
            alt="LST Express"
            loading="eager"
            fetchPriority="high"
          />
        </Link>
        <nav aria-label="Navigation principale">
          {nav.map((item) =>
            item.children ? (
              <Dropdown key={item.href} item={item} active={isActive(pathname, item.href)} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(pathname, item.href) ? "nav-link active" : "nav-link"}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <Link className="btn bar-cta" href="/devis" onClick={close}>
          <span>Demander un devis</span>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>
      <nav id="menu-mobile" className={open ? "mnav open" : "mnav"} aria-label="Menu mobile" hidden={!open}>
        {nav.map((item) => (
          <div key={item.href} className="mnav-item">
            <Link
              href={item.href}
              onClick={close}
              className={isActive(pathname, item.href) ? "active" : undefined}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
            {item.children && (
              <ul className="mnav-sub">
                {item.children.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      onClick={close}
                      className={pathname === c.href ? "active" : undefined}
                      aria-current={pathname === c.href ? "page" : undefined}
                    >
                      <ServiceIcon name={c.icon} />
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}

/** Entrée avec sous-menu : s'ouvre au survol, au clavier (flèche) ou au focus, se ferme avec Échap. */
function Dropdown({ item, active }: { item: NavEntry; active: boolean }) {
  const [open, setOpen] = useState(false);
  const id = `sous-menu-${item.label.toLowerCase()}`;

  return (
    <div
      className={["dd", open && "open", active && "active"].filter(Boolean).join(" ")}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          (e.currentTarget.querySelector(".dd-toggle") as HTMLElement | null)?.focus();
        }
      }}
    >
      <Link
        href={item.href}
        className="dd-link"
        aria-current={active ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {item.label}
      </Link>
      <button
        type="button"
        className="dd-toggle"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Afficher les ${item.label.toLowerCase()}`}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="dd-panel" id={id}>
        <ul>
          {item.children?.map((c) => (
            <li key={c.href}>
              <Link href={c.href} onClick={() => setOpen(false)}>
                <span className="dd-ico">
                  <ServiceIcon name={c.icon} />
                </span>
                <span>
                  <b>{c.label}</b>
                  <small>{c.description}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={item.href} className="dd-all" onClick={() => setOpen(false)}>
          Voir tous les services →
        </Link>
      </div>
    </div>
  );
}
