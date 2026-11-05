import type { Mecanique, VarianteScore } from './types';

const MECAS: Mecanique[] = ['slider', 'qcm', 'plusmoins'];
const VARIANTES: VarianteScore[] = ['tolerance', 'exact', 'progressif'];

/**
 * Réglages de test, lus dans l'URL : ?meca=slider|qcm|plusmoins&score=tolerance|exact|progressif
 * &reset=1 efface la partie du jour (tests de couloir).
 * &jour=N force le numéro du défi.
 */
export function lireParametres() {
  const p = new URLSearchParams(location.search);
  const meca = p.get('meca') as Mecanique | null;
  const score = p.get('score') as VarianteScore | null;
  const jour = Number(p.get('jour'));
  return {
    meca: meca && MECAS.includes(meca) ? meca : ('slider' as Mecanique),
    variante: score && VARIANTES.includes(score) ? score : ('tolerance' as VarianteScore),
    reset: p.has('reset'),
    jour: Number.isInteger(jour) && jour > 0 ? jour : null,
  };
}

export { MECAS, VARIANTES };
