<script lang="ts">
  import { grand } from '../format';

  let {
    min,
    max,
    step,
    unite,
    value = $bindable(),
  }: { min: number; max: number; step: number; unite: string; value: number } = $props();

  // Curseur seul, sans boutons d'ajustement : il avance au pas de la question,
  // pour qu'on puisse toujours atteindre la valeur exacte (au doigt ou aux flèches du clavier).
  const affiche = $derived(grand(Number(value), unite, step));
</script>

<div class="affineur">
  <output class="valeur" aria-live="polite">
    <span class="chiffres">{affiche.chiffres}</span>
    <span class="unite">{affiche.unite}</span>
  </output>

  <input type="range" {min} {max} {step} bind:value aria-label="Valeur" />
</div>

<style>
  .affineur {
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
</style>
