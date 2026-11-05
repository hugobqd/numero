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

function melange<T>(items: T[], hasard: () => number): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

export const NB_PROPOSITIONS = 6;

/**
 * Propositions du défi n°`numero` pour une question (palier et plus/moins : 6 ; QCM : 4 d'entre elles),
 * triées par ordre croissant. Le tirage dépend de la question **et du numéro du défi** :
 * identique pour tous les joueurs un jour donné, différent d'un défi à l'autre.
 *
 * Composition (bonne réponse comprise) :
 * 1. 1 leurre « piège » de la fiche (`erreur_frequente`, `autre_unite` ou `autre_perimetre`)
 * 2. 2 leurres tirés dans le reste de la fiche et une réserve de leurres générés proches (±3 à 15 %)
 * 3. 2 extrêmes générés (≈ ×0,4–0,6 sous le plus petit, ≈ ×1,7–2,5 au-dessus du plus grand)
 *
 * Tous les leurres sont mis à la forme de la bonne réponse (`aLaForme`). Les leurres générés
 * gardent un écart minimal de 2 % avec les autres propositions ; ceux de la fiche peuvent être
 * plus proches (8 848 m contre 8 849 m est un vrai piège).
 */
export function propositions(q: Question, numero: number): number[] {
  const hasard = alea(hachage(q.id) ^ Math.imul(numero, 2654435761));
  const reponse = q.valeur_a_retenir;
  const pas = q.precision * 10 ** zerosFinaux(Math.round(reponse / q.precision));
  const ecartMin = Math.max(pas, reponse * 0.02);

  const retenues = new Set([reponse]);
  const tropProche = (l: number) => [...retenues].some((r) => Math.abs(r - l) < ecartMin);

  /** Ajoute un leurre de la fiche s'il est distinct ; renvoie true s'il a été retenu. */
  const ajouterFiche = (v: number) => {
    const l = aLaForme(v, q, hasard);
    if (retenues.has(l)) return false;
    retenues.add(l);
    return true;
  };
  /** Ajoute un leurre généré, en le re-tirant tant qu'il est trop proche d'une autre proposition. */
  const ajouterGenere = (v: number) => {
    let l = aLaForme(v, q, hasard);
    for (let essai = 0; essai < 20 && tropProche(l); essai++) l = aLaForme(v * (1 + (hasard() * 2 - 1) * 0.1), q, hasard);
    while (tropProche(l)) l += pas;
    retenues.add(l);
  };

  // 1. Un piège de la fiche.
  const fiche = melange(q.leurres, hasard);
  const piege = fiche.find((l) => l.type !== 'proche');
  if (piege) ajouterFiche(piege.valeur);

  // 2. Deux leurres parmi le reste de la fiche et des leurres proches générés.
  const reserve = melange(
    [
      ...fiche.filter((l) => l !== piege).map((l) => ({ v: l.valeur, fiche: true })),
      ...Array.from({ length: 4 }, () => {
        const sens = hasard() < 0.5 ? -1 : 1;
        return { v: reponse * (1 + sens * (0.03 + hasard() * 0.12)), fiche: false };
      }),
    ],
    hasard,
  );
  for (const r of reserve) {
    if (retenues.size >= NB_PROPOSITIONS - 2) break;
    // Les extrêmes viennent après : on écarte ici les valeurs très éloignées.
    if (r.v < reponse * 0.5 || r.v > reponse * 2) continue;
    if (r.fiche) ajouterFiche(r.v);
    else ajouterGenere(r.v);
  }
  while (retenues.size < NB_PROPOSITIONS - 2) ajouterGenere(reponse * (1 + (hasard() * 2 - 1) * 0.15));

  // 3. Deux extrêmes pour élargir le min et le max.
  const valeurs = [...retenues];
  ajouterGenere(Math.min(...valeurs) * (0.4 + hasard() * 0.2));
  ajouterGenere(Math.max(...valeurs) * (1.7 + hasard() * 0.8));

  return [...retenues].sort((a, b) => a - b);
}

/**
 * Les 4 propositions du QCM : une fenêtre de 4 valeurs consécutives, prise dans les
 * propositions triées et contenant la bonne réponse. La fenêtre change avec le défi,
 * ce qui place la bonne réponse à des rangs variés, extrémités comprises.
 */
export function propositionsQcm(q: Question, numero: number, nombre = 4): number[] {
  const toutes = propositions(q, numero);
  if (toutes.length <= nombre) return toutes;
  const rang = toutes.indexOf(q.valeur_a_retenir);
  const debutMin = Math.max(0, rang - nombre + 1);
  const debutMax = Math.min(rang, toutes.length - nombre);
  const debut = debutMin + (((hachage(q.id) ^ numero) >>> 0) % (debutMax - debutMin + 1));
  return toutes.slice(debut, debut + nombre);
}
