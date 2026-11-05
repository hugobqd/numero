<script lang="ts">
  /** Écran principal du joueur : le défi du jour, sa progression, ses révisions. Volontairement sobre. */
  let {
    pseudo,
    jour,
    defi,
    serie,
    nbFiches,
    nbTotal,
    nbARevoir,
    nbMaitrisees,
    onjouer,
    onbilan,
    onreviser,
    oncollection,
  }: {
    pseudo: string;
    jour: number;
    /** État du défi du jour. */
    defi: { faites: number; total: number; terminee: boolean; score: string };
    serie: number;
    nbFiches: number;
    nbTotal: number;
    nbARevoir: number;
    nbMaitrisees: number;
    onjouer: () => void;
    onbilan: () => void;
    onreviser: () => void;
    oncollection: () => void;
  } = $props();
</script>

<section class="accueil">
  <div class="salut">
    <p>Bonjour {pseudo}</p>
    <h2>Jour {jour}</h2>
  </div>

  <article class="carte defi">
    <h3>Défi du jour</h3>
    {#if defi.terminee}
      <p class="etat"><strong>{defi.score}</strong> · terminé</p>
      <p class="note">Prochain défi demain.</p>
      <button type="button" onclick={onbilan}>Voir le bilan</button>
    {:else if defi.faites > 0}
      <p class="etat">{defi.faites} / {defi.total} questions jouées</p>
      <button type="button" class="principal" onclick={onjouer}>Reprendre</button>
    {:else}
      <p class="etat">{defi.total} nombres à retenir au chiffre près</p>
      <button type="button" class="principal" onclick={onjouer}>Jouer</button>
    {/if}
  </article>

  <dl class="chiffres">
    <div><dt>Série</dt><dd>{serie}</dd></div>
    <div><dt>Fiches</dt><dd>{nbFiches}<small> / {nbTotal}</small></dd></div>
    <div><dt>Maîtrisées</dt><dd>{nbMaitrisees}</dd></div>
  </dl>

  {#if nbFiches}
    <article class="carte">
      <h3>Révision</h3>
      <p class="etat">
        {#if nbARevoir}<strong>{nbARevoir}</strong> fiche{nbARevoir > 1 ? 's' : ''} à revoir{:else}Aucune fiche à revoir{/if}
      </p>
      <div class="actions">
        <button type="button" onclick={onreviser}>Réviser</button>
        <button type="button" class="discret" onclick={oncollection}>Ma collection →</button>
      </div>
    </article>
  {/if}
</section>

<style>
  .accueil {
    display: grid;
    gap: 1.25rem;
    padding-top: 1.5rem;
  }
  .salut p {
    margin: 0;
    color: var(--muted);
  }
  h2 {
    margin: 0;
    font-size: 2.25rem;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .carte {
    display: grid;
    gap: 0.6rem;
    padding: 1.1rem 1.2rem;
    border: 1px solid var(--border);
    border-radius: 0.8rem;
  }
  .carte.defi {
    border-color: var(--accent);
  }
  h3 {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
  .etat {
    margin: 0;
    font-size: 1.1rem;
    font-variant-numeric: tabular-nums;
  }
  .note {
    margin: -0.3rem 0 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .chiffres {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 0;
    text-align: center;
  }
  .chiffres dt {
    color: var(--muted);
    font-size: 0.75rem;
  }
  .chiffres dd {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .chiffres small {
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--muted);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .discret {
    background: none;
    border-color: transparent;
    color: var(--accent);
  }
</style>
