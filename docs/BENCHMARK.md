# Benchmark général — Jeux de quiz, chiffres et mémorisation

> Benchmark rédigé par Hugo, ajouté le 2026-11-07. Matière d'inspiration, pas de décision : ce qui en sera repris passera par un ticket de décision avant d'entrer dans `DECISIONS.md`.

## 1. Périmètre du benchmark

Ce benchmark explore les produits qui se situent à la croisée de trois expériences :

- **Le jeu de culture générale** : découvrir des faits, tester ses connaissances et apprendre.
- **Le jeu d'estimation numérique** : évaluer sa capacité à situer une valeur, un ordre de grandeur ou une quantité.
- **L'outil de mémorisation gamifié** : apprendre une information, la retrouver plus tard et la retenir durablement.

L'enjeu est d'identifier les mécaniques qui peuvent rendre une connaissance mémorable, donner envie de revenir et créer une progression perceptible.

Le benchmark est organisé en quatre familles :

1. Les jeux directement centrés sur les chiffres.
2. Les jeux de connaissances et de culture générale.
3. Les outils de mémorisation.
4. Les mécaniques de rendez-vous quotidien et de partage.

---

## 2. Les références à analyser

### A. Les jeux directement centrés sur les chiffres

C'est la famille prioritaire. Elle permet d'observer les formats de questions, les réponses numériques, le feedback et la manière de rendre les nombres ludiques.

#### 1. Cifra

Site : https://cifragame.com/

**Principe**

Cinq questions quotidiennes portant sur des nombres réels. Le joueur saisit librement une estimation, puis découvre la valeur exacte et son score.

Les questions couvrent de nombreux domaines : sciences, géographie, technologie, histoire, sport, etc.

**Mécaniques intéressantes**

- Réponse libre plutôt que QCM : le joueur doit produire une valeur.
- Score calculé selon l'écart relatif, ce qui permet de comparer des valeurs très différentes.
- Même défi pour tous les joueurs le même jour.
- Résultat partageable sous forme de grille.
- Sources associées aux données.

**À retenir pour notre projet**

La saisie libre engage davantage que le simple choix d'une réponse. Le score de proximité est intéressant pour valoriser une intuition numérique, même sans connaissance exacte.

#### 2. Estimania

Site : https://estimania.app/

**Principe**

Cinq questions numériques par jour, avec une réponse libre et un score sur 100 selon la proximité de l'estimation. Une courte explication accompagne la réponse.

**Mécaniques intéressantes**

- Format très court et régulier.
- Questions issues de domaines variés.
- Explication pédagogique après chaque réponse.
- Classement et partage du score.
- Certaines questions invitent à raisonner par approximation plutôt qu'à connaître la réponse.

**À retenir pour notre projet**

L'explication après la réponse est essentielle. Elle transforme une simple performance de quiz en petite séquence d'apprentissage.

#### 3. Magnitudle

Site : https://magnitudle.app/fr/

**Principe**

Une question quotidienne, une seule estimation. Le score dépend de la distance entre la réponse et la valeur réelle, exprimée en puissances de dix.

Le jeu propose aussi plusieurs modes : survie, estimation visuelle, plus ou moins, quiz des grandeurs et entraînement par thème.

**Mécaniques intéressantes**

- Une seule tentative : elle donne du poids à la réponse.
- Visualisation de l'écart sur une échelle logarithmique.
- Anecdote et source après la révélation.
- Modes alternatifs pour varier les expériences.
- Archive et statistiques personnelles.

**À retenir pour notre projet**

La représentation visuelle de l'ordre de grandeur est particulièrement pertinente. Elle aide à donner une dimension concrète à des nombres difficiles à se représenter.

#### 4. Popdle

Site : https://www.popdle.com/

**Principe**

Chaque jour, un pays différent. Le joueur doit estimer sa population en six tentatives maximum. Après chaque proposition, le jeu indique si la valeur réelle est supérieure ou inférieure et donne un indicateur de proximité.

**Mécaniques intéressantes**

- Déduction progressive grâce aux indications plus/moins.
- Jauge de proximité colorée.
- Seuil de réussite explicite.
- Mode entraînement illimité.
- Résultat partageable sans révéler la réponse.

**À retenir pour notre projet**

Les tentatives successives créent une petite tension ludique. C'est une bonne mécanique pour les nombres dont le joueur ne connaît pas du tout l'ordre de grandeur.

#### 5. Global Habit

Site : https://www.globalhabit.app/

**Principe**

Comparer deux pays sur une statistique : population, superficie, PIB par habitant, altitude, médailles olympiques, etc. Le joueur doit déterminer quelle valeur est la plus élevée.

