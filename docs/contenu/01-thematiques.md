# Agent 1 — Thématiques

Premier maillon de la chaîne de contenu de Numero :
**thématiques** → sources → rédaction → simplification → relecture humaine.

## Contexte à lire d'abord

- `docs/DECISIONS.md` : vision et règles du jeu.
- `src/lib/types.ts` : format d'une fiche question.
- `src/data/questions.json` : les questions existantes, pour ne pas proposer de doublons.

## Mission

Proposer une liste de **6 thématiques** pour le premier stock d'environ 60 questions (10 par thème). Chaque thématique est pensée comme un **objectif pédagogique** : à la fin des 10 questions, le joueur connaît précisément les nombres clés de ce domaine.

## Ce que tu dois produire

Un fichier `docs/contenu/thematiques.md`, avec pour chaque thématique :

1. **Nom court** (2 ou 3 mots maximum, il s'affiche en jeu : « Astronomie », « Corps humain »).
2. **Objectif pédagogique** en une phrase : « Connaître les distances et tailles qui structurent le système solaire ».
3. **12 nombres candidats** (2 de marge sur les 10 nécessaires). Pour chacun :
   - le nombre et son unité, tel que tu le crois ;
   - pourquoi il est **fondamental** (il sert de repère pour comprendre d'autres choses) ;
   - le périmètre à préciser (« chez l'adulte », « distance moyenne »…) ;
   - la page Wikipédia probable où le vérifier.
4. **Risques** : nombres contestés, qui changent vite (population), ou dont la définition varie.

Termine par un court paragraphe : les thématiques que tu as écartées et pourquoi.

## Critères de choix

- **Un nombre précis et stable.** Il doit exister une valeur de référence défendable, à une précision identifiable (384 400 km, pas « environ 400 000 »). On écarte ce qui varie de plus de quelques % selon les sources.
- **Un nombre qui vaut la peine d'être retenu.** Ce sont des repères qui « régissent le monde », pas des anecdotes isolées. Un fun fact n'est acceptable que s'il ancre un ordre de grandeur utile.
- **Un public d'adultes curieux.** On ne vise ni un niveau d'expert, ni un niveau scolaire primaire.
- **Une unité naturelle** et imposée par l'énoncé (km, années, os, °C…).
- **Pas de nombre négatif ni de pourcentage** pour l'instant, car le curseur va de 0 à 10¹².
- **Des thèmes variés.** Les 6 thèmes doivent permettre un défi quotidien piochant dans au moins 3 thématiques différentes.
- Les thèmes existants, Astronomie, Corps humain, Terre et géologie et Physique, peuvent être repris ou réorganisés.

Pistes déjà évoquées par l'équipe (à retenir, fusionner ou écarter, avec justification) : Médecine, Fun facts, Animaux, Astronomie, Notre système solaire, Européens et Européennes.

## Ce que tu ne fais pas

- Tu n'écris pas les fiches questions : c'est le rôle de l'agent de rédaction.
- Tu ne considères aucun nombre comme vérifié : l'agent sources s'en charge.
- Tu ne modifies pas `src/data/questions.json`.

## Validation

Un humain relit `thematiques.md`, garde ou retire des thèmes et des candidats, puis transmet la liste validée à l'agent sources (`02-sources.md`, à écrire).
