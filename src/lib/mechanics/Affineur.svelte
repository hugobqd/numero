<script lang="ts">
  import { entier, lisible } from '../format';

  let {
    min,
    max,
    step,
    unite,
    value = $bindable(),
  }: { min: number; max: number; step: number; unite: string; value: number } = $props();

  // Le curseur garde au plus ~1000 crans ; les boutons donnent la précision fine.
  const pasCurseur = $derived.by(() => {
    let p = step;
    while ((max - min) / p > 1000) p *= 10;
    return p;
  });

  const pasBoutons = $derived.by(() => {
    const pas = [step];
    while (pas.length < 3 && pas[pas.length - 1] * 10 <= (max - min) / 10) pas.push(pas[pas.length - 1] * 10);
    return pas.reverse();
  });

  function ajuster(delta: number) {
    const v = Math.round((Number(value) + delta) / step) * step;
    value = Math.min(max, Math.max(min, v));
  }
</script>

<div class="affineur">
  <output class="valeur" aria-live="polite">
    <span class="chiffres">{entier(value)}</span>
    <span class="unite">{unite}</span>
  </output>
  {#if value >= 1e6}<div class="lisible">{lisible(value)}</div>{/if}

  <input
    type="range"
    {min}
    {max}
    step={pasCurseur}
    bind:value
    aria-label="Valeur"
  />

  <div class="boutons" style:grid-template-columns="repeat({pasBoutons.length}, 1fr)">
    {#each pasBoutons as p}
      <button type="button" class="pas" onclick={() => ajuster(-p)}>−{entier(p)}</button>
    {/each}
    {#each [...pasBoutons].reverse() as p}
      <button type="button" class="pas" onclick={() => ajuster(p)}>+{entier(p)}</button>
    {/each}
  </div>
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
  .lisible {
    text-align: center;
    color: var(--muted);
    margin-top: -0.5rem;
  }
  input[type='range'] {
    width: 100%;
    accent-color: var(--accent);
  }
  .boutons {
    display: grid;
    gap: 0.4rem;
  }
  .pas {
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
    padding: 0.5rem 0.25rem;
  }
</style>
