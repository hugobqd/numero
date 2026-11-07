import { themePrincipal, type CranDifficulte, type Question, type ResultatQuestion } from './types';
import { cleJoueur } from './joueurs';

/**
 * Pochettes (ADR 0007) : chaque joueur récupère ses fiches par paquets de 5, tirés au hasard
 * parmi celles qu'il n'a pas encore. Ouvrir une pochette lance aussitôt le défi de ses fiches.
 */

export const FICHES_PAR_POCHETTE = 5;
export const THEMES_MIN = 3;

/** Chances de sortir selon le cran : les fiches faciles sortent plus souvent, la difficulté monte d'elle-même. */
export const POIDS_PAR_CRAN: Record<CranDifficulte, number> = { 1: 8, 2: 4, 3: 2, 4: 1 };

/** Pochette offerte du début, jouée avec le mode d'emploi : ses fiches sont tirées dans le cran tout public. */
export const ID_POCHETTE_OFFERTE = 'offerte';
export const CRAN_OFFERT: CranDifficulte = 1;

/** Questions jouables : les fiches validées, plus les brouillons si on les inclut (prototype). */
export function questionsJouables(stock: Question[], inclureBrouillons: boolean): Question[] {
  return stock
    .filter((q) => q.statut === 'valide' || (inclureBrouillons && q.statut === 'brouillon'))
    .sort((a, b) => a.id.localeCompare(b.id));
}

const poids = (q: Question) => POIDS_PAR_CRAN[q.difficulte?.cran ?? 2];

/**
 * Tire jusqu'à 5 fiches parmi `candidates` (les fiches que le joueur n'a pas encore), sans remise,
 * chacune avec une chance proportionnelle au poids de son cran. Au moins 3 thèmes par pochette :
 * quand il ne reste que les places nécessaires pour les atteindre, on ne pioche plus que dans
 * des thèmes absents de la pochette (si le stock le permet). Aucune pondération par thème.
 */
export function tirerPochette(candidates: Question[], alea: () => number = Math.random): Question[] {
  const reste = [...candidates];
  const pochette: Question[] = [];
  const themes = new Set<string>();
  const taille = Math.min(FICHES_PAR_POCHETTE, reste.length);
  while (pochette.length < taille) {
    const manquants = THEMES_MIN - themes.size;
    const places = taille - pochette.length;
    let urne = reste;
    if (manquants > 0 && places <= manquants) {
      const nouveaux = reste.filter((q) => !themes.has(themePrincipal(q)));
      if (nouveaux.length) urne = nouveaux;
    }
    const total = urne.reduce((s, q) => s + poids(q), 0);
    let tirage = alea() * total;
    const choisie = urne.find((q) => (tirage -= poids(q)) < 0) ?? urne[urne.length - 1];
    pochette.push(choisie);
    themes.add(themePrincipal(choisie));
    reste.splice(reste.indexOf(choisie), 1);
  }
  return pochette;
}

/** Une pochette ouverte : ses fiches tirées et le défi en cours ou terminé. */
export interface Pochette {
  id: string;
  origine: 'offerte' | 'jour';
  /** Jour (simulé) où elle a été ouverte. */
  jour: number;
  fiches: string[];
  /** Graine des propositions du défi. */
  graine: number;
  resultats: ResultatQuestion[];
  terminee: boolean;
}

export const idPochetteDuJour = (jour: number) => `jour-${jour}`;

const clePochette = (id: string) => cleJoueur(`pochette:${id}`);

export function lirePochette(id: string): Pochette | null {
  try {
    const brut = localStorage.getItem(clePochette(id));
    return brut ? (JSON.parse(brut) as Pochette) : null;
  } catch {
    return null;
  }
}

export function ecrirePochette(p: Pochette): void {
  try {
    localStorage.setItem(clePochette(p.id), JSON.stringify(p));
  } catch {
    // stockage indisponible : le défi reste jouable, sans mémoire
  }
}

export function effacerPochette(id: string): void {
  try {
    localStorage.removeItem(clePochette(id));
  } catch {
    /* rien */
  }
}

function ouvrir(id: string, origine: Pochette['origine'], jour: number, fiches: Question[]): Pochette {
  const p: Pochette = {
    id,
    origine,
    jour,
    fiches: fiches.map((q) => q.id),
    graine: 1 + Math.floor(Math.random() * 1_000_000),
    resultats: [],
    terminee: false,
  };
  ecrirePochette(p);
  return p;
}

/** Ouvre la pochette du jour : tire ses fiches parmi celles que le joueur n'a pas encore et l'enregistre. */
export function ouvrirPochetteDuJour(jour: number, candidates: Question[]): Pochette {
  return ouvrir(idPochetteDuJour(jour), 'jour', jour, tirerPochette(candidates));
}

/**
 * Ouvre la pochette offerte : 5 fiches tout public tirées au hasard (au moins 3 thèmes) parmi celles
 * que le joueur n'a pas encore ; s'il en reste moins de 5 dans ce cran, le tirage se fait dans tout le stock restant.
 */
export function ouvrirPochetteOfferte(jour: number, candidates: Question[]): Pochette {
  const faciles = candidates.filter((q) => q.difficulte?.cran === CRAN_OFFERT);
  const urne = faciles.length >= FICHES_PAR_POCHETTE ? faciles : candidates;
  return ouvrir(ID_POCHETTE_OFFERTE, 'offerte', jour, tirerPochette(urne));
}
