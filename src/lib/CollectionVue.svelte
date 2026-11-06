<script lang="ts">
  import { themePrincipal, type Question } from './types';
  import { MAITRISE_MAX, maitrise, type Collection } from './collection';
  import { grand } from './format';
  import { illustration } from './themes';

  let {
    collection,
    stock,
    onreviser,
    onretour,
  }: { collection: Collection; stock: Question[]; onreviser: () => void; onretour: () => void } = $props();

  // Chaque thème est illustré (src/assets/themes, prompt dans le README).

  const themes = $derived(
    [...new Set(stock.map(themePrincipal))].sort().map((theme) => {
      const toutes = stock.filter((q) => themePrincipal(q) === theme);
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

  // Seuls les thèmes commencés ont une carte ; les autres sont cités pour encourager à jouer.
  const themesCommences = $derived(themes.filter((t) => t.possedees.length));
  const themesADecouvrir = $derived(themes.filter((t) => !t.possedees.length));

  // Vue d'ensemble par thème ; un thème touché affiche le détail de ses fiches.
  let themeOuvert = $state<string | null>(null);
  const detail = $derived(themes.find((t) => t.theme === themeOuvert));

  /**
   * Étoiles de la moyenne, arrondie à la demi-étoile inférieure : 1,7 → ★½☆ (1 pleine, 1 demie, 1 vide).
   * Renvoie le remplissage de chaque étoile : 1, 0,5 ou 0.
   */
  const remplissage = (moyenne: number) => {
    const arrondi = Math.floor(moyenne * 2) / 2;
    return Array.from({ length: MAITRISE_MAX }, (_, i) => Math.max(0, Math.min(1, arrondi - i)));
  };

  const moyenneLisible = (m: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(m);
  const nbPossedees = $derived(themes.reduce((s, t) => s + t.possedees.length, 0));
  const nbAObtenir = $derived(stock.length - nbPossedees);
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
    {@const ill = illustration(detail.theme)}
    <div class="theme">
      <div class="bandeau">
        {#if ill}<img src={ill.src} alt={ill.alt} width="600" height="600" />{/if}
        <h3>{detail.theme} <span class="compte">{detail.possedees.length} / {detail.total}</span></h3>
      </div>
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
                  {#if q.mnemo}<p><strong>Astuce :</strong> {q.mnemo}</p>{/if}
                  <p class="meta">
                    {e.obtenueAuDefi === 0 ? 'Obtenue au premier défi' : `Obtenue au défi #${e.obtenueAuDefi}`} · {e.revisions} révision{e.revisions > 1 ? 's' : ''}
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
      {#each themesCommences as t}
        {@const ill = illustration(t.theme)}
        <li>
          <button type="button" class="carte" onclick={() => (themeOuvert = t.theme)}>
            {#if ill}<img class="illustration" src={ill.src} alt="" width="600" height="600" loading="lazy" />{/if}
            <span class="nom">{t.theme}</span>
            <span class="quantite"><strong>{t.possedees.length}</strong> / {t.total} fiches</span>
            <span class="jauge" aria-hidden="true"><span style:width="{(100 * t.possedees.length) / t.total}%"></span></span>
            <span
              class="maitrise"
              role="img"
              aria-label="Maîtrise moyenne : {moyenneLisible(t.moyenne)} étoile(s) sur {MAITRISE_MAX}"
              title="Moyenne des étoiles des fiches possédées : {moyenneLisible(t.moyenne)} / {MAITRISE_MAX}"
            >
              {#each remplissage(t.moyenne) as r}<span class="etoile" style:--plein="{r * 100}%"></span>{/each}
            </span>
          </button>
        </li>
      {/each}
    </ul>

    {#if themesADecouvrir.length || nbAObtenir}
      <div class="encouragement">
        {#if themesADecouvrir.length}
          <p>
            Continue à jouer pour découvrir aussi
            {#each themesADecouvrir as t, i}<strong class="theme-nom">{t.theme}</strong>{i < themesADecouvrir.length - 2 ? ', ' : i === themesADecouvrir.length - 2 ? ' et ' : ''}{/each}.
          </p>
        {:else}
          <p>Continue à jouer pour compléter tes thèmes : encore <strong>{nbAObtenir} fiches</strong> à obtenir.</p>
        {/if}
      </div>
    {/if}

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
    font-size: 2.6rem;
    font-weight: 900;
    line-height: 0.95;
  }
  .compteur {
    margin: 0;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .compteur strong {
    color: var(--fg);
    font-size: 1.6rem;
    font-weight: 800;
    font-stretch: 72%;
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
    gap: 0.75rem;
  }
  /* Carte de thème : l'illustration en grand, puis le nom, la quantité et la maîtrise. */
  .carte {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: auto auto auto auto auto;
    align-content: start;
    gap: 0.4rem;
    justify-items: start;
    text-align: left;
    padding: 0 0 0.9rem;
    background: var(--surface);
    border-radius: var(--rayon-carte);
    overflow: hidden;
  }
  .carte > :not(.illustration) {
    margin-inline: 0.8rem;
  }
  .carte:hover .illustration {
    transform: scale(1.04);
  }
  .illustration {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    height: auto;
    object-fit: cover;
    margin-bottom: 0.35rem;
    transition: transform 0.4s ease;
  }
  .carte > .jauge {
    width: calc(100% - 1.6rem);
  }
  .encouragement {
    padding: 1rem 1.1rem;
    background: var(--surface);
    border-radius: var(--rayon-carte);
    color: var(--muted);
  }
  .encouragement p {
    margin: 0;
    line-height: 1.6;
  }
  .encouragement strong {
    color: var(--fg);
    font-weight: 600;
  }
  .theme-nom {
    white-space: nowrap;
  }
  .nom {
    font-size: 1.15rem;
    font-weight: 800;
    font-stretch: 72%;
    line-height: 1.1;
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
    height: 0.35rem;
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
    display: inline-flex;
    gap: 0.1rem;
    font-size: 1rem;
    line-height: 1;
  }
  /* Étoile vide (☆) recouverte d'une étoile pleine (★) coupée à --plein : 0 %, 50 % ou 100 %. */
  .etoile {
    position: relative;
    color: var(--accent);
  }
  .etoile::before {
    content: '☆';
  }
  .etoile::after {
    content: '★';
    position: absolute;
    left: 0;
    top: 0;
    width: var(--plein);
    overflow: hidden;
  }
  .bandeau {
    display: grid;
    grid-template-columns: 5.5rem 1fr;
    align-items: center;
    gap: 1rem;
  }
  .bandeau img {
    border-radius: var(--rayon-carte);
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    display: block;
  }
  .bandeau h3 {
    font-size: 1.6rem;
    font-weight: 900;
    font-stretch: 72%;
    line-height: 1;
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
    border-left: 4px solid var(--accent);
    border-radius: var(--rayon-petit);
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
    font-size: 1.5rem;
    font-weight: 800;
    font-stretch: 72%;
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
