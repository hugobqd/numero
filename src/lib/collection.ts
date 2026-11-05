import type { Question } from './types';

/**
 * Collection du joueur : les fiches gagnées en défi, qu'il peut ensuite réviser.
 * Stockée dans le navigateur (localStorage), comme le reste du prototype.
 */
export interface EntreeCollection {
  /** Numéro du défi où la fiche a été gagnée. */
  obtenueAuDefi: number;
  obtenueLe: string;
  revisions: number;
  /** Révisions réussies d'affilée ; un échec remet à 0. */
  reussitesDeSuite: number;
  derniereRevision: string | null;
}

export type Collection = Record<string, EntreeCollection>;

const CLE = 'numero:collection';
export const MAITRISE_MAX = 3;
export const FICHES_PAR_REVISION = 5;

export function lireCollection(): Collection {
  try {
    return JSON.parse(localStorage.getItem(CLE) ?? '{}') as Collection;
  } catch {
    return {};
  }
}

function ecrire(c: Collection): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(c));
  } catch {
    // stockage indisponible : la collection ne sera pas conservée
  }
}

export function effacerCollection(): void {
  try {
    localStorage.removeItem(CLE);
  } catch {
    /* rien */
  }
}

/** Ajoute une fiche gagnée en défi. Renvoie true si elle est nouvelle. */
export function gagnerFiche(id: string, numeroDefi: number): boolean {
  const c = lireCollection();
  if (c[id]) return false;
  c[id] = {
    obtenueAuDefi: numeroDefi,
    obtenueLe: new Date().toISOString(),
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
  e.revisions++;
  e.reussitesDeSuite = reussie ? e.reussitesDeSuite + 1 : 0;
  e.derniereRevision = new Date().toISOString();
  ecrire(c);
}

/** Maîtrise de 1 à 3 étoiles : 1 à l'obtention, +1 par révision réussie d'affilée. */
export function maitrise(e: EntreeCollection): number {
  return Math.min(MAITRISE_MAX, 1 + e.reussitesDeSuite);
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
