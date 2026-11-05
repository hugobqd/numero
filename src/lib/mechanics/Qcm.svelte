<script lang="ts">
  import type { Question, Reponse } from '../types';
  import { entier, lisible } from '../format';
  import { melanger } from '../daily';

  let { question, onrepondre }: { question: Question; onrepondre: (r: Reponse) => void } = $props();

  const choix = melanger([question.valeur_a_retenir, ...question.leurres], Math.random);
</script>

<div class="choix">
  {#each choix as c}
    <button type="button" onclick={() => onrepondre({ valeur: c, essai: 1 })}>
      <span class="chiffres">{c >= 1e6 ? lisible(c) : entier(c)}</span> <span class="unite">{question.unite}</span>
    </button>
  {/each}
</div>

<style>
  .choix {
    display: grid;
    gap: 0.6rem;
  }
  button {
    padding: 1rem;
    font-size: 1.25rem;
  }
  .chiffres {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .unite {
    color: var(--muted);
    font-size: 1rem;
  }
</style>
