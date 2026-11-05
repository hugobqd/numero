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

  /** Illustration de chaque thématique (emoji par défaut pour un thème nouveau). */
  const ICONES: Record<string, string> = {
    Astronomie: '🔭',
    'Corps humain': '🫀',
    'Terre et géologie': '🌋',
    Physique: '⚛️',
    Animaux: '🐋',
    Humanité: '🌍',
  };
  const icone = (theme: string) => ICONES[theme] ?? '📘';

  const themes = $derived(
    [...new Set(stock.map((q) => q.thematique))].sort().map((theme) => {
      const toutes = stock.filter((q) => q.thematique === theme);
      const possedees = toutes.filter((q) => collection[q.id]);
      const sommeEtoiles = possedees.reduce((s, q) => s + maitrise(collection[q.id]), 0);
      return {
        theme,
        total: toutes.length,
        possedees,
        /** Moyenne des étoiles des fiches possédées (0 à 3). */
        moyenne: possedees.length ? sommeEtoiles / possedees.length : 0,
      };
    }),
  );

  // Vue d'ensemble par thème ; un thème touché affiche le détail de ses fiches.
  let themeOuvert = $state<string | null>(null);
  const detail = $derived(themes.find((t) => t.theme === themeOuvert));

  const moyenneLisible = (m: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(m);
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

  {#if detail}
    <div class="theme">
      <h3><span class="icone-titre">{icone(detail.theme)}</span> {detail.theme} <span class="compte">{detail.possedees.length} / {detail.total}</span></h3>
      {#if detail.possedees.length}
        <ul class="fiches">
          {#each detail.possedees as q}
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
                    {e.obtenueAuDefi === 0 ? 'Offerte (tuto)' : `Obtenue au défi #${e.obtenueAuDefi}`} · {e.revisions} révision{e.revisions > 1 ? 's' : ''}
                  </p>
                </div>
              </details>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="vide">Aucune fiche de ce thème pour l'instant. Elles arrivent avec les défis du jour.</p>
      {/if}
    </div>
    <button type="button" onclick={() => (themeOuvert = null)}>← Tous les thèmes</button>
  {:else}
    <ul class="cartes">
      {#each themes as t}
        <li>
          <button type="button" class="carte" class:vide-theme={!t.possedees.length} onclick={() => (themeOuvert = t.theme)}>
            <span class="icone" aria-hidden="true">{icone(t.theme)}</span>
            <span class="nom">{t.theme}</span>
            <span class="quantite"><strong>{t.possedees.length}</strong> / {t.total} fiches</span>
            <span class="jauge" aria-hidden="true"><span style:width="{(100 * t.possedees.length) / t.total}%"></span></span>
            <span class="maitrise" title="Moyenne des étoiles des fiches possédées">
              ★ {moyenneLisible(t.moyenne)} <small>/ {MAITRISE_MAX}</small>
            </span>
          </button>
        </li>
      {/each}
    </ul>
    <button type="button" onclick={onretour}>← Retour</button>
  {/if}
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
  .cartes {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
    gap: 0.6rem;
  }
  .carte {
    width: 100%;
    height: 100%;
    display: grid;
    gap: 0.35rem;
    justify-items: start;
    text-align: left;
    padding: 0.9rem;
    border-radius: 0.8rem;
    background: var(--surface);
  }
  .carte.vide-theme {
    opacity: 0.6;
  }
  .icone {
    font-size: 1.75rem;
    line-height: 1;
  }
  .nom {
    font-weight: 700;
  }
  .quantite {
    font-size: 0.85rem;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .quantite strong {
    color: var(--fg);
  }
  .jauge {
    width: 100%;
    height: 0.3rem;
    border-radius: 1rem;
    background: var(--border);
    overflow: hidden;
  }
  .jauge span {
    display: block;
    height: 100%;
    background: var(--accent);
  }
  .maitrise {
    font-size: 0.85rem;
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
  .maitrise small {
    color: var(--muted);
  }
  .icone-titre {
    font-size: 1.2rem;
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
