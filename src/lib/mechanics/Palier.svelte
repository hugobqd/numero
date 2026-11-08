<script lang="ts">
  import type { Question, Reponse } from '../types';
  import { avecUnite, grand } from '../format';
  import { propositions, type Difficulte } from '../propositions';

  let {
    question,
    numero,
    difficulte = 'normale',
    onrepondre,
  }: { question: Question; numero: number; difficulte?: Difficulte; onrepondre: (r: Reponse) => void } = $props();

  // Mêmes propositions que le QCM, présentées comme les crans d'un curseur.
  const paliers = propositions(question, numero, difficulte);
  let index = $state(Math.floor((paliers.length - 1) / 2));

  const affiche = $derived(grand(paliers[index], question.unite, question.precision));
</script>

<div class="palier">
  <output class="valeur" aria-live="polite">
    <span class="chiffres">{affiche.chiffres}</span>
    <span class="unite">{affiche.unite}</span>
  </output>

  <input
    type="range"
    min="0"
    max={paliers.length - 1}
    step="1"
    bind:value={index}
    style:--ratio={index / Math.max(1, paliers.length - 1)}
    aria-label="Choisis une proposition"
    aria-valuetext={avecUnite(paliers[index], question.unite, question.precision)}
  />
  <!-- Un cran par proposition, chacun centré sous la position du pouce. -->
  <ol class="crans">
    {#each paliers as p, i}
      <li>
        <button type="button" class:actif={i === index} onclick={() => (index = i)}>
          {grand(p, '', question.precision).chiffres}<small>{grand(p).unite}</small>
        </button>
      </li>
    {/each}
  </ol>

  <button type="button" class="principal" onclick={() => onrepondre({ valeur: paliers[index], essai: 1, propositions: paliers })}>
    Valider
  </button>
</div>

<style>
  .palier {
    display: grid;
    gap: 0.75rem;
  }
  .valeur {
    display: flex;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  /* La valeur en cours : le plus gros élément de l'écran. */
  .chiffres {
    font-size: clamp(2.75rem, 20cqi, 6rem);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .unite {
    color: var(--muted);
    font-size: 1.2rem;
    font-weight: 600;
  }
  /*
   * Curseur dessiné à la main : la taille du pouce est connue, ce qui permet de placer chaque cran
   * (trait et valeur) exactement sous la position du pouce, d'une demi-largeur de pouce à l'autre.
   */
  .palier {
    --pouce: 1.6rem;
    --piste: 0.45rem;
  }
  input[type='range'] {
    /* La piste se remplit jusqu'au centre du pouce. */
    --remplissage: calc(var(--pouce) / 2 + (100% - var(--pouce)) * var(--ratio));
    width: 100%;
    height: var(--pouce);
    margin: 0;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }
  input[type='range']::-webkit-slider-runnable-track {
    height: var(--piste);
    border-radius: 1rem;
    background: linear-gradient(to right, var(--accent) var(--remplissage), var(--surface-2) var(--remplissage));
  }
  input[type='range']::-moz-range-track {
    height: var(--piste);
    border-radius: 1rem;
    background: linear-gradient(to right, var(--accent) var(--remplissage), var(--surface-2) var(--remplissage));
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: var(--pouce);
    height: var(--pouce);
    margin-top: calc((var(--piste) - var(--pouce)) / 2);
    border: none;
    border-radius: 50%;
    background: var(--accent);
  }
  input[type='range']::-moz-range-thumb {
    width: var(--pouce);
    height: var(--pouce);
    border: none;
    border-radius: 50%;
    background: var(--accent);
  }
  input[type='range']:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
    border-radius: 1rem;
  }
  /* Les crans, répartis entre les deux positions extrêmes du centre du pouce ; chaque valeur est centrée sur le sien. */
  .crans {
    list-style: none;
    margin: -0.5rem 0 0;
    padding: 0 calc(var(--pouce) / 2);
    display: flex;
    justify-content: space-between;
  }
  .crans li {
    width: 0;
    display: flex;
    justify-content: center;
  }
  .crans button {
    position: relative;
    flex: none;
    padding: 0.7rem 0.3rem 0.35rem;
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    white-space: nowrap;
    background: transparent;
    border-color: transparent;
    color: var(--muted);
  }
  /* Le trait du cran, au-dessus de la valeur. */
  .crans button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 0.4rem;
    margin-left: -1px;
    border-radius: 1px;
    background: currentColor;
  }
  .crans small {
    display: block;
    font-size: 0.75rem;
  }
  .palier > .principal {
    margin-top: 1rem;
  }
  .crans button.actif {
    color: var(--fg);
    font-weight: 700;
  }
</style>
