import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';

// Charger les vrais modules TypeScript avec la dépendance déjà utilisée par le projet.
const dossier = mkdtempSync(join(tmpdir(), 'numero-revision-'));
let ouvrirPochetteDuJour, ouvrirPochetteBonus, ouvrirPochetteOfferte, lirePochette, effacerPochette;
try {
  for (const nom of ['joueurs', 'types', 'pochettes']) {
    const source = readFileSync(new URL(`../src/lib/${nom}.ts`, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    writeFileSync(join(dossier, `${nom}.js`), outputText);
  }
  ({ ouvrirPochetteDuJour, ouvrirPochetteBonus, ouvrirPochetteOfferte, lirePochette, effacerPochette } = createRequire(import.meta.url)(join(dossier, 'pochettes.js')));
} finally {
  rmSync(dossier, { recursive: true, force: true });
}

function scenario(faire) {
  const donnees = new Map();
  const stockage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const alea = Math.random;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (cle) => donnees.get(cle) ?? null,
    setItem: (cle, valeur) => donnees.set(cle, valeur),
    removeItem: (cle) => donnees.delete(cle),
    get length() { return donnees.size; },
    key: (index) => [...donnees.keys()][index] ?? null,
  } });
  Math.random = () => 0;
  try {
    const candidates = Array.from({ length: 12 }, (_, i) => ({
      id: `fiche-${i}`, themes: [`Thème ${i % 3}`], difficulte: { cran: 1 },
    }));
    faire(candidates, donnees);
  } finally {
    Math.random = alea;
    if (stockage) Object.defineProperty(globalThis, 'localStorage', stockage);
    else delete globalThis.localStorage;
  }
}
const sansDoublon = (a, b) => assert.deepEqual(b.fiches.filter((id) => a.fiches.includes(id)), []);

test('une pochette bonus ne reprend pas les fiches non jouées de la pochette du jour', () => scenario((candidates) => {
  const jour = ouvrirPochetteDuJour(1, candidates);
  const avant = structuredClone(jour);
  const bonus = ouvrirPochetteBonus(1, 1, candidates);
  assert.equal(jour.fiches.length, 5);
  assert.equal(bonus.fiches.length, 5);
  sansDoublon(jour, bonus);
  assert.deepEqual(lirePochette('jour-1'), avant);
}));

test('le même principe vaut si le bonus est ouvert avant la pochette du jour', () => scenario((candidates) => {
  const bonus = ouvrirPochetteBonus(1, 1, candidates);
  sansDoublon(bonus, ouvrirPochetteDuJour(1, candidates));
}));

test('les réservations de la veille et de la pochette offerte restent protégées', () => scenario((candidates) => {
  const offerte = ouvrirPochetteOfferte(1, candidates);
  const jour = ouvrirPochetteDuJour(1, candidates);
  const lendemain = ouvrirPochetteDuJour(2, candidates);
  sansDoublon(offerte, jour);
  sansDoublon(offerte, lendemain);
  sansDoublon(jour, lendemain);
  assert.equal(lendemain.fiches.length, 2);
  assert.equal(ouvrirPochetteBonus(1, 2, candidates), null);
  assert.equal(lirePochette('bonus-1'), null);
}));

test('les pochettes des autres joueurs ne réservent pas les fiches du joueur actif', () => scenario((candidates, donnees) => {
  donnees.set('numero:joueurActif', JSON.stringify('alice'));
  const alice = ouvrirPochetteDuJour(1, candidates);
  donnees.set('numero:joueurActif', JSON.stringify('bob'));
  assert.deepEqual(ouvrirPochetteDuJour(1, candidates).fiches, alice.fiches);
}));

test('effacer une pochette de test libère ses réservations', () => scenario((candidates) => {
  const jour = ouvrirPochetteDuJour(1, candidates);
  effacerPochette(jour.id);
  assert.deepEqual(ouvrirPochetteBonus(1, 1, candidates).fiches, jour.fiches);
}));
