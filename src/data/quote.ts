import type { NeedType, ShipmentType } from "@/types";

/** Quote request page (/devis) — fields from the specification §7.1. */
export const quotePage = {
  eyebrow: "Demande de devis",
  title: "Décrivez votre besoin",
  intro: "Trois étapes pour nous transmettre les informations utiles. L'équipe commerciale revient vers vous avec une proposition adaptée.",
  aside: {
    title: "Comment ça se passe ?",
    steps: [
      "Vous décrivez votre besoin en quelques minutes.",
      "L'équipe étudie votre demande et vous recontacte si besoin de précisions.",
      "Vous recevez une proposition adaptée à vos opérations.",
    ],
  },
};

export const needOptions: { value: NeedType; label: string }[] = [
  { value: "transport-terrestre", label: "Transport terrestre" },
  { value: "fret-maritime", label: "Fret maritime" },
  { value: "fret-aerien", label: "Fret aérien" },
  { value: "solutions-logistiques", label: "Solutions logistiques" },
  { value: "transit-douane", label: "Transit & douane" },
  { value: "consulting", label: "Consulting" },
  { value: "autre", label: "Autre" },
];

export const shipmentOptions: { value: ShipmentType; label: string }[] = [
  { value: "import", label: "Import" },
  { value: "export", label: "Export" },
  { value: "national", label: "National" },
  { value: "international", label: "International" },
  { value: "non-applicable", label: "Non applicable" },
];
