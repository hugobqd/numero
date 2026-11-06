export type Statut = 'brouillon' | 'valide';

/**
 * Nature d'un leurre :
 * - `erreur_frequente` : valeur que les gens donnent souvent (ancienne mesure, arrondi courant…)
 * - `autre_unite` : la bonne grandeur exprimée dans une autre unité (miles au lieu de km…)
 * - `autre_perimetre` : une grandeur voisine (périgée au lieu de distance moyenne, nouveau-né au lieu d'adulte…)
 * - `proche` : simple valeur plausible, sans piège particulier
 */
export type TypeLeurre = 'erreur_frequente' | 'autre_unite' | 'autre_perimetre' | 'proche';

/**
 * Difficulté d'une fiche, en 4 crans repérés sur les programmes scolaires (voir GLOSSARY.md) :
 * 1 tout public (école primaire, ou nombre très connu) · 2 grand public (collège) ·
 * 3 curieux (lycée, ou culture générale) · 4 pointu (hors programme).
 */
export type CranDifficulte = 1 | 2 | 3 | 4;

export const CRANS_DIFFICULTE: Record<CranDifficulte, string> = {
  1: 'tout public',
  2: 'grand public',
  3: 'curieux',
  4: 'pointu',
};

export interface Difficulte {
  cran: CranDifficulte;
  /** Pourquoi ce cran, en citant le niveau de programme quand il existe (pour la relecture). */
  justification: string;
}

export interface Leurre {
  valeur: number;
  type: TypeLeurre;
  /** Pourquoi ce leurre est plausible (pour la relecture ; pas affiché en jeu). */
  note?: string;
}

export interface Question {
  id: string;
  enonce: string;
  /** Valeur de référence telle que donnée par la source. */
  valeur: number;
  /** Valeur que le joueur doit retenir et sur laquelle on juge le « pile ». */
  valeur_a_retenir: number;
  /** Pas d'arrondi propre à la question (100 km, 1 os, 1e7 années…). */
  precision: number;
  unite: string;
  /** Ce que mesure exactement le nombre : « chez l'adulte », « distance moyenne »… */
  perimetre: string;
  /** Comparaison mémorable affichée à la révélation. */
  ancrage: string;
  /** Moyen mnémotechnique facultatif. */
  mnemo?: string;
  source: {
    url: string;
    consulte_le: string;
    /** Seconde source qui confirme la valeur, pour la relecture (pas affichée en jeu). */
    recoupement?: string;
    /** Où l'on a trouvé le sujet (source d'idée), pour la relecture (pas affichée en jeu). */
    idee?: string;
  };
  /** Thèmes de la fiche, au moins un ; le premier est le thème principal (album, composition des défis). */
  themes: string[];
  /** Attribuée à la rédaction, confirmée à la relecture ; obligatoire pour une fiche `valide`. */
  difficulte?: Difficulte;
  /**
   * Réserve de leurres écrits à la main (6 à 8 visés, 3 au minimum). Le jeu en tire
   * quelques-uns à chaque défi et complète avec des leurres générés (voir propositions.ts).
   */
  leurres: Leurre[];
  statut: Statut;
  langue: string;
}

export type Mecanique = 'slider' | 'palier' | 'qcm' | 'plusmoins';
export type VarianteScore = 'exact' | 'progressif';

/** Ce qu'une mécanique remonte une fois la question jouée. */
export interface Reponse {
  valeur: number;
  /** Nombre de coups joués (plus/moins) ; 1 sinon. */
  essai: number;
  /** Propositions triées parmi lesquelles le joueur a choisi (QCM, palier, plus/moins). */
  propositions?: number[];
  /** Plus/moins : le mauvais choix qui a fait perdre la question. */
  erreur?: ErreurPlusMoins;
}

export interface ErreurPlusMoins {
  seuil: number;
  choix: 'plus' | 'moins';
}

export interface ResultatQuestion {
  id: string;
  reponse: number;
  points: number; // 0..100
  gagne: boolean;
  erreur?: ErreurPlusMoins;
}

/** Thème principal d'une fiche : le premier de sa liste. */
export function themePrincipal(q: Question): string {
  return q.themes[0];
}
