import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { suivreInstallation } from './lib/etat-installation.svelte'
import AdminFiches from './lib/AdminFiches.svelte'

suivreInstallation()
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
      console.warn('Numero : le mode hors connexion est indisponible.', error)
    })
  })
}

// La consultation ne monte pas le jeu et ne touche donc pas aux données des joueurs.
const Vue = new URLSearchParams(location.search).get('admin') === 'fiches' ? AdminFiches : App
const app = mount(Vue, {
  target: document.getElementById('app')!,
})

export default app
