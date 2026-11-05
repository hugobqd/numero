import type { Mecanique, Question, Reponse, VarianteScore } from './types';

export const ECART_NUL = 0.5; // progressif : 0 point à ±50 %
/** Progressif, modes à propositions : points selon l'écart de rang (0 = bonne, 1 = voisine…). */
export const POINTS_PAR_RANG = [100, 50, 20];

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

  // QCM, palier et plus/moins : la réponse est l'une des propositions.
  if (meca === 'qcm' || meca === 'palier' || meca === 'plusmoins') {
    switch (variante) {
      case 'exact':
        return { points: exact ? 100 : 0, gagne: exact };
      case 'progressif': {
        // Points selon le rang : bonne proposition 100, voisine 50, deux crans plus loin 20.
        const props = r.propositions ?? [];
        const iReponse = props.indexOf(r.valeur);
        const iBonne = props.findIndex((p) => estExact(q, p));
        const distance = iReponse < 0 || iBonne < 0 ? (exact ? 0 : Infinity) : Math.abs(iReponse - iBonne);
        const points = POINTS_PAR_RANG[distance] ?? 0;
        return { points, gagne: distance === 0 };
      }
    }
  }

  // Curseur : une estimation libre, notée selon la variante.
  switch (variante) {
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
