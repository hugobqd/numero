<script lang="ts">
  import { CRANS_DIFFICULTE, type Question } from './types';
  import { avecUnite } from './format';
  import { propositions, type Difficulte } from './propositions';

  /** Outils de test : tout ce qu'il faut savoir sur la question affichée. */
  let { question, graine, difficulte }: { question: Question; graine: number; difficulte: Difficulte } = $props();

  const tirage = $derived(propositions(question, graine, difficulte));
  const leurresTries = $derived([...question.leurres].sort((a, b) => a.valeur - b.valeur));
  const deLaFiche = $derived(new Set(question.leurres.map((l) => l.valeur)));
  const TYPES = {
    erreur_frequente: 'erreur fréquente',
    autre_unite: 'autre unité',
    autre_perimetre: 'autre périmètre',
    proche: 'proche',
  } as const;
  const f = (v: number) => avecUnite(v, '', question.precision);
  const lien = (url: string) => decodeURIComponent(url.replace(/^https?:\/\//, ''));
</script>

<dl class="inspecteur">
  <dt>Fiche</dt>
  <dd><code>{question.id}</code> · {question.statut}</dd>

  <dt>Thème</dt>
  <dd>{question.theme}</dd>

  <dt>Tags internes</dt>
  <dd>{question.tags.join(' · ') || 'Aucun'}</dd>

  <dt>Difficulté</dt>
  <dd>
    {#if question.difficulte}
      {question.difficulte.cran} · {CRANS_DIFFICULTE[question.difficulte.cran]}<br /><small>{question.difficulte.justification}</small>
    {:else}
      <em>non attribuée</em>
    {/if}
  </dd>

  <dt>Bonne réponse</dt>
  <dd>
    <strong>{avecUnite(question.valeur_a_retenir, question.unite, question.precision)}</strong>
    <br />pas {f(question.precision)} · source {avecUnite(question.valeur, question.unite)}
  </dd>

  <dt>Périmètre</dt>
  <dd>{question.perimetre}</dd>

  <dt>Leurres de la fiche ({question.leurres.length})</dt>
  <dd>
    <ul>
      {#each leurresTries as l}
        <li title={l.note ?? ''}>{f(l.valeur)} <em>{TYPES[l.type]}</em>{#if l.note}<br /><small>{l.note}</small>{/if}</li>
      {/each}
    </ul>
  </dd>

  <dt>Propositions (graine {graine} · exigence {difficulte})</dt>
  <dd>
    <span class="liste">
      {#each tirage as v}<span
          class:bonne={v === question.valeur_a_retenir}
          class:fiche={deLaFiche.has(v)}>{f(v)}</span
        >{/each}
    </span>
    <small>vert : bonne réponse · gras : leurre de la fiche</small>
  </dd>

  <dt>Source</dt>
  <dd>
    <a href={question.source.url} target="_blank" rel="noopener">{lien(question.source.url)}</a>
    {#if question.source.recoupement}<br /><small>recoupement : <a href={question.source.recoupement} target="_blank" rel="noopener">{lien(question.source.recoupement)}</a></small>{/if}
    {#if question.source.idee}<br /><small>idée : {question.source.idee}</small>{/if}
  </dd>
</dl>

<style>
  .inspecteur {
    margin: 0;
    display: grid;
    gap: 0.15rem;
  }
  dt {
    margin-top: 0.4rem;
    font-weight: 600;
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
  ul {
    margin: 0;
    padding-left: 1rem;
  }
  li {
    margin-bottom: 0.2rem;
  }
  em {
    font-style: normal;
    opacity: 0.8;
  }
  small {
    opacity: 0.8;
  }
  .liste {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.5rem;
    font-variant-numeric: tabular-nums;
  }
  .bonne {
    color: var(--gagne);
    font-weight: 700;
  }
  .fiche {
    font-weight: 700;
    color: var(--fg);
  }
</style>
