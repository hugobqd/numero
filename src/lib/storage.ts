import type { Mecanique, ResultatQuestion, VarianteScore } from './types';
import { cleJoueur } from './joueurs';

export interface PartieDuJour {
  numero: number;
  meca: Mecanique;
  variante: VarianteScore;
  resultats: ResultatQuestion[];
  terminee: boolean;
}

export interface Stats {
  jouees: number;
  serie: number;
  meilleureSerie: number;
  dernierNumero: number | null;
}

// Les clés dépendent du joueur actif (comptes simulés) : on les calcule à chaque appel.
const CLE_PARTIE = (n: number) => cleJoueur(`partie:${n}`);
const cleStats = () => cleJoueur('stats');

function lire<T>(cle: string): T | null {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : null;
  } catch {
    return null;
  }
}

function ecrire(cle: string, valeur: unknown): void {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    // stockage indisponible : le jeu reste jouable, sans mémoire
  }
}

export const lirePartie = (n: number) => lire<PartieDuJour>(CLE_PARTIE(n));
export const ecrirePartie = (p: PartieDuJour) => ecrire(CLE_PARTIE(p.numero), p);

export function effacerPartie(n: number): void {
  try {
    localStorage.removeItem(CLE_PARTIE(n));
  } catch {
    /* rien */
  }
}

export function effacerStats(): void {
  try {
    localStorage.removeItem(cleStats());
  } catch {
    /* rien */
  }
}

export function lireStats(): Stats {
  return lire<Stats>(cleStats()) ?? { jouees: 0, serie: 0, meilleureSerie: 0, dernierNumero: null };
}

/** À appeler une seule fois, quand le défi du jour est terminé. */
export function enregistrerFin(numero: number): Stats {
  const s = lireStats();
  if (s.dernierNumero === numero) return s;
  const serie = s.dernierNumero === numero - 1 ? s.serie + 1 : 1;
  const maj: Stats = {
    jouees: s.jouees + 1,
    serie,
    meilleureSerie: Math.max(s.meilleureSerie, serie),
    dernierNumero: numero,
  };
  ecrire(cleStats(), maj);
  return maj;
}
