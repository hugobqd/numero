<script lang="ts">
  import type { Question } from './types';
  import { MAITRISE_MAX, maitrise, type Collection } from './collection';
  import { grand } from './format';

  let {
    collection,
    stock,
    onreviser,
    onretour,
  }: { collection: Collection; stock: Question[]; onreviser: () => void; onretour: () => void } = $props();

  const themes = $derived(
    [...new Set(stock.map((q) => q.thematique))].sort().map((theme) => {
      const toutes = stock.filter((q) => q.thematique === theme);
      return { theme, total: toutes.length, possedees: toutes.filter((q) => collection[q.id]) };
    }),
  );
  const nbPossedees = $derived(themes.reduce((s, t) => s + t.possedees.length, 0));
  const nbARevoir = $derived(stock.filter((q) => collection[q.id] && maitrise(collection[q.id]) === 0).length);

  const etoiles = (n: number) => '★'.repeat(n) + '☆'.repeat(MAITRISE_MAX - n);
</script>

<section class="collection">
  <div class="entete">
    <h2>Ma collection</h2>
    <p class="compteur"><strong>{nbPossedees}</strong> / {stock.length} fiches</p>
  </div>

  {#if nbPossedees === 0}
    <p class="vide">Joue le défi du jour : chaque question jouée, réussie ou non, rejoint ta collection.</p>
  {:else}
    <button type="button" class="principal" onclick={onreviser}>
      Réviser mes fiches{#if nbARevoir}{` · ${nbARevoir} à revoir`}{/if}
    </button>
  {/if}

  {#each themes as t}
    <div class="theme">
      <h3>{t.theme} <span class="compte">{t.possedees.length} / {t.total}</span></h3>
      {#if t.possedees.length}
        <ul class="fiches">
          {#each t.possedees as q}
            {@const g = grand(q.valeur_a_retenir, q.unite, q.precision)}
            {@const e = collection[q.id]}
            <li class:revoir={maitrise(e) === 0}>
              <details>
                <summary>
                  <span class="enonce">{q.enonce}</span>
                  <span class="valeur"><strong>{g.chiffres}</strong> {g.unite}</span>
                  <span class="etoiles" title="Maîtrise {maitrise(e)} / {MAITRISE_MAX}">
                    {#if maitrise(e) === 0}<span class="a-revoir">à revoir</span>{/if}{etoiles(maitrise(e))}
                  </span>
                </summary>
                <div class="detail">
                  <p class="perimetre">{q.perimetre}</p>
                  <p>{q.ancrage}</p>
                  {#if q.mnemo}<p>💡 {q.mnemo}</p>{/if}
                  <p class="meta">
                    Obtenue au défi #{e.obtenueAuDefi} · {e.revisions} révision{e.revisions > 1 ? 's' : ''}
                  </p>
                </div>
              </details>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/each}

  <button type="button" onclick={onretour}>← Retour</button>
</section>

<style>
  .collection {
    display: grid;
    gap: 1.25rem;
  }
  .entete {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  .compteur {
    margin: 0;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .compteur strong {
    color: var(--fg);
    font-size: 1.25rem;
  }
  .vide {
    margin: 0;
    color: var(--muted);
  }
  .theme {
    display: grid;
    gap: 0.5rem;
  }
  h3 {
    margin: 0;
    font-size: 1rem;
  }
  .compte {
    color: var(--muted);
    font-weight: 400;
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }
  .fiches {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.4rem;
  }
  details {
    background: var(--surface);
    border-left: 3px solid var(--accent);
    border-radius: 0.3rem;
  }
  summary {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.1rem 0.75rem;
    padding: 0.6rem 0.75rem;
    cursor: pointer;
    list-style: none;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  .enonce {
    grid-column: 1 / -1;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .valeur {
    font-variant-numeric: tabular-nums;
  }
  .valeur strong {
    font-size: 1.2rem;
  }
  .revoir details {
    border-left-color: var(--perdu);
  }
  .a-revoir {
    margin-right: 0.4rem;
    color: var(--perdu);
    font-size: 0.75rem;
    letter-spacing: 0;
  }
  .etoiles {
    color: var(--accent);
    letter-spacing: 0.1em;
    align-self: center;
  }
  .detail {
    padding: 0 0.75rem 0.6rem;
    display: grid;
    gap: 0.4rem;
  }
  .detail p {
    margin: 0;
    font-size: 0.9rem;
  }
  .perimetre,
  .meta {
    color: var(--muted);
    font-style: italic;
  }
  .meta {
    font-style: normal;
    font-size: 0.8rem !important;
  }
</style>
