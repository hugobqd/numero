# Numero — décisions de conception

Issues de la session de cadrage du 2026-11-05. Ce document fait foi tant qu'une décision n'est pas révisée ici.

## Vision

Jeu éducatif pour **retenir des nombres précis** qui régissent le monde (distance Terre-Lune : 384 400 km, os du corps adulte : 206…). Le jeu doit rester simple ; l'objectif est un savoir précis, pas seulement un ordre de grandeur.

## Décisions

| Sujet | Décision |
|---|---|
| Public | Adultes curieux et grands ados |
| Support | Web, pensé d'abord pour le mobile. Site statique Vite + TypeScript + Svelte, sans backend |
| Format | Défi quotidien de 5 questions, identique pour tous, renouvelé à minuit heure de Paris, un seul par jour |
| Composition | 5 questions tirées dans au moins 3 thématiques, ordre quelconque, **pas de niveau** |
| Valeur cible | Chaque question définit `valeur_a_retenir` et `precision` (pas d'arrondi propre à la question) |
| Mécaniques testées | `slider` : curseur unique, plage fixée par la question (décade de la valeur), le joueur ne choisit ni l'unité ni l'échelle · `palier` : curseur à crans posés sur les propositions du QCM · `qcm` : 4 propositions triées du plus petit au plus grand, fenêtre de 4 valeurs consécutives parmi les 6 propositions du palier, contenant la bonne réponse (fenêtre fixée par question, identique pour tous) · `plusmoins` : le jeu demande « plus grand ou plus petit que X ? » (deux boutons) ; X est un seuil rond placé entre deux des 6 propositions du palier ; dichotomie en **3 coups au plus**, la proposition restante devient la réponse |
| Propositions (QCM, palier, plus/moins) | 6 propositions **tirées à chaque défi** (selon la question et le numéro du défi : identiques pour tous un jour donné). On tire d'abord le **rang de la bonne réponse, uniforme** : elle est la plus petite ou la plus grande 1 fois sur 6 chacune, on ne peut pas éliminer les extrémités. Puis, de chaque côté : le piège de la fiche s'il y a de la place, une valeur éloignée (≈ ×0,35–0,55 ou ≈ ×1,7–2,5) pour élargir min et max, et des leurres proches (fiche ou générés, ±3 à 35 %). Le QCM montre la bonne réponse et 3 des 5 leurres au hasard : sa position parmi les 4 est uniforme. Tous les leurres prennent la forme de la bonne réponse ; écart minimal de 2 % pour les leurres générés |
| Scores testés | `tolerance` : gagné à ±5 % · `exact` : gagné si égal à `valeur_a_retenir` à `precision` près · `progressif` : 100 pts si exact, décroît jusqu'à 0 à ±50 %. QCM, palier et plus/moins : `exact` = la bonne proposition ; `tolerance` = une proposition à ±5 % ; `progressif` = selon le rang (bonne 100, voisine 50, deux crans plus loin 20, au-delà 0) |
| Tests | Panneau « Réglages de test » : rejouer le défi, passer au défi précédent ou suivant, effacer les stats, choisir l'une des 12 combinaisons. Paramètres d'URL `?meca=slider\|palier\|qcm\|plusmoins&score=tolerance\|exact\|progressif`, tests de couloir, aucune mesure d'audience |
| Révélation | Valeur exacte en grand, écart du joueur, ancrage, moyen mnémotechnique facultatif, source |
| Affichage des nombres | Dès 1 million, on passe à « millions / milliards / billions » avec l'unité : « 4,54 milliards d'années », jamais « 4 540 000 000 années » ; la notation scientifique reste en complément à la révélation |
| Partage | `Numero #12 — 4/5` + emojis 🟩🟥 (🟩🟨🟥 en progressif), sans dévoiler les réponses |
| Stockage | localStorage (résultat du jour, série, statistiques) |
| Langue | Français, contenu prêt à être traduit (champ `langue`) |
| Direction artistique | Sobre et typographique, chiffres tabulaires, une couleur d'accent, mode clair et sombre |
| Dépôt | Git local uniquement, aucun envoi en ligne pour l'instant |

## Fiche question

Voir `src/lib/types.ts`. Champs : `id, enonce, valeur, valeur_a_retenir, precision, unite, perimetre, ancrage, mnemo?, source {url, consulte_le}, thematique, leurres[], statut (brouillon|valide), langue`.

`leurres` est une réserve de 6 à 8 leurres typés (`erreur_frequente`, `autre_unite`, `autre_perimetre`, `proche`), avec une note ; au moins 3 pièges. Règles de rédaction : `docs/agents/03-redaction.md`.

Seules les fiches `valide` entrent dans le défi quotidien.

## Contenu

Chaîne d'agents lancée à la main, consignes dans `docs/agents/` :
thématiques → sources (Wikipédia) → rédaction → simplification → relecture.
**La relecture humaine est la seule porte vers `valide`.**
Cible du prototype : environ 60 questions sur environ 6 thèmes.

## Plus tard

Espaces thématiques jouables séparément, chaîne d'agents automatisée, difficulté calculée sur les taux de réussite réels, mesure d'audience légère au premier partage public.