Son défi quotidien, Daily Five, propose cinq comparaisons communes à tous les joueurs.

**Mécaniques intéressantes**

- Comparaison immédiate plutôt que saisie d'un nombre.
- Streak de bonnes réponses.
- Défi quotidien partagé par tous.
- Mode sans fin pour continuer à jouer.
- Apprentissage indirect par confrontation de données.

**À retenir pour notre projet**

Le jeu montre qu'on peut apprendre des ordres de grandeur sans demander systématiquement de saisir un nombre. La comparaison est un format à intégrer dans notre éventail de questions.

**Bilan de cette famille**

Cifra et Estimania sont les concurrents les plus proches du format quiz numérique. Magnitudle est particulièrement intéressant pour la diversité des modes. Popdle et Global Habit apportent des mécaniques de déduction et de comparaison.

---

### B. Les jeux de connaissances et de culture générale

Ces références sont moins proches du gameplay numérique, mais elles sont intéressantes pour comprendre comment structurer un vaste catalogue de connaissances et donner envie de l'explorer.

#### 6. WikiMaster

Site : https://wikimaster.com/

**Principe**

WikiMaster associe des articles Wikipédia à des quiz. Le joueur peut découvrir un article, répondre aux questions correspondantes, créer ses propres quiz et défier d'autres utilisateurs.

**Mécaniques intéressantes**

- Une question est rattachée à une connaissance et à un contenu documentaire.
- Questions organisées par sujet et par article.
- Possibilité de créer des quiz personnalisés.
- Progression et reconnaissance par sujet.
- Défis entre joueurs, scores et badges.

**À retenir pour notre projet**

Une réponse ne devrait pas être un fait isolé. Elle peut être une porte d'entrée vers une petite fiche de connaissance, avec du contexte, une explication et des faits connexes.

#### 7. Sporcle

Site : https://www.sporcle.com/

**Principe**

Une immense bibliothèque de quiz thématiques, souvent chronométrés, avec des formats variés : retrouver des pays, des capitales, des noms, des dates ou des éléments d'une liste.

**Mécaniques intéressantes**

- Quiz très spécialisés.
- Chronomètre et pression ludique.
- Progression visible dans une liste de réponses.
- Rejouabilité et comparaison des scores.
- Contenus créés et enrichis par la communauté.

**À retenir pour notre projet**

Varier la forme de restitution permet de tester une même connaissance différemment : reconnaître, retrouver, compléter, classer ou répondre sous contrainte de temps.

---

### C. Les outils qui savent réellement faire mémoriser

C'est probablement la famille la plus importante pour différencier notre projet. Les jeux d'estimation évaluent la proximité d'une réponse, mais ils ne garantissent pas que le joueur saura retrouver la valeur plusieurs jours après.

#### 8. Anki

Site : https://apps.ankiweb.net/

**Principe**

Des cartes de révision qui reviennent à intervalles calculés selon la capacité de mémorisation du joueur.

Après avoir vu la réponse, l'utilisateur indique s'il ne s'en souvenait pas, s'il l'a retrouvée difficilement ou facilement. Cette évaluation influence la prochaine révision.

**Mécaniques intéressantes**

- Rappel actif : essayer de retrouver la réponse avant de la voir.
- Répétition espacée : revoir une connaissance au bon moment.
- Adaptation des intervalles à la difficulté individuelle.
- Suivi de la rétention et des révisions.
- Réapparition des connaissances oubliées.

**À retenir pour notre projet**

C'est la référence pédagogique majeure. Une question ne devrait pas être considérée comme acquise simplement parce que le joueur a donné la bonne réponse une fois.

#### 9. Quizlet

Site : https://quizlet.com/

**Principe**

Des fiches de connaissances qui peuvent être apprises avec plusieurs modalités : cartes, reconnaissance, restitution et répétition espacée.

**Mécaniques intéressantes**

- Plusieurs modes pour une même information.
- Évaluation de la facilité de mémorisation.
- Révisions organisées selon les difficultés.
- Création de collections de fiches.
- Apprentissage autonome par petites sessions.

**À retenir pour notre projet**

Une même donnée peut être abordée sous différentes formes. Par exemple, reconnaître que le corps humain compte environ 206 os, puis retrouver ce nombre sans proposition, puis le replacer dans une question de contexte.

#### 10. Duolingo

Site : https://www.duolingo.com/

**Principe**

Des sessions courtes, une progression structurée, des exercices variés et une gamification très visible.

**Mécaniques intéressantes**

- Streak quotidien pour installer une habitude.
- Progression par niveaux et unités.
- XP, ligues et classements.
- Révision des notions déjà rencontrées.
- Récompenses et objectifs intermédiaires.

