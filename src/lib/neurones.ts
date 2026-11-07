import type { CranDifficulte } from './types';
import type { Etat } from './collection';
import { cleJoueur } from './joueurs';

/**
 * Neurones (voir GLOSSARY.md) : compteur de progression du joueur, qui ne baisse jamais.
 * Une fiche qui progresse grâce à une réussite rapporte 10 × son cran ; une révision parfaite, 20 de bonus.
 * Tous les 100 neurones, une pochette bonus est gagnée, une par jour au plus : les neurones au-delà
 * restent dans la jauge et donnent la pochette suivante dès le jour suivant.
 */

export const NEURONES_PAR_CRAN = 10;
export const BONUS_REVISION_PARFAITE = 20;
export const PALIER_BONUS = 100;

export interface Neurones {
  /** Total gagné depuis le début : ne baisse jamais. */
  total: number;
  /** Pochettes bonus gagnées depuis le début (chacune a consommé un palier de 100). */
  bonus: number;
  /** Jour (simulé) de la dernière pochette bonus gagnée. */
  dernierJourBonus: number | null;
}

const cle = () => cleJoueur('neurones');

export function lireNeurones(): Neurones {
  let n: Partial<Neurones> = {};
  try {
    n = JSON.parse(localStorage.getItem(cle()) ?? '{}') as Partial<Neurones>;
  } catch {
    /* stockage indisponible */
  }
  return { total: n.total ?? 0, bonus: n.bonus ?? 0, dernierJourBonus: n.dernierJourBonus ?? null };
}

function ecrire(n: Neurones): void {
  try {
    localStorage.setItem(cle(), JSON.stringify(n));
  } catch {
    /* stockage indisponible */
  }
}

/** Neurones dans la jauge : ceux qui n'ont pas encore donné de pochette bonus (peut dépasser 100). */
export const jauge = (n: Neurones) => n.total - n.bonus * PALIER_BONUS;

/**
 * Gain d'une fiche jouée : 10 × son cran si une réussite l'a fait progresser (inconnue → en cours,
 * découverte → en cours, en cours → acquise) ; rien pour une erreur ni pour une fiche déjà acquise.
 * `avant` vaut null pour une fiche qui n'était pas encore dans la collection.
 */
export function gainFiche(avant: Etat | null, apres: Etat, cran: CranDifficulte | undefined): number {
  return apres !== avant && apres !== 'decouverte' ? NEURONES_PAR_CRAN * (cran ?? 2) : 0;
}

/** Donne la pochette bonus du jour si la jauge atteint 100 et qu'aucune n'a été gagnée ce jour-là. */
function franchirPalier(n: Neurones, jour: number): boolean {
  if (jauge(n) < PALIER_BONUS || n.dernierJourBonus === jour) return false;
  n.bonus++;
  n.dernierJourBonus = jour;
  return true;
}

/** Ajoute des neurones ; renvoie l'état à jour et si une pochette bonus vient d'être gagnée. */
export function ajouterNeurones(gain: number, jour: number): { neurones: Neurones; bonusGagnee: boolean } {
  const n = lireNeurones();
  n.total += Math.max(0, gain);
  const bonusGagnee = franchirPalier(n, jour);
  ecrire(n);
  return { neurones: n, bonusGagnee };
}

/** À l'arrivée du joueur : les neurones gardés de la veille donnent la pochette bonus du jour. */
export function verifierPalier(jour: number): { neurones: Neurones; bonusGagnee: boolean } {
  return ajouterNeurones(0, jour);
}
