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

Style : International Typographic Style (Swiss Style), constructivisme et illustration éditoriale Mid-Century « Atomic Age ». Aplats de couleur, fines lignes techniques, trajectoires en pointillés, cercles concentriques, trames Ben-Day et rendu risographie sur papier ancien.

### Prompt des illustrations de thématiques

Les illustrations de `src/assets/themes/` ont été générées avec ce prompt, en remplaçant les trois éléments entre crochets :

```text
Square 2D graphic design illustration of [SUJET PRINCIPAL], accompanied by [ÉLÉMENT SECONDAIRE] and [ÉLÉMENT TERTIAIRE]. Style: International Typographic Style (Swiss Style), Constructivism, and 1950s Mid-Century Modern Atomic Age editorial art, inspired by Josef Müller-Brockmann, Saul Bass, and Charley Harper. Clean minimalist poster aesthetic with bold graphic silhouettes and sharp geometric cutouts. Visually structured with a mix of solid flat color blocks, fine thin technical diagram lines, delicate dashed trajectories, concentric circular rings, and coarse Ben-Day halftone screen-print dots. Limited muted retro palette: aged warm cream paper background, burnt terracotta orange, deep petrol teal, and mustard ochre. Balanced asymmetrical layout, generous negative space, textured risograph print finish, strictly 2D vector, no 3D rendering, no photorealism.
```

Sources d'origine en 2000 × 2000 px, réduites à 600 px (JPEG) pour le mobile.

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
