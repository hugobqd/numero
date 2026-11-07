# Pochettes tirées pour chaque joueur plutôt qu'un parcours commun

Remplace l'ADR 0002. Chaque joueur récupère ses fiches par pochettes de 5, tirées au hasard parmi celles qu'il n'a pas encore, avec des chances qui décroissent avec la difficulté (poids 8 / 4 / 2 / 1 du cran tout public au cran pointu) et au moins 3 thèmes par pochette. Ouvrir une pochette lance aussitôt le défi de ses 5 fiches, qui entrent ensuite dans la collection, réussies ou non (l'ADR 0003 reste valable). Comme une fiche récupérée ne ressort plus, la difficulté monte d'elle-même au fil des pochettes, sans parcours écrit à la main ; deux joueurs n'ont donc plus les mêmes défis, et le partage montre un score sans comparaison possible.

Décidé le 2026-11-07, pour tester une mécanique de collection simple : la montée en difficulté, la collectionnite et la révision selon ce que le joueur sait.

## Options écartées

- **Le parcours commun de l'ADR 0002** (le défi #12 est le même pour tous) : il rendait le partage comparable, mais obligeait à composer à la main un parcours qui monte en difficulté (ticket hugobqd/numero#8) et ne donnait aucun sentiment de récupérer des fiches. Un défi commun en bonus reste envisageable plus tard.
- **Des pochettes dont les fiches entrent dans la collection sans être jouées** : la collection se remplirait de fiches jamais vues, et le tirage prendrait le pas sur l'apprentissage.
