<script lang="ts">
  import JaugeNeurones from './JaugeNeurones.svelte';
  /** Écran principal du joueur : la pochette du jour, sa progression, ses révisions. Volontairement sobre. */
  let {
    jour,
    pochette,
    nbFiches,
    nbAReviser,
    nbAcquises,
    oncollection,
    bonus,
    neurones,
    onouvrir,
    onjouer,
    onbilan,
    onbonus,
    onreviser,
    anciennesPochettes,
    onreprendre,
    onouvrirOfferte,
  }: {
    jour: number;
    /**
     * Pochette du jour : à ouvrir, ouverte (défi en cours ou terminé), ou plus aucune fiche à récupérer.
     */
    pochette:
      | { etat: 'toutes-les-fiches' }
      | { etat: 'fiches-reservees' }
      | { etat: 'a-ouvrir' }
      | { etat: 'ouverte'; faites: number; total: number; terminee: boolean };
    nbFiches: number;
    nbAReviser: number;
    nbAcquises: number;
    oncollection: () => void;
    /**
     * Pochettes bonus gagnées avec les neurones et pas encore terminées : celle commencée (faites / total)
     * et le nombre à ouvrir ; null s'il n'y en a pas (ou plus de fiches à récupérer).
     */
    bonus: { aOuvrir: number; faites: number | null; total: number | null } | null;
    /** Neurones : total, dernier palier payé, palier suivant, et si sa pochette bonus arrive demain. */
    neurones: { total: number; depuis: number; vers: number };
    onouvrir: () => void;
    onjouer: () => void;
    onbilan: () => void;
    onbonus: () => void;
    onreviser: () => void;
    anciennesPochettes: { id: string; jour: number; offerte: boolean; faites: number; total: number }[];
    onouvrirOfferte?: () => void;
    onreprendre: (id: string) => void;
  } = $props();

  const pochettesAReprendre = $derived([...anciennesPochettes].sort((a, b) => Number(b.offerte) - Number(a.offerte)));
  const aucunePochetteDisponible = $derived(
    (pochette.etat === 'fiches-reservees' || (pochette.etat === 'ouverte' && pochette.terminee))
      && !onouvrirOfferte && !bonus && !pochettesAReprendre.length,
  );
</script>

