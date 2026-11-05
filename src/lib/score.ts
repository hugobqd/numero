import type { Mecanique, Question, Reponse, VarianteScore } from './types';

export const TOLERANCE = 0.05; // ±5 %
export const ECART_NUL = 0.5; // progressif : 0 point à ±50 %

export function ecartRelatif(q: Question, valeur: number): number {
  return (valeur - q.valeur_a_retenir) / q.valeur_a_retenir;
}

export function estExact(q: Question, valeur: number): boolean {
  return Math.abs(valeur - q.valeur_a_retenir) < q.precision / 2;
}

export function noter(
  q: Question,
  r: Reponse,
  meca: Mecanique,
  variante: VarianteScore,
): { points: number; gagne: boolean } {
  const exact = estExact(q, r.valeur);
  const ecart = Math.abs(ecartRelatif(q, r.valeur));

  // QCM et palier : on choisit parmi des propositions, seule la bonne compte.
  if (meca === 'qcm' || meca === 'palier') {
    return { points: exact ? 100 : 0, gagne: exact };
  }

  // Curseur et plus/moins : une estimation libre, notée selon la variante.
  switch (variante) {
    case 'tolerance': {
      const gagne = exact || ecart <= TOLERANCE;
      return { points: gagne ? 100 : 0, gagne };
    }
    case 'exact':
      return { points: exact ? 100 : 0, gagne: exact };
    case 'progressif': {
      const points = exact ? 100 : Math.max(0, Math.round(99 * (1 - ecart / ECART_NUL)));
      return { points, gagne: points >= 80 };
    }
  }
}

/** Case du partage : 🟩 gagné, 🟨 des points sans gagner (progressif), 🟥 sinon. */
export function caseEmoji(points: number, gagne: boolean): string {
  if (gagne) return '🟩';
  return points > 0 ? '🟨' : '🟥';
}
