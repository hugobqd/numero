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
 * 1. On tire d'abord le **rang de la bonne réponse** (0 à 5, uniforme) : elle est la plus petite
 *    1 fois sur 6 et la plus grande 1 fois sur 6, on ne peut donc pas éliminer d'office les extrémités.
 *    Le piège est ensuite choisi parmi ceux qui ont de la place de leur côté.
 * 2. On place ensuite r leurres en dessous et 5 − r au-dessus. De chaque côté, dans l'ordre :
 *    - le piège de la fiche (`erreur_frequente`, `autre_unite`, `autre_perimetre`) s'il est de ce côté ;
 *    - une valeur éloignée (≈ ×0,35–0,55 ou ≈ ×1,7–2,5, ou un leurre éloigné de la fiche) pour élargir le min ou le max ;
 *    - des leurres proches, tirés dans la fiche et parmi des valeurs générées (±3 à 35 %).
 *
 * Tous les leurres sont mis à la forme de la bonne réponse (`aLaForme`). Les leurres générés
 * gardent un écart minimal de 2 % ; ceux de la fiche peuvent être plus proches (8 848 m contre 8 849 m).
 */
export function propositions(q: Question, numero: number): number[] {
  const hasard = alea(hachage(q.id) ^ Math.imul(numero, 2654435761));
  const reponse = q.valeur_a_retenir;
  const pas = q.precision * 10 ** zerosFinaux(Math.round(reponse / q.precision));
  const ecartMin = Math.max(pas, reponse * 0.02);
  const entre = (a: number, b: number) => a + hasard() * (b - a);

  const retenues = new Set([reponse]);
  const tropProche = (l: number) => [...retenues].some((r) => Math.abs(r - l) < ecartMin);
  const duBonCote = (l: number, cote: -1 | 1) => (cote < 0 ? l < reponse && l > 0 : l > reponse);

  /** Leurre de la fiche : retenu s'il est distinct et du bon côté. */
  const ajouterFiche = (v: number, cote: -1 | 1) => {
    const l = aLaForme(v, q, hasard);
    if (retenues.has(l) || !duBonCote(l, cote)) return false;
    retenues.add(l);
    return true;
  };
  /** Leurre généré à partir d'un rapport à la réponse, re-tiré tant qu'il est mal placé. */
  const ajouterGenere = (ratioMin: number, ratioMax: number, cote: -1 | 1) => {
    for (let essai = 0; essai < 40; essai++) {
      const l = aLaForme(reponse * entre(ratioMin, ratioMax), q, hasard);
      if (duBonCote(l, cote) && !tropProche(l)) {
        retenues.add(l);
        return true;
      }
    }
    return false;
  };

  // 1. Rang de la bonne réponse, uniforme : 1 chance sur 6 d'être la plus petite, idem la plus grande.
  const rang = Math.floor(hasard() * NB_PROPOSITIONS);

  // Piège : tiré parmi ceux qui ont de la place de leur côté (aucun en dessous si la réponse est la plus petite).
  const fiche = melange(q.leurres, hasard);
  const piege = fiche.find(
    (l) => l.type !== 'proche' && (l.valeur < reponse ? rang >= 1 : rang <= NB_PROPOSITIONS - 2),
  );
  const cotePiege: -1 | 1 | 0 = !piege ? 0 : piege.valeur < reponse ? -1 : 1;

  // 2. Remplissage de chaque côté.
  for (const [cote, nombre] of [[-1, rang], [1, NB_PROPOSITIONS - 1 - rang]] as [-1 | 1, number][]) {
    const cible = retenues.size + nombre;
    const restants = () => cible - retenues.size;
    const loin = (v: number) => (cote < 0 ? v < reponse * 0.5 : v > reponse * 2);

    if (piege && cotePiege === cote && restants() > 0) ajouterFiche(piege.valeur, cote);

    if (restants() > 0) {
      const lointainFiche = fiche.find((l) => l !== piege && loin(l.valeur) && duBonCote(l.valeur, cote));
      if (!(lointainFiche && ajouterFiche(lointainFiche.valeur, cote))) {
        if (cote < 0) ajouterGenere(0.35, 0.55, cote);
        else ajouterGenere(1.7, 2.5, cote);
      }
    }

    const proches = melange(
      [
        ...fiche
          .filter((l) => l !== piege && !loin(l.valeur) && duBonCote(l.valeur, cote))
          .map((l) => ({ fiche: l.valeur, min: 0, max: 0 })),
        ...[0, 1, 2].map(() => (cote < 0 ? { fiche: 0, min: 0.85, max: 0.97 } : { fiche: 0, min: 1.03, max: 1.15 })),
        cote < 0 ? { fiche: 0, min: 0.65, max: 0.8 } : { fiche: 0, min: 1.25, max: 1.5 },
      ],
      hasard,
    );
    for (const c of proches) {
      if (restants() <= 0) break;
      if (c.fiche) ajouterFiche(c.fiche, cote);
      else ajouterGenere(c.min, c.max, cote);
    }
    // Filet de sécurité : on complète avec des valeurs plus dispersées.
    for (let essai = 0; essai < 20 && restants() > 0; essai++) {
      if (cote < 0) ajouterGenere(0.3, 0.97, cote);
      else ajouterGenere(1.03, 3, cote);
    }
  }

  return [...retenues].sort((a, b) => a - b);
}

/**
 * Les 4 propositions du QCM : la bonne réponse et 3 leurres tirés au hasard parmi les 5 du palier,
 * triés. Comme le rang de la réponse parmi les 6 est uniforme, sa position parmi les 4 l'est aussi
 * (1 chance sur 4 d'être en première ou en dernière position).
 */
export function propositionsQcm(q: Question, numero: number, nombre = 4): number[] {
  const toutes = propositions(q, numero);
  if (toutes.length <= nombre) return toutes;
  const hasard = alea((hachage(q.id) ^ Math.imul(numero, 40503)) + 1);
  const leurres = melange(
    toutes.filter((v) => v !== q.valeur_a_retenir),
    hasard,
  ).slice(0, nombre - 1);
  return [q.valeur_a_retenir, ...leurres].sort((a, b) => a - b);
}
