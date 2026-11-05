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
