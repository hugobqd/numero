<script lang="ts">
  import type { Question, ResultatQuestion } from './types';
  import { avecUnite } from './format';
  import { verdict } from './score';

  /** Liste des questions d'un défi ou d'une révision, chacune qualifiée par son résultat. */
  let {
    questions,
    resultats,
    afficherPoints,
  }: { questions: Question[]; resultats: ResultatQuestion[]; afficherPoints: boolean } = $props();

  const etat = (r: ResultatQuestion) => (r.gagne ? 'gagne' : r.points > 0 ? 'presque' : 'rate');
</script>

<ul class="recap">
  {#each resultats as r, i}
    {@const q = questions[i]}
    {#if q}
      <li class={etat(r)}>
        <span class="enonce">{q.enonce}</span>
        <strong class="valeur">{avecUnite(q.valeur_a_retenir, q.unite, q.precision)}</strong>
        <span class="verdict">
          {r.gagne ? '✓' : r.points > 0 ? '≈' : '✗'} {verdict(q, r)}{#if afficherPoints}{` · ${r.points} pts`}{/if}
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
    gap: 0.5rem;
  }
  li {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.15rem 0.75rem;
    padding: 0.55rem 0.75rem;
    border-left: 3px solid var(--perdu);
    border-radius: 0.3rem;
    background: var(--surface);
  }
  li.gagne {
    border-left-color: var(--gagne);
  }
  li.presque {
    border-left-color: #d4a017;
  }
  .enonce {
    grid-column: 1 / -1;
    font-size: 0.9rem;
  }
  .valeur {
    font-variant-numeric: tabular-nums;
  }
  .verdict {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--perdu);
    white-space: nowrap;
    align-self: center;
  }
  .gagne .verdict {
    color: var(--gagne);
  }
  .presque .verdict {
    color: #d4a017;
  }
</style>
