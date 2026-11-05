# Numero — décisions de conception

Issues de la session de cadrage du 2026-11-05. Ce document fait foi tant qu'une décision n'est pas révisée ici.

## Vision

Jeu éducatif pour **retenir des nombres précis** qui régissent le monde (distance Terre-Lune : 384 400 km, os du corps adulte : 206…). Le jeu doit rester simple ; l'objectif est un savoir précis, pas seulement un ordre de grandeur.

## Décisions

| Sujet | Décision |
|---|---|
| Public | Adultes curieux et grands ados |
| Support | Web, pensé d'abord pour le mobile. Site statique Vite + TypeScript + Svelte, sans backend |
| Format | Défi quotidien de 5 questions, identique pour tous, un seul par jour. Cible : renouvelé à minuit heure de Paris ; dans le prototype, le jour est simulé par joueur |
| Composition | Le stock est découpé en défis de 5 questions **sans répétition** : chaque cycle épuise toutes les questions jouables avant de recommencer dans un nouvel ordre. Chaque défi pioche dans des thématiques différentes (au moins 3), en privilégiant celles qui ont le plus de questions restantes. Ordre quelconque, **pas de niveau** |
| Valeur cible | Chaque question définit `valeur_a_retenir` et `precision` (pas d'arrondi propre à la question) |
| Mécaniques testées | `slider` : curseur unique, plage fixée par la question (décade de la valeur), le joueur ne choisit ni l'unité ni l'échelle · `palier` : curseur à crans posés sur les propositions du QCM · `qcm` : 4 propositions triées du plus petit au plus grand (la bonne réponse et 3 des 5 leurres du palier) · `plusmoins` : le jeu demande « plus grand ou plus petit que X ? » (deux boutons) ; X est un seuil rond placé entre deux des 6 propositions du palier ; dichotomie en **3 coups au plus** ; **un seul mauvais choix fait perdre la question** ; en progressif : perdu au coup 1 = 0 pt, au coup 2 = 20 pts, au coup 3 = 50 pts, gagné = 100 pts (en exact : 100 ou 0) ; sans erreur, on arrive sur la bonne réponse |
| Propositions (QCM, palier, plus/moins) | 6 propositions **tirées à chaque défi** (selon la question et le numéro du défi : identiques pour tous un jour donné). On tire d'abord le **rang de la bonne réponse, uniforme** : elle est la plus petite ou la plus grande 1 fois sur 6 chacune, on ne peut pas éliminer les extrémités. Puis, de chaque côté : le piège de la fiche s'il y a de la place, une valeur éloignée (≈ ×0,35–0,55 ou ≈ ×1,7–2,5) pour élargir min et max, et des leurres proches (fiche ou générés, ±3 à 35 %). Le QCM montre la bonne réponse et 3 des 5 leurres au hasard : sa position parmi les 4 est uniforme. Tous les leurres prennent la forme de la bonne réponse ; écart minimal de 2 % pour les leurres générés |
| Difficulté des propositions | Trois profils (QCM, palier, plus/moins) : **découverte** (2 valeurs éloignées de chaque côté, proches à ±15–35 %), **normale** (1 éloignée de chaque côté, le reste proche : profil actuel), **experte** (aucune éloignée, pièges et proches à ±2–20 %). Défi du jour et premier défi : normale, identique pour tous. **Révision : selon la maîtrise de la fiche** — 0 ★ découverte, 1–2 ★ normale, 3 ★ experte ; badge « niveau découverte / expert » sur la question |
| Scores testés | `progressif` (par défaut) : au curseur, 100 pts si exact, puis décroît jusqu'à 0 à ±50 % ; en QCM, palier et plus/moins, selon le rang (bonne 100, voisine 50, deux crans plus loin 20, au-delà 0) · `exact` : 100 si la réponse vaut `valeur_a_retenir` à `precision` près, sinon 0. La variante « tolérance ±5 % » a été supprimée |
| Réglage par défaut | **Palier + score progressif** (sans paramètre d'URL) |
| Tests | Outils de test **repliés derrière un petit ⚙** en bas à droite (discret mais visible) ; il ouvre un panneau par-dessus le jeu (à droite sur ordinateur, en bas sur mobile), état mémorisé dans le navigateur : joueur, jour simulé, mécanique × score, contenu, données. Paramètres d'URL `?meca=slider\|palier\|qcm\|plusmoins&score=progressif\|exact`. Tests de couloir sur mobile, aucune mesure d'audience |
| Révélation | Valeur exacte en grand, écart du joueur, ancrage, moyen mnémotechnique facultatif, source |
| Affichage des nombres | Dès 1 million, on passe à « millions / milliards / billions » avec l'unité : « 4,54 milliards d'années », jamais « 4 540 000 000 années » ; la notation scientifique reste en complément à la révélation |
| Partage | `Numero #12 — 4/5` (en progressif `380/500 pts`) + emojis 🟩🟥 (🟩🟨🟥 en progressif), sans dévoiler les réponses |
| Collection | **Toutes les questions jouées en défi**, réussies ou non, ajoutent leur fiche à la collection (une fois) : c'est l'intérêt pédagogique, on s'entraîne surtout sur ses erreurs. Écran « Ma collection » : **une carte par thématique commencée** (les thèmes sans fiche n'ont pas de carte ; un bloc « Continue à jouer pour découvrir aussi … » les cite, ou indique le nombre de fiches restantes) (emoji, nom, fiches x / 10 avec jauge, moyenne des étoiles des fiches possédées, affichée en étoiles arrondies à la demi-étoile inférieure), sans le détail des questions ; toucher une carte ouvre ses fiches (valeur, ancrage, étoiles, « à revoir »). **Révision** : 5 fiches, les moins maîtrisées (donc les ratées) et les moins récemment révisées d'abord, propositions tirées au hasard ; même mécanique et même score que le défi. **Maîtrise** : 1 étoile si réussie en défi, 0 (« à revoir ») si ratée ; +1 par révision réussie (3 au plus), une erreur ramène à 0. La révision ne compte pas dans les stats du défi |
| Écran principal | Accueil sobre : « Bonjour <pseudo> », **Jour N** en grand ; carte « Défi du jour » (Jouer / Reprendre x/5 / score + Voir le bilan) ; trois chiffres (série, fiches x/N, maîtrisées) ; carte « Révision » (fiches à revoir, Réviser, Ma collection). Le titre « Numero » ramène à l'accueil, tout comme « ← Accueil » aux bilans |
| Joueurs (prototype) | **Comptes simulés** dans le navigateur : bouton « Nouveau joueur » avec un pseudo, choix et suppression des joueurs. Chaque joueur a ses propres parties, stats et collection, et son **jour simulé** (commence au jour 1 ; « Simuler le jour suivant » au bilan, ← / → dans le panneau de test). Le défi du jour est celui du jour simulé |
| Accueil d'un nouveau joueur | **Premier défi (tuto)** avant le premier défi du jour : écran de bienvenue (règles, collection, fiches à revoir), puis 5 questions fixes (os, Everest, Terre-Lune, dents, tour Eiffel) avec le mode d'emploi de la mécanique sous chaque question. Les 5 fiches rejoignent la collection (ratées = à revoir). « Revoir le tuto » dans le panneau de test |
| Stockage | localStorage, par joueur : `numero:<joueur>:partie:N`, `…:stats`, `…:collection` ; liste des joueurs dans `numero:joueurs` |
| Langue | Français, contenu prêt à être traduit (champ `langue`) |
| Direction artistique | Sobre et typographique, chiffres tabulaires, une couleur d'accent, mode clair et sombre |
| Dépôt et hébergement | Dépôt GitHub public, prototype publié sur **GitHub Pages** (déploiement automatique à chaque push sur `main`, `.github/workflows/deploy.yml`). Données des joueurs uniquement dans le navigateur (localStorage) |

## Fiche question

Voir `src/lib/types.ts`. Champs : `id, enonce, valeur, valeur_a_retenir, precision, unite, perimetre, ancrage, mnemo?, source {url, consulte_le}, thematique, leurres[], statut (brouillon|valide), langue`.

`leurres` est une réserve de 6 à 8 leurres typés (`erreur_frequente`, `autre_unite`, `autre_perimetre`, `proche`), avec une note ; au moins 3 pièges. Règles de rédaction : `docs/agents/03-redaction.md`.

Seules les fiches `valide` entrent dans le défi quotidien. **Exception du prototype** : les brouillons sont inclus par défaut pour pouvoir tester (statut visible seulement dans l'inspecteur des outils de test, pas pour les joueurs ; `?brouillons=0` pour les exclure). Toutes les fiches de `src/data/*.json` sont chargées (un fichier par thématique). `npm run verifier` contrôle les fiches.

## Contenu

Chaîne d'agents lancée à la main, consignes dans `docs/agents/` :
thématiques → sources (Wikipédia) → rédaction → simplification → relecture.
**La relecture humaine est la seule porte vers `valide`.**
Cible du prototype : environ 60 questions sur environ 6 thèmes.

## Plus tard

Espaces thématiques jouables séparément, chaîne d'agents automatisée, difficulté calculée sur les taux de réussite réels, mesure d'audience légère au premier partage public.
