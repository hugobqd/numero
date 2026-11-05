import type { Question } from './types';

export const DATE_LANCEMENT = '2026-11-05';
export const QUESTIONS_PAR_DEFI = 5;
export const THEMATIQUES_MIN = 3;

/** Date du jour à Paris, au format AAAA-MM-JJ. */
export function dateParis(maintenant = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(maintenant);
}

/** Numéro du défi : 1 le jour du lancement, puis +1 chaque jour (minuit, heure de Paris). */
export function numeroDefi(maintenant = new Date()): number {
  const jour = Date.parse(dateParis(maintenant) + 'T00:00:00Z');
  const lancement = Date.parse(DATE_LANCEMENT + 'T00:00:00Z');
  return Math.round((jour - lancement) / 86_400_000) + 1;
}

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
function rng(graine: number): () => number {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function melanger<T>(items: readonly T[], alea: () => number): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Les 5 questions du défi n°`numero`, identiques pour tous.
 * Seules les fiches `valide` sont tirées ; on exige au moins 3 thématiques
 * quand le stock le permet.
 */
export function questionsDuDefi(stock: Question[], numero: number): Question[] {
  const valides = stock.filter((q) => q.statut === 'valide');
  const alea = rng(numero * 2654435761);
  const nbThemes = new Set(valides.map((q) => q.thematique)).size;
  const themesVises = Math.min(THEMATIQUES_MIN, nbThemes);

  let tirage = melanger(valides, alea).slice(0, QUESTIONS_PAR_DEFI);
  for (let essai = 0; essai < 200; essai++) {
    if (new Set(tirage.map((q) => q.thematique)).size >= themesVises) break;
    tirage = melanger(valides, alea).slice(0, QUESTIONS_PAR_DEFI);
  }
  return tirage;
}
