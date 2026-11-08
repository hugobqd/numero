import { defineConfig } from 'vite'
import { pwa } from './scripts/pwa.mjs'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const { version: versionPackage } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

function git(commande: string): string | null {
  try {
    return execSync(`git ${commande}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return null
  }
}

/** Commit court du build (« dev » si git n'est pas disponible). */
const commit = git('rev-parse --short HEAD') ?? 'dev'

/**
 * Numéro de version : majeur.mineur du package.json, puis le nombre de commits.
 * Il augmente donc tout seul à chaque commit, et chaque publication en porte un nouveau
 * (ex. 0.1.45). Le déploiement récupère tout l'historique (fetch-depth: 0) pour compter juste.
 */
const [majeur, mineur] = versionPackage.split('.')
const version = `${majeur}.${mineur}.${git('rev-list --count HEAD') ?? 0}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), pwa()],
  // Chemins relatifs : le site fonctionne aussi dans un sous-dossier (GitHub Pages : /numero/).
  base: './',
  // Numéro de version affiché discrètement en bas de page.
  define: {
    __VERSION__: JSON.stringify(version),
    __COMMIT__: JSON.stringify(commit),
  },
})
