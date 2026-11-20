# Assets réalistes : séquences d'images 3D

Les véhicules de l'accueil (camion, grue, navire, avion) ne sont pas de la 3D temps réel. Ce sont des
**rendus 3D pré-calculés**, exportés en séquences d'images à fond transparent, que le site dessine dans
un `<canvas>` en fonction du défilement (`src/components/scroll/FrameSequence.tsx`).

```
assets-src/models/*.glb ──Blender──▶ assets-src/renders/<séquence>/frame_000.png … ──encode──▶ public/sequences/<séquence>/{desktop,mobile}/frame_000.{avif,webp}
                                                                                              └▶ src/data/sequences.json (manifeste lu par le site)
```

`assets-src/models/` et `assets-src/renders/` ne sont **pas versionnés** (modèles sous licence, fichiers lourds).
Seuls les fichiers encodés de `public/sequences/` et le manifeste le sont.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run assets:placeholders` | Silhouettes simples (sans Blender) dans `assets-src/renders/`. Sert à faire tourner le site en attendant les vrais rendus. |
| `npm run assets:render` | Rendus Blender réalistes. Nécessite `blender` (4.x) dans le PATH et les modèles. |
| `npm run assets:encode` | PNG → AVIF + WebP, desktop et mobile, avec le manifeste. Échoue si un budget est dépassé. |

Options utiles :

```bash
# une séquence et une livrée, en aperçu rapide (50 %, 32 échantillons)
npm run assets:render -- --only truck-rotate --variant yellow --preview
# rendu final d'une séquence
npm run assets:render -- --only reachstacker-load --samples 256
# réencoder une séquence seulement
node scripts/encode-frames.mjs --only=truck-rotate-yellow
```

Sous Windows, si `blender` n'est pas dans le PATH :

```powershell
& "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe" -b -P scripts/blender/render_sequences.py -- --preview
```

## Séquences

Toutes les séquences sont décrites dans `scripts/sequences.config.json`, qui est lu par Blender, par le
générateur de placeholders et par l'encodeur.

| Séquence | Frames | Cadre | Contenu |
| --- | --- | --- | --- |
| `truck-side-<livrée>` | 1 | 1920×1080 | Camion de côté, roues masquées, conteneur LST chargé. Écrit aussi `wheels.json` (position et diamètre des roues en % du cadre). |
| `wheel` | 1 | 256×256 | Une roue vue de côté, centrée. Elle tourne en CSS (`RotatingWheel`). |
| `truck-rotate-<livrée>` | 60 | 1920×1080 | Caméra orthographique qui passe de la vue de côté (frame 0 = `truck-side`) à la vue du dessus (dernière frame = `truck-top`). |
| `truck-top-<livrée>` | 1 | 1920×1080 | Vue du dessus, même cadrage que la dernière frame de `truck-rotate`. |
| `reachstacker-load-<livrée>` | 72 | 1920×1080 | La grue soulève le conteneur LST et le pose sur la remorque (vue 3/4, longue focale). |
| `ship-top` | 1 | 2400×600 | Porte-conteneurs vu du dessus, proue vers la droite. |
| `plane-top` | 1 | 1600×1600 | Avion cargo vu du dessus, nez vers la droite. |

**Continuité sans saut d'image** : `truck-side`, `truck-rotate` et `truck-top` partagent exactement la
même caméra (orthographique, échelle 24 m, pivot à 2 m de haut). Ne changez pas `blender.truckView`
pour une seule des trois.

### Livrées

- **Cabine** : jaune `#f8b80b` ou noire `#1c1e21`. Les deux sont rendues ; le choix se fait dans
  `src/data/sequences.ts` (`TRUCK_LIVERY`, à valider par le client).
- **Remorque / conteneur** : blanc, avec le monogramme LST (flèche jaune) de `public/brand/lst-monogramme.png`.
- **Conteneurs du navire** : jaune / blanc / anthracite (`containerColors`).

### Avion : image détourée

`plane-top` vient de `assets-src/photos/plane-top.webp` (vue du dessus, nez vers la droite, fond transparent) :
`node scripts/make-plane-photo.mjs && node scripts/encode-frames.mjs --only=plane-top`.

### Camion : images détourées

`truck-side-*`, `truck-top-*` et `truck-rotate-*` ne viennent plus de Blender mais de deux images à fond
transparent, identiques pour les deux livrées : `assets-src/photos/truck-side.png` (côté, cabine à droite)
et `assets-src/photos/truck-top.png` (dessus).

```bash
node scripts/make-truck-photo.mjs
node scripts/encode-frames.mjs --only=truck-side-yellow,truck-side-black,truck-top-yellow,truck-top-black,truck-rotate-yellow,truck-rotate-black
```

- vue de côté : placée comme l'ancien rendu ; chaque roue est découpée dans la photo
  (`public/sequences/truck-side-photo/wheel-<n>.webp`, référencées par `src` dans `wheels.json`) et tourne au défilement ;
- bascule de caméra : « retournement de carte », la vue de côté s'aplatit sur son axe puis la vue du dessus se
  déplie au même endroit, sans jamais les empiler (sinon on croit voir deux camions superposés) ;
- pour changer d'images, remesurer les constantes `SIDE` et `TOP` en tête du script (et `PHOTO_BOX` dans
  `make-placeholders.mjs` pour le chargement).

Le même script produit aussi, pour l'embarquement (fin de la ville → mer), deux vues du dessus au cadrage de
`truck-top` : `truck-top-empty` (camion sans conteneur, châssis de remorque dessiné) et `container-top` (le
conteneur seul). Le conteneur est posé dans un emplacement libre du navire : `ship-top` (placeholders) laisse
deux baies vides, marquées en jaune, et écrit leur position dans `src/data/ship-slot.json`, lue par la timeline.

