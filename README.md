# Numero

Jeu éducatif : retenir au chiffre près les nombres qui régissent le monde.
Décisions de conception : [docs/DECISIONS.md](docs/DECISIONS.md).

```bash
npm install
npm run dev
```

## Réglages de test

`?meca=slider|palier|qcm|plusmoins&score=progressif|exact` — `&reset=1` efface la partie du jour, `&jour=N` force un numéro de défi.
Le panneau « Réglages de test » en bas de page permet de rejouer le défi, de naviguer entre les jours (#N−1, #N+1), d'effacer les stats et de lancer les 8 combinaisons.

## Contenu

Questions : tous les fichiers `src/data/*.json` (format : `src/lib/types.ts`), un par thématique. Dans le prototype, les brouillons sont joués aussi (`?brouillons=0` pour ne garder que les fiches validées).

```bash
npm run verifier   # contrôle les fiches (format, pas, leurres)
```
Consignes des agents de contenu : `docs/agents/`.
