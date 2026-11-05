import { caseEmoji } from './score';
import type { ResultatQuestion, VarianteScore } from './types';

export function texteDePartage(
  numero: number,
  variante: VarianteScore,
  resultats: ResultatQuestion[],
  url = location.origin + location.pathname,
): string {
  const cases = resultats.map((r) => caseEmoji(r.points, r.gagne)).join('');
  const total =
    variante === 'progressif'
      ? `${resultats.reduce((s, r) => s + r.points, 0)}/${resultats.length * 100} pts`
      : `${resultats.filter((r) => r.gagne).length}/${resultats.length}`;
  return `Numero #${numero} — ${total}\n${cases}\n${url}`;
}

/** Partage natif sur mobile, sinon copie dans le presse-papiers. Renvoie ce qui s'est passé. */
export async function partager(texte: string): Promise<'partage' | 'copie' | 'echec'> {
  try {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ text: texte });
      return 'partage';
    }
    await navigator.clipboard.writeText(texte);
    return 'copie';
  } catch {
    return 'echec';
  }
}