```bash
node scripts/encode-frames.mjs --only=truck-top-empty,container-top
node scripts/make-placeholders.mjs --only=ship-top && node scripts/encode-frames.mjs --only=ship-top
```

Ne pas relancer `npm run assets:render` ni `assets:placeholders` sur ces séquences : ils écraseraient les images.

La séquence de chargement (`reachstacker-load-*`) utilise aussi cette photo quand elle existe : le script des
placeholders la sépare en deux calques (camion à remorque vide, conteneur porté par la grue ; emprise du
conteneur dans `PHOTO_BOX`). La grue vient de `assets-src/photos/reachstacker-side.png` (vue de côté, flèche
vers la droite, fond transparent), découpée en calques : châssis, flèche (pivote autour de son axe), tige du vérin
(coulisse dans le corps), palonnier (reste vertical, déployé à la longueur du conteneur) et roues (tournent quand la
machine roule). Les mesures sont dans `RS`, en tête de `make-placeholders.mjs` ; à remesurer si l'image change.
Sans cette image, la grue est dessinée. Pour régénérer la séquence seule :

```bash
node scripts/make-placeholders.mjs --only=reachstacker-load && node scripts/encode-frames.mjs --only=reachstacker-load-yellow,reachstacker-load-black
```

## Préparer les modèles (`assets-src/models/`)

Fichiers attendus : `truck.glb`, `reachstacker.glb`, `ship.glb`, `plane.glb`.

- Unités en mètres, sol à Z = 0, avant du véhicule vers +X. Sinon, renseignez `forward` et `scale`
  dans `blender.models.<modèle>`.
- **Camion** : les roues doivent être des objets séparés dont le nom correspond à `wheelPattern`
  (`wheel`, `tire`, `rim`…). Les matériaux sont recolorés selon `materials` (motif de nom → rôle
  `cab` / `white` / `anthracite`). Le monogramme est collé sur la remorque via `decal`.
- **Reachstacker** : pour un résultat fidèle, fournissez une animation glTF nommée `load` et un objet
  ou un os `spreader`. Le conteneur suit alors le spreader jusqu'à `releaseAt`. Sans animation, le
  script fait rouler la grue et déplace le conteneur (repli procédural, moins réaliste).
- **Navire** : si le modèle n'a pas de conteneurs, `generateContainers` les ajoute sur le pont.

### Éclairage et rendu

- Cycles avec débruitage et fond transparent (`film_transparent`), transformation de couleur AgX.
- **Éclairage studio doux** : trois softboxes (key, fill, rim) et un fond gris neutre. Si
  `assets-src/hdri/studio.exr` existe, il sert d'environnement (HDRI de studio CC0, par exemple Poly Haven).
- **Ombre de contact** : un plan *shadow catcher* au sol. L'ombre est conservée, le sol est transparent.
- Caméra orthographique (camion) ou longue focale de 85 mm (chargement), pour limiter la déformation.

## Encodage et budgets

| Sortie | Largeur | Frames | Formats | Budget par séquence |
| --- | --- | --- | --- | --- |
| desktop | ≤ 1920 px | toutes | AVIF q50 (alpha) + WebP q72 | ≤ 6 Mo (AVIF) |
| mobile | ≤ 960 px | une sur deux | AVIF + WebP | ≤ 2 Mo (AVIF) |

- Le navigateur reçoit de l'AVIF s'il le décode (avec alpha), sinon du WebP (`preferredExt()`).
- Le manifeste `src/data/sequences.json` contient, pour chaque séquence : le nombre de frames, le
  ratio, l'emprise du sujet (pixels non transparents) dans la première et la dernière frame, et les
  roues. Il est régénéré à chaque encodage : ne l'éditez pas à la main.
- Si un budget est dépassé, essayez dans l'ordre :
  1. baisser `avifQuality` (40–45) ;
  2. réduire le nombre de frames ;
  3. recadrer plus serré (moins de pixels transparents).

## Crédits et licences des modèles

> TODO(client) : à compléter à la livraison des modèles. Aucun modèle n'est versionné dans le dépôt.

| Fichier | Source | Auteur | Licence | Attribution requise |
| --- | --- | --- | --- | --- |
| `truck.glb` | TODO | TODO | TODO | TODO |
| `reachstacker.glb` | TODO | TODO | TODO | TODO |
| `ship.glb` | TODO | TODO | TODO | TODO |
| `plane.glb` | TODO | TODO | TODO | TODO |
| `studio.exr` (facultatif) | TODO | TODO | TODO | TODO |

Les placeholders actuels (`npm run assets:placeholders`) sont générés par le code du dépôt et
n'utilisent aucun asset tiers, en dehors du monogramme LST.

## Globe du hero sur mobile (image pré-rendue)

Sur mobile (< 768 px), le hero affiche `public/images/hero-globe-mobile.webp` (780×1688, environ 40 Ko)
au lieu du globe WebGL, pour ne pas charger three.js au démarrage. Il faut régénérer cette image après
chaque modification visuelle du globe (couleurs, halo, destinations) :

1. `npm run build && npm run start`
2. Ouvrir `http://localhost:3000/?globe-webgl` en émulation mobile 390×844, DPR 2, avec
   `prefers-reduced-motion: reduce` (globe figé, arcs complets).
3. Masquer le texte du hero et l'en-tête (`.hero-copy`, `.bar`, `.wa`, `.hero-hint`, `.scroll-progress`),
   puis capturer l'écran.
4. Convertir la capture en WebP qualité 72 vers `public/images/hero-globe-mobile.webp`.

Le paramètre `?globe-webgl` ne sert qu'à cette capture : il force le globe WebGL sur mobile.
