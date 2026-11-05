<script lang="ts">
  import type { Question } from './types';
  import { avecUnite } from './format';
  import { propositions, propositionsQcm } from './propositions';

  /** Outils de test : tout ce qu'il faut savoir sur la question affichée. */
  let { question, graine }: { question: Question; graine: number } = $props();

  const props6 = $derived(propositions(question, graine));
  const props4 = $derived(propositionsQcm(question, graine));
  const TYPES = {
    erreur_frequente: 'erreur fréquente',
    autre_unite: 'autre unité',
    autre_perimetre: 'autre périmètre',
    proche: 'proche',
  } as const;
  const f = (v: number) => avecUnite(v, '', question.precision);
</script>

<dl class="inspecteur">
  <dt>Fiche</dt>
  <dd><code>{question.id}</code> · {question.thematique} · {question.statut}</dd>

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
      {#each question.leurres as l}
        <li title={l.note ?? ''}>{f(l.valeur)} <em>{TYPES[l.type]}</em>{#if l.note}<br /><small>{l.note}</small>{/if}</li>
      {/each}
    </ul>
  </dd>

  <dt>Propositions du jour (graine {graine})</dt>
  <dd>
    <span class="liste">
      {#each props6 as v}<span class:bonne={v === question.valeur_a_retenir} class:qcm={props4.includes(v)}>{f(v)}</span>{/each}
    </span>
    <small>palier et plus/moins : les 6 · QCM : soulignées</small>
  </dd>

  <dt>Source</dt>
  <dd><a href={question.source.url} target="_blank" rel="noopener">{decodeURIComponent(question.source.url.replace(/^https?:\/\//, ''))}</a></dd>
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
  .qcm {
    text-decoration: underline;
  }
</style>
