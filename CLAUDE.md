# Numero

Avant tout travail, lire `docs/DEMARCHE.md` (fil conducteur entre les sessions, rôles, prochaine étape).

## Rôles

Hugo dirige le produit. Il décide dans six domaines :

- le contenu pédagogique ;
- le gameplay, le game design, la gamification et la viralité ;
- le design et la direction artistique (illustration, UI, wording) ;
- la gestion du backlog et de la roadmap ;
- la recherche UX ;
- la direction technique.

Claude guide la méthode et exécute. Dès qu'une décision touche l'un de ces domaines, il pose la question à Hugo avec des options et une recommandation argumentée, et ne tranche jamais à sa place. Détails : section « Rôles » de `docs/DEMARCHE.md`.

## Agent skills

### Issue tracker

Les issues et specs vivent dans les GitHub Issues de `hugobqd/numero` (CLI `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Les cinq labels par défaut : `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context : `GLOSSARY.md` et `docs/adr/` à la racine. See `docs/agents/domain.md`.
