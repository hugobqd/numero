<script lang="ts">
  import { avecUnite, grand } from '../format';

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

  // Boutons d'ajustement : le pas fin (±1 pas) et, si la plage le permet, un pas ×100 ;
  // pas de niveau intermédiaire ×10, jugé superflu.
  const pasBoutons = $derived.by(() => {
    const pas = [step];
    if (step * 100 <= (max - min) / 10) pas.push(step * 100);
    return pas.reverse();
  });

  const affiche = $derived(grand(Number(value), unite, step));

  function ajuster(delta: number) {
    const v = Math.round((Number(value) + delta) / step) * step;
    value = Math.min(max, Math.max(min, v));
  }
</script>

<div class="affineur">
  <output class="valeur" aria-live="polite">
    <span class="chiffres">{affiche.chiffres}</span>
    <span class="unite">{affiche.unite}</span>
  </output>

  <input
    type="range"
    {min}
    {max}
    step={pasCurseur}
    bind:value
    aria-label="Valeur"
  />

  <div class="boutons" style:grid-template-columns="repeat({pasBoutons.length * 2}, 1fr)">
    {#each pasBoutons as p}
      <button type="button" class="pas" onclick={() => ajuster(-p)}>−{avecUnite(p)}</button>
    {/each}
    {#each [...pasBoutons].reverse() as p}
      <button type="button" class="pas" onclick={() => ajuster(p)}>+{avecUnite(p)}</button>
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
