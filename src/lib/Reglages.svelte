<script lang="ts">
  import type { Mecanique } from './types';
  import { MECAS } from './params';

  /** Mes réglages : le mode de réponse et le changement de joueur. */
  let {
    pseudo,
    meca,
    onmeca,
    onjoueurs,
  }: {
    pseudo: string;
    /** Mode de réponse choisi par le joueur. */
    meca: Mecanique;
    onmeca: (m: Mecanique) => void;
    /** Ouvre l'écran Joueurs (choisir, créer, supprimer). */
    onjoueurs: () => void;
  } = $props();

  const MODES: Record<Mecanique, { nom: string; aide: string }> = {
    palier: { nom: 'Palier', aide: 'Un curseur à 5 crans : choisis le bon, puis valide.' },
    qcm: { nom: 'QCM', aide: '5 valeurs : touche la bonne.' },
    plusmoins: { nom: 'Plus ou moins', aide: 'Plus grand ou plus petit ? 3 coups au plus, une erreur fait perdre.' },
  };
</script>

<section class="reglages">
  <h2>Mes réglages</h2>

  <fieldset class="mode">
    <legend>Mode de réponse</legend>
    <div class="segments">
      {#each MECAS as m}
        <label class:actif={m === meca}>
          <input type="radio" name="mode-reponse" value={m} checked={m === meca} onchange={() => onmeca(m)} />
          {MODES[m].nom}
        </label>
      {/each}
    </div>
    <p class="note">{MODES[meca].aide}</p>
  </fieldset>

  <div class="bloc">
    <h3>Joueur</h3>
    <div class="joueur">
      <strong>{pseudo}</strong>
      <button type="button" onclick={onjoueurs}>Changer de joueur</button>
    </div>
  </div>
</section>

<style>
  .reglages {
    display: grid;
    gap: 1.75rem;
    padding-top: 0.5rem;
  }
  h2 {
    margin: 0;
    font-size: 2.6rem;
    font-weight: 900;
    line-height: 0.95;
  }
  h3,
  .mode legend {
    margin: 0 0 0.5rem;
    padding: 0;
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--muted);
  }
  .bloc {
    display: grid;
  }
  .joueur {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    background: var(--surface);
    border-radius: var(--rayon-bouton);
    font-size: 1.05rem;
  }
  .joueur strong {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .joueur button {
    flex: none;
    min-height: 2.75rem;
    padding: 0.5rem 0.9rem;
    background: var(--bg);
    font-weight: 600;
  }
  .joueur button:hover {
    background: var(--surface-2);
  }
  /* Mode de réponse : trois boutons segmentés ; le choix s'applique dès la question suivante. */
  .mode {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    border: none;
  }
  .segments {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem;
    padding: 0.25rem;
    background: var(--surface);
    border-radius: var(--rayon-bouton);
  }
  .segments label {
    display: grid;
    place-items: center;
    min-height: 2.75rem;
    padding: 0.4rem 0.3rem;
    border-radius: var(--rayon-petit);
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
    color: var(--muted);
    cursor: pointer;
  }
  .segments label.actif {
    background: var(--bg);
    color: var(--fg);
    box-shadow: 0 0 0 2px var(--accent);
  }
  .segments label:has(input:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .segments input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .note {
    margin: 0;
    font-size: 0.85rem;
    color: var(--muted);
  }
</style>
