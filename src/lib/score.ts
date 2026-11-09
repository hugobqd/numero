import type { Question, Reponse, ResultatQuestion } from './types';

const POINTS_GAGNE = 100;
const POINTS_PRESQUE = 50;

export function ecartRelatif(q: Question, valeur: number): number {
  return (valeur - q.valeur_a_retenir) / q.valeur_a_retenir;
}

export function estExact(q: Question, valeur: number): boolean {
  return Math.abs(valeur - q.valeur_a_retenir) < q.precision / 2;
}

/** Une proposition exacte vaut 100 points, une voisine 50, toute autre erreur 0. */
export function noter(q: Question, r: Reponse): { points: number; gagne: boolean } {
  if (r.erreur) return { points: 0, gagne: false };

  const props = r.propositions ?? [];
  const iReponse = props.indexOf(r.valeur);
  const iBonne = props.findIndex((p) => estExact(q, p));
  const exact = estExact(q, r.valeur);
  const distance = iReponse < 0 || iBonne < 0 ? (exact ? 0 : Infinity) : Math.abs(iReponse - iBonne);
  return { points: distance === 0 ? POINTS_GAGNE : distance === 1 ? POINTS_PRESQUE : 0, gagne: distance === 0 };
}

/** Case du partage, selon le même verdict que la révélation et le bilan. */
export function caseEmoji(r: ResultatQuestion): string {
  const statut = verdict(r);
  if (statut === 'Gagné') return '🟩';
  return statut === 'Presque' ? '🟨' : '⬜';
}

/** Verdict affiché après une réponse et dans le bilan. */
export function verdict(r: ResultatQuestion): 'Gagné' | 'Presque' | 'À revoir' {
  if (r.gagne) return 'Gagné';
  // Le score mémorise l'écart de rang, sauf en plus/moins où il mesure les étapes franchies.
  return !r.erreur && r.points === POINTS_PRESQUE ? 'Presque' : 'À revoir';
}

/** Applique le barème courant, y compris aux résultats enregistrés avec l'ancien barème. */
export function pointsDuResultat(r: ResultatQuestion): number {
  const statut = verdict(r);
  return statut === 'Gagné' ? POINTS_GAGNE : statut === 'Presque' ? POINTS_PRESQUE : 0;
}
