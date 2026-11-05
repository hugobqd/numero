<script lang="ts">
  import type { Question, Reponse } from '../types';
  import { bornesQuestion } from '../format';
  import Affineur from './Affineur.svelte';

  let { question, onrepondre }: { question: Question; onrepondre: (r: Reponse) => void } = $props();

  // L'échelle est fixée par la question : le joueur ne règle que la valeur.
  const { min, max, step, depart } = bornesQuestion(question);
  let valeur = $state(depart);
</script>

<div class="etape">
  <Affineur {min} {max} {step} unite={question.unite} bind:value={valeur} />
  <button type="button" class="principal" onclick={() => onrepondre({ valeur, essai: 1 })}>Valider</button>
</div>

<style>
  .etape {
    display: grid;
    gap: 1rem;
  }
</style>
