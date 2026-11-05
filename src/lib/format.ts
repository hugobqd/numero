const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 3 });

/** 384400 → « 384 400 ». */
export function entier(n: number): string {
  return nf.format(n);
}

const GRANDS: [number, string, string][] = [
  [1e12, 'billion', 'billions'],
  [1e9, 'milliard', 'milliards'],
  [1e6, 'million', 'millions'],
];

/** « de années » → « d'années ». */
function de(unite: string): string {
  return /^[aeiouyéèêàâîôûh]/i.test(unite) ? `d'${unite}` : `de ${unite}`;
}

/**
 * Découpe un nombre pour l'affichage, en passant aux millions / milliards / billions
 * dès 1 million : 4540000000 années → { chiffres: « 4,54 », unite: « milliards d'années » }.
 * `precision` (le pas de la question) fixe le nombre de décimales utiles ;
 * sans elle, on garde jusqu'à 2 décimales.
 */
export function grand(n: number, unite = '', precision?: number): { chiffres: string; unite: string } {
  const g = GRANDS.find(([div]) => Math.abs(n) >= div);
  if (!g) return { chiffres: entier(n), unite };
  const [div, sing, plur] = g;
  const x = n / div;
  const decimales = precision ? Math.max(0, Math.min(6, Math.ceil(Math.log10(div / precision)))) : 2;
  const chiffres = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimales }).format(x);
  const mot = Math.abs(x) >= 2 ? plur : sing;
  return { chiffres, unite: unite ? `${mot} ${de(unite)}` : mot };
}

/** Nombre et unité en une chaîne : « 4,54 milliards d'années », « 384 400 km ». */
export function avecUnite(n: number, unite = '', precision?: number): string {
  const g = grand(n, unite, precision);
  return g.unite ? `${g.chiffres} ${g.unite}` : g.chiffres;
}

/** Notation scientifique : 4540000000 → « 4,54 × 10⁹ ». */
export function scientifique(n: number): string {
  if (n === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(n)));
  const m = n / 10 ** e;
  const exp = String(e).replace(/[-0-9]/g, (c) => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)]);
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 3 }).format(m)} × 10${exp}`;
}

const NOMS_DECADES = [
  'unités',
  'dizaines',
  'centaines',
  'milliers',
  'dizaines de milliers',
  'centaines de milliers',
  'millions',
  'dizaines de millions',
  'centaines de millions',
  'milliards',
  'dizaines de milliards',
  'centaines de milliards',
  'billions',
];

/**
 * Plage de réponse déduite de la question : la décade de la valeur à retenir
 * (ex. 384 400 → de 100 000 à 1 000 000), avec la précision de la question comme pas.
 */
export function bornesQuestion(q: { valeur_a_retenir: number; precision: number }) {
  const decade = decadeDe(q.valeur_a_retenir);
  const min = decade === 0 ? 0 : 10 ** decade;
  const max = 10 ** (decade + 1);
  const step = Math.max(1, Math.min(q.precision, 10 ** decade / 10));
  const depart = Math.round((5 * 10 ** decade) / step) * step;
  return { decade, min, max, step, depart };
}

export function nomDecade(e: number): string {
  return NOMS_DECADES[e] ?? `10^${e}`;
}

export function decadeDe(n: number): number {
  return n < 1 ? 0 : Math.floor(Math.log10(n));
}

export function pourcentage(x: number): string {
  const signe = x > 0 ? '+' : x < 0 ? '−' : '';
  return `${signe}${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(Math.abs(x) * 100)} %`;
}
