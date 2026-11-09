<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Jauge des neurones vers la prochaine pochette bonus (accueil et bilans) : le total actuel et le palier
   * suivant, la barre entre le dernier palier et le suivant, avec des repères tous les quarts.
   */
  let {
    total,
    depuis,
    vers,
    titre,
  }: { total: number; depuis: number; vers: number; titre: Snippet } = $props();

  const part = $derived(Math.min(1, Math.max(0, (total - depuis) / (vers - depuis))));
</script>

<div class="jauge-neurones">
  <p class="tete">
    <span>{@render titre()}</span>
    <span class="valeur"><strong>{total}</strong> / {vers} neurones</span>
  </p>
  <div
    class="barre"
    role="progressbar"
    aria-label="Neurones vers la prochaine pochette bonus"
    aria-valuemin={depuis}
    aria-valuemax={vers}
    aria-valuenow={Math.min(total, vers)}
  >
    <span class="remplie" style:width="{part * 100}%"></span>
    {#each [25, 50, 75] as r}<span class="repere" style:left="{r}%"></span>{/each}
  </div>
  <p class="bornes">
    <span>{depuis}</span>
    <span>{vers}</span>
  </p>
</div>

<style>
  .jauge-neurones {
    display: grid;
    gap: 0.3rem;
  }
  p {
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
  }
  .valeur {
    color: var(--muted);
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;
  }
  .valeur strong {
    font-size: 1.15rem;
    font-weight: 900;
    font-stretch: 72%;
    color: var(--fg);
  }
  .barre {
    position: relative;
    height: 0.55rem;
    border-radius: 1rem;
    background: var(--surface-2);
    overflow: hidden;
  }
  .remplie {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: inherit;
    background: var(--accent);
    transition: width 550ms cubic-bezier(.2,.8,.2,1);
    animation: remplir 600ms ease-out both;
    transform-origin: left;
  }
  /* Repères tous les quarts du palier : un trait fin de la couleur du fond. */
  .repere {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    margin-left: -1px;
    background: var(--surface);
  }
  .bornes {
    font-size: 0.75rem;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  @keyframes remplir { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @media (prefers-reduced-motion: reduce) { .remplie { animation: none; } }
</style>
