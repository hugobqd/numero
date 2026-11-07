import type { Question, Reponse, ResultatQuestion } from './types';

/** Points selon l'écart de rang entre la réponse et la bonne proposition (0 = bonne, 1 = voisine…). */
export const POINTS_PAR_RANG = [100, 50, 20];
/** Plus/moins : points si l'on perd au coup 1, 2 ou 3 (gagné = 100). */
export const POINTS_PLUSMOINS_PERDU = [0, 20, 50];

export function ecartRelatif(q: Question, valeur: number): number {
  return (valeur - q.valeur_a_retenir) / q.valeur_a_retenir;
}

export function estExact(q: Question, valeur: number): boolean {
  return Math.abs(valeur - q.valeur_a_retenir) < q.precision / 2;
}

/**
 * Score progressif (le seul) : la réponse est toujours l'une des propositions.
 * Points selon le rang : bonne proposition 100, voisine 50, deux crans plus loin 20, au-delà 0.
 * Plus/moins : un mauvais choix fait perdre la question tout de suite ; les étapes franchies
 * avant l'erreur rapportent des points (perdu au coup 1 : 0, 2 : 20, 3 : 50).
 */
export function noter(q: Question, r: Reponse): { points: number; gagne: boolean } {
  if (r.erreur) return { points: POINTS_PLUSMOINS_PERDU[r.essai - 1] ?? 0, gagne: false };

  const props = r.propositions ?? [];
  const iReponse = props.indexOf(r.valeur);
  const iBonne = props.findIndex((p) => estExact(q, p));
  const exact = estExact(q, r.valeur);
  const distance = iReponse < 0 || iBonne < 0 ? (exact ? 0 : Infinity) : Math.abs(iReponse - iBonne);
  return { points: POINTS_PAR_RANG[distance] ?? 0, gagne: distance === 0 };
}

/** Case du partage : 🟩 gagné, 🟨 des points sans gagner, 🟥 sinon. */
export function caseEmoji(points: number, gagne: boolean): string {
  if (gagne) return '🟩';
  return points > 0 ? '🟨' : '🟥';
}

/** Qualificatif du résultat d'une question, affiché à la révélation et aux bilans. */
export function verdict(q: Question, r: ResultatQuestion): 'Pile !' | 'Gagné' | 'Presque' | 'Raté' | 'Mauvaise échelle' {
  if (estExact(q, r.reponse)) return 'Pile !';
  if (r.gagne) return 'Gagné';
  if (r.points > 0) return 'Presque';
  if (r.erreur) return 'Raté';
  if (r.reponse <= 0 || Math.abs(Math.log10(r.reponse / q.valeur_a_retenir)) >= 1) return 'Mauvaise échelle';
  return 'Raté';
}
