import type { Mecanique, VarianteScore } from './types';

const MECAS: Mecanique[] = ['slider', 'palier', 'qcm', 'plusmoins'];
const VARIANTES: VarianteScore[] = ['progressif', 'exact'];

/**
 * Réglages de test, lus dans l'URL : ?meca=slider|palier|qcm|plusmoins&score=progressif|exact
 * &reset=1 efface la partie du jour (tests de couloir).
 * &brouillons=0 exclut les fiches en brouillon (incluses par défaut dans le prototype).
 */
export function lireParametres() {
  const p = new URLSearchParams(location.search);
  const meca = p.get('meca') as Mecanique | null;
  const score = p.get('score') as VarianteScore | null;
  return {
    meca: meca && MECAS.includes(meca) ? meca : ('slider' as Mecanique),
    variante: score && VARIANTES.includes(score) ? score : ('progressif' as VarianteScore),
    reset: p.has('reset'),
    brouillons: p.get('brouillons') !== '0',
  };
}

export { MECAS, VARIANTES };
