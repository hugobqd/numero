<script lang="ts">
  import type { Question, ResultatQuestion } from './types';
  import { ecartRelatif, estExact } from './score';
  import { avecUnite, grand, pourcentage, scientifique } from './format';

  let {
    question,
    resultat,
    afficherPoints,
    onsuivante,
    dernier,
  }: {
    question: Question;
    resultat: ResultatQuestion;
    afficherPoints: boolean;
    onsuivante: () => void;
    dernier: boolean;
  } = $props();

  const vraie = $derived(grand(question.valeur_a_retenir, question.unite, question.precision));
  const ecart = $derived(ecartRelatif(question, resultat.reponse));
  const verdict = $derived(
    estExact(question, resultat.reponse)
      ? 'Pile !'
      : resultat.gagne
        ? 'Gagné'
        : resultat.points > 0
          ? 'Presque'
        : resultat.reponse <= 0 ||
            Math.abs(Math.log10(resultat.reponse / question.valeur_a_retenir)) >= 1
          ? 'Mauvaise échelle'
          : 'Raté',
  );
</script>

<section class="revelation" class:gagne={resultat.gagne}>
  <p class="verdict">{verdict}{#if afficherPoints}{` · ${resultat.points} pts`}{/if}</p>

  <div class="vraie">
    <span class="chiffres">{vraie.chiffres}</span>
    <span class="unite">{vraie.unite}</span>
  </div>
  {#if question.valeur_a_retenir >= 1e6}
    <p class="formes">{scientifique(question.valeur_a_retenir)} {question.unite}</p>
  {/if}
  <p class="perimetre">{question.perimetre}</p>

  <p class="toi">
    Ta réponse : <strong>{avecUnite(resultat.reponse, question.unite, question.precision)}</strong>
    {#if !estExact(question, resultat.reponse)}({pourcentage(ecart)}){/if}
  </p>

  <p class="ancrage">{question.ancrage}</p>
  {#if question.mnemo}<p class="mnemo">💡 {question.mnemo}</p>{/if}

  <p class="source">
    Source : <a href={question.source.url} target="_blank" rel="noopener">{new URL(question.source.url).hostname}</a>
  </p>

  <button type="button" class="principal" onclick={onsuivante}>
    {dernier ? 'Voir le bilan' : 'Question suivante →'}
  </button>
</section>

<style>
  .revelation {
    display: grid;
    gap: 0.75rem;
  }
  .verdict {
    margin: 0;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--perdu);
  }
  .gagne .verdict {
    color: var(--gagne);
  }
  .vraie {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .vraie .chiffres {
    font-size: clamp(2.5rem, 12vw, 4rem);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .unite,
  .formes,
  .perimetre {
    color: var(--muted);
  }
  .formes,
  .perimetre {
    margin: 0;
  }
  .perimetre {
    font-style: italic;
  }
  .toi {
    margin: 0.5rem 0 0;
    font-variant-numeric: tabular-nums;
  }
  .ancrage {
    margin: 0;
    padding: 0.75rem 1rem;
    border-left: 3px solid var(--accent);
    background: var(--surface);
  }
  .mnemo {
    margin: 0;
  }
  .source {
    margin: 0;
    font-size: 0.85rem;
    color: var(--muted);
  }
  a {
    color: var(--accent);
  }
</style>
