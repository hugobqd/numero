import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { serviceWorker, pwa } from '../scripts/pwa.mjs';

function environnement(version = 'v2') {
  const evenements = {};
  const appels = [];
  const scope = 'https://exemple.fr/numero/';
  const cache = {
    addAll: async (urls) => appels.push(['precache', urls]),
    match: async (key) => key === `${scope}index.html` ? 'html-v2' : undefined,
  };
  const caches = {
    open: async () => cache,
    keys: async () => [`numero-pwa-${scope}v1`, `numero-pwa-${scope}v2`, 'autre-cache', 'numero-pwa-https://exemple.fr/autre/v1'],
    delete: async (nom) => appels.push(['delete', nom]),
  };
  const self = {
    registration: { scope },
    clients: { claim: async () => appels.push(['claim']) },
    addEventListener: (nom, fn) => { evenements[nom] = fn; },
  };
  vm.runInNewContext(serviceWorker(['index.html', 'assets/app.js'], version), {
    self, caches, URL, fetch: async (req) => { appels.push(['fetch', req.url]); return 'reseau'; },
  });
  return { evenements, appels, cache, scope };
}

test('manifeste autonome, chemins relatifs et icônes PNG aux dimensions annoncées', () => {
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  assert.equal(manifest.display, 'standalone');
  for (const cle of ['id', 'scope', 'start_url']) assert.equal(manifest[cle], './');
  for (const icon of manifest.icons) {
    const png = readFileSync(`public/${icon.src}`);
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
  assert(manifest.icons.some((i) => i.purpose === 'maskable'));
});

test('installation précache tous les fichiers dans le sous-dossier sans activation forcée', async () => {
  const { evenements, appels, scope } = environnement();
  let promesse;
  evenements.install({ waitUntil: (p) => { promesse = p; } });
  await promesse;
  assert.deepEqual(Array.from(appels[0][1]), [`${scope}index.html`, `${scope}assets/app.js`]);
  assert.equal(appels.length, 1); // Aucun skipWaiting : le défi en cours garde sa version.
});

test('échec du précache refuse l’installation de la nouvelle version', async () => {
  const { evenements, cache } = environnement();
  cache.addAll = async () => { throw new Error('hors connexion'); };
  let promesse;
  evenements.install({ waitUntil: (p) => { promesse = p; } });
  await assert.rejects(promesse, /hors connexion/);
});

test('activation supprime seulement les anciennes versions de ce jeu et de ce chemin', async () => {
  const { evenements, appels, scope } = environnement();
  let promesse;
  evenements.activate({ waitUntil: (p) => { promesse = p; } });
  await promesse;
  assert.deepEqual(appels, [['delete', `numero-pwa-${scope}v1`], ['claim']]);
});

test('navigation hors connexion avec paramètres reprend le HTML précaché', async () => {
  const { evenements, scope, appels } = environnement();
  for (const path of ['?meca=qcm', 'index.html?admin=fiches']) {
    let reponse;
    evenements.fetch({ request: { url: scope + path, mode: 'navigate', method: 'GET' }, respondWith: (p) => { reponse = p; } });
    assert.equal(await reponse, 'html-v2');
  }
  assert.deepEqual(appels, []);
});

test('autres sites, chemins et requêtes POST restent au navigateur', () => {
  const { evenements, scope } = environnement();
  for (const [url, mode, method] of [
    ['https://fonts.googleapis.com/css', 'cors', 'GET'],
    [scope + 'inexistant', 'navigate', 'GET'],
    [scope, 'navigate', 'POST'],
  ]) {
    evenements.fetch({ request: { url, mode, method }, respondWith: () => assert.fail('requête interceptée') });
  }
});

test('générateur versionne le cache quand le contenu ou le nom des fichiers change', () => {
  const generer = (code, fileName) => {
    let source;
    pwa().generateBundle.handler.call({ emitFile: (asset) => { source = asset.source; } }, {}, {
      'index.html': { type: 'asset', source: '<html />' },
      [fileName]: { type: 'chunk', code },
    });
    return source;
  };
  assert.notEqual(generer('a', 'a.js'), generer('b', 'a.js'));
  assert.notEqual(generer('a', 'a.js'), generer('a', 'b.js'));
  assert.equal(generer('a', 'a.js'), generer('a', 'a.js'));
});

test('build refusé si le HTML n’est pas encore généré (ordre des plugins)', () => {
  assert.throws(() => pwa().generateBundle.handler.call({}, {}, {}), /index.html/);
});
