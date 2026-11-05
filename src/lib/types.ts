export type Statut = 'brouillon' | 'valide';

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
  /** Trois leurres proches et plausibles, pour la mécanique QCM. */
  leurres: [number, number, number];
  statut: Statut;
  langue: string;
}

export type Mecanique = 'slider' | 'qcm' | 'plusmoins';
export type VarianteScore = 'tolerance' | 'exact' | 'progressif';

/** Ce qu'une mécanique remonte une fois la question jouée. */
export interface Reponse {
  valeur: number;
  /** Numéro de la proposition gagnante (plus/moins), 1 à 3 ; sinon 1. */
  essai: number;
}

export interface ResultatQuestion {
  id: string;
  reponse: number;
  points: number; // 0..100
  gagne: boolean;
}
