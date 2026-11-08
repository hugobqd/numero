# Illustrations des douze thèmes — #52

Le 8 novembre 2026, Hugo a retenu le style géométrique à aplats du pilote et demandé de supprimer la trame puis de décliner les neuf autres thèmes.

## Livrables

24 SVG natifs dans `src/assets/themes/v2/` à la racine du dépôt. Les illustrations ont un viewBox de 300 × 300, les icônes dédiées un viewBox de 24 × 24. Fond ivoire pour les illustrations, transparent pour les icônes. Aucune texture, image intégrée, police, ressource externe ou filtre. `manifest.json` associe thèmes, fichiers et dominantes.

| Thème | Illustration | Icône | Dominante |
|---|---|---|---|
| Astronomie | `astronomie.svg` | `astronomie-24.svg` | `#2A535A` |
| Corps humain | `corps-humain.svg` | `corps-humain-24.svg` | `#CB6F71` |
| Animaux | `animaux.svg` | `animaux-24.svg` | `#C75936` |
| Géographie | `geographie.svg` | `geographie-24.svg` | `#447FAB` |
| Terre et géologie | `terre-geologie.svg` | `terre-geologie-24.svg` | `#785775` |
| Physique et chimie | `physique-chimie.svg` | `physique-chimie-24.svg` | `#328F89` |
| Constructions et transports | `constructions-transports.svg` | `constructions-transports-24.svg` | `#B78436` |
| Histoire | `histoire.svg` | `histoire-24.svg` | `#90613F` |
| Arts et culture | `arts-culture.svg` | `arts-culture-24.svg` | `#A74F78` |
| Sport et jeux | `sport-jeux.svg` | `sport-jeux-24.svg` | `#5967A4` |
| Nombres et mesures | `nombres-mesures.svg` | `nombres-mesures-24.svg` | `#6D8799` |
| Nature et climat | `nature-climat.svg` | `nature-climat-24.svg` | `#60854D` |

## Vérification

`planche-complete.png` / `.svg` regroupent les douze thèmes. `planche-1` et `planche-2` proposent la même revue en deux pages de six thèmes. Chaque paire comprend l’illustration à 180 puis 112 pixels et son icône à 24 pixels réels. Contrôle visuel des rendus, analyse XML des 24 sources et vérification de l’absence d’images ou de motifs de texture. Environ 16,5 Ko pour les 24 SVG non compressés.

Les trois illustrations du pilote sont reprises à l’identique. Les nouveaux visuels sont disponibles pour relecture avant leur intégration dans l’interface ; `src/lib/themes.ts` utilise encore les anciens JPEG. L’issue #52 reste ouverte pour cette intégration et la validation des neuf nouvelles paires.


## Comparaison A / B / C

La première famille `src/assets/themes/v2/` est désormais **proposition A** et reste strictement inchangée.

À la demande de Hugo, deux familles supplémentaires ont été dessinées sur les douze thèmes, avec douze icônes dédiées chacune. Fonds moins jaunes, sans texture, et un accent vif par illustration.

- **B — Silhouettes souples** : contours plus arrondis, objets et scènes aérées, fond blanc cassé neutre `#FAFAF7`. Animaux : léopard en marche et tête simplifiée pour l’icône. Sources : `src/assets/themes/proposition-b/` ; planche `proposition-b.png`.
- **C — Découpes et symboles** : compositions plus compactes, découpes en aplats, contrastes plus francs, surfaces de fond très pâles. Animaux : portrait de léopard, simplifié pour l’icône. Sources : `src/assets/themes/proposition-c/` ; planche `proposition-c.png`.

Les palettes dominantes de B et C sont communes pour faciliter la comparaison des formes. Chaque manifeste précise le sujet, la dominante et l’accent. Autres sujets B : satellite, cœur, globe, volcan, atome, train, colonne, palette, raquette, compas, pousse. Autres sujets C : fusée, main, rose des vents, strates, prisme, skyline, sablier, masque, cavalier, boulier, nuage et soleil.

`proposition-{b,c}-detail-{1,2}.svg` et `.png` présentent chaque famille en deux planches détaillées, avec les illustrations à 180 et 112 pixels et les icônes à 24 pixels réels. `comparaison-animaux.png` / `.svg` rapproche les trois traitements d’Animaux.

Vérification : 48 fichiers XML valides, sans image incorporée, filtre, texture, police ou ressource externe. Fond transparent pour les icônes ; compositions simplifiées prévues pour leur taille. Poids non compressé : B, 19 092 octets ; C, 16 044 octets pour 24 SVG par famille. Contrôle visuel des planches et des déclinaisons à petite taille. Conservation de A vérifiée par empreintes SHA-256. Aucun changement dans le jeu ; choix de la direction artistique en attente.
