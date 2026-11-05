import type { Question } from './types';
import { cleJoueur } from './joueurs';

/**
 * Collection du joueur : toutes les fiches jouées en défi, réussies ou non, qu'il peut ensuite réviser.
 * Les fiches ratées entrent à 0 étoile : ce sont elles que la révision propose en premier.
 * Stockée dans le navigateur (localStorage), comme le reste du prototype.
 */
export interface EntreeCollection {
  /** Numéro du défi où la fiche a été obtenue. */
  obtenueAuDefi: number;
  /** Maîtrise de 0 à 3 étoiles (0 = à revoir). */
  etoiles?: number;
  obtenueLe: string;
  revisions: number;
  /** Ancien compteur (avant `etoiles`) : révisions réussies d'affilée. */
  reussitesDeSuite: number;
  derniereRevision: string | null;
}

export type Collection = Record<string, EntreeCollection>;

// Clé propre au joueur actif (comptes simulés).
const cle = () => cleJoueur('collection');
export const MAITRISE_MAX = 3;
export const FICHES_PAR_REVISION = 5;

export function lireCollection(): Collection {
  try {
    return JSON.parse(localStorage.getItem(cle()) ?? '{}') as Collection;
  } catch {
    return {};
  }
}

function ecrire(c: Collection): void {
  try {
    localStorage.setItem(cle(), JSON.stringify(c));
  } catch {
    // stockage indisponible : la collection ne sera pas conservée
  }
}

export function effacerCollection(): void {
  try {
    localStorage.removeItem(cle());
  } catch {
    /* rien */
  }
}

/**
 * Ajoute une fiche jouée en défi : 1 étoile si la question est réussie, 0 (« à revoir ») sinon.
 * Renvoie true si elle est nouvelle.
 */
export function gagnerFiche(id: string, numeroDefi: number, reussie: boolean): boolean {
  const c = lireCollection();
  if (c[id]) return false;
  c[id] = {
    obtenueAuDefi: numeroDefi,
    obtenueLe: new Date().toISOString(),
    etoiles: reussie ? 1 : 0,
    revisions: 0,
    reussitesDeSuite: 0,
    derniereRevision: null,
  };
  ecrire(c);
  return true;
}

export function enregistrerRevision(id: string, reussie: boolean): void {
  const c = lireCollection();
  const e = c[id];
  if (!e) return;
  const avant = maitrise(e);
  e.revisions++;
  e.reussitesDeSuite = reussie ? e.reussitesDeSuite + 1 : 0;
  e.etoiles = reussie ? Math.min(MAITRISE_MAX, avant + 1) : 0;
  e.derniereRevision = new Date().toISOString();
  ecrire(c);
}

/**
 * Maîtrise de 0 à 3 étoiles : 1 si la fiche a été réussie en défi, 0 si elle est à revoir ;
 * +1 par révision réussie (3 au plus), une erreur la ramène à 0.
 */
export function maitrise(e: EntreeCollection): number {
  // Fiches enregistrées avant l'ajout des étoiles : 1 + révisions réussies d'affilée.
  return e.etoiles ?? Math.min(MAITRISE_MAX, 1 + e.reussitesDeSuite);
}

/** Les fiches de la collection présentes dans le stock (une fiche retirée du jeu est ignorée). */
export function fichesPossedees(c: Collection, stock: Question[]): Question[] {
  return stock.filter((q) => c[q.id]);
}

/**
 * Fiches à réviser : les moins maîtrisées d'abord, puis celles révisées il y a le plus longtemps
 * (ou jamais), avec un peu de hasard entre fiches équivalentes.
 */
export function choisirRevision(c: Collection, stock: Question[], nombre = FICHES_PAR_REVISION): Question[] {
  return fichesPossedees(c, stock)
    .map((q) => ({ q, e: c[q.id], hasard: Math.random() }))
    .sort(
      (a, b) =>
        maitrise(a.e) - maitrise(b.e) ||
        (a.e.derniereRevision ?? '').localeCompare(b.e.derniereRevision ?? '') ||
        a.hasard - b.hasard,
    )
    .slice(0, nombre)
    .map(({ q }) => q);
}
