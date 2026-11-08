import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';

const dossier = mkdtempSync(join(tmpdir(), 'numero-catalogue-'));
let indexerCatalogue, selectionnerFiches, filtresVides, compterOptions;
try {
  for (const nom of ['catalogue', 'lots-historiques']) {
    const source = readFileSync(new URL(`../src/lib/${nom}.ts`, import.meta.url), 'utf8');
    writeFileSync(join(dossier, `${nom}.js`), ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText);
  }
  ({ indexerCatalogue, selectionnerFiches, filtresVides, compterOptions } = createRequire(import.meta.url)(join(dossier, 'catalogue.js')));
} finally {
  rmSync(dossier, { recursive: true, force: true });
}
const fichiers = Object.fromEntries(readdirSync(new URL('../src/data/', import.meta.url)).filter((f) => f.endsWith('.json'))
  .map((f) => [f, JSON.parse(readFileSync(new URL(`../src/data/${f}`, import.meta.url), 'utf8'))]));
const catalogue = indexerCatalogue(fichiers);

test('retrouve les lots des 150 fiches, y compris les lots historiques mélangés entre fichiers', () => {
  const effectifs = {};
  for (const { lot } of catalogue) effectifs[lot] = (effectifs[lot] ?? 0) + 1;
  assert.deepEqual(effectifs, { 0: 5, 1: 54, 2: 25, 3: 25, 4: 25, 5: 16 });
  const fiche = catalogue[0].fiche;
  assert.equal(indexerCatalogue({ 'divers.json': [{ ...fiche, id: 'nouvelle-fiche' }] })[0].lot, null);
  assert.equal(indexerCatalogue({ 'lot-7.json': [{ ...fiche, id: 'nouvelle-fiche' }] })[0].lot, 7);
});

test('combine thème, tag, lot, statut et recherche insensible aux accents', () => {
  const resultat = selectionnerFiches(catalogue, {
    ...filtresVides(), theme: 'Géographie', tag: 'France', lot: '2', statut: 'brouillon', recherche: 'regions METROPOLITAINE',
  }, 'enonce', 'asc');
  assert.deepEqual(resultat.map(({ fiche }) => fiche.id), ['humanite-regions-metropole']);
});

test('repère les sources à compléter et garde les filtres indépendants du stock jouable', () => {
  const resultat = selectionnerFiches(catalogue, { ...filtresVides(), aCompleter: true }, 'enonce', 'asc');
  assert.equal(resultat.length, 5);
  assert(resultat.every(({ fiche }) => !fiche.source.recoupement));
  assert.equal(selectionnerFiches(catalogue, { ...filtresVides(), lot: '3' }, 'enonce', 'asc').length, 25);
});

test('trie les nombres sans modifier le stock et conserve les valeurs absentes en dernier', () => {
  const modele = catalogue[0];
  const donnees = [
    { ...modele, fiche: { ...modele.fiche, id: 'b', valeur_a_retenir: 10, difficulte: undefined } },
    { ...modele, fiche: { ...modele.fiche, id: 'a', valeur_a_retenir: 2, difficulte: { cran: 2, justification: 'Collège' } } },
  ];
  const avant = structuredClone(donnees);
  assert.deepEqual(selectionnerFiches(donnees, filtresVides(), 'valeur', 'asc').map(({ fiche }) => fiche.id), ['a', 'b']);
  assert.deepEqual(selectionnerFiches(donnees, filtresVides(), 'valeur', 'desc').map(({ fiche }) => fiche.id), ['b', 'a']);
  for (const ordre of ['asc', 'desc']) assert.equal(selectionnerFiches(donnees, filtresVides(), 'difficulte', ordre).at(-1).fiche.id, 'b');
  assert.deepEqual(donnees, avant);
});

test('les effectifs des options tiennent compte des autres filtres sans masquer les alternatives', () => {
  const filtres = { ...filtresVides(), theme: 'Géographie' };
  const themes = compterOptions(catalogue, filtres, 'theme');
  assert.equal(themes.total, 150);
  assert.equal(themes.nombres.get('Astronomie'), 16);
  assert.equal(themes.nombres.get('Géographie'), 25);
  const lots = compterOptions(catalogue, filtres, 'lot');
  assert.equal(lots.total, 25);
  assert.equal([...lots.nombres.values()].reduce((a, b) => a + b, 0), 25);
  const aucun = compterOptions(catalogue, { ...filtres, recherche: 'aucune-fiche-xyz' }, 'theme');
  assert.equal(aucun.total, 0);
  assert.equal(aucun.nombres.size, 0);
});
