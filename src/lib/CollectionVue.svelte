<script lang="ts">
  import { CRANS_DIFFICULTE, themePrincipal, type CranDifficulte, type Question } from './types';
  import { estTrouvee, LIBELLES_ETAT, type Collection } from './collection';
  import { grand } from './format';
  import { illustration } from './themes';

  let {
    collection,
    stock,
    onreviser,
    onretour,
  }: { collection: Collection; stock: Question[]; onreviser: () => void; onretour: () => void } = $props();

  // Les douze thèmes utilisent les illustrations validées et optimisées pour le mobile.

  const themes = $derived(
    [...new Set(stock.map(themePrincipal))].sort().map((theme) => {
      const toutes = stock.filter((q) => themePrincipal(q) === theme);
      const possedees = toutes.filter((q) => collection[q.id]);
      const aReviser = possedees.filter((q) => collection[q.id].etat === 'decouverte').length;
      return { theme, total: toutes.length, possedees, aReviser };
    }),
  );

  // Seuls les thèmes commencés ont une carte ; les autres sont cités pour encourager à jouer.
  const themesCommences = $derived(themes.filter((t) => t.possedees.length));
  const themesADecouvrir = $derived(themes.filter((t) => !t.possedees.length));

  // Vue d'ensemble par thème ; un thème touché affiche le détail de ses fiches.
  let themeOuvert = $state<string | null>(null);
  const detail = $derived(themes.find((t) => t.theme === themeOuvert));
  const groupes = $derived(
    ([1, 2, 3, 4] as CranDifficulte[])
      .map((cran) => ({ cran, fiches: detail?.possedees.filter((q) => (q.difficulte?.cran ?? 2) === cran) ?? [] }))
      .filter((groupe) => groupe.fiches.length > 0),
  );

  const nbPossedees = $derived(themes.reduce((s, t) => s + t.possedees.length, 0));
  const nbAObtenir = $derived(stock.length - nbPossedees);
  const nbAReviser = $derived(stock.filter((q) => collection[q.id]?.etat === 'decouverte').length);
</script>

