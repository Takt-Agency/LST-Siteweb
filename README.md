# LST-Siteweb

Site vitrine LST Express (Next.js, React, TypeScript). Frontend uniquement : le formulaire de devis est une démonstration, rien n'est envoyé.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Organisation

- `src/app/page.tsx` : la page d'accueil, assemblée à partir des composants.
- `src/app/globals.css` : la feuille de style du site.
- `src/data/site.ts` : tous les textes et coordonnées (services, FAQ, contact…).
- `src/components/`
  - `layout/` : en-tête, pied de page, bouton d'appel flottant.
  - `journey/` : le parcours animé au défilement (avion, camion, bateau).
  - `services/` : les cartes de services empilées.
  - `home/` : bandeau, consulting, à propos, méthode, FAQ.
  - `quote/` : la section et le formulaire de devis en 3 étapes.
- `public/brand/` : logos officiels et flèche LST.
