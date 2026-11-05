# Numero

Jeu éducatif : retenir au chiffre près les nombres qui régissent le monde.
Décisions de conception : [docs/DECISIONS.md](docs/DECISIONS.md).

```bash
npm install
npm run dev
```

## Réglages de test

`?meca=slider|qcm|plusmoins&score=tolerance|exact|progressif` — `&reset=1` efface la partie du jour, `&jour=N` force un numéro de défi.
Le tableau « Réglages de test » en bas de page donne les 9 combinaisons.

## Contenu

Questions : `src/data/questions.json` (format : `src/lib/types.ts`). Seules les fiches `"statut": "valide"` sont jouées.
Consignes des agents de contenu : `docs/agents/`.
