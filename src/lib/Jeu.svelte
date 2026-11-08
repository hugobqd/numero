<script lang="ts">
  import { themePrincipal, type Mecanique, type Question, type Reponse, type ResultatQuestion } from './types';
  import { noter } from './score';
  import Qcm from './mechanics/Qcm.svelte';
  import Palier from './mechanics/Palier.svelte';
  import PlusMoins from './mechanics/PlusMoins.svelte';
  import Revelation from './Revelation.svelte';
  import type { Difficulte } from './propositions';
  import { illustration } from './themes';
  import { fade } from 'svelte/transition';

  /**
   * Déroulé d'une série de questions (défi d'une pochette ou révision) : question, puis révélation,
   * jusqu'à la dernière. Le parent garde les résultats et décide quoi en faire.
   */
  let {
    questions,
    meca,
    graine,
    resultats,
    etiquette = '',
    aide = false,
    difficulte = () => 'normale',
    enCours = $bindable(null),
    onresultat,
    onfin,
    onfermer,
  }: {
    questions: Question[];
    /** Mode de réponse : réglage du joueur, appliqué dès la question suivante s'il change. */
    meca: Mecanique;
    /** Graine des propositions (numéro du défi, ou tirage au hasard en révision). */
    graine: number;
    resultats: ResultatQuestion[];
    etiquette?: string;
    /** Affiche le mode d'emploi de la mécanique sous la question (tuto). */
    aide?: boolean;
    /** Difficulté des propositions pour une question (révision : selon l'état de la fiche). */
    difficulte?: (q: Question) => Difficulte;
    /** Question affichée, graine et difficulté de ses propositions, exposées aux outils de test. */
    enCours?: { question: Question; graine: number; difficulte: Difficulte } | null;
    onresultat: (r: ResultatQuestion, q: Question) => void;
    onfin: () => void;
    onfermer: () => void;
  } = $props();

  let enRevelation = $state(false);

  const AIDES: Record<Mecanique, string> = {
    palier: 'Choisis un cran sur le curseur (ou touche une valeur), puis valide.',
    qcm: 'Touche la valeur qui te semble juste.',
    plusmoins:
      'Le jeu propose une valeur : dis si la bonne est plus grande ou plus petite. 3 coups au plus, et une seule erreur fait perdre la question.',
  };

  const index = $derived(enRevelation ? resultats.length - 1 : resultats.length);
  const courante = $derived(questions[index]);

  $effect(() => {
    enCours = courante ? { question: courante, graine, difficulte: difficulte(courante) } : null;
    return () => (enCours = null);
  });
  const dernierResultat = $derived(resultats[resultats.length - 1]);

  function repondre(r: Reponse) {
    const q = questions[resultats.length];
    const { points, gagne } = noter(q, r);
    onresultat({ id: q.id, reponse: r.valeur, points, gagne, erreur: r.erreur }, q);
    enRevelation = true;
  }

  function suivante() {
    enRevelation = false;
    if (resultats.length >= questions.length) onfin();
  }
</script>

