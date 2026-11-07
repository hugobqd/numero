<script lang="ts">
  import { themePrincipal, type Mecanique, type Question, type Reponse, type ResultatQuestion } from './types';
  import { noter } from './score';
  import Qcm from './mechanics/Qcm.svelte';
  import Palier from './mechanics/Palier.svelte';
  import PlusMoins from './mechanics/PlusMoins.svelte';
  import Revelation from './Revelation.svelte';
  import type { Difficulte } from './propositions';
  import { illustration } from './themes';

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

{#if enRevelation && courante && dernierResultat}
  <Revelation
    question={courante}
    resultat={dernierResultat}
    onsuivante={suivante}
    dernier={resultats.length >= questions.length}
  />
{:else if courante}
  {@const ill = illustration(themePrincipal(courante))}
  <section class="question">
    <div class="entete">
      {#if ill}<img class="vignette" src={ill.src} alt="" width="600" height="600" />{/if}
      <div>
        <p class="progression">
          {#if etiquette}{`${etiquette} · `}{/if}Question {resultats.length + 1} / {questions.length} · {themePrincipal(courante)}
        </p>
        <!-- Avancement : un segment par question. -->
        <ol class="segments" aria-hidden="true">
          {#each questions as _, i}<li class:fait={i < resultats.length} class:courant={i === resultats.length}></li>{/each}
        </ol>
        <!-- Le statut brouillon n'est pas montré aux joueurs (il reste visible dans les outils de test). -->
        {#if difficulte(courante) !== 'normale'}
          <p class="badges">
            <span class="badge niveau">{difficulte(courante) === 'decouverte' ? 'niveau découverte' : 'niveau expert'}</span>
          </p>
        {/if}
      </div>
    </div>
    <h2>{courante.enonce}</h2>
    {#if aide}<p class="aide"><strong>Comment jouer :</strong> {AIDES[meca]}</p>{/if}
    {#key courante.id}
      {#if meca === 'palier'}
        <Palier question={courante} numero={graine} difficulte={difficulte(courante)} onrepondre={repondre} />
      {:else if meca === 'qcm'}
        <Qcm question={courante} numero={graine} difficulte={difficulte(courante)} onrepondre={repondre} />
      {:else}
        <PlusMoins question={courante} numero={graine} difficulte={difficulte(courante)} onrepondre={repondre} />
      {/if}
    {/key}
  </section>
{/if}

<style>
  .question {
    display: grid;
    gap: 1rem;
  }
  .entete {
    display: grid;
    grid-template-columns: 3.5rem 1fr;
    gap: 0.85rem;
    align-items: center;
  }
  .vignette {
    border-radius: var(--rayon-petit);
    width: 3.5rem;
    height: 3.5rem;
    object-fit: cover;
    display: block;
  }
  .progression {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
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
  h2 {
    margin: 0.25rem 0 0;
    font-size: 1.65rem;
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
