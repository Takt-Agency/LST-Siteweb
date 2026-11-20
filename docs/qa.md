# QA — refonte scrollytelling de l'accueil

État au 20/11/2026, branche `feat/scrollytelling-realiste`. Les mesures sont faites en local, sur un
build de production (`next build` + `next start`).

## Lighthouse (profil mobile, throttling simulé par défaut)

| Page | Performance | Accessibilité | Bonnes pratiques | SEO |
| --- | --- | --- | --- | --- |
| `/` (3 passages) | 80 · 82 · 72 | 100 | 100 | 100 |
| `/a-propos` (référence, page simple) | 79 | — | — | — |

- CLS : 0,02 (objectif < 0,1). TBT : 180–620 ms selon le passage.
- LCP simulé : environ 4 s. Le LCP réellement observé est de **0,62 s** : c'est le `<h1>`, rendu côté
  serveur et peint au premier affichage. L'écart vient du modèle de simulation de Lighthouse, qui
  impute au LCP le travail CPU du chargement.
- Avec un throttling réellement appliqué (`--throttling-method=devtools`), le score est plus bas. Le
  coût restant est surtout l'hydratation React d'une page longue et le rendu natif. En headless, ce
  rendu est logiciel : une page intérieure simple y coûte déjà environ 2,6 s ×4.

### Optimisations faites (phase 6)

- Mobile : le globe est une **image pré-calculée** (`public/images/hero-globe-mobile.webp`, 41 Ko).
  Aucun WebGL ni three.js au chargement. Le globe WebGL n'est monté qu'après l'hydratation, sur desktop.
- Le mode d'animation (`motion-on` ou statique) est choisi par un script inline dans `<head>`, avant la
  première peinture. On évite ainsi de recalculer le style et le layout de 28 000 px à l'hydratation.
- La timeline du parcours n'est construite qu'à l'approche de la section (IntersectionObserver).
- Les séquences d'images et l'océan WebGL sont chargés seulement un peu avant leur scène.
- Polices : l'italique d'Inter n'est plus chargé ; JetBrains Mono n'est plus préchargée.
- Le pulse du marqueur du footer est animé en `transform` et `opacity` (compositeur, sans repeindre).
- Les liens vers l'accueil (fil d'Ariane, logo, ancres du footer) ne déclenchent plus de prefetch.
  Celui-ci préchargeait inutilement la CSS du parcours sur les pages intérieures.

## Accessibilité

- `prefers-reduced-motion` : pas de Lenis, pas de scène collante ni de pin. Le parcours s'affiche en
  scènes empilées avec des images fixes, et le hero n'est pas épinglé.
- Sans JavaScript : même version statique, avec tous les textes présents.
- Textes du parcours : toujours dans l'arbre d'accessibilité. Seul le décor d'une scène inactive est
  masqué. Les liens restent focalisables, et **le focus clavier amène le défilement sur la scène**
  (testé : focus sur la 5ᵉ carte services → défilement jusqu'à la scène, carte visible).
- Les canvas et visuels décoratifs sont en `aria-hidden`.
- Contrastes AA corrigés : sur-titres `.kick`, compteurs « / 06 », état atténué du titre Consulting
  (40 % au lieu de 30 %, pour respecter le contraste AA des grands textes).
- Ordre des titres : les titres de colonnes du footer passent de `h4` à `h2` (le style est inchangé).

## Navigateurs et appareils

| Environnement | Statut |
| --- | --- |
| Chrome 1440×900 et 390×844 (headless) | ✅ Testé : scènes, console, reduced-motion, clavier |
| Edge (Chromium) | ✅ Testé : parcours complet, aucune erreur console |
| Firefox | ⚠️ Non testé (non installé sur la machine de développement) |
| Safari macOS, iOS Safari (AVIF + alpha) | ⚠️ À tester sur appareil réel |
| Android (Chrome) | ⚠️ À tester sur appareil réel |
| Trackpad, molette, tactile | ⚠️ À valider à la main |

Toutes les pages ont été vérifiées sans erreur ni avertissement console : `/`, `/services`,
`/services/fret-maritime`, `/contact`, `/devis`, `/a-propos`, `/consulting`, `/actualites`,
`/mentions-legales`, `/confidentialite`.

## Points connus

- Les séquences actuelles sont des **placeholders**. Le rendu photoréaliste demande les modèles 3D
  et un rendu Blender (voir `docs/assets.md`).
- Les pages d'articles (`/actualites/[slug]`) renvoient 404 tant que `site.newsEnabled` vaut `false`
  dans `src/data/site.ts`. Ce réglage est antérieur à la refonte.
