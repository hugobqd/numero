const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 3 });

/** 384400 → « 384 400 ». */
export function entier(n: number): string {
  return nf.format(n);
}

/** Forme lisible des grands nombres : 4540000000 → « 4,54 milliards ». */
export function lisible(n: number): string {
  const abs = Math.abs(n);
  const court = (x: number, mot: string) =>
    `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(x)} ${mot}`;
  if (abs >= 1e12) return court(n / 1e12, n / 1e12 >= 2 ? 'billions' : 'billion');
  if (abs >= 1e9) return court(n / 1e9, n / 1e9 >= 2 ? 'milliards' : 'milliard');
  if (abs >= 1e6) return court(n / 1e6, n / 1e6 >= 2 ? 'millions' : 'million');
  return entier(n);
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
