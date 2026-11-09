<script lang="ts">
  import type { Question, ResultatQuestion } from './types';
  import { ecartRelatif, verdict } from './score';
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
  const statut = $derived(verdict(resultat));
</script>

<section class="revelation">
  <div class="comparaison">
    <div class="vraie">
      <span class="chiffres">{vraie.chiffres}</span>
      <span class="unite">{vraie.unite}</span>
    </div>
    <div class="retour" class:exact={resultat.gagne} class:presque={statut === 'Presque'}>
      <p class="verdict">{statut}</p>
      {#if resultat.erreur}
        <p class="reponse-joueur">Ta réponse · <strong>{resultat.erreur.choix} de {avecUnite(resultat.erreur.seuil, question.unite)}</strong></p>
      {:else}
        <p class="reponse-joueur">Ta réponse · <strong>{avecUnite(resultat.reponse, question.unite, question.precision)}</strong></p>
      {/if}
      {#if resultat.neurones}
        <p class="gain">+{resultat.neurones} neurone{resultat.neurones > 1 ? 's' : ''}</p>
      {/if}
    </div>
  </div>
  {#if question.perimetre}<p class="perimetre">{question.perimetre}</p>{/if}
  {#if resultat.erreur}
    <p class="perimetre">C’était {resultat.erreur.choix === 'plus' ? 'moins' : 'plus'} de {avecUnite(resultat.erreur.seuil, question.unite)}.</p>
  {/if}

  <p class="ancrage">{question.ancrage}</p>

  <button type="button" class="principal" onclick={onsuivante}>
    {dernier ? 'Voir le bilan' : 'Question suivante'}
  </button>

  <details>
    <summary>Détails</summary>
    {#if !resultat.gagne && !resultat.erreur}<p>Écart · {pourcentage(ecart)}</p>{/if}
    {#if question.valeur_a_retenir >= 1e6}<p>{scientifique(question.valeur_a_retenir)} {question.unite}</p>{/if}
    {#if question.mnemo}<p>{question.mnemo}</p>{/if}
    <a href={question.source.url} target="_blank" rel="noopener">Source · {new URL(question.source.url).hostname}</a>
  </details>
</section>

<style>
  .revelation {
    display: grid;
    gap: 0.75rem;
  }
  .comparaison {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(6.5rem, 2fr);
    align-items: start;
    gap: 0.75rem;
  }
  .vraie {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
    container-type: inline-size;
  }
  .vraie .chiffres {
    font-size: clamp(2.25rem, 26cqi, 5.5rem);
    color: var(--accent-texte);
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 0.9;
    letter-spacing: -0.02em;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .vraie .unite {
    font-size: 1.2rem;
    font-weight: 600;
  }
  .ancrage {
    margin: 0.25rem 0 0;
    padding: 0.9rem 1rem;
    border-left: 4px solid var(--accent);
    border-radius: var(--rayon-petit);
    background: var(--surface);
    font-size: 1.05rem;
  }
  .unite, .perimetre, details { color: var(--muted); }
  .perimetre, .retour p { margin: 0; }
  .retour {
    --couleur-verdict: var(--verdict-perdu);
    display: grid;
    justify-items: end;
    gap: 0.5rem;
    text-align: right;
    font-size: 0.9rem;
    overflow-wrap: anywhere;
  }
  .gain { color: var(--accent-texte); font-weight: 800; }
  .verdict {
    transform: rotate(-5deg);
    margin: 0;
    padding: 0.3rem 0.7rem;
    border-radius: var(--rayon-petit);
    background: var(--couleur-verdict);
    color: var(--verdict-texte);
    font-weight: 800;
  }
  .retour.exact { --couleur-verdict: var(--verdict-gagne); }
  .retour.presque { --couleur-verdict: var(--verdict-presque); }
  .reponse-joueur { color: var(--muted); font-weight: 400; }
  .reponse-joueur strong {
    color: color-mix(in srgb, var(--couleur-verdict) 40%, var(--fg));
    font-weight: 600;
  }
  @media (prefers-color-scheme: dark) {
    .reponse-joueur strong { color: var(--couleur-verdict); }
  }
  details { font-size: 0.9rem; }
  summary { cursor: pointer; }
  a { color: var(--accent-texte); }
</style>
