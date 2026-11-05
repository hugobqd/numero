<script lang="ts">
  import type { Question, Reponse } from '../types';
  import { avecUnite, grand } from '../format';
  import { propositions } from '../propositions';

  let { question, onrepondre }: { question: Question; onrepondre: (r: Reponse) => void } = $props();

  // Mêmes propositions que le QCM, présentées comme les crans d'un curseur.
  const paliers = propositions(question);
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
    list="crans-{question.id}"
    aria-label="Choisis une proposition"
    aria-valuetext={avecUnite(paliers[index], question.unite, question.precision)}
  />
  <datalist id="crans-{question.id}">
    {#each paliers as _, i}<option value={i}></option>{/each}
  </datalist>

  <ol class="crans" style:grid-template-columns="repeat({paliers.length}, 1fr)">
    {#each paliers as p, i}
      <li>
        <button type="button" class:actif={i === index} onclick={() => (index = i)}>
          {grand(p, '', question.precision).chiffres}<small>{grand(p).unite}</small>
        </button>
      </li>
    {/each}
  </ol>

  <button type="button" class="principal" onclick={() => onrepondre({ valeur: paliers[index], essai: 1 })}>
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
  .chiffres {
    font-size: clamp(2rem, 9vw, 3rem);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .unite {
    color: var(--muted);
  }
  input[type='range'] {
    width: 100%;
    accent-color: var(--accent);
  }
  .crans {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.25rem;
  }
  .crans button {
    width: 100%;
    padding: 0.35rem 0.1rem;
    font-size: 0.7rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    background: transparent;
    border-color: transparent;
    color: var(--muted);
  }
  .crans small {
    display: block;
    font-size: 0.65rem;
  }
  .crans button.actif {
    color: var(--fg);
    border-color: var(--accent);
    font-weight: 700;
  }
</style>
