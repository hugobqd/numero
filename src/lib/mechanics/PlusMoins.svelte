<script lang="ts">
  import type { Question, Reponse, VarianteScore } from '../types';
  import { decadeDe, entier, nomDecade } from '../format';
  import { estTrouve } from '../score';
  import Affineur from './Affineur.svelte';

  const ESSAIS_MAX = 3;

  let {
    question,
    variante,
    onrepondre,
  }: { question: Question; variante: VarianteScore; onrepondre: (r: Reponse) => void } = $props();

  // L'ordre de grandeur est révélé d'entrée.
  const decade = decadeDe(question.valeur_a_retenir);
  const min = decade === 0 ? 0 : 10 ** decade;
  const max = 10 ** (decade + 1);
  const step = Math.max(1, Math.min(question.precision, 10 ** decade / 10));

  let valeur = $state(Math.round((5 * 10 ** decade) / step) * step);
  let historique = $state<{ valeur: number; indice: 'plus' | 'moins' }[]>([]);

  function proposer() {
    const essai = historique.length + 1;
    if (estTrouve(question, valeur, variante) || essai >= ESSAIS_MAX) {
      onrepondre({ valeur, essai });
      return;
    }
    historique.push({ valeur, indice: valeur < question.valeur_a_retenir ? 'plus' : 'moins' });
  }
</script>

<div class="plusmoins">
  <p class="indice-depart">
    Indice : c'est dans les <strong>{nomDecade(decade)}</strong>
    (entre {entier(min)} et {entier(max)} {question.unite}).
  </p>

  {#if historique.length}
    <ol class="historique">
      {#each historique as h}
        <li>
          <span class="chiffres">{entier(h.valeur)}</span>
          <span class="fleche">{h.indice === 'plus' ? '↑ C’est plus' : '↓ C’est moins'}</span>
        </li>
      {/each}
    </ol>
  {/if}

  <Affineur {min} {max} {step} unite={question.unite} bind:value={valeur} />

  <button type="button" class="principal" onclick={proposer}>
    Proposer ({historique.length + 1}/{ESSAIS_MAX})
  </button>
</div>

<style>
  .plusmoins {
    display: grid;
    gap: 1rem;
  }
  .indice-depart {
    margin: 0;
    color: var(--muted);
  }
  .historique {
    margin: 0;
    padding-left: 1.25rem;
    display: grid;
    gap: 0.25rem;
  }
  .chiffres {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
  .fleche {
    color: var(--accent);
    margin-left: 0.5rem;
  }
</style>
