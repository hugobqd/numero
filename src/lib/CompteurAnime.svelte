<script lang="ts">
  import { untrack } from 'svelte';

  let { valeur, depuis, onaffiche }: {
    valeur: number;
    depuis: number;
    onaffiche: (valeur: number) => void;
  } = $props();
  let affichee = $state(untrack(() => depuis));
  let anime = $state(false);

  $effect(() => {
    const cible = valeur;
    const memoriser = onaffiche;
    const debut = untrack(() => affichee);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let termine = false;
    function finir() {
      window.cancelAnimationFrame(frame);
      affichee = cible;
      anime = false;
      termine = true;
      memoriser(cible);
    }
    function reduire() { if (preference.matches && !termine) finir(); }
    if (debut === cible || preference.matches) {
      finir();
    } else {
      anime = true;
      const depart = performance.now();
      function avancer(maintenant: number) {
        const t = Math.min(1, (maintenant - depart) / 600);
        affichee = Math.round(debut + (cible - debut) * (1 - (1 - t) ** 3));
        if (t < 1) frame = window.requestAnimationFrame(avancer);
        else finir();
      }
      frame = window.requestAnimationFrame(avancer);
    }
    preference.addEventListener('change', reduire);
    return () => {
      window.cancelAnimationFrame(frame);
      preference.removeEventListener('change', reduire);
    };
  });
</script>

<span class="compteur chiffres" aria-hidden="true">
  <span class="reserve">{valeur}</span>
  {#key valeur}<span class="valeur" class:anime>{affichee}</span>{/key}
</span>

<style>
  .compteur { display: inline-grid; font: inherit; font-variant-numeric: tabular-nums; }
  .reserve, .valeur { grid-area: 1 / 1; text-align: right; }
  .reserve { visibility: hidden; }
  .anime { animation: impulsion 600ms ease-out; }
  @keyframes impulsion {
    0%, 100% { transform: none; }
    30% { transform: translateY(-2px) scale(1.12); color: var(--accent-texte); }
  }
  @media (prefers-reduced-motion: reduce) { .anime { animation: none; } }
</style>
