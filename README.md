# Numero

Jeu éducatif : retenir au chiffre près les nombres qui régissent le monde.

**À jouer en ligne : https://hugobqd.github.io/numero/** (prototype, données dans le navigateur).

Décisions de conception : [docs/DECISIONS.md](docs/DECISIONS.md).

```bash
npm install
npm run dev
```

## Réglages de test

`?meca=slider|palier|qcm|plusmoins&score=progressif|exact` — `&reset=1` efface la partie du jour. Les joueurs et les jours sont simulés : bouton « Nouveau joueur », puis « Simuler le jour suivant » ou ← / → dans le panneau de test.
Le petit bouton ⚙ en bas à droite ouvre les outils de test, qui permettent de changer de jour simulé, de rejouer le défi, de changer de joueur, de revoir le tuto, d’effacer les stats ou la collection, et de lancer les 8 combinaisons.

## Contenu

Questions : tous les fichiers `src/data/*.json` (format : `src/lib/types.ts`), un par thématique. Dans le prototype, les brouillons sont joués aussi (`?brouillons=0` pour ne garder que les fiches validées).

```bash
npm run verifier   # contrôle les fiches (format, pas, leurres)
```
Consignes des agents de contenu : `docs/agents/`.

## Mise en ligne

Le site est publié sur GitHub Pages par `.github/workflows/deploy.yml` à chaque push sur `main` : contrôle des fiches, build, puis déploiement. Le build utilise des chemins relatifs (`base: './'`) et fonctionne donc dans le sous-dossier `/numero/`. Les données des joueurs restent dans leur navigateur.