{#if courante}
  {@const ill = illustration(themePrincipal(courante))}
  <article class="carte-jeu palette-fiche" class:retournee={enRevelation} aria-label={`Fiche ${themePrincipal(courante)}`}>
    <div class="entete">
      {#if ill}<img class="vignette" src={ill.src} alt="" width="600" height="600" />{:else}<span class="vignette sans-illustration" aria-hidden="true"></span>{/if}
      <div>
        <p class="progression">
          {#if etiquette}{`${etiquette} · `}{/if}Question {index + 1} / {questions.length} · {themePrincipal(courante)}
        </p>
        <!-- Avancement : un segment par question. -->
        <ol class="segments" aria-hidden="true">
          {#each questions as _, i}<li class:fait={i < resultats.length} class:courant={i === index}></li>{/each}
        </ol>
        <!-- Le statut brouillon n'est pas montré aux joueurs (il reste visible dans les outils de test). -->
        {#if difficulte(courante) !== 'normale'}
          <p class="badges">
            <span class="badge niveau">{difficulte(courante) === 'decouverte' ? 'niveau découverte' : 'niveau expert'}</span>
          </p>
        {/if}
      </div>
      <button type="button" class="fermer" onclick={onfermer} aria-label="Fermer et revenir à l'accueil">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
    <h1>{courante.enonce}</h1>
    {#key `${courante.id}-${enRevelation}`}
      <div class="face" in:fade={{ duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160 }}>
        {#if enRevelation && dernierResultat}
          <Revelation
            question={courante}
            resultat={dernierResultat}
            onsuivante={suivante}
            dernier={resultats.length >= questions.length}
          />
        {:else}
          {#if aide}<p class="aide"><strong>Comment jouer :</strong> {AIDES[meca]}</p>{/if}
          {#if meca === 'palier'}
            <Palier question={courante} numero={graine} difficulte={difficulte(courante)} onrepondre={repondre} />
          {:else if meca === 'qcm'}
            <Qcm question={courante} numero={graine} difficulte={difficulte(courante)} onrepondre={repondre} />
          {:else}
            <PlusMoins question={courante} numero={graine} difficulte={difficulte(courante)} onrepondre={repondre} />
          {/if}
        {/if}
      </div>
    {/key}
  </article>
{/if}

<style>
  /* La carte occupe la colonne existante : sa largeur inclut ses marges intérieures. */
  .carte-jeu {
    display: grid;
    gap: 1.5rem;
    padding: clamp(1.1rem, 4vw, 2rem);
    border-radius: 24px;
    background: var(--carte-fond);
    color: var(--fg);
    box-shadow: 0 14px 36px -20px var(--carte-ombre), 0 3px 0 var(--surface-2);
    container-type: inline-size;
  }
  .face {
    display: grid;
    gap: 1.25rem;
    min-width: 0;
  }
  .retournee .face {
    animation: retourner 220ms ease-out;
  }
  @keyframes retourner {
    from { transform: perspective(900px) rotateY(-10deg); }
    to { transform: perspective(900px) rotateY(0); }
  }
  .carte-jeu :global(button.principal:hover) {
    background: var(--accent-texte);
    color: var(--action-texte);
  }
  .carte-jeu :global(button:focus-visible),
  .carte-jeu :global(a:focus-visible) {
    outline-color: var(--accent);
  }
  @media (prefers-reduced-motion: reduce) {
    .carte-jeu .face { animation: none; }
  }
  .entete {
    display: grid;
    grid-template-columns: 3.5rem minmax(0, 1fr) 2.75rem;
    gap: 0.85rem;
    align-items: center;
  }
  .fermer {
    display: grid;
    place-items: center;
    align-self: start;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    background: transparent;
    color: var(--muted);
    border-radius: 50%;
  }
  .fermer:hover { background: var(--surface); color: var(--fg); }
  .fermer svg { width: 1.25rem; height: 1.25rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
  .vignette {
    border-radius: var(--rayon-petit);
    width: 3.5rem;
    height: 3.5rem;
    object-fit: cover;
    display: block;
  }
  /* Thème sans illustration (Sport, Jeux, Musique pour l'instant) : un carré ivoire à sa place. */
  .sans-illustration {
    background: var(--surface);
  }
  .progression {
    margin: 0;
    color: var(--muted);
    font-size: 0.85rem;
  }
  .segments {
    list-style: none;
    margin: 0.4rem 0 0;
    padding: 0;
    display: flex;
    gap: 0.25rem;
  }
  .segments li {
    flex: 1;
    height: 0.3rem;
    border-radius: 1rem;
    background: var(--border);
  }
  .segments li.fait {
    background: var(--petrole);
  }
  .segments li.courant {
    background: var(--accent);
  }
  @media (prefers-color-scheme: dark) {
    .segments li.fait {
      background: var(--ivoire);
    }
  }
  /* L'énoncé est une phrase : largeur normale, pas l'étroit des affiches. */
  h1 {
    margin: 0.25rem 0 0;
    font-size: clamp(1.35rem, 4.8vw, 1.65rem);
    font-weight: 600;
    font-stretch: 100%;
    line-height: 1.2;
    letter-spacing: -0.015em;
  }
  .aide {
    margin: 0;
    padding: 0.75rem 0.9rem;
    background: var(--surface);
    border-radius: var(--rayon-bouton);
    font-size: 0.95rem;
  }
  .badges {
    margin: 0.35rem 0 0;
    display: flex;
    gap: 0.3rem;
  }
  .badge {
    padding: 0.05rem 0.45rem;
    border-radius: var(--rayon-petit);
    background: var(--surface);
    font-size: 0.75rem;
    color: var(--muted);
  }
  .badge.niveau {
    background: var(--ocre);
    color: var(--petrole);
  }
</style>
