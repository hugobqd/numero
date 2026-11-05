import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

/** Commit court du build (« dev » si git n'est pas disponible). */
function commit(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Chemins relatifs : le site fonctionne aussi dans un sous-dossier (GitHub Pages : /numero/).
  base: './',
  // Numéro de version affiché discrètement en bas de page.
  define: {
    __VERSION__: JSON.stringify(version),
    __COMMIT__: JSON.stringify(commit()),
  },
})
