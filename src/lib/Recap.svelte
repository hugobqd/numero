<script lang="ts">
  import type { Question, ResultatQuestion } from './types';
  import { avecUnite } from './format';
  import { verdict } from './score';

  /** Liste des questions d'un défi ou d'une révision, chacune qualifiée par son résultat. */
  let { questions, resultats }: { questions: Question[]; resultats: ResultatQuestion[] } = $props();

  const etat = (r: ResultatQuestion) => (r.gagne ? 'gagne' : r.points > 0 ? 'presque' : 'rate');
</script>

<ul class="recap">
  {#each resultats as r, i}
    {@const q = questions[i]}
    {#if q}
      <li class={etat(r)} style={`--rang: ${i}`}>
        <span class="enonce">{q.enonce}</span>
        <strong class="valeur">{avecUnite(q.valeur_a_retenir, q.unite, q.precision)}</strong>
        <span class="verdict">
          {verdict(q, r)} · {r.points} pts
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
    /* Un seul bloc : les fiches se suivent, séparées par un filet. */
    border-radius: var(--rayon-carte);
    overflow: hidden;
  }
  li + li {
    border-top: 1px solid var(--bg);
  }
  li {
    animation: ranger 320ms ease-out both;
    animation-delay: calc(var(--rang) * 55ms);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.15rem 0.75rem;
    padding: 0.55rem 0.75rem;
    border-left: 4px solid var(--perdu);
    background: var(--surface);
  }
  li.gagne {
    border-left-color: var(--gagne);
  }
  li.presque {
    border-left-color: var(--presque);
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
  /* L'ocre manque de contraste en texte sur la crème : le mot passe en brun technique, la marque reste ocre. */
  .presque .verdict {
    color: var(--brun);
  }
  @media (prefers-color-scheme: dark) {
    .presque .verdict {
      color: var(--ocre);
    }
  }
  @keyframes ranger {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: none; }
  }
  @media (prefers-reduced-motion: reduce) { li { animation: none; } }
</style>
