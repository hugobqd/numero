<script lang="ts">
  import type { Question, ResultatQuestion } from './types';
  import { ecartRelatif, estExact, verdict as qualifier } from './score';
  import { avecUnite, grand, pourcentage, scientifique } from './format';

  let {
    question,
    resultat,
    onsuivante,
    dernier,
  }: {
    question: Question;
    resultat: ResultatQuestion;
    onsuivante: () => void;
    dernier: boolean;
  } = $props();

  const vraie = $derived(grand(question.valeur_a_retenir, question.unite, question.precision));
  const ecart = $derived(ecartRelatif(question, resultat.reponse));
  const verdict = $derived(qualifier(question, resultat));
</script>

<section class="revelation" class:gagne={resultat.gagne}>
  <p class="verdict" class:presque={!resultat.gagne && resultat.points > 0}>
    <span class="pastille">{verdict}</span><span class="points">{resultat.points} pts</span>
    {#if resultat.neurones}<span class="neurones">+{resultat.neurones} neurones</span>{/if}
  </p>

  <div class="vraie">
    <span class="chiffres">{vraie.chiffres}</span>
    <span class="unite">{vraie.unite}</span>
  </div>
  {#if question.valeur_a_retenir >= 1e6}
    <p class="formes">{scientifique(question.valeur_a_retenir)} {question.unite}</p>
  {/if}
  <p class="perimetre">{question.perimetre}</p>

  <p class="toi">
    {#if resultat.erreur}
      Tu as répondu <strong>« {resultat.erreur.choix} »</strong> à
      <strong>{avecUnite(resultat.erreur.seuil, question.unite)}</strong>, mais c'était
      {resultat.erreur.choix === 'plus' ? 'moins' : 'plus'}.
    {:else}
      Ta réponse : <strong>{avecUnite(resultat.reponse, question.unite, question.precision)}</strong>
      {#if !estExact(question, resultat.reponse)}({pourcentage(ecart)}){/if}
    {/if}
  </p>

  <p class="ancrage">{question.ancrage}</p>
  {#if question.mnemo}<p class="mnemo"><strong>Astuce :</strong> {question.mnemo}</p>{/if}

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
  /* Verdict : un aplat de couleur (rouille, ocre ou sarcelle) en capitales étroites. */
  .verdict {
    margin: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    font-weight: 800;
  }
  .pastille {
    padding: 0.3rem 0.7rem;
    border-radius: var(--rayon-petit);
    background: var(--verdict-perdu);
    color: var(--verdict-texte);
    font-size: 1.3rem;
    font-stretch: 72%;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .presque .pastille {
    background: var(--verdict-presque);
  }
  .gagne .pastille {
    background: var(--verdict-gagne);
  }
  .points {
    font-size: 1.3rem;
    font-stretch: 72%;
  }
  .gagne .pastille { animation: tampon 380ms ease-out; }
  .vraie { animation: decouvrir 350ms ease-out both; }
  .neurones {
    animation: decouvrir 400ms 150ms ease-out both;
    margin-left: auto;
    font-size: 1.1rem;
    font-stretch: 72%;
    color: var(--accent-texte);
  }
  .vraie {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .vraie .chiffres {
    font-size: clamp(2.75rem, 17cqi, 5.5rem);
    color: var(--accent-texte);
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 0.9;
    letter-spacing: -0.02em;
  }
  .vraie .unite {
    font-size: 1.2rem;
    font-weight: 600;
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
    margin: 0.25rem 0 0;
    padding: 0.9rem 1rem;
    border-left: 4px solid var(--accent);
    border-radius: var(--rayon-petit);
    background: var(--surface);
    font-size: 1.05rem;
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
    color: var(--accent-texte);
  }
  .principal {
    margin-top: 0.75rem;
  }
  @keyframes tampon {
    0% { transform: scale(1.2) rotate(-5deg); opacity: 0; }
    65% { transform: scale(.96) rotate(1deg); opacity: 1; }
    100% { transform: none; }
  }
  @keyframes decouvrir {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .gagne .pastille, .vraie, .neurones { animation: none; }
  }
</style>
