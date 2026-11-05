// Contrôle des fiches questions de src/data/*.json : format, contraintes techniques du jeu,
// règles de rédaction des leurres (docs/agents/03-redaction.md).
// Usage : npm run verifier
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DOSSIER = new URL('../src/data/', import.meta.url).pathname;
const TYPES = ['erreur_frequente', 'autre_unite', 'autre_perimetre', 'proche'];
const CHAMPS = ['id', 'enonce', 'valeur', 'valeur_a_retenir', 'precision', 'unite', 'perimetre', 'ancrage', 'source', 'thematique', 'leurres', 'statut', 'langue'];

const zerosFinaux = (n) => {
  let z = 0;
  while (n > 0 && n % 10 === 0) { n /= 10; z++; }
  return z;
};

const erreurs = [];
const avertissements = [];
const ids = new Map();
const parTheme = new Map();
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
    parTheme.set(q.thematique, (parTheme.get(q.thematique) ?? 0) + 1);

    const v = q.valeur_a_retenir;
    const p = q.precision;
    if (!Number.isInteger(v) || v < 1) err(`valeur_a_retenir doit être un entier ≥ 1 (${v})`);
    if (!(p >= 1 && Number.isInteger(Math.log10(p)))) err(`precision doit être une puissance de 10 ≥ 1 (${p})`);
    else if (v % p !== 0) err(`valeur_a_retenir (${v}) n'est pas un multiple de precision (${p})`);
    if (!['brouillon', 'valide'].includes(q.statut)) err(`statut inconnu « ${q.statut} »`);
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
      if (l.valeur % p !== 0) avert(`leurre ${l.valeur} : pas un multiple de precision (${p}), il sera retouché`);
      else if (zerosFinaux(l.valeur / p) > zerosFinaux(v / p)) avert(`leurre ${l.valeur} : plus rond que la réponse, il sera retouché`);
      if (l.valeur < v * 0.5 || l.valeur > v * 2) lointains++;
      if (l.type !== 'proche' && !l.note) avert(`piège ${l.valeur} sans note`);
    }
    if (lointains > 1) avert(`${lointains} leurres hors de ×0,5–×2 (1 au plus conseillé)`);
  }
}

console.log(`${total} fiches · ${[...parTheme].map(([t, n]) => `${t} ${n}`).join(' · ')}`);
if (avertissements.length) console.log(`\n${avertissements.length} avertissement(s) :\n- ${avertissements.join('\n- ')}`);
if (erreurs.length) {
  console.error(`\n${erreurs.length} erreur(s) :\n- ${erreurs.join('\n- ')}`);
  process.exit(1);
}
console.log('\nAucune erreur bloquante.');
