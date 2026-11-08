import type { Question } from './types';
import { LOTS_HISTORIQUES } from './lots-historiques';

export interface FicheCatalogue {
  fiche: Question;
  fichier: string;
  lot: number | null;
}
export interface FiltresCatalogue {
  recherche: string;
  theme: string;
  tag: string;
  cran: string;
  statut: string;
  lot: string;
  unite: string;
  aCompleter: boolean;
}
export type ColonneTri = 'enonce' | 'theme' | 'tags' | 'difficulte' | 'statut' | 'lot' | 'valeur' | 'consulte_le';
export type OrdreTri = 'asc' | 'desc';

export function filtresVides(): FiltresCatalogue {
  return { recherche: '', theme: '', tag: '', cran: '', statut: '', lot: '', unite: '', aCompleter: false };
}

export function indexerCatalogue(fichiers: Record<string, Question[]>): FicheCatalogue[] {
  return Object.entries(fichiers).flatMap(([chemin, fiches]) => {
    const fichier = chemin.split('/').at(-1)!;
    const numero = /^lot-(\d+)\.json$/.exec(fichier);
    return fiches.map((fiche) => ({
      fiche,
      fichier,
      lot: numero ? Number(numero[1]) : LOTS_HISTORIQUES[fiche.id] ?? null,
    }));
  });
}

export const libelleLot = (lot: number | null): string => lot === null ? 'Non renseigné' : lot === 0 ? 'Stock initial' : `Lot ${lot}`;
export const cleLot = (lot: number | null): string => lot === null ? 'inconnu' : String(lot);
export function manqueRelecture(q: Question): boolean {
  return !q.source.url?.trim() || !q.source.recoupement?.trim() || !q.source.idee?.trim() || !q.difficulte?.justification?.trim();
}

function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').replace(/œ/g, 'oe');
}

const comparaison = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });

/** Les filtres se combinent par ET ; les mots de recherche peuvent être dans des champs différents. */
export function selectionnerFiches(
  catalogue: FicheCatalogue[], filtres: FiltresCatalogue, colonne: ColonneTri, ordre: OrdreTri,
): FicheCatalogue[] {
  const mots = normaliser(filtres.recherche).trim().split(/\s+/).filter(Boolean);
  const retenues = catalogue.filter(({ fiche: q, lot, fichier }) => {
    if (filtres.theme && q.theme !== filtres.theme) return false;
    if (filtres.tag && !q.tags.includes(filtres.tag)) return false;
    if (filtres.cran && String(q.difficulte?.cran ?? 'inconnue') !== filtres.cran) return false;
    if (filtres.statut && q.statut !== filtres.statut) return false;
    if (filtres.lot && cleLot(lot) !== filtres.lot) return false;
    if (filtres.unite && q.unite !== filtres.unite) return false;
    if (filtres.aCompleter && !manqueRelecture(q)) return false;
    if (!mots.length) return true;
    const texte = normaliser([
      q.id, q.enonce, q.theme, ...q.tags, q.perimetre, q.ancrage, q.mnemo ?? '',
      q.valeur_a_retenir, q.valeur, q.unite, q.source.url, q.source.recoupement ?? '',
      q.source.idee ?? '', q.difficulte?.justification ?? '', fichier, libelleLot(lot),
      ...q.leurres.map((l) => `${l.valeur} ${l.note ?? ''}`),
    ].join(' '));
    return mots.every((mot) => texte.includes(mot));
  });
  const valeur = ({ fiche: q, lot }: FicheCatalogue): string | number | null => {
    switch (colonne) {
      case 'enonce': return q.enonce;
      case 'theme': return q.theme;
      case 'tags': return q.tags.join(', ');
      case 'difficulte': return q.difficulte?.cran ?? null;
      case 'statut': return q.statut;
      case 'lot': return lot;
      case 'valeur': return q.valeur_a_retenir;
      case 'consulte_le': return q.source.consulte_le || null;
    }
  };
  return retenues.sort((a, b) => {
    const x = valeur(a), y = valeur(b);
    // Les absences restent en fin de liste, quel que soit le sens du tri.
    if (x === null && y !== null) return 1;
    if (y === null && x !== null) return -1;
    const c = x === null || y === null ? 0 : typeof x === 'number' && typeof y === 'number' ? x - y : comparaison.compare(String(x), String(y));
    return c * (ordre === 'asc' ? 1 : -1) || comparaison.compare(a.fiche.id, b.fiche.id);
  });
}
