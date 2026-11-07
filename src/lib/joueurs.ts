import type { Mecanique } from './types';

/**
 * Comptes de joueurs simulés (prototype) : chaque joueur a un pseudo, son propre jour simulé
 * et ses propres données (parties, stats, collection), toutes dans le localStorage du navigateur.
 */
export interface Joueur {
  id: string;
  pseudo: string;
  creeLe: string;
  /** Jour simulé : numéro du défi du jour pour ce joueur. */
  jour: number;
  /** Le premier défi (tuto) a été joué. */
  tutoFait: boolean;
  /** Mode de réponse choisi (réglage de l'accueil) ; palier si absent. */
  meca?: Mecanique;
}

const CLE_JOUEURS = 'numero:joueurs';
const CLE_ACTIF = 'numero:joueurActif';

function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : defaut;
  } catch {
    return defaut;
  }
}

function ecrire(cle: string, valeur: unknown): void {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    /* stockage indisponible */
  }
}

export const lireJoueurs = (): Joueur[] => lire<Joueur[]>(CLE_JOUEURS, []);

export function joueurActif(): Joueur | null {
  const id = lire<string | null>(CLE_ACTIF, null);
  return lireJoueurs().find((j) => j.id === id) ?? null;
}

/** Clé de stockage propre au joueur actif : numero:<id>:<nom>. */
export function cleJoueur(nom: string): string {
  const id = lire<string | null>(CLE_ACTIF, null) ?? 'anonyme';
  return `numero:${id}:${nom}`;
}

export function creerJoueur(pseudo: string, jourDepart = 1): Joueur {
  const base = pseudo.trim().toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'joueur';
  const joueur: Joueur = {
    id: `${base}-${Math.random().toString(36).slice(2, 7)}`,
    pseudo: pseudo.trim(),
    creeLe: new Date().toISOString(),
    jour: jourDepart,
    tutoFait: false,
  };
  ecrire(CLE_JOUEURS, [...lireJoueurs(), joueur]);
  ecrire(CLE_ACTIF, joueur.id);
  return joueur;
}

export function choisirJoueur(id: string): void {
  ecrire(CLE_ACTIF, id);
}

export function majJoueur(id: string, modif: Partial<Joueur>): void {
  ecrire(
    CLE_JOUEURS,
    lireJoueurs().map((j) => (j.id === id ? { ...j, ...modif } : j)),
  );
}

/** Supprime le joueur et toutes ses données. */
export function supprimerJoueur(id: string): void {
  ecrire(
    CLE_JOUEURS,
    lireJoueurs().filter((j) => j.id !== id),
  );
  try {
    for (const cle of Object.keys(localStorage)) if (cle.startsWith(`numero:${id}:`)) localStorage.removeItem(cle);
    if (lire<string | null>(CLE_ACTIF, null) === id) localStorage.removeItem(CLE_ACTIF);
  } catch {
    /* rien */
  }
}

/** Nombre d'entrées de collection d'un joueur, pour l'écran de choix. */
export function nbFichesDe(id: string): number {
  return Object.keys(lire<Record<string, unknown>>(`numero:${id}:collection`, {})).length;
}

/** Supprime les données d'avant les comptes simulés (clés sans joueur : numero:stats, numero:partie:N…). */
export function nettoyerAnciennesDonnees(): void {
  try {
    for (const cle of Object.keys(localStorage)) {
      if (/^numero:(stats|collection|partie:\d+)$/.test(cle)) localStorage.removeItem(cle);
    }
  } catch {
    /* rien */
  }
}
