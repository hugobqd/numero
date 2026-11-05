import type { Question } from './types';

/** Arrondi à `chiffres` chiffres significatifs : 192 200 → 190 000 (2 chiffres). */
export function arrondiSignificatif(n: number, chiffres = 2): number {
  if (n <= 0) return 0;
  const facteur = 10 ** (Math.floor(Math.log10(n)) - chiffres + 1);
  return Math.round(n / facteur) * facteur;
}

/** Petit hachage stable d'une chaîne (même résultat pour tous les joueurs). */
function hachage(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Générateur pseudo-aléatoire déterministe, dans [0, 1). */
function alea(graine: number): () => number {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function zerosFinaux(n: number): number {
  let z = 0;
  while (n > 0 && n % 10 === 0) {
    n /= 10;
    z++;
  }
  return z;
}

/**
 * Donne à une valeur la même « forme » que la bonne réponse, pour qu'aucune proposition
 * ne se trahisse par son arrondi : même pas (`precision`) et même nombre de zéros finaux.
 * Ex. pour 206 os, 300 devient 309 ou 287 ; pour 299 792 km/s, 270 000 devient 263 418.
 * Une valeur trop ronde est brouillée de ±6 % au plus, puis son dernier chiffre est rendu non nul.
 */
function aLaForme(v: number, q: Question, hasard: () => number): number {
  const p = q.precision;
  const nReponse = Math.round(q.valeur_a_retenir / p);
  const unite = 10 ** zerosFinaux(nReponse);
  let n = Math.max(1, Math.round(v / p));
  if (zerosFinaux(n) !== zerosFinaux(nReponse)) {
    n = Math.round((n * (1 + (hasard() * 2 - 1) * 0.06)) / unite) * unite;
    if ((n / unite) % 10 === 0) {
      const decalage = unite * (1 + Math.floor(hasard() * 9));
      n = n - decalage > 0 && hasard() < 0.5 ? n - decalage : n + decalage;
    }
  }
  return n * p;
}

/**
 * Propositions communes au QCM et au palier, triées par ordre croissant :
 * la bonne valeur, les 3 leurres proches de la fiche, et 2 extrêmes plus éloignés
 * (≈ moitié du plus petit, ≈ double du plus grand) pour élargir le min et le max.
 * Tous les leurres sont mis à la forme de la bonne réponse (voir `aLaForme`) ;
 * le tirage dépend de la question, donc il est identique pour tous les joueurs.
 */
export function propositions(q: Question): number[] {
  const hasard = alea(hachage(q.id));
  const proches = [q.valeur_a_retenir, ...q.leurres];
  const bas = Math.min(...proches) * (0.45 + hasard() * 0.15);
  const haut = Math.max(...proches) * (1.7 + hasard() * 0.6);

  const pas = q.precision * 10 ** zerosFinaux(Math.round(q.valeur_a_retenir / q.precision));
  // Deux propositions trop proches (ex. 211 et 212) se repèrent : écart minimal de 2 %.
  const ecartMin = Math.max(pas, q.valeur_a_retenir * 0.02);
  const tropProche = (l: number) => [...retenues].some((r) => Math.abs(r - l) < ecartMin);

  const retenues = new Set([q.valeur_a_retenir]);
  for (const v of [...q.leurres, bas, haut]) {
    let l = aLaForme(v, q, hasard);
    for (let essai = 0; essai < 20 && tropProche(l); essai++) l = aLaForme(v * (1 + (hasard() * 2 - 1) * 0.1), q, hasard);
    // En dernier recours, on s'écarte d'un pas à la fois.
    while (tropProche(l)) l += pas;
    retenues.add(l);
  }
  return [...retenues].sort((a, b) => a - b);
}

/**
 * Les 4 propositions du QCM : une fenêtre de 4 valeurs consécutives, prise dans les
 * propositions triées et contenant la bonne réponse. La fenêtre dépend de la question
 * (identique pour tous), ce qui place la bonne réponse à des rangs variés, extrémités comprises.
 */
export function propositionsQcm(q: Question, nombre = 4): number[] {
  const toutes = propositions(q);
  if (toutes.length <= nombre) return toutes;
  const rang = toutes.indexOf(q.valeur_a_retenir);
  const debutMin = Math.max(0, rang - nombre + 1);
  const debutMax = Math.min(rang, toutes.length - nombre);
  const debut = debutMin + (hachage(q.id) % (debutMax - debutMin + 1));
  return toutes.slice(debut, debut + nombre);
}
