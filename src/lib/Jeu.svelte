<script lang="ts">
  import type { Mecanique, Question, Reponse, ResultatQuestion, VarianteScore } from './types';
  import { noter } from './score';
  import Slider from './mechanics/Slider.svelte';
  import Qcm from './mechanics/Qcm.svelte';
  import Palier from './mechanics/Palier.svelte';
  import PlusMoins from './mechanics/PlusMoins.svelte';
  import Revelation from './Revelation.svelte';

  /**
   * Déroulé d'une série de questions (défi du jour ou révision) : question, puis révélation,
   * jusqu'à la dernière. Le parent garde les résultats et décide quoi en faire.
   */
  let {
    questions,
    meca,
    variante,
    graine,
    resultats,
    etiquette = '',
    aide = false,
    onresultat,
    onfin,
  }: {
    questions: Question[];
    meca: Mecanique;
    variante: VarianteScore;
    /** Graine des propositions (numéro du défi, ou tirage au hasard en révision). */
    graine: number;
    resultats: ResultatQuestion[];
    etiquette?: string;
    /** Affiche le mode d'emploi de la mécanique sous la question (tuto). */
    aide?: boolean;
    onresultat: (r: ResultatQuestion, q: Question) => void;
    onfin: () => void;
  } = $props();

  let enRevelation = $state(false);

  const AIDES: Record<Mecanique, string> = {
    slider: 'Fais glisser le curseur jusqu’à la valeur voulue, au chiffre près, puis valide.',
    palier: 'Choisis un cran sur le curseur (ou touche une valeur), puis valide.',
    qcm: 'Touche la valeur qui te semble juste.',
    plusmoins:
      'Le jeu propose une valeur : dis si la bonne est plus grande ou plus petite. 3 coups au plus, et une seule erreur fait perdre la question.',
  };

  const index = $derived(enRevelation ? resultats.length - 1 : resultats.length);
  const courante = $derived(questions[index]);
  const dernierResultat = $derived(resultats[resultats.length - 1]);

  function repondre(r: Reponse) {
    const q = questions[resultats.length];
    const { points, gagne } = noter(q, r, meca, variante);
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
    afficherPoints={variante === 'progressif'}
    onsuivante={suivante}
    dernier={resultats.length >= questions.length}
  />
{:else if courante}
  <section class="question">
    <p class="progression">
      {#if etiquette}{`${etiquette} · `}{/if}Question {resultats.length + 1} / {questions.length} · {courante.thematique}
      {#if courante.statut === 'brouillon'}<span class="badge">brouillon</span>{/if}
    </p>
    <h2>{courante.enonce}</h2>
    {#if aide}<p class="aide">💡 {AIDES[meca]}</p>{/if}
    {#key courante.id}
      {#if meca === 'slider'}
        <Slider question={courante} onrepondre={repondre} />
      {:else if meca === 'palier'}
        <Palier question={courante} numero={graine} onrepondre={repondre} />
      {:else if meca === 'qcm'}
        <Qcm question={courante} numero={graine} onrepondre={repondre} />
      {:else}
        <PlusMoins question={courante} numero={graine} onrepondre={repondre} />
      {/if}
    {/key}
  </section>
{/if}

<style>
  .question {
    display: grid;
    gap: 1rem;
  }
  .progression {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  h2 {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.25;
  }
  .aide {
    margin: 0;
    padding: 0.6rem 0.8rem;
    border-radius: 0.5rem;
    background: var(--surface);
    font-size: 0.9rem;
  }
  .badge {
    margin-left: 0.4rem;
    padding: 0 0.4rem;
    border: 1px solid var(--border);
    border-radius: 0.3rem;
    font-size: 0.75rem;
  }
</style>
