<script lang="ts">
  import type { Question, Reponse } from '../types';
  import { DECADE_MAX, nomDecade } from '../format';
  import Affineur from './Affineur.svelte';

  let { question, onrepondre }: { question: Question; onrepondre: (r: Reponse) => void } = $props();

  let etape = $state<'echelle' | 'affinage'>('echelle');
  let decade = $state(3);
  let valeur = $state(0);

  const bornes = $derived({
    min: decade === 0 ? 0 : 10 ** decade,
    max: 10 ** (decade + 1),
    step: Math.max(1, Math.min(question.precision, 10 ** decade / 10)),
  });

  function choisirEchelle() {
    const milieu = 5 * 10 ** decade;
    valeur = Math.round(milieu / bornes.step) * bornes.step;
    etape = 'affinage';
  }
</script>

{#if etape === 'echelle'}
  <div class="etape">
    <p class="consigne">1. Choisis l'échelle</p>
    <output class="decade">{nomDecade(decade)}</output>
    <div class="exemple">de {(decade === 0 ? 0 : 10 ** decade).toLocaleString('fr-FR')} à {(10 ** (decade + 1)).toLocaleString('fr-FR')} {question.unite}</div>
    <input type="range" min="0" max={DECADE_MAX} step="1" bind:value={decade} aria-label="Ordre de grandeur" />
    <button type="button" class="principal" onclick={choisirEchelle}>Affiner →</button>
  </div>
{:else}
  <div class="etape">
    <p class="consigne">2. Affine la valeur</p>
    <Affineur min={bornes.min} max={bornes.max} step={bornes.step} unite={question.unite} bind:value={valeur} />
    <div class="actions">
      <button type="button" onclick={() => (etape = 'echelle')}>← Échelle</button>
      <button type="button" class="principal" onclick={() => onrepondre({ valeur, essai: 1 })}>Valider</button>
    </div>
  </div>
{/if}

<style>
  .etape {
    display: grid;
    gap: 1rem;
  }
  .consigne {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .decade {
    text-align: center;
    font-size: 1.75rem;
    font-weight: 700;
  }
  .exemple {
    text-align: center;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
    margin-top: -0.75rem;
  }
  input[type='range'] {
    width: 100%;
    accent-color: var(--accent);
  }
  .actions {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 0.5rem;
  }
</style>
