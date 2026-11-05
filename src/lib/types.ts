export type Statut = 'brouillon' | 'valide';

/**
 * Nature d'un leurre :
 * - `erreur_frequente` : valeur que les gens donnent souvent (ancienne mesure, arrondi courant…)
 * - `autre_unite` : la bonne grandeur exprimée dans une autre unité (miles au lieu de km…)
 * - `autre_perimetre` : une grandeur voisine (périgée au lieu de distance moyenne, nouveau-né au lieu d'adulte…)
 * - `proche` : simple valeur plausible, sans piège particulier
 */
export type TypeLeurre = 'erreur_frequente' | 'autre_unite' | 'autre_perimetre' | 'proche';

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
  source: { url: string; consulte_le: string };
  thematique: string;
  /**
   * Réserve de leurres écrits à la main (6 à 8 visés, 3 au minimum). Le jeu en tire
   * quelques-uns à chaque défi et complète avec des leurres générés (voir propositions.ts).
   */
  leurres: Leurre[];
  statut: Statut;
  langue: string;
}

export type Mecanique = 'slider' | 'palier' | 'qcm' | 'plusmoins';
export type VarianteScore = 'tolerance' | 'exact' | 'progressif';

/** Ce qu'une mécanique remonte une fois la question jouée. */
export interface Reponse {
  valeur: number;
  /** Nombre de coups joués (plus/moins) ; 1 sinon. */
  essai: number;
  /** Propositions triées parmi lesquelles le joueur a choisi (QCM, palier, plus/moins). */
  propositions?: number[];
}

export interface ResultatQuestion {
  id: string;
  reponse: number;
  points: number; // 0..100
  gagne: boolean;
}
