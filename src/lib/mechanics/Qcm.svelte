<script lang="ts">
  import type { Question, Reponse } from '../types';
  import { grand } from '../format';
  import { propositionsQcm, type Difficulte } from '../propositions';

  let {
    question,
    numero,
    difficulte = 'normale',
    onrepondre,
  }: { question: Question; numero: number; difficulte?: Difficulte; onrepondre: (r: Reponse) => void } = $props();

  // 4 propositions, triées du plus petit au plus grand.
  const choix = propositionsQcm(question, numero, difficulte);
</script>

<div class="choix">
  {#each choix as c}
    {@const g = grand(c, question.unite, question.precision)}
    <button type="button" onclick={() => onrepondre({ valeur: c, essai: 1, propositions: choix })}>
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
    padding: 0.9rem 1rem;
    font-size: 1.25rem;
  }
  .chiffres {
    font-size: 1.9rem;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .unite {
    color: var(--muted);
    font-size: 1rem;
  }
</style>
