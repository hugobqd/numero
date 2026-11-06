# Numero — idées à investiguer plus tard

Pistes notées en cours de route. Rien n'est décidé : chaque idée passera par un cadrage avant d'entrer dans `DECISIONS.md`.

## 1. S'appuyer sur les programmes scolaires (noté le 2026-11-05)

Explorer les programmes officiels de l'Éducation nationale, matière par matière (histoire, français, biologie / SVT, physique-chimie, géographie…) et niveau par niveau (cycles 3 et 4, lycée).

- **Pourquoi** : définir un savoir à acquérir par tranche d'âge. Ça donne une culture générale qui répond aussi à un besoin scolaire, et ça ouvre un public (élèves, parents, enseignants) qu'on avait mis de côté au cadrage.
- **À creuser** :
  - Quels nombres les programmes demandent-ils explicitement de connaître ?
  - Faut-il des **niveaux** ? Ils avaient été écartés pour le prototype ; ils pourraient revenir sous la forme « niveau scolaire » plutôt que « difficulté ».
  - Des **thématiques par matière**, pour les futurs espaces thématiques.
  - Les **dates** (« les années »), exclues pour l'instant (« pas d'année-date »). En histoire, elles sont centrales : il faudrait décider si et comment les jouer (curseur sur une frise, plus/moins…).
- **Sources possibles** : programmes officiels (eduscol.education.fr, BO de l'Éducation nationale), manuels.

## 2. Des questions tirées de l'actualité (noté le 2026-11-05)

Trouver une ou plusieurs sources d'actualité pour en tirer des nombres du moment :

- **découvertes scientifiques** : nouvelle exoplanète, record, fossile, mesure…
- **actualité géopolitique**, par pays : population, superficie, distances, chiffres clés d'un pays dont on parle.
- **À creuser** :
  - Le choix des sources fiables : revues de vulgarisation, agences de presse, communiqués d'organismes de recherche (CNRS, ESA, NASA…).
  - La fréquence : une question « actu » dans le défi du jour ? un défi spécial hebdomadaire ?
  - La durée de vie : un nombre d'actualité vieillit vite. Il faut le dater dans `perimetre` et le retirer ou le mettre à jour au bon moment.
  - L'automatisation : un agent de veille qui propose des fiches en `brouillon`, toujours validées par un humain.

## 3. Collection à compléter, façon « looting » (noté le 2026-11-05)

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

Le jeu décale de quelques % un leurre plus rond que la réponse, pour qu'il ne se trahisse pas. Il perd alors des pièges exacts et instructifs, retirés des fiches pour cette raison au lot 2 : l'ancien record du mille-pattes (750 pattes), la « 10e planète » (10), l'année de 360 jours, le panier de mini-basket (260 cm), les premiers marathons (40 000 m).

- **Idée** : marquer un leurre comme exact dans la fiche (par exemple `"exact": true`), pour que le jeu le montre tel quel.
- **À creuser** : un leurre rond et exact se repère-t-il trop facilement à côté d'une réponse précise ? Faut-il le réserver aux pièges sourcés ?
