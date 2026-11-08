import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';

// Charger les vrais modules TypeScript avec la dépendance déjà utilisée par le projet.
const dossier = mkdtempSync(join(tmpdir(), 'numero-revision-'));
let choisirRevision;
try {
  for (const nom of ['joueurs', 'collection']) {
    const source = readFileSync(new URL(`../src/lib/${nom}.ts`, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    writeFileSync(join(dossier, `${nom}.js`), outputText);
  }
  ({ choisirRevision } = createRequire(import.meta.url)(join(dossier, 'collection.js')));
} finally {
  rmSync(dossier, { recursive: true, force: true });
}

function jeu(decouvertes, enCours, acquises) {
  const collection = {};
  const stock = [];
  for (const [etat, nombre] of [['decouverte', decouvertes], ['en-cours', enCours], ['acquise', acquises]]) {
    for (let i = 0; i < nombre; i++) {
      const id = `${etat}-${i}`;
      stock.push({ id });
      collection[id] = { etat, derniereRevision: `2026-11-${String(i + 1).padStart(2, '0')}T12:00:00Z` };
    }
  }
  return { collection, stock };
}
const ids = (resultat) => resultat.map((q) => q.id);

for (const [nom, nombres, attendus] of [
  ['réserve 3 découvertes, 1 en cours et 1 acquise', [6, 3, 2], [3, 1, 1]],
  ['remplace une découverte manquante par une fiche en cours', [2, 3, 2], [2, 2, 1]],
  ['garde la place acquise même sans découverte', [0, 6, 2], [0, 4, 1]],
  ['remplace les états absents par les découvertes disponibles', [6, 0, 0], [5, 0, 0]],
  ['complète avec les acquises quand les autres états sont épuisés', [1, 1, 6], [1, 1, 3]],
  ['accepte une collection de moins de cinq fiches', [1, 0, 1], [1, 0, 1]],
  ['accepte une collection vide', [0, 0, 0], [0, 0, 0]],
]) {
  test(nom, () => {
    const { collection, stock } = jeu(...nombres);
    const avant = structuredClone({ collection, stock });
    const resultat = choisirRevision(collection, stock);
    assert.deepEqual(['decouverte', 'en-cours', 'acquise'].map((etat) =>
      resultat.filter((q) => collection[q.id].etat === etat).length), attendus);
    assert.equal(new Set(ids(resultat)).size, resultat.length);
    assert.deepEqual({ collection, stock }, avant);
  });
}

test('choisit les jamais révisées puis les plus anciennes dans chaque état, y compris en complément', () => {
  const { collection, stock } = jeu(0, 6, 2);
  collection['en-cours-5'].derniereRevision = null;
  collection['acquise-1'].derniereRevision = null;
  assert.deepEqual(ids(choisirRevision(collection, stock)), [
    'en-cours-5', 'acquise-1', 'en-cours-0', 'en-cours-1', 'en-cours-2',
  ]);
});

test('ignore les fiches retirées et celles qui ne sont pas possédées', () => {
  const { collection, stock } = jeu(3, 1, 1);
  delete collection['decouverte-0'];
  stock.push({ id: 'inconnue' });
  collection.retiree = { etat: 'decouverte', derniereRevision: null };
  const resultat = ids(choisirRevision(collection, stock));
  assert.equal(resultat.length, 4);
  assert(!resultat.includes('inconnue'));
  assert(!resultat.includes('retiree'));
  assert(!resultat.includes('decouverte-0'));
});
