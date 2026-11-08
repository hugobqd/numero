# Ensemble retenu et icônes — #52

Le 8 novembre 2026, à la demande de Hugo : déclinaison des douze illustrations en icônes et présentation de l’ensemble.

## Présentation

- `ensemble-1.png` : Astronomie, Corps humain, Animaux, Géographie, Terre et géologie, Physique et chimie.
- `ensemble-2.png` : Constructions et transports, Histoire, Arts et culture, Sport et jeux, Nombres et mesures, Nature et climat.
- `ensemble-complet.png` : les douze paires sur une seule planche.
- `icones-24.png` / `.svg` : les douze icônes à 24 pixels réels, dans le même ordre.

Chaque planche montre l’illustration choisie à 232 pixels, puis l’icône agrandie à 64 pixels et à sa taille cible de 24 pixels. Les SVG de mise en page référencent les PNG originaux ; les PNG des planches sont autonomes. Ces planches sont des compositions de présentation, pas des illustrations vectorisées.

## Sources

Les **12 icônes sont de vrais SVG natifs**, dessinés pour 24 × 24, sans image embarquée, texture, filtre, police ni ressource externe. Fond transparent. Ils sont dans `src/assets/themes/selection/icons/` à la racine du dépôt ; poids cumulé : **7 911 octets**. Le manifeste adjacent associe chaque thème à son icône, son illustration source et au panneau retenu dans la planche originale.

Les illustrations retenues sont conservées fidèlement : télescope, léopard et Terre en coupe de F corrigée ; main, globe, prisme, train, amphore, cavalier et compas de G ; casque/synthétiseur et arbre de H. Les fichiers source PNG restent inchangés. Le découpage des panneaux sur les planches de présentation est réalisé par les viewports SVG.

## Simplification des icônes

Conserver la silhouette, les couleurs et le signe distinctif. Ôter les accessoires secondaires : planète du télescope, orbites décoratives, étoile, cristal, ballon du cavalier, etc. Main à cinq doigts et petit cœur ; tête de léopard avec oreilles arrondies et rosettes ; globe en coupe ; train et phare corail ; amphore et frise ; casque et clavier ; compas et équerre ; arbre et soleil. Aucun groupe de trois traits en éventail.

## Vérification et suite

Structure XML et viewBox 24 × 24 vérifiés pour les douze icônes. Contrôle visuel des deux planches, avec le rendu à 24 pixels et l’agrandissement. Les PNG de présentation ont été rendus avec librsvg. Les icônes sont une première déclinaison présentée pour validation ; l’intégration dans le jeu reste à faire. Les illustrations principales sont toujours matricielles et ne sont pas présentées comme des SVG natifs.


## Intégration validée

Hugo a validé l’ensemble et demandé son installation. Les douze grandes illustrations ont été extraites fidèlement des panneaux retenus et exportées en WebP 600 × 600 qualité 84 (291 952 octets au total). Aucune régénération artistique à cette étape. Le jeu utilise les nouveaux fichiers via `src/lib/themes.ts` : grandes images dans la mosaïque et la collection ; icônes SVG à 24 pixels dans les fiches et les pastilles du catalogue de contenu. Fond des illustrations de collection éclairci pour correspondre aux images.

Vérification : 28 tests passent ; contrôle Svelte/TypeScript sans erreur (9 avertissements préexistants) ; build réussi. Couverture de tous les thèmes du stock et présence des 24 fichiers vérifiées. Navigateur : accueil, première question et révélation, collection et détail de thème ; dimensions mobiles et grand écran ; 25 icônes du catalogue chargées sans erreur et affichées à 24 × 24. Aperçu enregistré dans `integration-jeu.png`. Modification locale, sans déploiement public.
