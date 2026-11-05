<script lang="ts">
  import type { Question, Reponse } from '../types';
  import { grand } from '../format';
  import { melanger } from '../daily';
  import { propositions } from '../propositions';

  let { question, onrepondre }: { question: Question; onrepondre: (r: Reponse) => void } = $props();

  const choix = melanger(propositions(question), Math.random);
</script>

<div class="choix">
  {#each choix as c}
    {@const g = grand(c, question.unite, question.precision)}
    <button type="button" onclick={() => onrepondre({ valeur: c, essai: 1 })}>
      <span class="chiffres">{g.chiffres}</span> <span class="unite">{g.unite}</span>
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
