# Numero

Jeu éducatif : retenir au chiffre près les nombres qui régissent le monde.
Décisions de conception : [docs/DECISIONS.md](docs/DECISIONS.md).

```bash
npm install
npm run dev
```

## Réglages de test

`?meca=slider|palier|qcm|plusmoins&score=tolerance|exact|progressif` — `&reset=1` efface la partie du jour, `&jour=N` force un numéro de défi.
Le panneau « Réglages de test » en bas de page permet de rejouer le défi, de naviguer entre les jours (#N−1, #N+1), d'effacer les stats et de lancer les 12 combinaisons.

## Contenu

Questions : `src/data/questions.json` (format : `src/lib/types.ts`). Seules les fiches `"statut": "valide"` sont jouées.
Consignes des agents de contenu : `docs/agents/`.
