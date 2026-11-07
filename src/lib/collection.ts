import type { Question } from './types';
import { cleJoueur } from './joueurs';

/**
 * Collection du joueur : toutes les fiches jouées dans le défi d'une pochette, réussies ou non, qu'il peut ensuite réviser.
 * Chaque fiche a un état (découverte, en cours, acquise) qui ne fait que progresser.
 * Stockée dans le navigateur (localStorage), comme le reste du prototype.
 */

/**
 * État d'une fiche (voir GLOSSARY.md) :
 * - `decouverte` : jouée, jamais réussie ; sa valeur à retenir reste cachée ;
 * - `en-cours` : réussie une fois ;
 * - `acquise` : réussie deux fois, en deux occasions séparées (un défi ou une révision chacune).
 */
export type Etat = 'decouverte' | 'en-cours' | 'acquise';

export const ETATS: Etat[] = ['decouverte', 'en-cours', 'acquise'];

export const LIBELLES_ETAT: Record<Etat, string> = {
  decouverte: 'découverte',
  'en-cours': 'en cours',
  acquise: 'acquise',
};

export interface EntreeCollection {
  /** Jour (simulé) de la pochette où la fiche a été obtenue ; 0 pour la pochette offerte. */
  obtenueLeJour: number;
  etat: Etat;
  obtenueLe: string;
  revisions: number;
  derniereRevision: string | null;
}

export type Collection = Record<string, EntreeCollection>;

/** Entrée telle qu'elle a pu être enregistrée avant les états (étoiles de 0 à 3, ou compteur plus ancien). */
type EntreeStockee = Omit<EntreeCollection, 'etat' | 'obtenueLeJour'> & {
  etat?: Etat;
  obtenueLeJour?: number;
  /** Avant les pochettes : numéro du défi du parcours commun (0 pour le premier défi). */
  obtenueAuDefi?: number;
  etoiles?: number;
  reussitesDeSuite?: number;
};

// Clé propre au joueur actif (comptes simulés).
const cle = () => cleJoueur('collection');
export const FICHES_PAR_REVISION = 5;

/** Reprise des données : 0 ★ → découverte, 1–2 ★ → en cours, 3 ★ → acquise. */
function etatDepuisEtoiles(etoiles: number): Etat {
  return etoiles <= 0 ? 'decouverte' : etoiles >= 3 ? 'acquise' : 'en-cours';
}

function normaliser(e: EntreeStockee): EntreeCollection {
  // Entrées d'avant les étoiles : 1 étoile + révisions réussies d'affilée.
  const etat = e.etat ?? etatDepuisEtoiles(e.etoiles ?? Math.min(3, 1 + (e.reussitesDeSuite ?? 0)));
  return {
    obtenueLeJour: e.obtenueLeJour ?? e.obtenueAuDefi ?? 0,
    etat,
    obtenueLe: e.obtenueLe,
    revisions: e.revisions ?? 0,
    derniereRevision: e.derniereRevision ?? null,
  };
}

export function lireCollection(): Collection {
  try {
    const brut = JSON.parse(localStorage.getItem(cle()) ?? '{}') as Record<string, EntreeStockee>;
    return Object.fromEntries(Object.entries(brut).map(([id, e]) => [id, normaliser(e)]));
  } catch {
    return {};
  }
}

/** Réécrit la collection enregistrée au format actuel (états, jour d'obtention), si elle existe. */
export function migrerCollection(): void {
  try {
    if (localStorage.getItem(cle()) !== null) ecrire(lireCollection());
  } catch {
    /* rien */
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

/** État suivant après une réussite ; une erreur ne change rien (l'état ne fait que progresser). */
export function progresser(etat: Etat, reussie: boolean): Etat {
  if (!reussie) return etat;
  return etat === 'decouverte' ? 'en-cours' : 'acquise';
}

/** Fiche trouvée : réussie au moins une fois ; sa valeur à retenir s'affiche pour toujours. */
export const estTrouvee = (e: EntreeCollection) => e.etat !== 'decouverte';

/**
 * Ajoute une fiche jouée dans le défi d'une pochette : en cours si la question est réussie, découverte sinon.
 * Renvoie true si elle est nouvelle.
 */
export function gagnerFiche(id: string, jour: number, reussie: boolean): boolean {
  const c = lireCollection();
  if (c[id]) return false;
  c[id] = {
    obtenueLeJour: jour,
    obtenueLe: new Date().toISOString(),
    etat: progresser('decouverte', reussie),
    revisions: 0,
    derniereRevision: null,
  };
  ecrire(c);
  return true;
}

/** Code de triche (joueur « hubert ») : toutes les fiches du stock entrent dans la collection, acquises. */
export function toutGagner(stock: { id: string }[]): void {
  const c = lireCollection();
  for (const { id } of stock) {
    if (c[id]) c[id].etat = 'acquise';
    else
      c[id] = {
        obtenueLeJour: 0,
        obtenueLe: new Date().toISOString(),
        etat: 'acquise',
        revisions: 0,
        derniereRevision: null,
      };
  }
  ecrire(c);
}

export function enregistrerRevision(id: string, reussie: boolean): void {
  const c = lireCollection();
  const e = c[id];
  if (!e) return;
  e.revisions++;
  e.etat = progresser(e.etat, reussie);
  e.derniereRevision = new Date().toISOString();
  ecrire(c);
}

/** Les fiches de la collection présentes dans le stock (une fiche retirée du jeu est ignorée). */
export function fichesPossedees(c: Collection, stock: Question[]): Question[] {
  return stock.filter((q) => c[q.id]);
}

/**
 * Fiches à réviser : les moins avancées d'abord, puis celles révisées il y a le plus longtemps
 * (ou jamais), avec un peu de hasard entre fiches équivalentes.
 */
export function choisirRevision(c: Collection, stock: Question[], nombre = FICHES_PAR_REVISION): Question[] {
  return fichesPossedees(c, stock)
    .map((q) => ({ q, e: c[q.id], hasard: Math.random() }))
    .sort(
      (a, b) =>
        ETATS.indexOf(a.e.etat) - ETATS.indexOf(b.e.etat) ||
        (a.e.derniereRevision ?? '').localeCompare(b.e.derniereRevision ?? '') ||
        a.hasard - b.hasard,
    )
    .slice(0, nombre)
    .map(({ q }) => q);
}
