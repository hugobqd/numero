import { cleJoueur } from './joueurs';

/** Statistiques du joueur : la série compte les jours consécutifs où la pochette du jour a été ouverte. */
export interface Stats {
  /** Pochettes du jour ouvertes. */
  ouvertes: number;
  serie: number;
  meilleureSerie: number;
  dernierJour: number | null;
}

/** Stats telles qu'enregistrées avant les pochettes (défis du jour joués). */
type StatsStockees = Partial<Stats> & { jouees?: number; dernierNumero?: number | null };

// Clé propre au joueur actif (comptes simulés) : on la calcule à chaque appel.
const cleStats = () => cleJoueur('stats');

export function lireStats(): Stats {
  let s: StatsStockees = {};
  try {
    s = JSON.parse(localStorage.getItem(cleStats()) ?? '{}') as StatsStockees;
  } catch {
    /* stockage indisponible */
  }
  return {
    ouvertes: s.ouvertes ?? s.jouees ?? 0,
    serie: s.serie ?? 0,
    meilleureSerie: s.meilleureSerie ?? 0,
    dernierJour: s.dernierJour ?? s.dernierNumero ?? null,
  };
}

/** Réécrit les stats enregistrées au format actuel (pochettes ouvertes, dernier jour), si elles existent. */
export function migrerStats(): void {
  try {
    if (localStorage.getItem(cleStats()) !== null) localStorage.setItem(cleStats(), JSON.stringify(lireStats()));
  } catch {
    /* rien */
  }
}

/** À l'ouverture de la pochette du jour : une fois par jour, prolonge la série ou la recommence. */
export function enregistrerOuverture(jour: number): Stats {
  const s = lireStats();
  if (s.dernierJour === jour) return s;
  const serie = s.dernierJour === jour - 1 ? s.serie + 1 : 1;
  const maj: Stats = {
    ouvertes: s.ouvertes + 1,
    serie,
    meilleureSerie: Math.max(s.meilleureSerie, serie),
    dernierJour: jour,
  };
  try {
    localStorage.setItem(cleStats(), JSON.stringify(maj));
  } catch {
    /* stockage indisponible */
  }
  return maj;
}

/** Série en cours au jour donné : elle tombe à 0 si la pochette d'hier n'a pas été ouverte. */
export const serieDuJour = (s: Stats, jour: number) =>
  s.dernierJour !== null && s.dernierJour >= jour - 1 ? s.serie : 0;
