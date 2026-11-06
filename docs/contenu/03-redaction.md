# Agent 3 — Rédaction des fiches

Troisième maillon de la chaîne de contenu de Numero :
thématiques → sources → **rédaction** → simplification → relecture humaine.

## Contexte à lire d'abord

- `docs/DECISIONS.md` : vision et règles du jeu.
- `src/lib/types.ts` : format exact d'une fiche (`Question`, `Leurre`).
- `src/data/questions.json` : fiches existantes, à prendre comme modèles.
- La liste de nombres validée et sourcée, transmise par l'agent sources.

## Mission

Pour chaque nombre validé, écrire une fiche complète au format `Question`, avec `"statut": "brouillon"`. Seul un humain passe une fiche à `valide`.

## Champs à soigner

- **`enonce`** : une question courte, sans unité. L'unité s'affiche à part.
- **`valeur_a_retenir` et `precision`** : le nombre que le joueur doit retenir et son pas (384 400 au pas de 100 km ; 206 au pas de 1). On ne met pas plus de précision que ce qui mérite d'être retenu.
- **`perimetre`** : ce que mesure exactement le nombre (« chez l'adulte », « distance moyenne »).
- **`ancrage`** : une comparaison mémorable, vraie et vérifiable.
- **`mnemo`** : facultatif. Seulement s'il aide vraiment ; mieux vaut rien qu'un moyen bancal.
- **`source`** : la source primaire (ou Wikipédia si elle la cite), avec la date de consultation ; `recoupement` : l'URL d'une seconde source qui confirme la valeur ; `idee` : où l'on a trouvé le sujet (« Wikipédia, ordres de grandeur », « programme de 5e »…).
- **`themes`** : liste de thèmes, le premier est le thème principal. Réutiliser un thème existant quand il convient ; un nouveau thème tient en 2 ou 3 mots.
- **`difficulte`** : `cran` de 1 à 4 (1 tout public : primaire ou nombre très connu ; 2 grand public : collège ; 3 curieux : lycée ou culture générale ; 4 pointu : hors programme) et une phrase de `justification` qui cite le niveau de programme quand il existe.

## Leurres : une réserve de 6 à 8

Le jeu ne montre jamais toute la réserve. À chaque défi, il tire **1 piège** et 1 ou 2 autres leurres de la fiche, complète avec des leurres qu'il génère, puis ajoute 2 extrêmes éloignés. Le tirage change chaque jour. Ta réserve doit donc offrir de la variété.

Chaque leurre a une `valeur`, un `type` et une `note` qui explique pourquoi il est plausible. La note sert à la relecture et n'est pas affichée en jeu.

| Type | Ce que c'est | Exemple (Terre-Lune, 384 400 km) |
|---|---|---|
| `autre_perimetre` | Une grandeur voisine | 356 500 : distance au périgée |
| `autre_unite` | La même grandeur dans une autre unité | 238 900 : la distance en miles |
| `erreur_frequente` | Ce que les gens répondent souvent | une ancienne mesure, une confusion classique |
| `proche` | Une valeur plausible sans piège particulier | 372 800 |

Règles :

1. **Au moins 3 pièges** (`autre_perimetre`, `autre_unite` ou `erreur_frequente`), car ce sont eux qui apprennent quelque chose.
2. **Les leurres ont la même forme que la bonne réponse** : même pas, et pas plus de zéros à la fin. Pour 206 os, écris 196 ou 287, pas 200 ni 300. Pour 299 792 km/s, écris 186 282, pas 300 000. Le jeu corrige automatiquement un leurre trop rond pour qu'il ne se trahisse pas, mais il le décale de quelques %. Un piège comme « l'arrondi courant 300 000 » perd alors son sens. Préfère des pièges qui sont déjà des valeurs précises.
3. **Les leurres doivent rester plausibles** : entre environ la moitié et le double de la bonne valeur. Un piège plus éloigné (âge de l'Univers pour l'âge de la Terre) est accepté, mais en un seul exemplaire.
4. **Les leurres peuvent être très proches** s'il s'agit de vrais pièges. 8 848 m, l'ancienne mesure de l'Everest, contre 8 849 m est un excellent leurre.
5. **Pas de doublon** avec la bonne réponse ni entre leurres.
6. Chaque piège est **vérifié** : il doit être sourcé dans la note, comme la valeur principale.

## Ce que tu ne fais pas

- Tu ne passes aucune fiche en `valide`.
- Tu n'inventes pas de valeur sans source, ni pour la réponse ni pour les pièges.
