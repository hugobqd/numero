import type { Mecanique } from './types';

/** Modes de réponse, dans l'ordre du réglage de l'accueil. */
export const MECAS: Mecanique[] = ['palier', 'qcm', 'plusmoins'];
export const MECA_PAR_DEFAUT: Mecanique = 'palier';

export const estMecanique = (m: unknown): m is Mecanique => MECAS.includes(m as Mecanique);

/**
 * Réglages de test, lus dans l'URL :
 * ?meca=palier|qcm|plusmoins choisit le mode de réponse du joueur (mémorisé, comme le réglage de l'accueil).
 * &reset=1 efface la partie du jour (tests de couloir).
 * &brouillons=0 exclut les fiches en brouillon (incluses par défaut dans le prototype).
 */
export function lireParametres() {
  const p = new URLSearchParams(location.search);
  const meca = p.get('meca');
  return {
    meca: estMecanique(meca) ? meca : null,
    reset: p.has('reset'),
    brouillons: p.get('brouillons') !== '0',
  };
}
