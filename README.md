# Numero

Jeu éducatif : retenir au chiffre près les nombres qui régissent le monde.

**À jouer en ligne : https://hugobqd.github.io/numero/** (prototype, données dans le navigateur).

Décisions de conception : [docs/DECISIONS.md](docs/DECISIONS.md).

```bash
npm install
npm run dev
```

## Réglages de test

`?meca=palier|qcm|plusmoins` change le mode de réponse du joueur (aussi réglable sur l'accueil ; par défaut : palier) — `&reset=1` efface la partie du jour. Les joueurs et les jours sont simulés : bouton « Nouveau joueur », puis « Simuler le jour suivant » ou ← / → dans le panneau de test.
Le petit bouton ⚙ en bas à droite ouvre les outils de test, qui permettent de changer de jour simulé, de rejouer le défi, de changer de joueur, de revoir le tuto, d’effacer les stats ou la collection, et de lancer les 8 combinaisons.

## Consultation des fiches

Dans **Test → Contenu → Consulter les fiches (tableau)**, ouvrir la consultation en lecture seule (`?admin=fiches`). Le tableau affiche tout le stock, même si les brouillons sont exclus du jeu : recherche sans distinction d’accents, filtres combinables (thème, tag, difficulté, statut, lot, unité et sources à compléter), tri par colonne et pagination. Toucher un énoncé ouvre les valeurs, le périmètre, l’ancrage, les sources, la justification de difficulté et les leurres. La vue ne modifie ni les fiches ni les données des joueurs.

Les lots historiques sont indexés dans `src/lib/lots-historiques.ts` d’après les PR #12 et #14 ; les nouveaux fichiers `lot-N.json` donnent leur numéro de lot. Une nouvelle fiche dans un fichier historique doit être ajoutée à cet index pour que son lot soit connu.

## Contenu

Questions : tous les fichiers `src/data/*.json` (format : `src/lib/types.ts`), les fichiers historiques peuvent contenir plusieurs thèmes : le champ `theme` détermine l’album. Le champ `tags` sert au classement interne. Répartition et objectifs des prochains lots : [thèmes et tags internes](docs/contenu/proposition-reorganisation-themes.md). Dans le prototype, les brouillons sont joués aussi (`?brouillons=0` pour ne garder que les fiches validées).

```bash
npm run verifier   # contrôle les fiches (format, pas, leurres)
```
Consignes des agents de contenu : `docs/contenu/`.

## Mise en ligne

Le numéro de version affiché en bas de page vaut `majeur.mineur.<nombre de commits> · <commit>` (par exemple `v0.1.45 · 20598f2`) : il change tout seul à chaque commit et donc à chaque publication. Pour changer de version majeure ou mineure, modifier `version` dans `package.json`.

Le site est publié sur GitHub Pages par `.github/workflows/deploy.yml` à chaque push sur `main` : contrôle des fiches, build, puis déploiement. Le build utilise des chemins relatifs (`base: './'`) et fonctionne donc dans le sous-dossier `/numero/`. Les données des joueurs restent dans leur navigateur.

## Direction artistique

Les douze thèmes utilisent la famille **Atomic Age 1950–1960** validée le 8 novembre 2026 : silhouettes expressives, courbes boomerang, aplats, contours noirs, fonds clairs peu jaunes et accents vifs. Pas de trame ajoutée ni de groupes de trois traits en éventail. Une dominante par thème ; les miniatures gardent le sujet principal et suppriment les détails secondaires.

### Illustrations et icônes des thématiques

- `src/assets/themes/selection/illustrations/` : douze WebP carrés de 600 × 600 px, extraits des panneaux approuvés puis optimisés pour le mobile (qualité 84, environ 292 Ko au total).
- `src/assets/themes/selection/icons/` : douze SVG natifs de 24 × 24, fond transparent (environ 8 Ko au total).
- `src/lib/themes.ts` : correspondance des douze thèmes avec leur illustration, leur icône et leur texte alternatif. Une thématique inconnue retourne `null`.
- `src/assets/themes/selection/manifest.json` : provenance des illustrations et panneau sélectionné.
- `docs/design/illustrations-themes/selection/` : planches de validation et détails de simplification ; recherches et briefs dans les dossiers voisins.

Les illustrations sont utilisées dans la mosaïque d’accueil et la collection ; les icônes sont affichées à 24 pixels dans l’en-tête des fiches de jeu et les pastilles de l’outil de consultation. Les anciens JPEG et les pistes écartées sont conservés comme archives, sans être importés par le jeu.

### Palette

| Rôle | Hex | Nom | Usage |
|---|---|---|---|
| `color_bg_base` | `#F4EAD4` | Fond papier ivoire | Fond principal, teinte de papier rétro |
| `color_bg_subtle` | `#ECE0C3` | Crème chaud | Zones claires secondaires, surfaces |
| `color_dark_primary` | `#1D3540` | Bleu nuit / pétrole foncé | Remplace le noir : texte, traits fins, aplats profonds |
| `color_dark_secondary` | `#2A535A` | Sarcelle profond | Sombre intermédiaire : trames, silhouettes secondaires |
| `color_accent_terracotta` | `#C75936` | Orange brûlé / terracotta | Accent chaud principal, silhouettes dominantes |
| `color_accent_rust` | `#A64023` | Rouille foncé | Variante dense : ombrages, texte d'accent |
| `color_accent_ochre` | `#C88E3E` | Ocre moutarde | Accent lumineux : rayons, orbites, découpes |
| `color_line_technical` | `#8A6B43` | Brun technique | Cercles concentriques, lignes fines, repères de diagramme |
| `color_verdict_win` | `#3CCF9A` | Vert menthe | Pastille « Pile ! » (texte pétrole) |
| `color_verdict_close` | `#F5B82E` | Jaune soleil | Pastille « Presque » (texte pétrole) |
| `color_verdict_miss` | `#FF7A52` | Corail | Pastille « Raté » (texte pétrole) |

Les couleurs sont déclarées en variables CSS dans `src/app.css`.