{#snippet visuelPochette()}
  <span class="mini-pochette" aria-hidden="true"><span>Numero</span><span>↗</span></span>
{/snippet}

  {#snippet carteRevision()}
    {#if nbFiches}
      <article class="revision palette-fiche">
        <div>
          <h3>Révision</h3>
          {#if nbAReviser}
            <p class="etat"><strong class="chiffres">{nbAReviser}</strong> fiche{nbAReviser > 1 ? 's' : ''} à réviser</p>
          {/if}
          <p class="etat">{nbAcquises} sur {nbFiches} acquises</p>
          <button type="button" class="lien" onclick={oncollection}>Ma collection</button>
        </div>
        <button type="button" class="principal" onclick={onreviser}>Réviser</button>
      </article>
    {/if}
  {/snippet}
<section class="accueil">
  <section class="pochettes-en-cours" aria-label="Pochettes">
    {#if pochette.etat === 'ouverte' && pochette.terminee}
      <!-- Pochette du jour jouée : elle passe au second plan, en bloc discret. -->
      <article class="defi-joue palette-fiche">
        {@render visuelPochette()}
        <div>
          <h3>Pochette du jour · Jour {jour}</h3>
          <p class="note">Défi joué · prochaine pochette demain</p>
        </div>
        <button type="button" onclick={onbilan}>Voir le bilan</button>
      </article>
    {:else if pochette.etat !== 'fiches-reservees'}
      <article class="defi">
        {@render visuelPochette()}
        <h3>Pochette du jour · Jour {jour}</h3>
        {#if pochette.etat === 'toutes-les-fiches'}
          <p class="etat">Collection complète !</p>
        {:else if pochette.etat === 'a-ouvrir'}
          <button type="button" class="principal" onclick={onouvrir}>Ouvrir</button>
        {:else}
          <p class="etat"><strong class="chiffres">{pochette.faites} sur {pochette.total}</strong></p>
          <button type="button" class="principal" onclick={onjouer}>Reprendre</button>
        {/if}
      </article>
    {/if}

    {#if onouvrirOfferte}
      <article class="pochette-ancienne palette-fiche">
        {@render visuelPochette()}
        <div><h4>Pochette offerte</h4></div>
        <button type="button" onclick={onouvrirOfferte} aria-label="Ouvrir la pochette offerte">Ouvrir</button>
      </article>
    {/if}

    {#each pochettesAReprendre as p (p.id)}
      <article class="pochette-ancienne palette-fiche">
        {@render visuelPochette()}
        <div>
          <h4>{p.offerte ? 'Pochette offerte' : `Pochette du jour ${p.jour}`}</h4>
          <p class="note progression-pochette" aria-label={`${p.faites} questions sur ${p.total} jouées`}>{p.faites}/{p.total}</p>
        </div>
        <button type="button" class:principal={pochette.etat === 'fiches-reservees' && !bonus && p.id === pochettesAReprendre[0]?.id} onclick={() => onreprendre(p.id)} aria-label={`Reprendre ${p.offerte ? 'la pochette offerte' : `la pochette du jour ${p.jour}`}`}>Reprendre</button>
      </article>
    {/each}

    {#if bonus}
      <article class="bonus palette-fiche">
        {@render visuelPochette()}
        <div>
          <h4>Pochettes bonus</h4>
          <p class="etat">
            {#if bonus.faites !== null}
              <strong class="chiffres">{bonus.faites} sur {bonus.total}</strong>
            {:else}
              <strong class="chiffres">{bonus.aOuvrir}</strong> à ouvrir
            {/if}
          </p>
          {#if bonus.faites !== null && bonus.aOuvrir}<p class="note">Puis {bonus.aOuvrir} autre{bonus.aOuvrir > 1 ? 's' : ''} à ouvrir</p>{/if}
        </div>
        <button type="button" class:principal={pochette.etat === 'fiches-reservees'} onclick={onbonus}>{bonus.faites !== null ? 'Reprendre' : 'Ouvrir'}</button>
      </article>
    {/if}

    {#if nbFiches}
      {#if aucunePochetteDisponible}
        <aside class="conseil-bonus palette-fiche">
          {@render visuelPochette()}
          <p><strong>À toi la prochaine pochette !</strong> Révise tes fiches pour gagner des neurones et débloquer des pochettes bonus.</p>
        </aside>
      {/if}
      <div class="neurones">
        <JaugeNeurones {...neurones}>
          {#snippet titre()}Prochaine pochette bonus{/snippet}
        </JaugeNeurones>
      </div>
    {/if}
  </section>

  {@render carteRevision()}
</section>

<style>
  .accueil {
    display: grid;
    gap: 1.25rem;
    padding-top: 0.5rem;
  }
  .pochettes-en-cours { display: grid; gap: 0.75rem; }
  .pochette-ancienne { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 1rem; background: var(--carte-fond); border-radius: var(--rayon-carte); }
  .bonus h4, .pochette-ancienne h4 { margin: 0 0 0.25rem; font-size: 1rem; }
  .progression-pochette { color: var(--muted); font-size: 0.8rem; }
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
  .mini-pochette {
    position: relative;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 0.15rem;
    width: 3.2rem;
    aspect-ratio: 4 / 5;
    border-radius: 4px 4px 9px 9px;
    background: var(--terracotta);
    color: var(--ivoire);
    box-shadow: 0 3px 0 var(--rouille), 0 8px 12px -6px #142d3466;
    transform: rotate(-7deg);
    font-size: 0.6rem;
    font-weight: 900;
    text-transform: uppercase;
  }
  .mini-pochette::before { content: ''; position: absolute; inset: 17% 0 auto; border-top: 1px dashed currentColor; }
  .mini-pochette span:last-child { font-size: 1rem; }
  .defi .mini-pochette {
    grid-column: 2;
    grid-row: 1 / span 3;
    align-self: center;
    width: clamp(3.8rem, 17vw, 5.25rem);
    background: var(--ivoire);
    color: var(--petrole);
    font-size: 0.78rem;
    box-shadow: 0 3px 0 var(--rouille), 0 8px 12px -6px #142d3466;
  }
  .defi { grid-template-columns: minmax(0, 1fr) auto; column-gap: 1.1rem; }
  .defi > :not(.mini-pochette) { grid-column: 1; }
  .bonus .mini-pochette { background: var(--petrole); box-shadow: 0 3px 0 var(--sarcelle); }
  .defi-joue > div, .bonus > div, .pochette-ancienne > div { flex: 1 1 8rem; }
  .defi > * {
    position: relative;
    z-index: 1;
  }
  /* Texte ivoire sur terracotta : en grand et gras pour rester lisible (contraste « grand texte »). */
  .defi h3,
  .defi .etat {
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
  .bonus,
  .defi-joue {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.9rem 1rem 0.9rem 1.2rem;
    background: var(--carte-fond);
    border-radius: var(--rayon-carte);
  }
  .revision > div,
  .bonus > div,
  .defi-joue > div {
    display: grid;
    gap: 0.2rem;
    justify-items: start;
  }
  .revision {
    border-inline-start: 4px solid var(--accent);
    box-shadow: 0 3px 0 var(--surface-2);
  }
  .revision .etat .chiffres { color: var(--accent-texte); font-size: 1.5rem; }
  .revision .etat {
    font-size: 0.95rem;
  }
  .lien { padding: 0.25rem 0; background: none; border: 0; text-decoration: underline; }
  .conseil-bonus {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1rem;
    border-radius: var(--rayon-carte);
    border-inline-start: 4px solid var(--accent);
    background: var(--carte-fond);
  }
  .conseil-bonus p { margin: 0; color: var(--muted); font-size: 0.9rem; }
  .conseil-bonus strong { display: block; margin-bottom: 0.2rem; color: var(--fg); }
  .neurones { padding: 0.75rem 1rem; }
  .defi-joue .note {
    font-size: 0.85rem;
    color: var(--muted);
  }
  .defi-joue button {
    flex: none;
    background: var(--surface-2);
  }
  .revision .principal,
  .bonus .principal {
    flex: none;
    min-width: 7.5rem;
  }
</style>
