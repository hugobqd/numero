<script lang="ts">
  import { nbFichesDe, type Joueur } from './joueurs';
  import { illustration } from './themes';

  // Écran d'accueil d'un nouveau venu : les six thèmes en mosaïque.
  const MOSAIQUE = ['Astronomie', 'Corps humain', 'Terre et géologie', 'Physique', 'Animaux', 'Humanité']
    .map(illustration)
    .filter((i) => i !== null);

  let {
    joueurs,
    actifId,
    oncreer,
    onchoisir,
    onsupprimer,
    onretour,
  }: {
    joueurs: Joueur[];
    actifId: string | null;
    oncreer: (pseudo: string) => void;
    onchoisir: (id: string) => void;
    onsupprimer: (id: string) => void;
    onretour?: () => void;
  } = $props();

  let pseudo = $state('');

  function creer(e: SubmitEvent) {
    e.preventDefault();
    if (pseudo.trim()) oncreer(pseudo);
  }
</script>

<section class="joueurs">
  {#if !joueurs.length}
    <div class="mosaique" aria-hidden="true">
      {#each MOSAIQUE as ill}<img src={ill.src} alt="" width="600" height="600" />{/each}
    </div>
    <h2 class="titre-accueil">Les nombres qui régissent le monde</h2>
    <p class="pitch">5 nombres par jour, à retenir au chiffre près. Chaque question jouée rejoint ta collection.</p>
  {:else}
    <h2>Joueurs</h2>
  {/if}
  <p class="aide">Comptes simulés pour tester : chaque joueur a son jour, ses défis et sa collection.</p>

  <form onsubmit={creer}>
    <label for="pseudo">Nouveau joueur</label>
    <div class="ligne">
      <input id="pseudo" bind:value={pseudo} placeholder="Pseudo" maxlength="24" autocomplete="off" />
      <button type="submit" class="principal" disabled={!pseudo.trim()}>Créer</button>
    </div>
  </form>

  {#if joueurs.length}
    <ul>
      {#each joueurs as j}
        <li class:actif={j.id === actifId}>
          <div>
            <strong>{j.pseudo}</strong>
            <span class="meta">
              jour {j.jour} · {nbFichesDe(j.id)} fiche{nbFichesDe(j.id) > 1 ? 's' : ''}{j.tutoFait ? '' : ' · tuto à faire'}
            </span>
          </div>
          <div class="actions">
            {#if j.id !== actifId}<button type="button" onclick={() => onchoisir(j.id)}>Jouer</button>{:else}<span class="meta">actif</span>{/if}
            <button
              type="button"
              class="supprimer"
              onclick={() => confirm(`Supprimer ${j.pseudo} et toutes ses données ?`) && onsupprimer(j.id)}
              aria-label="Supprimer {j.pseudo}">Supprimer</button
            >
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  {#if onretour}<button type="button" onclick={onretour}>← Retour</button>{/if}
</section>

<style>
  .joueurs {
    display: grid;
    gap: 1rem;
  }
  h2 {
    margin: 0;
    font-size: 2.6rem;
    font-weight: 900;
    line-height: 0.95;
  }
  .titre-accueil {
    margin-top: 0.75rem;
    font-size: clamp(2.6rem, 12vw, 3.6rem);
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .pitch {
    margin: 0;
    font-size: 1.15rem;
  }
  .mosaique {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }
  .mosaique img {
    border-radius: var(--rayon-carte);
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }
  .aide,
  .meta {
    margin: 0;
    color: var(--muted);
    font-size: 0.85rem;
  }
  form {
    display: grid;
    gap: 0.4rem;
  }
  label {
    font-weight: 600;
  }
  .ligne {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }
  input {
    font: inherit;
    color: var(--fg);
    background: var(--surface);
    border: none;
    border-bottom: 2px solid var(--fg);
    border-radius: var(--rayon-bouton) var(--rayon-bouton) 0 0;
    padding: 0.75rem 1rem;
    min-width: 0;
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.4rem;
  }
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    background: var(--surface);
    border-radius: var(--rayon-bouton);
    border-left: 4px solid transparent;
  }
  li.actif {
    border-left-color: var(--accent);
  }
  li div:first-child {
    display: grid;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .actions button {
    padding: 0.4rem 0.75rem;
  }
  .supprimer {
    color: var(--perdu);
  }
</style>
