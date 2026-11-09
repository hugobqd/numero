<script lang="ts">
  import type { Question, ResultatQuestion } from './types';
  import { verdict } from './score';
  import { avecUnite } from './format';

  /** Liste des questions d'un défi ou d'une révision, chacune qualifiée par son résultat. */
  let { questions, resultats }: { questions: Question[]; resultats: ResultatQuestion[] } = $props();

</script>

<ul class="recap">
  {#each resultats as r, i}
    {@const q = questions[i]}
    {@const statut = verdict(r)}
    {#if q}
      <li class:gagne={statut === 'Gagné'} class:presque={statut === 'Presque'} style:--rang={i}>
        <span class="enonce">{q.enonce}</span>
        <strong class="valeur">{avecUnite(q.valeur_a_retenir, q.unite, q.precision)}</strong>
        <span class="meta">
          <span class="tag">{statut}</span>
          {#if r.neurones}<span>+{r.neurones} neurone{r.neurones > 1 ? 's' : ''}</span>{/if}
        </span>
      </li>
    {/if}
  {/each}
</ul>

<style>
  .recap {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    border-radius: var(--rayon-carte);
    overflow: hidden;
  }
  li + li {
    border-top: 1px solid var(--bg);
  }
  li {
    --couleur-verdict: var(--verdict-perdu);
    animation: ranger 320ms ease-out both;
    animation-delay: calc(var(--rang) * 55ms);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.15rem 0.75rem;
    padding: 0.55rem 0.75rem;
    border-left: 4px solid var(--couleur-verdict);
    background: var(--surface);
  }
  li.gagne { --couleur-verdict: var(--verdict-gagne); }
  li.presque { --couleur-verdict: var(--verdict-presque); }
  .enonce {
    grid-column: 1 / -1;
    font-size: 0.9rem;
  }
  .valeur {
    font-variant-numeric: tabular-nums;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: end;
    align-items: center;
    gap: 0.35rem;

    font-size: 0.85rem;
    font-weight: 600;
    color: var(--muted);
    white-space: nowrap;
    align-self: center;
  }
  .tag {
    padding: 0.1rem 0.4rem;
    border-radius: var(--rayon-petit);
    background: var(--couleur-verdict);
    color: var(--verdict-texte);
  }
  @keyframes ranger {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: none; }
  }
  @media (prefers-reduced-motion: reduce) { li { animation: none; } }
</style>
