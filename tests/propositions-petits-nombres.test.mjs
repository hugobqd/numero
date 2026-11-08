import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';

const dossier = mkdtempSync(join(tmpdir(), 'numero-propositions-'));
let propositions;
try {
  const source = readFileSync(new URL('../src/lib/propositions.ts', import.meta.url), 'utf8');
  writeFileSync(join(dossier, 'propositions.cjs'), ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText);
  ({ propositions } = createRequire(import.meta.url)(join(dossier, 'propositions.cjs')));
} finally {
  rmSync(dossier, { recursive: true, force: true });
}

for (const valeur of [3, 4, 5, 10, 20, 30, 1000]) {
  test(`cinq propositions distinctes même pour une réponse de ${valeur}`, () => {
    const fiche = {
      id: `petit-nombre-${valeur}`, valeur_a_retenir: valeur, precision: 1,
      leurres: [1, 2, 4, 5, 6, 7, 12, 24].filter((v) => v !== valeur)
        .map((v) => ({ valeur: v, type: 'proche' })),
    };
    for (const exigence of ['decouverte', 'normale', 'experte']) {
      for (let graine = 1; graine <= 30; graine++) {
        const choix = propositions(fiche, graine, exigence);
        assert.equal(choix.length, 5, `${exigence}, graine ${graine} : ${choix}`);
        assert.equal(new Set(choix).size, 5);
        assert(choix.includes(valeur));
        assert(choix.every((v) => Number.isInteger(v) && v > 0));
      }
    }
  });
}
