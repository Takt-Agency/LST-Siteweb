/**
 * About page content (/a-propos) — spec §01 (LST = Logistique, Service, Transport),
 * §1.3 (positioning, signature), §03 (présentation, histoire, mission, vision,
 * valeurs, engagements, équipe si applicable), §05-07 (trust arguments).
 *
 * Mission, vision and values are drafted from the positioning and must be
 * validated by LST Express. History, commitments and team are left empty on
 * purpose: their sections stay hidden until LST supplies real content.
 */

export const aboutPage = {
  eyebrow: "À propos",
  title: "Un partenaire qui relie transport, logistique et conseil",
  intro:
    "LST Express accompagne les entreprises avec des solutions de transport, de logistique et de consulting, en Afrique et à l'international.",

  banner: {
    src: "/images/lst-a-propos.webp",
    alt: "LST Express — Logistique, Service, Transport : porte-conteneurs, avion cargo, camion et entrepôt sous une carte du monde",
    position: "center",
  },

  presentation: {
    eyebrow: "Qui sommes-nous",
    statement: "Un partenaire professionnel réunissant transport, logistique et conseil pour aider les entreprises à mieux organiser leurs opérations.",
    text: "Importateurs, exportateurs, entreprises industrielles et commerciales, responsables supply chain ou dirigeants : LST Express structure une offre claire pour faire circuler vos marchandises et optimiser vos flux.",
  },

  /** The meaning of the name (spec §01). */
  letters: [
    { letter: "L", word: "Logistique", text: "Organiser, coordonner et optimiser les flux de marchandises." },
    { letter: "S", word: "Service", text: "Un accompagnement attentif, du premier échange au suivi des opérations." },
    { letter: "T", word: "Transport", text: "Des solutions routières, maritimes et aériennes adaptées à chaque besoin." },
  ],

  mission: {
    label: "Notre mission",
    text: "Aider les entreprises à mieux organiser leurs opérations en réunissant transport, logistique et conseil.",
  },
  vision: {
    label: "Notre vision",
    text: "Connecter les marchés et optimiser les opérations de nos clients, en Afrique et à l'international.",
  },

  values: {
    eyebrow: "Nos valeurs",
    title: "Ce qui guide notre façon de travailler",
    items: [
      { title: "Accompagnement", text: "Être présent à chaque étape et rester un interlocuteur disponible." },
      { title: "Solutions adaptées", text: "Construire chaque organisation selon le volume, l'urgence et le budget." },
      { title: "Réactivité", text: "Répondre rapidement, pour les besoins réguliers comme pour les urgences." },
      { title: "Expertise", text: "Mettre la connaissance du transport et de la logistique au service des décisions." },
      { title: "Vision globale", text: "Penser transport, logistique et conseil ensemble, pour des flux cohérents." },
    ],
  },

  /** Company history — milestones supplied by LST only. Hidden while empty. */
  history: {
    eyebrow: "Notre histoire",
    title: "Les étapes de notre développement",
    items: [] as { year: string; title: string; text: string }[],
  },

  /** Commitments — supplied by LST only. Hidden while empty. */
  commitments: {
    eyebrow: "Nos engagements",
    title: "Nos engagements envers nos clients",
    items: [] as { title: string; text: string }[],
  },

  /** Team — only if LST wishes to present it ("si applicable"). Hidden while empty. */
  team: {
    eyebrow: "L'équipe",
    title: "Les personnes qui vous accompagnent",
    members: [] as { name: string; role: string }[],
  },
};