<section class="collection palette-fiche">
  {#if detail}
    {@const ill = illustration(detail.theme)}
    <div class="theme">
      <button type="button" class="retour-theme" onclick={() => (themeOuvert = null)} aria-label="Retour à tous les thèmes">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
      </button>
      <div class="bandeau">
        {#if ill}<img src={ill.src} alt={ill.alt} width="600" height="600" />{:else}<span class="sans-illustration" aria-hidden="true"></span>{/if}
        <div>
          <h2>{detail.theme}</h2>
          <p class="compte"><strong>{detail.possedees.length}</strong> / {detail.total} fiches</p>
        </div>
      </div>
      {#if detail.possedees.length}
        {#each groupes as groupe (groupe.cran)}
        <section class="groupe" aria-labelledby={`cran-${groupe.cran}`}>
          <h3 id={`cran-${groupe.cran}`}>{CRANS_DIFFICULTE[groupe.cran][0].toUpperCase() + CRANS_DIFFICULTE[groupe.cran].slice(1)} <span class="compte">{groupe.fiches.length} fiche{groupe.fiches.length > 1 ? 's' : ''}</span></h3>
          <ul class="fiches">
          {#each groupe.fiches as q (q.id)}
            {@const g = grand(q.valeur_a_retenir, q.unite, q.precision)}
            {@const e = collection[q.id]}
            <li class="etat-{e.etat}">
              <details>
                <summary>
                  <span class="enonce">{q.enonce}</span>
                  {#if estTrouvee(e)}
                    <span class="valeur"><strong>{g.chiffres}</strong> {g.unite}</span>
                  {:else}
                    <span class="valeur cachee">à réviser</span>
                  {/if}
                  <span class="etat">{LIBELLES_ETAT[e.etat]}</span>
                </summary>
                <div class="detail">
                  <p class="perimetre">{q.perimetre}</p>
                  {#if estTrouvee(e)}
                    <p>{q.ancrage}</p>
                    {#if q.mnemo}<p><strong>Astuce :</strong> {q.mnemo}</p>{/if}
                  {:else}
                    <p>Trouve-la en révision pour découvrir sa valeur.</p>
                  {/if}
                  <p class="meta">
                    {e.obtenueLeJour === 0 ? 'Obtenue dans la pochette offerte' : `Obtenue le jour ${e.obtenueLeJour}`} · {e.revisions} révision{e.revisions > 1 ? 's' : ''}
                  </p>
                </div>
              </details>
            </li>
          {/each}
        </ul>
        </section>
        {/each}
        {#if detail.total > detail.possedees.length}
          {@const reste = detail.total - detail.possedees.length}
          <p class="reste">Encore {reste} fiche{reste > 1 ? 's' : ''} à récupérer</p>
        {/if}
      {:else}
        <p class="vide">Aucune fiche de ce thème pour l'instant. Elles arrivent avec les pochettes.</p>
      {/if}
    </div>
  {:else}
    <div class="entete">
      <h2>Ma collection</h2>
      <p class="compteur"><strong>{nbPossedees}</strong> / {stock.length} fiches</p>
    </div>

    {#if nbPossedees === 0}
      <p class="vide">Ouvre ta pochette du jour : chaque question jouée, réussie ou non, rejoint ta collection.</p>
    {:else}
      <button type="button" class="principal" onclick={onreviser}>
        Réviser mes fiches{#if nbAReviser}{` · ${nbAReviser} à réviser`}{/if}
      </button>
    {/if}

    <ul class="cartes">
      {#each themesCommences as t}
        {@const ill = illustration(t.theme)}
        <li>
          <button type="button" class="carte" onclick={() => (themeOuvert = t.theme)}>
            {#if ill}<img class="illustration" src={ill.src} alt="" width="600" height="600" loading="lazy" />{:else}<span class="illustration sans-illustration" aria-hidden="true"></span>{/if}
            <span class="nom">{t.theme}</span>
            <span class="quantite"><strong>{t.possedees.length}</strong> / {t.total} fiches</span>
            <span class="a-reviser"><strong class:nonzero={t.aReviser > 0}>{t.aReviser}</strong> à réviser</span>
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
    --fond-illustration: #f8f7f1;
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }
  /* Carte de thème : l'illustration en grand, puis le nom et la quantité. */
  .carte {
    min-width: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: auto auto auto auto auto;
    align-content: start;
    gap: 0.4rem;
    justify-items: start;
    text-align: left;
    padding: 0 0 0.9rem;
    background: var(--carte-fond);
    border-radius: var(--rayon-carte);
    overflow: hidden;
  }
  .carte:hover {
    background: var(--surface);
  }
  .collection > .principal:hover {
    background: var(--accent-texte);
    color: var(--action-texte);
  }
  .carte > :not(.illustration) {
    margin-inline: 0.8rem;
  }
  .carte:hover .illustration {
    transform: scale(1.04);
  }
  .illustration {
    background: var(--fond-illustration);
    display: block;
    width: 100%;
    aspect-ratio: 1;
    height: auto;
    object-fit: cover;
    margin-bottom: 0.35rem;
    transition: transform 0.4s ease;
  }
  /* Même fond pour les images et les emplacements sans illustration, dans les deux thèmes. */
  .sans-illustration {
    display: block;
    aspect-ratio: 1;
    background: var(--fond-illustration);
  }
  .encouragement {
    padding: 1rem 1.1rem;
    background: var(--carte-fond);
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
    overflow-wrap: anywhere;
  }
  .quantite {
    font-size: 0.85rem;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .quantite strong {
    color: var(--fg);
    font-size: 1.5rem;
    line-height: 1;
  }
  .a-reviser { font-size: 0.85rem; color: var(--muted); }
  .a-reviser .nonzero { color: var(--fg); }
  @media (max-width: 480px) {
    .cartes { gap: 0.5rem; }
    .carte > :not(.illustration) { margin-inline: 0.4rem; }
    .nom { font-size: 1rem; }
    .quantite { font-size: 0.75rem; }
    .a-reviser { font-size: 0.75rem; }
  }
  /* Sous la liste d'un thème : ce qu'il reste à récupérer dans les pochettes. */
  .reste {
    margin: 0;
    text-align: center;
    font-size: 0.9rem;
    color: var(--muted);
  }
  .bandeau {
    display: grid;
    grid-template-columns: 5.5rem 1fr;
    align-items: center;
    gap: 1rem;
  }
  .bandeau img,
  .bandeau .sans-illustration {
    background: var(--fond-illustration);
    border-radius: var(--rayon-carte);
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    display: block;
  }
  .bandeau h2 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 900;
    font-stretch: 72%;
    line-height: 1;
  }
  .bandeau .compte { margin: 0.35rem 0 0; }
  .bandeau .compte strong { color: var(--fg); font-weight: 800; }
  .retour-theme {
    justify-self: start;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
    background: transparent;
    color: var(--muted);
  }
  .retour-theme:hover { background: var(--surface); color: var(--fg); }
  .retour-theme svg {
    width: 1.25rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .theme {
    display: grid;
    gap: 0.5rem;
  }
  .groupe { display: grid; gap: 0.65rem; margin-top: 1.25rem; }
  .groupe h3 { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; margin: 0; font-size: 0.85rem; font-weight: 500; color: var(--muted); }
  .groupe .compte { font-size: 0.75rem; }
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
    /* Un seul bloc, comme le récap d'un défi : les fiches se suivent, séparées par un filet. */
    border-radius: var(--rayon-carte);
    overflow: hidden;
  }
  .fiches li + li {
    border-top: 1px solid var(--border);
  }
  details {
    background: var(--carte-fond);
    border-left: 4px solid var(--accent);
  }
  summary {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.1rem 0.75rem;
    padding: 0.6rem 0.75rem;
    cursor: pointer;
    list-style: none;
  }
  summary:hover {
    background: var(--surface);
  }
  summary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -3px;
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
  /* Liseré par état : discret pour une découverte, accent pour une fiche acquise. */
  .etat-decouverte details {
    border-left-color: var(--border);
  }
  .etat-en-cours details {
    border-left-color: var(--gagne);
  }
  .valeur.cachee {
    align-self: center;
    color: var(--muted);
    font-style: italic;
  }
  .etat {
    align-self: center;
    color: var(--muted);
    font-size: 0.8rem;
  }
  .etat-acquise .etat {
    color: var(--accent-texte);
    font-weight: 600;
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
