import type { Mecanique, Question, Reponse, VarianteScore } from './types';

export const TOLERANCE = 0.05; // ±5 %
export const ECART_NUL = 0.5; // progressif : 0 point à ±50 %
export const POINTS_PLUSMOINS = [100, 60, 30];

export function ecartRelatif(q: Question, valeur: number): number {
  return (valeur - q.valeur_a_retenir) / q.valeur_a_retenir;
}

export function estExact(q: Question, valeur: number): boolean {
  return Math.abs(valeur - q.valeur_a_retenir) < q.precision / 2;
}

/**
 * Critère « trouvé » utilisé pendant le plus/moins pour arrêter les propositions :
 * exact pour la variante `exact`, ±5 % sinon.
 */
export function estTrouve(q: Question, valeur: number, variante: VarianteScore): boolean {
  if (variante === 'exact') return estExact(q, valeur);
  return estExact(q, valeur) || Math.abs(ecartRelatif(q, valeur)) <= TOLERANCE;
}

export function noter(
  q: Question,
  r: Reponse,
  meca: Mecanique,
  variante: VarianteScore,
): { points: number; gagne: boolean } {
  const exact = estExact(q, r.valeur);
  const ecart = Math.abs(ecartRelatif(q, r.valeur));

  if (meca === 'qcm') {
    return { points: exact ? 100 : 0, gagne: exact };
  }

  if (meca === 'plusmoins') {
    const trouve = estTrouve(q, r.valeur, variante);
    if (variante === 'progressif') {
      const points = trouve ? POINTS_PLUSMOINS[r.essai - 1] ?? 0 : 0;
      return { points, gagne: trouve };
    }
    return { points: trouve ? 100 : 0, gagne: trouve };
  }

  // slider
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
