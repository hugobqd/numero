// Contrôle des fiches questions de src/data/*.json : format, contraintes techniques du jeu,
// règles de rédaction des leurres (docs/contenu/03-redaction.md).
// Usage : npm run verifier
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DOSSIER = new URL('../src/data/', import.meta.url).pathname;
const CRANS = { 1: 'tout public', 2: 'grand public', 3: 'curieux', 4: 'pointu' };
const TYPES = ['erreur_frequente', 'autre_unite', 'autre_perimetre', 'proche'];
const CHAMPS = ['id', 'enonce', 'valeur', 'valeur_a_retenir', 'precision', 'unite', 'perimetre', 'ancrage', 'source', 'theme', 'tags', 'leurres', 'statut', 'langue'];

const zerosFinaux = (n) => {
  let z = 0;
  while (n > 0 && n % 10 === 0) { n /= 10; z++; }
  return z;
};

const erreurs = [];
const avertissements = [];
const ids = new Map();
const parTheme = new Map();
const parCran = new Map();
// Champs que le lot 1 doit remplir sur les brouillons existants : signalés en un seul compte.
const aCompleter = { difficulte: 0, recoupement: 0, idee: 0 };
let total = 0;

for (const fichier of readdirSync(DOSSIER).filter((f) => f.endsWith('.json')).sort()) {
  let fiches;
  try {
    fiches = JSON.parse(readFileSync(join(DOSSIER, fichier), 'utf8'));
  } catch (e) {
    erreurs.push(`${fichier} : JSON invalide (${e.message})`);
    continue;
  }
  for (const q of fiches) {
    total++;
    const ou = `${fichier} › ${q.id ?? '(sans id)'}`;
    const err = (m) => erreurs.push(`${ou} : ${m}`);
    const avert = (m) => avertissements.push(`${ou} : ${m}`);

    for (const c of CHAMPS) if (q[c] === undefined || q[c] === '') err(`champ « ${c} » manquant`);
    if (ids.has(q.id)) err(`id en double (déjà dans ${ids.get(q.id)})`);
    ids.set(q.id, fichier);

    // Le thème visible détermine l’album ; les tags servent uniquement au classement interne.
    if (typeof q.theme !== 'string' || !q.theme.trim()) err('theme doit être un texte non vide');
    else parTheme.set(q.theme, (parTheme.get(q.theme) ?? 0) + 1);
    if (q.themes !== undefined) err('themes retiré : utiliser theme et tags');
    if (!Array.isArray(q.tags)) err('tags doit être une liste');
    else {
      if (q.tags.some((t) => typeof t !== 'string' || !t.trim() || t !== t.trim())) err('tags : chaque tag doit être un texte non vide sans espaces superflus');
      const normalises = q.tags.filter((t) => typeof t === 'string').map((t) => t.normalize('NFC').toLocaleLowerCase('fr'));
      if (new Set(normalises).size !== normalises.length) err('tags : tag en double');
    }

    // Difficulté : obligatoire pour une fiche validée.
    if (q.difficulte === undefined) {
      if (q.statut === 'valide') err('difficulte manquante (obligatoire pour une fiche valide)');
      else aCompleter.difficulte++;
    } else {
      const { cran, justification } = q.difficulte ?? {};
      if (!(cran in CRANS)) err(`difficulte.cran doit valoir 1, 2, 3 ou 4 (${cran})`);
      else parCran.set(cran, (parCran.get(cran) ?? 0) + 1);
      if (typeof justification !== 'string' || !justification.trim()) err('difficulte.justification manquante');
    }

    // Traçabilité des sources (pour la relecture).
    if (q.source?.recoupement === undefined) aCompleter.recoupement++;
    else if (!/^https?:\/\//.test(q.source.recoupement)) err('source.recoupement doit être une URL');
    if (q.source?.idee === undefined) aCompleter.idee++;
    else if (typeof q.source.idee !== 'string' || !q.source.idee.trim()) err('source.idee vide');

    const v = q.valeur_a_retenir;
    const p = q.precision;
    const enPas = (n) => p < 1 ? n * Math.round(1 / p) : n / p;
    const multipleDuPas = (n) => Math.abs(enPas(n) - Math.round(enPas(n))) < 1e-8;
    if (!Number.isFinite(v) || v <= 0) err(`valeur_a_retenir doit être un nombre positif (${v})`);
    if (!(p >= 0.001 && Number.isInteger(Math.log10(p)))) err(`precision doit être une puissance de 10 ≥ 0,001 (${p})`);
    else if (!multipleDuPas(v)) err(`valeur_a_retenir (${v}) n'est pas un multiple de precision (${p})`);
    if (!['brouillon', 'valide', 'rejete'].includes(q.statut)) err(`statut inconnu « ${q.statut} »`);
    if (q.source && !/^https?:\/\//.test(q.source.url ?? '')) err('source.url invalide');
    if (q.valeur && Math.abs(q.valeur - v) / v > 0.05) avert(`valeur (${q.valeur}) et valeur_a_retenir (${v}) diffèrent de plus de 5 %`);

    const leurres = Array.isArray(q.leurres) ? q.leurres : [];
    if (leurres.length < 3) err(`au moins 3 leurres attendus (${leurres.length})`);
    else if (leurres.length < 6) avert(`réserve de ${leurres.length} leurres (6 à 8 visés)`);
    const pieges = leurres.filter((l) => l.type !== 'proche').length;
    if (pieges < 3) avert(`${pieges} piège(s) seulement (3 attendus)`);
    const vus = new Set([v]);
    let lointains = 0;
    for (const l of leurres) {
      if (!TYPES.includes(l.type)) err(`leurre ${l.valeur} : type inconnu « ${l.type} »`);
      if (!(l.valeur > 0)) err(`leurre ${l.valeur} : doit être positif`);
      if (vus.has(l.valeur)) err(`leurre ${l.valeur} : en double ou égal à la réponse`);
      vus.add(l.valeur);
      if (!multipleDuPas(l.valeur)) {
        if (l.valeur_fixe) err(`leurre fixe ${l.valeur} : pas un multiple de precision (${p})`);
        else avert(`leurre ${l.valeur} : pas un multiple de precision (${p}), il sera retouché`);
      } else if (!l.valeur_fixe && zerosFinaux(Math.round(enPas(l.valeur))) > zerosFinaux(Math.round(enPas(v)))) {
        avert(`leurre ${l.valeur} : plus rond que la réponse, il sera retouché`);
      }
      if (Math.abs(l.valeur - v) / v < 0.005) err(`leurre ${l.valeur} : à moins de 0,5 % de la réponse`);
      if (l.valeur < v * 0.5 || l.valeur > v * 2) lointains++;
      if (l.type !== 'proche' && !l.note) avert(`piège ${l.valeur} sans note`);
    }
    if (lointains > 1) avert(`${lointains} leurres hors de ×0,5–×2 (1 au plus conseillé)`);
  }
}

const pct = (n) => `${Math.round((n / total) * 100)} %`;
console.log(`${total} fiches · ${[...parTheme].map(([t, n]) => `${t} ${n}`).join(' · ')}`);
console.log(
  `Difficulté : ${Object.entries(CRANS).map(([c, nom]) => `${nom} ${parCran.get(Number(c)) ?? 0} (${pct(parCran.get(Number(c)) ?? 0)})`).join(' · ')}` +
    ` · non attribuée ${aCompleter.difficulte}`,
);
const manques = [
  aCompleter.difficulte && `${aCompleter.difficulte} sans difficulté`,
  aCompleter.recoupement && `${aCompleter.recoupement} sans source de recoupement`,
  aCompleter.idee && `${aCompleter.idee} sans source d'idée`,
].filter(Boolean);
if (manques.length) console.log(`À compléter (brouillons) : ${manques.join(' · ')}`);
if (avertissements.length) console.log(`\n${avertissements.length} avertissement(s) :\n- ${avertissements.join('\n- ')}`);
if (erreurs.length) {
  console.error(`\n${erreurs.length} erreur(s) :\n- ${erreurs.join('\n- ')}`);
  process.exit(1);
}
console.log('\nAucune erreur bloquante.');
