<script lang="ts">
  import QRCode from 'qrcode';

  /** Adresse publique du prototype, à scanner pour jouer sur un autre téléphone. */
  const URL_SITE = 'https://hugobqd.github.io/numero/';

  let ouvert = $state(false);
  let svg = $state('');
  let message = $state('');

  async function ouvrir() {
    ouvert = true;
    message = '';
    if (!svg) svg = await QRCode.toString(URL_SITE, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
  }

  async function copier() {
    try {
      await navigator.clipboard.writeText(URL_SITE);
      message = 'Lien copié';
    } catch {
      message = 'Copie impossible';
    }
  }

  function fermerSurFond(e: MouseEvent) {
    if (e.target === e.currentTarget) ouvert = false;
  }
</script>

<svelte:window onkeydown={(e) => ouvert && e.key === 'Escape' && (ouvert = false)} />

<button type="button" class="lien-partage" onclick={ouvrir}>Partager</button>

{#if ouvert}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="fond" onclick={fermerSurFond}>
    <div class="fenetre" role="dialog" aria-modal="true" aria-labelledby="titre-partage">
      <h2 id="titre-partage">Faire jouer quelqu'un</h2>
      <p>Scanne ce code avec l'appareil photo du téléphone :</p>
      <div class="qr" aria-label="QR code vers {URL_SITE}" role="img">{@html svg}</div>
      <p class="url">{URL_SITE}</p>
      <div class="actions">
        <button type="button" onclick={copier}>Copier le lien</button>
        <button type="button" class="principal" onclick={() => (ouvert = false)}>Fermer</button>
      </div>
      {#if message}<p class="message">{message}</p>{/if}
    </div>
  </div>
{/if}

<style>
  .lien-partage {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 0.15em;
    cursor: pointer;
  }
  .fond {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgb(0 0 0 / 0.5);
  }
  .fenetre {
    width: min(20rem, 100%);
    display: grid;
    gap: 0.75rem;
    padding: 1.25rem;
    border-radius: 1rem;
    background: var(--bg);
    border: 1px solid var(--border);
    text-align: center;
    color: var(--fg);
    font-size: 1rem;
    opacity: 1;
  }
  h2 {
    margin: 0;
    font-size: 1.2rem;
  }
  p {
    margin: 0;
  }
  /* Le QR reste noir sur blanc, même en mode sombre, pour être lisible par les appareils photo. */
  .qr {
    background: #fff;
    border-radius: 0.5rem;
    padding: 0.5rem;
  }
  .qr :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }
  .url {
    font-size: 0.85rem;
    color: var(--muted);
    overflow-wrap: anywhere;
  }
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .message {
    font-size: 0.85rem;
    color: var(--muted);
  }
</style>
