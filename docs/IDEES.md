# Numero — idées à investiguer plus tard

Pistes notées en cours de route. Rien n'est décidé : chaque idée passera par un cadrage avant d'entrer dans `DECISIONS.md`.

## 1. S'appuyer sur les programmes scolaires (noté le 2026-11-05)

> **Suivi (2026-11-07)** : hors champ pour le public scolaire en tant que tel (carte #1) ; les programmes servent de repère aux crans de difficulté. Les dates restent dans le brouillard de la carte.

Explorer les programmes officiels de l'Éducation nationale, matière par matière (histoire, français, biologie / SVT, physique-chimie, géographie…) et niveau par niveau (cycles 3 et 4, lycée).

- **Pourquoi** : définir un savoir à acquérir par tranche d'âge. Ça donne une culture générale qui répond aussi à un besoin scolaire, et ça ouvre un public (élèves, parents, enseignants) qu'on avait mis de côté au cadrage.
- **À creuser** :
  - Quels nombres les programmes demandent-ils explicitement de connaître ?
  - Faut-il des **niveaux** ? Ils avaient été écartés pour le prototype ; ils pourraient revenir sous la forme « niveau scolaire » plutôt que « difficulté ».
  - Des **thématiques par matière**, pour les futurs espaces thématiques.
  - Les **dates** (« les années »), exclues pour l'instant (« pas d'année-date »). En histoire, elles sont centrales : il faudrait décider si et comment les jouer (curseur sur une frise, plus/moins…).
