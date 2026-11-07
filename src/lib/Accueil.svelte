<script lang="ts">
  /** Écran principal du joueur : la pochette du jour, sa progression, ses révisions. Volontairement sobre. */
  let {
    pseudo,
    jour,
    pochette,
    serie,
    nbFiches,
    nbTotal,
    nbAReviser,
    nbAcquises,
    bonus,
    onouvrir,
    onjouer,
    onbilan,
    onbonus,
    onreviser,
    oncollection,
  }: {
    pseudo: string;
    jour: number;
    /**
     * Pochette du jour : à ouvrir, ouverte (défi en cours ou terminé), ou plus aucune fiche à récupérer.
     */
    pochette:
      | { etat: 'toutes-les-fiches' }
      | { etat: 'a-ouvrir'; fiches: number }
      | { etat: 'ouverte'; faites: number; total: number; terminee: boolean; score: string };
    serie: number;
    nbFiches: number;
    nbTotal: number;
    nbAReviser: number;
    nbAcquises: number;
    /**
     * Pochettes bonus gagnées avec les neurones et pas encore terminées : celle commencée (faites / total)
     * et le nombre à ouvrir ; null s'il n'y en a pas (ou plus de fiches à récupérer).
     */
    bonus: { aOuvrir: number; faites: number | null; total: number | null } | null;
    onouvrir: () => void;
    onjouer: () => void;
    onbilan: () => void;
    onbonus: () => void;
    onreviser: () => void;
    oncollection: () => void;
  } = $props();
</script>

