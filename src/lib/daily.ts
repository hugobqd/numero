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

/** Questions jouables : les fiches validées, plus les brouillons si on les inclut (prototype). */
export function questionsJouables(stock: Question[], inclureBrouillons: boolean): Question[] {
  return stock
    .filter((q) => q.statut === 'valide' || (inclureBrouillons && q.statut === 'brouillon'))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Découpe le stock en défis de 5 questions, sans répétition à l'intérieur d'un cycle.
 * Chaque défi pioche dans des thématiques différentes, en privilégiant celles qui ont
 * le plus de questions restantes (pour ne pas finir le cycle sur un seul thème).
 * Le cycle `c` est mélangé avec sa propre graine : après un tour complet, l'ordre change.
 */
function decouperCycle(jouables: Question[], c: number): Question[][] {
  const alea = rng(c * 7919 + 1);
  const files = new Map<string, Question[]>();
  for (const q of melanger(jouables, alea)) {
    if (!files.has(q.thematique)) files.set(q.thematique, []);
    files.get(q.thematique)!.push(q);
  }
  const restantes = () => [...files.values()].reduce((s, f) => s + f.length, 0);

  const defis: Question[][] = [];
  while (restantes() >= QUESTIONS_PAR_DEFI) {
    const defi: Question[] = [];
    const themesPris = new Set<string>();
    while (defi.length < QUESTIONS_PAR_DEFI) {
      let candidats = [...files].filter(([t, f]) => f.length && !themesPris.has(t));
      if (!candidats.length) candidats = [...files].filter(([, f]) => f.length);
      const max = Math.max(...candidats.map(([, f]) => f.length));
      const plusFournis = candidats.filter(([, f]) => f.length === max);
      const [theme, file] = plusFournis[Math.floor(alea() * plusFournis.length)];
      defi.push(file.pop()!);
      themesPris.add(theme);
    }
    defis.push(defi);
  }
  return defis;
}

const cacheCycles = new Map<string, Question[][]>();

/** Nombre de défis différents avant que les questions ne reviennent. */
export function defisParCycle(jouables: Question[]): number {
  return Math.max(1, Math.floor(jouables.length / QUESTIONS_PAR_DEFI));
}

/**
 * Les 5 questions du défi n°`numero`, identiques pour tous. Les défis successifs
 * épuisent le stock avant de reprendre (nouvel ordre à chaque cycle), avec au moins
 * 3 thématiques par défi quand le stock le permet.
 */
export function questionsDuDefi(jouables: Question[], numero: number): Question[] {
  if (jouables.length <= QUESTIONS_PAR_DEFI) return melanger(jouables, rng(numero));
  const parCycle = defisParCycle(jouables);
  const cycle = Math.floor((numero - 1) / parCycle);
  const cle = `${cycle}:${jouables.map((q) => q.id).join(',')}`;
  if (!cacheCycles.has(cle)) cacheCycles.set(cle, decouperCycle(jouables, cycle));
  return cacheCycles.get(cle)![(numero - 1) % parCycle];
}
