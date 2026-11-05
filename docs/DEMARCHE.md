# Numero — la démarche pour aller au-delà du prototype

Ce document est le **fil conducteur entre les sessions de travail**. Chaque nouvelle session commence par le lire, et le met à jour en fin de session (cases cochées, prochaine étape).

Point de départ (2026-11-05) : un prototype jouable en ligne (https://hugobqd.github.io/numero/), 60 questions en brouillon, décisions dans `docs/DECISIONS.md`, idées dans `docs/IDEES.md`.

## Principe

Six chantiers, mais **pas six agents permanents** :

| Chantier | Nature | Outil |
|---|---|---|
| Recherche UX | s'observe | tests de couloir sur le prototype, `/to-questionnaire`, `/research` |
| Game design, gamification, viralité | se décide | tickets de décision `/wayfinder`, `/prototype` pour tester une mécanique |
| Direction artistique, UI, wording | se décide puis s'exécute | tickets de décision, skill `design-taste-frontend` |
| Contenu pédagogique | se produit à la chaîne | **agents dédiés** (`docs/contenu/`), relecture humaine obligatoire |
| Backlog et roadmap | s'organise | carte `/wayfinder` + issues GitHub |
| Direction technique | se décide | ADR via `/grill-with-docs`, puis `/to-spec` → `/to-tickets` → `/implement` |

## Les étapes

- [ ] **1. Tests de couloir** (toi, en parallèle de tout le reste). 3 tâches (premier défi, défi du jour, collection), 3 questions (« à quoi sert ce jeu ? », « quel nombre retiens-tu ? », « tu rejouerais demain ? »). Noter par personne : mécanique, score, 2 blocages, nombre retenu. Optionnel : `/to-questionnaire` pour un questionnaire propre.
- [ ] **2. Configuration** — session dédiée : `/setup-matt-pocock-skills`. Issues GitHub de `hugobqd/numero` comme backlog, `GLOSSARY.md` + `docs/adr/` à la racine, bloc « Agent skills » dans un `CLAUDE.md` (à créer).
- [ ] **3. Vocabulaire et premières décisions** — session dédiée : `/grill-with-docs`. Produit `GLOSSARY.md` (fiche, leurre, piège, défi, palier, maîtrise, cycle, révision…) et des ADR pour ce qui est déjà tranché (site statique, données locales, palier par défaut, collection de toutes les fiches jouées…). Source : `docs/DECISIONS.md`.
- [ ] **4. La carte** — session dédiée, après les premiers retours de tests : `/wayfinder`. Destination à formuler (proposition : « une v1 publiable : plan de contenu, boucle de jeu et de rétention, charte visuelle, choix techniques »). Les six chantiers deviennent des étiquettes ; `docs/IDEES.md` et les retours de tests fournissent les premiers tickets de décision.
- [ ] **5. Résoudre les tickets de décision** — une session par ticket (ou deux tickets courts), en suivant la carte.
- [ ] **6. Construire** — quand une zone de la carte est claire : `/to-spec` → `/to-tickets` → `/implement` (une session par ticket, `/clear` entre deux).
- [ ] **7. Industrialiser le contenu** — transformer `docs/contenu/` en agents (`.claude/agents/*.md`) : thématiques → sources → rédaction → relecture. Peut démarrer dès que la carte a tranché le découpage des séries (thèmes, niveaux).

## Hygiène des sessions

- **Une session = une étape** (ou un ticket). On ne mélange pas configuration, interview et construction dans la même fenêtre.
- **Au-delà d'environ 150k tokens**, la qualité baisse : on s'arrête à la frontière d'étape la plus proche.
- **En fin de session** : cocher ici, écrire la prochaine étape ci-dessous, commiter. Les décisions vivent dans les ADR, le glossaire, les tickets et `DECISIONS.md`, jamais seulement dans la conversation.
- **Entre deux étapes** : nouvelle session (le contexte est dans le repo) ; `/compact` seulement si l'étape suivante a besoin du raisonnement de la précédente.
- Le site en ligne n'est republié que sur demande (un push sur `main` = un déploiement public).

## Prochaine étape

**Étape 2 : configuration.** Ouvrir une nouvelle session dans `~/Sites/numero` et lancer :

> Lis docs/DEMARCHE.md, puis lance /setup-matt-pocock-skills.

En parallèle : commencer les tests de couloir (étape 1).