**À retenir pour notre projet**

La progression doit être visible et gratifiante. Le joueur doit comprendre qu'il avance, même si la connaissance acquise est abstraite.

**Vigilance**

Ne pas faire passer la conservation du streak avant l'apprentissage lui-même.

---

### D. Les mécaniques de rendez-vous quotidien et de partage

Cette dernière famille apporte moins de contenu pédagogique, mais elle est essentielle pour la rétention et la diffusion du jeu.

| Référence    | Mécanique                     | Ce qu'on peut reprendre                                      |
| ------------ | ----------------------------- | ------------------------------------------------------------ |
| Wordle       | Un défi identique chaque jour | Un rendez-vous collectif et une règle immédiatement comprise |
| Cifra        | Cinq questions quotidiennes   | Un format court et un résultat partageable                   |
| Global Habit | Défi Daily Five               | Comparer ses résultats à ceux des autres                     |
| Duolingo     | Streak et ligues              | Installer une habitude et rendre les progrès visibles        |

**Le point commun :** le joueur doit pouvoir terminer une session rapidement, comprendre son résultat et avoir une bonne raison de revenir le lendemain.

---

## 3. Synthèse des mécaniques à reprendre

Voici les mécaniques qui semblent les plus intéressantes pour notre jeu, classées par fonction.

### Faire jouer et donner envie de revenir

| Mécanique              | Référence            | Intérêt pour notre projet                         |
| ---------------------- | -------------------- | ------------------------------------------------- |
| Défi quotidien commun  | Cifra, Wordle        | Créer un rendez-vous et faciliter la comparaison  |
| Session courte         | Cifra, Estimania     | Limiter la friction d'entrée                      |
| Streak                 | Duolingo, Popdle     | Encourager la régularité                          |
| Progression et niveaux | Duolingo, WikiMaster | Donner une sensation d'avancement                 |
| Classement             | Cifra, WikiMaster    | Ajouter une dimension compétitive                 |
| Partage visuel         | Wordle, Popdle       | Faire connaître le jeu sans dévoiler les réponses |

### Apprendre et mémoriser

| Mécanique                   | Référence             | Intérêt pour notre projet                     |
| --------------------------- | --------------------- | --------------------------------------------- |
| Réponse numérique libre     | Cifra, Estimania      | Obliger à produire une réponse                |
| Estimation progressive      | Popdle, Tenish        | Aider à comprendre les ordres de grandeur     |
| Comparaison de valeurs      | Global Habit          | Apprendre par confrontation                   |
| Explication après réponse   | WikiMaster, Estimania | Donner du sens au chiffre                     |
| Répétition espacée          | Anki, Quizlet         | Installer la mémorisation durable             |
| Rappel actif                | Anki                  | Vérifier que la donnée est réellement retenue |
| Modes de restitution variés | Quizlet, Magnitudle   | Éviter de toujours poser la même question     |

### Organiser et valoriser les connaissances

| Mécanique              | Référence           | Intérêt pour notre projet                   |
| ---------------------- | ------------------- | ------------------------------------------- |
| Collection de fiches   | Quizlet, WikiMaster | Donner une valeur durable aux connaissances |
| Catégories thématiques | Sporcle, WikiMaster | Structurer l'exploration                    |
| Progression par sujet  | WikiMaster          | Visualiser les domaines maîtrisés           |
| Historique personnel   | Magnitudle, Anki    | Retrouver ses résultats et ses lacunes      |
| Source documentaire    | Cifra, Magnitudle   | Renforcer la crédibilité des chiffres       |

---

## 4. Proposition de transposition à notre jeu

L'expérience pourrait s'articuler autour de cinq étapes.

### 01. Découvrir — Le défi du jour

Une question courte, une donnée surprenante, un chiffre à retrouver.

Exemple : « Combien de battements le cœur humain effectue-t-il en moyenne en une journée ? »

**Inspirations :** Cifra, Estimania, Wordle.

### 02. Comprendre — La révélation

Afficher la réponse, une explication courte, une comparaison qui donne une échelle concrète et une source.

Exemple : « Environ 100 000 battements. C'est plus de 36 millions par an. »

**Inspirations :** WikiMaster, Magnitudle.

### 03. Mémoriser — La révision intelligente

Reposer la question après un délai adapté. Modifier progressivement la forme : QCM, estimation, réponse libre, comparaison.

**Inspirations :** Anki, Quizlet.

### 04. Collectionner — La bibliothèque de connaissances

Chaque donnée maîtrisée rejoint une collection : corps humain, espace, animaux, Terre, histoire…

On peut visualiser les connaissances découvertes, en cours d'acquisition et acquises.

**Inspirations :** WikiMaster, Quizlet.