- **Sources possibles** : programmes officiels (eduscol.education.fr, BO de l'Éducation nationale), manuels.

## 2. Des questions tirées de l'actualité (noté le 2026-11-05)

> **Suivi (2026-11-07)** : hors champ (carte #1).

Trouver une ou plusieurs sources d'actualité pour en tirer des nombres du moment :

- **découvertes scientifiques** : nouvelle exoplanète, record, fossile, mesure…
- **actualité géopolitique**, par pays : population, superficie, distances, chiffres clés d'un pays dont on parle.
- **À creuser** :
  - Le choix des sources fiables : revues de vulgarisation, agences de presse, communiqués d'organismes de recherche (CNRS, ESA, NASA…).
  - La fréquence : une question « actu » dans le défi du jour ? un défi spécial hebdomadaire ?
  - La durée de vie : un nombre d'actualité vieillit vite. Il faut le dater dans `perimetre` et le retirer ou le mettre à jour au bon moment.
  - L'automatisation : un agent de veille qui propose des fiches en `brouillon`, toujours validées par un humain.

## 3. Collection à compléter, façon « looting » (noté le 2026-11-05)

> **Suivi (2026-11-07)** : pochettes décidées (ADR 0007, hugobqd/numero#19) ; séries et récompense d'un album : hugobqd/numero#30.

Prolongement de la collection de fiches, dont une première version existe : les fiches sont gagnées en défi, révisées et rangées par thème avec une progression « x / 10 ».

- **Idée** : des **séries à compléter, comme un album Panini**, par exemple « les 10 cartes de la collection Histoire de la Chine, niveau 1 ». Le joueur veut finir sa série, ce qui le fait revenir. L'album pourrait montrer les emplacements vides des cartes manquantes, sans en dévoiler le nombre.
- **À creuser** :
  - Comment découper le contenu en séries (thème × sous-thème × niveau, en lien avec l'idée des programmes scolaires) ?
  - Que gagne-t-on en finissant une série : un badge, un débloquage de la série suivante ou du niveau 2, un affichage spécial ?
  - Rareté des fiches, et comment en obtenir une précise : le défi du jour distribue des fiches au hasard, il faudra peut-être des défis thématiques pour cibler une série.
  - Doublons : que vaut une fiche déjà possédée (de l'expérience, de la maîtrise, une monnaie d'échange) ?
  - Renommer « fiche » en « carte » pour encourager la collectionnite (noté à l'étape 3). Le glossaire réserve déjà « carte » à l'objet de jeu ; les éléments d'interface s'appellent « blocs » et le regroupement d'un thème un « album ».
  - Garder l'apprentissage au centre : une fiche n'est vraiment « acquise » qu'une fois maîtrisée (étoiles), pas seulement gagnée.

## 4. Des leurres « exacts » que le jeu ne retouche pas (noté le 2026-11-06)

> **Suivi (2026-11-07)** : hugobqd/numero#32.

Le jeu décale de quelques % un leurre plus rond que la réponse, pour qu'il ne se trahisse pas. Il perd alors des pièges exacts et instructifs, retirés des fiches pour cette raison au lot 2 : l'ancien record du mille-pattes (750 pattes), la « 10e planète » (10), l'année de 360 jours, le panier de mini-basket (260 cm), les premiers marathons (40 000 m).

- **Idée** : marquer un leurre comme exact dans la fiche (par exemple `"exact": true`), pour que le jeu le montre tel quel.
- **À creuser** : un leurre rond et exact se repère-t-il trop facilement à côté d'une réponse précise ? Faut-il le réserver aux pièges sourcés ?

## 5. Des fiches qui ressemblent à des cartes à jouer (noté le 2026-11-06)

> **Suivi (2026-11-07)** : ouverture de pochette animée (hugobqd/numero#25), fiche en carte (hugobqd/numero#26), renommage en « carte » (hugobqd/numero#31).

Idée de design graphique : renforcer l'aspect « carte » des fiches, façon carte à jouer ou carte à collectionner.

- **Idée** : au lancement d'un défi, ses 5 fiches apparaissent comme une **pile de cartes**, qu'on joue une à une. Cette pile pourrait sortir d'un **booster** que le joueur ouvre.
- **À creuser** :
  - Le moment exact : à l'ouverture du défi (la pile entière, face cachée) ou à chaque révélation (la carte se retourne) ? « Révélation » désigne déjà, dans le glossaire, l'écran qui suit la réponse.
  - Le lien avec la collection façon album Panini (idée 3) : le booster rend visible le fait de « gagner » des cartes. Il faut garder l'apprentissage au centre, pas seulement le tirage.
  - Le vocabulaire : l'idée pousse vers le renommage de « fiche » en « carte », encore à décider (le glossaire réserve « carte » à l'objet de jeu).
  - Le coût : animations (ouverture, pile, retournement), accessibilité et réglage « réduire les animations », lisibilité sur mobile.

## 6. Réviser un album, une récompense de progression (noté le 2026-11-06)

> **Suivi (2026-11-07)** : hugobqd/numero#33.

Idée de gamification : la révision commence globale, puis le joueur gagne le droit de réviser un seul album.

- **Idée** : au début, la révision pioche dans toute la collection, comme aujourd'hui. Quand le joueur a assez de fiches dans un album (les fiches d'un thème), il débloque la **révision de cet album** seul. C'est une récompense qui suit sa progression, et elle sert à apprendre : il cible le thème qu'il veut consolider.
- **À creuser** :
  - Le seuil de déblocage : un nombre de fiches possédées dans l'album (5 ? 10 ?), une part de l'album, ou des fiches maîtrisées (étoiles) ? Un seuil sur la maîtrise garde l'apprentissage au centre.
  - Le vocabulaire : Hugo parle de « réviser une collection ». Dans le glossaire, la collection est l'ensemble des fiches du joueur et l'album le regroupement d'un thème : ici, c'est donc l'album qu'on révise. Avec les séries façon Panini (idée 3), la révision pourrait aussi porter sur une série.
  - Le choix des fiches : la règle actuelle (les moins maîtrisées et les moins récemment révisées d'abord) s'applique-t-elle telle quelle dans l'album ? Que faire quand toutes ses fiches ont 3 étoiles ?
  - L'effet sur la maîtrise et sur les fiches gagnées en révision (ticket #7) : la révision d'album rapporte-t-elle comme la révision globale ?
  - L'interface : où proposer cette révision (dans l'album, sur l'accueil), et comment annoncer le déblocage sans rendre la révision globale moins attirante.
  - Le lien avec les thèmes multiples : une fiche à plusieurs thèmes compte-t-elle dans chaque album ?

## 7. Séparer la difficulté de la fiche et ce que le joueur sait (noté le 2026-11-06)

> **Suivi (2026-11-07)** : décidé (états découverte / en cours / acquise, libellés révisés le même jour ; chiffre caché, albums par difficulté) ; à construire : hugobqd/numero#18 et hugobqd/numero#22.

Retour de Hugo sur l'écran « Ma collection » : il n'a pas compris ce que veulent dire les étoiles dans la liste des fiches. Rien ne l'explique à l'écran : une infobulle « Maîtrise x / 3 » au survol seulement, invisible sur mobile.

- **Constat** : deux informations différentes se mélangent. La **difficulté** est une propriété de la fiche (4 crans : tout public, grand public, curieux, pointu). La **maîtrise** dit où en est le joueur. Aujourd'hui, les étoiles portent la maîtrise mais servent aussi à régler l'exigence des propositions en révision, et rien ne montre la difficulté.
- **Idée** :
  - Dans un album, **ranger les fiches par difficulté, sous des intertitres** (de facile à difficile). Plus tard, ces groupes pourraient devenir des collections à part (lien avec les séries de l'idée 3 et la révision d'un album de l'idée 6), mais pas pour l'instant.
  - **Réserver les étoiles, ou leur remplaçant, à ce que le joueur sait** : acquis, ou pas encore connu et à réviser.
  - **N'afficher la valeur que si le joueur l'a trouvée** (ajouté le même jour) : tant qu'il n'a pas trouvé pile au moins une fois, la fiche de la collection montre un label « à réviser » à la place du nombre. Voir le chiffre veut dire qu'on l'a trouvé. Ça fait aussi de la place dans la liste.
- **À creuser** :
  - Combien d'états pour la maîtrise : deux (acquis / à réviser) ou garder une progression de 0 à 3 ? Deux états sont plus clairs ; une progression montre mieux l'effort en révision.
  - Le signe : des étoiles, un libellé (« à revoir », « acquis »), une couleur ? Les étoiles évoquent souvent une note ou une difficulté, d'où la confusion.
  - L'exigence en révision suit aujourd'hui la maîtrise (0 ★ découverte, 3 ★ experte) : la garder liée à la maîtrise, ou la lier aussi à la difficulté ?
  - La carte d'un thème affiche la moyenne des étoiles : que montrer à la place (nombre de fiches acquises, part de l'album) ?
  - Le wording des intertitres : reprendre les noms des crans tels quels, ou des libellés plus parlants pour le joueur ?
  - Le ton rassurant : « à réviser » plutôt que « raté », sans honte.
  - « Trouver pile » selon la mécanique : en QCM, c'est la bonne case ; avec le curseur ou le plus/moins, faut-il la valeur exacte ou une réponse dans la tolérance (une question « réussie ») ?
  - Une valeur trouvée une fois reste-t-elle affichée pour toujours ? Ce serait cohérent avec la maîtrise, qui ne baisse jamais.
  - Cacher le nombre empêche de le relire dans la collection pour l'apprendre. Le joueur le voit à la révélation, après chaque réponse : est-ce suffisant, ou faut-il un moyen de le découvrir à la demande ? Et le masquer donne-t-il envie de réviser (effet « carte à retourner », lien avec l'idée 5) ?
