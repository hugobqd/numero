import type { CranDifficulte } from './types';
import type { Etat } from './collection';
import { cleJoueur } from './joueurs';

/**
 * Neurones (voir GLOSSARY.md) : compteur de progression du joueur, qui ne baisse jamais.
 * Une fiche qui progresse grâce à une réussite rapporte 10 × son cran ; une révision parfaite, 20 de bonus.
 * Un palier tous les 250 neurones (250, 500, 750…) : chaque palier atteint donne aussitôt une pochette bonus.
 */

export const NEURONES_PAR_CRAN = 10;
export const BONUS_REVISION_PARFAITE = 20;
export const PALIER_BONUS = 250;

export interface Neurones {
  /** Total gagné depuis le début : ne baisse jamais. */
  total: number;
  /** Pochettes bonus gagnées depuis le début (leur rang sert d'identifiant). */
  bonus: number;
  /** Paliers déjà changés en pochette bonus (le suivant est à (paliers + 1) × 250). */
  paliers: number;
}

const cle = () => cleJoueur('neurones');

export function lireNeurones(): Neurones {
  let n: Partial<Neurones> = {};
  try {
    n = JSON.parse(localStorage.getItem(cle()) ?? '{}') as Partial<Neurones>;
  } catch {
    /* stockage indisponible */
  }
  const total = n.total ?? 0;
  const bonus = n.bonus ?? 0;
  // Données d'avant les paliers de 250 (un palier tous les 100) : les paliers déjà atteints comptent comme payés.
  const paliers = n.paliers ?? Math.min(bonus, atteints(total));
  return { total, bonus, paliers };
}

function ecrire(n: Neurones): void {
  try {
    localStorage.setItem(cle(), JSON.stringify(n));
  } catch {
    /* stockage indisponible */
  }
}

/** Nombre de paliers atteints par un total de neurones. */
const atteints = (total: number) => Math.floor(total / PALIER_BONUS);

/**
 * Progression vers la prochaine pochette bonus : le total actuel, entre le dernier palier atteint et le suivant.
 */
export function progression(n: Neurones): { total: number; depuis: number; vers: number } {
  return { total: n.total, depuis: n.paliers * PALIER_BONUS, vers: (n.paliers + 1) * PALIER_BONUS };
}

/**
 * Gain d'une fiche jouée : 10 × son cran si une réussite l'a fait progresser (inconnue → en cours,
 * découverte → en cours, en cours → acquise) ; rien pour une erreur ni pour une fiche déjà acquise.
 * `avant` vaut null pour une fiche qui n'était pas encore dans la collection.
 */
export function gainFiche(avant: Etat | null, apres: Etat, cran: CranDifficulte | undefined): number {
  return apres !== avant && apres !== 'decouverte' ? NEURONES_PAR_CRAN * (cran ?? 2) : 0;
}

/** Ajoute des neurones ; chaque palier franchi donne une pochette bonus. Renvoie l'état et le nombre de pochettes gagnées. */
export function ajouterNeurones(gain: number): { neurones: Neurones; bonusGagnees: number } {
  const n = lireNeurones();
  n.total += Math.max(0, gain);
  const bonusGagnees = Math.max(0, atteints(n.total) - n.paliers);
  n.paliers += bonusGagnees;
  n.bonus += bonusGagnees;
  ecrire(n);
  return { neurones: n, bonusGagnees };
}

/** Au chargement : un palier atteint mais pas encore payé (ancienne règle, une par jour) donne sa pochette bonus. */
export const reglerPaliers = () => ajouterNeurones(0);