### 05. Progresser et partager — Le bilan personnel

Score quotidien, progression dans les collections, connaissances retrouvées après plusieurs jours, résultat partageable.

**Inspirations :** Duolingo, Cifra, Wordle.

---

## 5. Quelques mécaniques à approfondir

### 5.1. Une progression de maîtrise en plusieurs états

Ne pas confondre la réussite ponctuelle avec la connaissance acquise.

| État      | Signification                                                  |
| --------- | -------------------------------------------------------------- |
| Inconnu   | La réponse n'est pas connue                                    |
| Découvert | La réponse a été vue et comprise                               |
| En cours  | La réponse est retrouvée avec difficulté                       |
| Acquis    | La réponse est retrouvée correctement à plusieurs reprises     |
| Maîtrisé  | La réponse est retrouvée correctement après un délai important |

Cela permettrait de faire de la collection une véritable représentation de la mémoire.

### 5.2. Des questions qui évoluent avec la maîtrise

Une donnée pourrait être découverte en QCM, puis révisée en estimation, puis demandée en réponse libre.

Exemple :

- Première rencontre : « Quelle est la population approximative de la France ? » avec quatre propositions.
- Première révision : « Estime la population de la France. »
- Révision suivante : « Combien d'habitants compte la France ? »
- Dernière étape : retrouver la donnée après plusieurs semaines.

L'objectif est de passer progressivement de la reconnaissance à la restitution autonome.

### 5.3. Des collections qui donnent envie d'explorer

Quelques exemples de grandes catégories :

| Collection      | Exemples de connaissances                  |
| --------------- | ------------------------------------------ |
| Le corps humain | Os, cellules, battements, neurones…        |
| L'espace        | Distances, masses, étoiles, planètes…      |
| La Terre        | Océans, montagnes, climats, population…    |
| Le vivant       | Animaux, végétaux, biodiversité…           |
| Les sociétés    | Population, villes, économie, démographie… |
| L'histoire      | Dates, durées, quantités, évolutions…      |

### 5.4. Des chiffres étonnants, mais fiables

La surprise est un puissant moteur de curiosité. Mais chaque chiffre doit être accompagné de son contexte :

- Année de référence.
- Source.
- Unité.
- Périmètre de la donnée.
- Éventuelle approximation.

C'est particulièrement important pour les données qui évoluent.

---

## 6. Priorisation du benchmark

Toutes les références ne méritent pas le même niveau d'analyse.

| Priorité | Référence    | Axe d'analyse                                |
| -------- | ------------ | -------------------------------------------- |
| 1        | Cifra        | Concurrent direct : gameplay, score, partage |
| 2        | Magnitudle   | Formats numériques et visualisation          |
| 3        | Anki         | Mémorisation et répétition espacée           |
| 4        | WikiMaster   | Organisation des connaissances et collection |
| 5        | Quizlet      | Modes de restitution et révision             |
| 6        | Duolingo     | Rétention, progression et gamification       |
| 7        | Popdle       | Déduction et feedback progressif             |
| 8        | Global Habit | Comparaison et défi collectif                |

---

## 7. Conclusion et positionnement potentiel

Il existe déjà des jeux qui font jouer avec des chiffres, et des outils qui savent très bien faire mémoriser des informations.

En revanche, parmi les références étudiées, on ne voit pas encore de produit qui combine aussi clairement les trois dimensions :

- Quiz quotidien sur les grands nombres qui décrivent le monde.
- Mémorisation à long terme.
- Collection de connaissances maîtrisées.

C'est là que notre positionnement peut devenir intéressant.

Ce n'est pas simplement un quiz de culture générale avec des réponses numériques : c'est un jeu qui cherche à transformer des chiffres étonnants en connaissances durables.

### Les trois axes de différenciation

**1. Le chiffre comme connaissance**

La valeur exacte est au cœur de l'expérience. Le joueur ne cherche pas seulement à deviner un ordre de grandeur, mais à retenir une information précise.

**2. La mémorisation comme progression**

La progression ne dépend pas uniquement du nombre de bonnes réponses ou du temps passé dans le jeu. Elle dépend de la capacité à retrouver une donnée après plusieurs jours ou semaines.

**3. La collection comme récompense durable**

Les connaissances découvertes et maîtrisées constituent une bibliothèque personnelle. Elle matérialise ce que le joueur a réellement appris.

### Question stratégique

Est-ce que le jeu doit surtout apprendre aux joueurs à _estimer les grands nombres_, ou leur faire _retenir les chiffres qui décrivent le monde_ ?

Ce sont deux promesses différentes. La seconde semble constituer le territoire de différenciation le plus intéressant pour notre projet.
