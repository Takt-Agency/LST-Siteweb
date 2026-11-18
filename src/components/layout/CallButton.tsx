"use client";

import { contact } from "@/data/landing";
import { LineIcon } from "@/components/landing/LineIcon";
import { useJourneyPassed } from "./useJourneyBottom";

const halfViewport = (vh: number) => vh * 0.5;

/** Bouton d'appel flottant : affiché après le parcours animé sur l'accueil, toujours ailleurs (`always`). */
export function CallButton({ always = false }: { always?: boolean }) {
  const passed = useJourneyPassed(halfViewport);
  const show = always || passed;

  return (
    <a
      className={show ? "wa show" : "wa"}
      id="wa"
      href={contact.phoneHref}
      aria-label={`Appeler LST Express au ${contact.phone}`}
    >
      <LineIcon name="phone" stroke="#161616" />
    </a>
  );
}
