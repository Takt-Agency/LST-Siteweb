# LST-Siteweb

Site web de **LST Express** — Logistique · Service · Transport ([lstexpress.tn](https://lstexpress.tn)).
Développé par [Takt Agency](https://takt-agency.net/).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, Cache Components) · React 19 · TypeScript strict
- Tailwind CSS 4 · police Inter (`next/font`)
- Font Awesome (icônes) · Motion (animations) · Swiper (carrousel des services)

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
```

Autres commandes :

```bash
npm run build    # build de production
npm run start    # sert le build
npm run lint
```

## Organisation

| Dossier | Contenu |
|---|---|
| `src/app/(site)/` | Pages publiques : accueil, services, consulting, à propos, actualités, contact, devis, pages légales |
| `src/components/` | Composants (layout, accueil, services, formulaires, UI) |
| `src/data/` | **Contenus du site** (textes, coordonnées, services, articles…) — à modifier ici |
| `src/lib/` | Utilitaires, validation des formulaires, simulation d'envoi |
| `public/` | Logos, images et visuels des services |

## À savoir

- **Frontend uniquement** : les formulaires (contact, devis) sont validés côté navigateur mais **l'envoi est simulé** (`src/lib/simulate.ts`). Aucun e-mail n'est envoyé et rien n'est enregistré tant qu'un backend n'est pas branché.
- **Actualités** : le blog est masqué (« Bientôt »). Pour l'ouvrir, passer `newsEnabled` à `true` dans `src/data/site.ts`.
- **Informations à compléter par LST** : adresse et lien Google Maps, mentions légales (forme juridique, RNE, matricule fiscal…), secteurs d'activité, chiffres clés, histoire et équipe. Les valeurs manquantes s'affichent « à confirmer » / « à compléter » ou leurs sections restent masquées.
