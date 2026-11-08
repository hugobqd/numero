import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import AdminFiches from './lib/AdminFiches.svelte'

// La consultation ne monte pas le jeu et ne touche donc pas aux données des joueurs.
const Vue = new URLSearchParams(location.search).get('admin') === 'fiches' ? AdminFiches : App
const app = mount(Vue, {
  target: document.getElementById('app')!,
})

export default app
