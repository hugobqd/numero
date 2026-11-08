import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';

/** Tous les fichiers livrés, y compris les illustrations, sont disponibles hors connexion. */
export function pwa() {
  return {
    name: 'numero-pwa',
    apply: 'build',
    generateBundle: { order: 'post', handler(_options, bundle) {
      if (!bundle['index.html']) throw new Error('Numero PWA : index.html doit être généré avant le service worker.');
      const fichiersPublics = ['manifest.webmanifest', ...readdirSync('public/icons').map((f) => `icons/${f}`)];
      const fichiers = [...Object.keys(bundle), ...fichiersPublics].sort();
      const hash = createHash('sha256');
      for (const nom of fichiers) {
        hash.update(nom);
        hash.update(bundle[nom] ? (bundle[nom].type === 'chunk' ? bundle[nom].code : bundle[nom].source) : readFileSync(`public/${nom}`));
      }
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorker(fichiers, hash.digest('hex').slice(0, 16)) });
    } },
  };
}

export function serviceWorker(fichiers, version) {
  return `// Généré au build : cache cohérent, activation au prochain démarrage, jamais au milieu d'un défi.
const PREFIX = 'numero-pwa-' + self.registration.scope;
const CACHE = PREFIX + '${version}';
const ASSETS = ${JSON.stringify(fichiers)}.map(p => new URL(p, self.registration.scope).href);
const INDEX = new URL('index.html', self.registration.scope).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const accueil = url.origin + url.pathname;
  const navigation = event.request.mode === 'navigate' &&
    (accueil === self.registration.scope || accueil === INDEX);
  if (!navigation && !ASSETS.includes(url.href)) return;
  event.respondWith(caches.open(CACHE).then(async cache =>
    (await cache.match(navigation ? INDEX : event.request)) || fetch(event.request)
  ));
});
`;
}
