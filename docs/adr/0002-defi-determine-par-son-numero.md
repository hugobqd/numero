# Le contenu d'un défi est déterminé par son numéro

Les défis forment un parcours fixe (#1, #2, #3…), le même pour tous ; chaque joueur avance dans ce parcours à son rythme, un défi par jour au plus. Les fiches d'un défi et le tirage de leurs propositions sont calculés dans le navigateur à partir du seul numéro du défi (tirage déterministe), si bien que deux joueurs qui jouent le #12 voient exactement les mêmes questions, sans serveur pour les distribuer (voir ADR 0001).

## Options écartées

- **Un défi du jour commun à tous** (façon Wordle) : il maximise la conversation du jour, mais un nouveau joueur tomberait en plein milieu de la progression. On a préféré une progression pédagogique écrite à l'avance, qui commence par la culture générale grand public. Un défi commun en bonus reste envisageable plus tard.
- **Un défi propre à chaque joueur** : il rendrait le partage impossible à comparer.
