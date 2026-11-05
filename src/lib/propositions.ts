import type { Question } from './types';

/** Arrondi à `chiffres` chiffres significatifs : 192 200 → 190 000 (2 chiffres). */
export function arrondiSignificatif(n: number, chiffres = 2): number {
  if (n <= 0) return 0;
  const facteur = 10 ** (Math.floor(Math.log10(n)) - chiffres + 1);
  return Math.round(n / facteur) * facteur;
}

/**
 * Propositions communes au QCM et au palier, triées par ordre croissant :
 * la bonne valeur, les 3 leurres proches de la fiche, et 2 extrêmes plus éloignés
 * (≈ moitié du plus petit, ≈ double du plus grand) pour élargir le min et le max.
 */
export function propositions(q: Question): number[] {
  const proches = [q.valeur_a_retenir, ...q.leurres];
  const bas = arrondiSignificatif(Math.min(...proches) / 2);
  const haut = arrondiSignificatif(Math.max(...proches) * 2);
  return [...new Set([bas, ...proches, haut])].sort((a, b) => a - b);
}

/** Petit hachage stable d'une chaîne (même résultat pour tous les joueurs). */
function hachage(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
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
