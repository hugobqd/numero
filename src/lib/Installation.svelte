<script lang="ts">
  import { installation, installer } from './etat-installation.svelte';
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
</script>

<section class="installation" aria-labelledby="titre-installation">
  <img src="./icons/icon-192.png" width="48" height="48" alt="" />
  <div>
    <h3 id="titre-installation">Numero sur ton écran d’accueil</h3>
    {#if installation.autonome}
      <p>Tu joues dans l’application Numero.</p>
    {:else}
      <p>Retrouve le jeu en un geste, sans barre de navigateur.</p>
      {#if installation.invitation}
        <button type="button" onclick={installer} disabled={installation.enCours}>
          {installation.enCours ? 'Installation…' : 'Installer Numero'}
        </button>
      {:else if ios}
        <p>Dans Safari, ouvre le menu de partage, puis « Sur l’écran d’accueil ». Si l’option apparaît, garde « Ouvrir comme app web » activé.</p>
      {:else}
        <p>Dans le menu du navigateur, choisis « Installer l’application » ou « Ajouter à l’écran d’accueil » si l’option est proposée.</p>
      {/if}
    {/if}
    <p class="note">Après un premier chargement en ligne, le jeu reste accessible hors connexion. Ta progression reste enregistrée sur cet appareil.</p>
    <p role="status">{installation.message}</p>
  </div>
</section>

<style>
  .installation { display: grid; grid-template-columns: 3rem minmax(0, 1fr); gap: 0.75rem; }
  img { border-radius: var(--rayon-bouton); }
  h3 { margin: 0; font-size: 1rem; }
  p { margin: 0.5rem 0 0; font-size: 0.9rem; }
  p:empty { margin: 0; }
  .note { color: var(--muted); }
  button { margin-top: 0.75rem; font-weight: 600; }
</style>