<section class="accueil">
  <div class="tete">
    <p class="salut">Bonjour {pseudo}</p>
    <h2 class="jour">Jour {jour}</h2>
    <!-- Motif : cercles concentriques en traits techniques, comme dans les illustrations. -->
    <svg class="anneaux" viewBox="0 0 200 200" aria-hidden="true">
      {#each [96, 84, 72, 60, 48, 36, 24] as r}<circle cx="100" cy="100" {r} />{/each}
    </svg>
  </div>

  <article class="defi">
    <h3>Pochette du jour</h3>
    {#if pochette.etat === 'toutes-les-fiches'}
      <p class="etat">Tu as toutes les fiches, révise-les</p>
      <button type="button" class="principal" onclick={onreviser}>Réviser</button>
    {:else if pochette.etat === 'a-ouvrir'}
      <p class="etat"><strong class="chiffres">{pochette.fiches}</strong> nombre{pochette.fiches > 1 ? 's' : ''} à retenir au chiffre près</p>
      <button type="button" class="principal" onclick={onouvrir}>Ouvrir</button>
    {:else if pochette.terminee}
      <p class="etat"><strong class="chiffres">{pochette.score}</strong></p>
      <p class="note">Terminée. Prochaine pochette demain.</p>
      <button type="button" onclick={onbilan}>Voir le bilan</button>
    {:else}
      <p class="etat"><strong class="chiffres">{pochette.faites} / {pochette.total}</strong> questions jouées</p>
      <button type="button" class="principal" onclick={onjouer}>Reprendre</button>
    {/if}
  </article>

  {#if bonus}
    <!-- Pochettes bonus (provisoire, en attendant la liste « Pochettes à ouvrir » de l'accueil, #24). -->
    <article class="bonus">
      <div>
        <h3>Pochettes bonus</h3>
        <p class="etat">
          {#if bonus.faites !== null}
            <strong class="chiffres">{bonus.faites} / {bonus.total}</strong> questions jouées
          {:else}
            <strong class="chiffres">{bonus.aOuvrir}</strong> à ouvrir
          {/if}
        </p>
        {#if bonus.faites !== null && bonus.aOuvrir}<p class="note">Puis {bonus.aOuvrir} autre{bonus.aOuvrir > 1 ? 's' : ''} à ouvrir</p>{/if}
      </div>
      <button type="button" class="principal" onclick={onbonus}>{bonus.faites !== null ? 'Reprendre' : 'Ouvrir'}</button>
    </article>
  {/if}

  {#if nbFiches}
    <!-- Révision en accès direct, juste sous la pochette du jour : un geste pour lancer 5 fiches. -->
    <article class="revision">
      <div>
        <h3>Révision</h3>
        <p class="etat">
          {#if nbAReviser}<strong class="chiffres">{nbAReviser}</strong> fiche{nbAReviser > 1 ? 's' : ''} à réviser{:else}Aucune fiche à réviser{/if}
        </p>
        <button type="button" class="discret" onclick={oncollection}>Ma collection →</button>
      </div>
      <button type="button" class="principal" onclick={onreviser}>Réviser</button>
    </article>
  {/if}

  <dl class="compteurs">
    <div><dt>Série</dt><dd class="chiffres">{serie}</dd></div>
    <div><dt>Fiches</dt><dd class="chiffres">{nbFiches}<small> / {nbTotal}</small></dd></div>
    <div><dt>Acquises</dt><dd class="chiffres">{nbAcquises}</dd></div>
  </dl>

</section>

<style>
  .accueil {
    display: grid;
    gap: 1.25rem;
    padding-top: 0.5rem;
  }
  .tete {
    position: relative;
    padding: 1.5rem 0 0.5rem;
  }
  .salut {
    margin: 0;
    font-size: 1.05rem;
    color: var(--muted);
  }
  .jour {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: clamp(4.5rem, 24vw, 7.5rem);
    font-weight: 900;
    line-height: 0.85;
    letter-spacing: -0.03em;
    word-spacing: 0.12em;
  }
  .anneaux {
    position: absolute;
    right: -2.5rem;
    top: -1.5rem;
    width: 13rem;
    height: 13rem;
    fill: none;
    stroke: var(--accent);
    stroke-width: 0.8;
    opacity: 0.7;
    pointer-events: none;
  }
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
  }
  .etat {
    margin: 0;
    font-size: 1.05rem;
  }
  .etat .chiffres {
    font-size: 2.6rem;
    font-weight: 800;
    line-height: 1;
    margin-right: 0.35rem;
  }
  .note {
    margin: 0;
  }
  /* La pochette du jour : un aplat terracotta, avec une trame Ben-Day dans le coin. */
  .defi {
    position: relative;
    display: grid;
    gap: 0.8rem;
    padding: 1.25rem 1.25rem 1.4rem;
    background-color: var(--terracotta);
    color: var(--ivoire);
    border-radius: var(--rayon-carte);
    overflow: hidden;
  }
  .defi::after {
    content: '';
    position: absolute;
    right: -1rem;
    bottom: -1rem;
    width: 9rem;
    height: 9rem;
    border-radius: 50%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Ccircle cx='4' cy='4' r='1.6' fill='%23a64023'/%3E%3C/svg%3E");
    pointer-events: none;
  }
  .defi > * {
    position: relative;
    z-index: 1;
  }
  /* Texte ivoire sur terracotta : en grand et gras pour rester lisible (contraste « grand texte »). */
  .defi h3,
  .defi .etat,
  .defi .note {
    font-size: 1.2rem;
    font-weight: 700;
  }
  .defi button {
    justify-self: start;
    min-width: 9rem;
    background: var(--petrole);
    color: var(--ivoire);
    font-weight: 700;
  }
  .defi button:hover {
    background: var(--sarcelle);
  }
  .compteurs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 0;
    padding: 0.25rem 0;
  }
  .compteurs div {
    display: grid;
  }
  .compteurs dt {
    font-size: 0.85rem;
    color: var(--muted);
  }
  .compteurs dd {
    margin: 0;
    font-size: 2.4rem;
    font-weight: 800;
    line-height: 1;
  }
  .compteurs small {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--muted);
  }
  /* Pochettes bonus : même gabarit que la révision, liseré terracotta pour rappeler la pochette du jour. */
  .bonus {
    border: 2px solid var(--accent);
  }
  .bonus .note {
    font-size: 0.85rem;
    color: var(--muted);
  }
  .bonus .etat .chiffres {
    font-size: 1.5rem;
    color: var(--accent-texte);
  }
  .revision,
  .bonus {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.9rem 1rem 0.9rem 1.2rem;
    background: var(--surface);
    border-radius: var(--rayon-carte);
  }
  .revision > div,
  .bonus > div {
    display: grid;
    gap: 0.2rem;
    justify-items: start;
  }
  .revision .etat {
    font-size: 0.95rem;
  }
  .revision .etat .chiffres {
    font-size: 1.5rem;
    color: var(--accent-texte);
  }
  .revision .principal,
  .bonus .principal {
    flex: none;
    min-width: 7.5rem;
  }
  .discret {
    background: none;
    padding: 0.2rem 0;
    color: var(--accent-texte);
    font-size: 0.9rem;
    font-weight: 600;
  }
  .discret:hover {
    text-decoration: underline;
  }
</style>
