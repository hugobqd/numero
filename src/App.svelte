<script lang="ts">
  import type { Question, Reponse, ResultatQuestion } from './lib/types';
  import { defisParCycle, numeroDefi, questionsDuDefi, questionsJouables } from './lib/daily';
  import { noter } from './lib/score';
  import { avecUnite } from './lib/format';
  import { lireParametres, MECAS, VARIANTES } from './lib/params';
  import { effacerPartie, effacerStats, ecrirePartie, enregistrerFin, lirePartie, lireStats, type PartieDuJour } from './lib/storage';
  import { partager, texteDePartage } from './lib/share';
  import Slider from './lib/mechanics/Slider.svelte';
  import Qcm from './lib/mechanics/Qcm.svelte';
  import Palier from './lib/mechanics/Palier.svelte';
  import PlusMoins from './lib/mechanics/PlusMoins.svelte';
  import Revelation from './lib/Revelation.svelte';

  const params = lireParametres();
  const numero = params.jour ?? numeroDefi();
  if (params.reset) effacerPartie(numero);

  // Toutes les fiches de src/data/*.json (un fichier par thématique ou par lot).
  const fichiers = import.meta.glob<Question[]>('./data/*.json', { eager: true, import: 'default' });
  const stock: Question[] = Object.values(fichiers).flat();
  const jouables = questionsJouables(stock, params.brouillons);
  const nbBrouillons = jouables.filter((q) => q.statut === 'brouillon').length;
  const questions: Question[] = questionsDuDefi(jouables, numero);

  // Une partie enregistrée avec un réglage qui n'existe plus (ex. l'ancienne variante « tolerance ») est ignorée.
  const enregistree = lirePartie(numero);
  const reprise =
    enregistree && MECAS.includes(enregistree.meca) && VARIANTES.includes(enregistree.variante) ? enregistree : null;
  // Une partie commencée garde ses réglages ; sinon on prend ceux de l'URL.
  let partie = $state<PartieDuJour>(
    reprise ?? { numero, meca: params.meca, variante: params.variante, resultats: [], terminee: false },
  );
  let ecran = $state<'accueil' | 'question' | 'revelation' | 'bilan'>(
    reprise?.terminee ? 'bilan' : reprise?.resultats.length ? 'question' : 'accueil',
  );
  let stats = $state(lireStats());
  let messagePartage = $state('');

  const index = $derived(Math.min(partie.resultats.length, questions.length - 1));
  const courante = $derived(questions[ecran === 'revelation' ? partie.resultats.length - 1 : index]);
  const dernierResultat = $derived(partie.resultats[partie.resultats.length - 1]);
  const afficherPoints = $derived(partie.variante === 'progressif');

  function repondre(r: Reponse) {
    const q = questions[partie.resultats.length];
    const { points, gagne } = noter(q, r, partie.meca, partie.variante);
    const res: ResultatQuestion = { id: q.id, reponse: r.valeur, points, gagne, erreur: r.erreur };
    partie.resultats.push(res);
    ecrirePartie($state.snapshot(partie));
    ecran = 'revelation';
  }

  function suivante() {
    if (partie.resultats.length >= questions.length) {
      partie.terminee = true;
      ecrirePartie($state.snapshot(partie));
      stats = enregistrerFin(numero);
      ecran = 'bilan';
    } else {
      ecran = 'question';
    }
  }

  async function onPartager() {
    const r = await partager(texteDePartage(numero, partie.variante, partie.resultats));
    messagePartage = r === 'copie' ? 'Copié dans le presse-papiers' : r === 'echec' ? 'Partage impossible' : '';
  }

  const total = $derived(
    afficherPoints
      ? `${partie.resultats.reduce((s, r) => s + r.points, 0)} / ${questions.length * 100}`
      : `${partie.resultats.filter((r) => r.gagne).length} / ${questions.length}`,
  );

  const aujourdhui = numeroDefi();

  /** Lien de test : relance un défi (efface la partie enregistrée) avec les réglages voulus. */
  function lien({ meca = partie.meca, score = partie.variante, jour = numero, brouillons = params.brouillons } = {}) {
    const j = jour === aujourdhui ? '' : `&jour=${jour}`;
    return `?meca=${meca}&score=${score}&reset=1${j}${brouillons ? '' : '&brouillons=0'}`;
  }

  function reinitialiserStats() {
    effacerStats();
    stats = lireStats();
  }
</script>

<main>
  <header>
    <h1>Numero</h1>
    <span class="numero">#{numero}</span>
  </header>

  {#if ecran === 'accueil'}
    <section class="accueil">
      <p class="pitch">5 nombres qui régissent le monde. Retiens-les au chiffre près.</p>
      <button type="button" class="principal" onclick={() => (ecran = 'question')}>Jouer le défi du jour</button>
    </section>
  {:else if ecran === 'question' && courante}
    <section class="question">
      <p class="progression">
        Question {partie.resultats.length + 1} / {questions.length} · {courante.thematique}
        {#if courante.statut === 'brouillon'}<span class="badge">brouillon</span>{/if}
      </p>
      <h2>{courante.enonce}</h2>
      <p class="unite-attendue">Réponse en <strong>{courante.unite}</strong></p>
      {#key courante.id}
        {#if partie.meca === 'slider'}
          <Slider question={courante} onrepondre={repondre} />
        {:else if partie.meca === 'palier'}
          <Palier question={courante} {numero} onrepondre={repondre} />
        {:else if partie.meca === 'qcm'}
          <Qcm question={courante} {numero} onrepondre={repondre} />
        {:else}
          <PlusMoins question={courante} {numero} onrepondre={repondre} />
        {/if}
      {/key}
    </section>
  {:else if ecran === 'revelation' && courante && dernierResultat}
    <Revelation
      question={courante}
      resultat={dernierResultat}
      {afficherPoints}
      onsuivante={suivante}
      dernier={partie.resultats.length >= questions.length}
    />
  {:else if ecran === 'bilan'}
    <section class="bilan">
      <p class="score">{total}</p>
      <ul class="recap">
        {#each partie.resultats as r, i}
          <li class:gagne={r.gagne}>
            <span>{questions[i]?.enonce}</span>
            <strong>{avecUnite(questions[i].valeur_a_retenir, questions[i].unite, questions[i].precision)}</strong>
          </li>
        {/each}
      </ul>
      <button type="button" class="principal" onclick={onPartager}>Partager mon résultat</button>
      {#if messagePartage}<p class="message">{messagePartage}</p>{/if}
      <dl class="stats">
        <div><dt>Joués</dt><dd>{stats.jouees}</dd></div>
        <div><dt>Série</dt><dd>{stats.serie}</dd></div>
        <div><dt>Record</dt><dd>{stats.meilleureSerie}</dd></div>
      </dl>
      <p class="demain">Prochain défi demain à minuit (heure de Paris).</p>
      <a class="rejouer" href={lien()}>↻ Rejouer ce défi (test)</a>
    </section>
  {/if}

  <details class="dev" open>
    <summary>Réglages de test · défi #{numero} · {partie.meca} / {partie.variante}</summary>
    <p class="stock">
      {jouables.length} questions jouables ({nbBrouillons} en brouillon) · {defisParCycle(jouables)} défis différents
      avant répétition ·
      <a href={lien({ brouillons: !params.brouillons })}>{params.brouillons ? 'exclure' : 'inclure'} les brouillons</a>
    </p>
    <nav class="defis">
      {#if numero > 1}<a href={lien({ jour: numero - 1 })}>← #{numero - 1}</a>{/if}
      <a href={lien()}>↻ Rejouer #{numero}</a>
      <a href={lien({ jour: numero + 1 })}>#{numero + 1} →</a>
      {#if numero !== aujourdhui}<a href={lien({ jour: aujourdhui })}>Aujourd'hui</a>{/if}
      <button type="button" onclick={reinitialiserStats}>Effacer les stats</button>
    </nav>
    <table>
      <thead><tr><th></th>{#each VARIANTES as v}<th>{v}</th>{/each}</tr></thead>
      <tbody>
        {#each MECAS as m}
          <tr>
            <th>{m}</th>
            {#each VARIANTES as v}
              <td><a href={lien({ meca: m, score: v })} class:actif={m === partie.meca && v === partie.variante}>jouer</a></td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </details>
</main>

<style>
  main {
    max-width: 34rem;
    margin: 0 auto;
    padding: 1rem 1rem 3rem;
    display: grid;
    gap: 1.5rem;
  }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }
  h1 {
    margin: 0;
    font-size: 1.5rem;
    letter-spacing: -0.02em;
  }
  .numero {
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .accueil {
    display: grid;
    gap: 1.5rem;
    padding-top: 3rem;
  }
  .pitch {
    font-size: 1.4rem;
    margin: 0;
  }
  .question {
    display: grid;
    gap: 1rem;
  }
  .progression,
  .unite-attendue {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  h2 {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.25;
  }
  .bilan {
    display: grid;
    gap: 1rem;
  }
  .score {
    margin: 0;
    font-size: 3rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    text-align: center;
  }
  .recap {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }
  .recap li {
    display: grid;
    gap: 0.15rem;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid var(--perdu);
    background: var(--surface);
  }
  .recap li.gagne {
    border-left-color: var(--gagne);
  }
  .recap strong {
    font-variant-numeric: tabular-nums;
  }
  .message,
  .demain {
    margin: 0;
    text-align: center;
    color: var(--muted);
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 0;
    text-align: center;
  }
  .stats dt {
    color: var(--muted);
    font-size: 0.8rem;
  }
  .stats dd {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
  .dev {
    margin-top: 2rem;
    font-size: 0.8rem;
    color: var(--muted);
  }
  .badge {
    margin-left: 0.4rem;
    padding: 0 0.4rem;
    border: 1px solid var(--border);
    border-radius: 0.3rem;
    font-size: 0.75rem;
  }
  .stock {
    margin: 0.5rem 0 0;
  }
  .rejouer {
    text-align: center;
    color: var(--accent);
  }
  .defis {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 1rem;
    margin-top: 0.75rem;
  }
  .defis button {
    padding: 0.25rem 0.6rem;
    font-size: 0.8rem;
  }
  .dev table {
    margin-top: 0.5rem;
    border-collapse: collapse;
    width: 100%;
  }
  .dev th,
  .dev td {
    padding: 0.25rem;
    text-align: center;
  }
  .dev a {
    color: var(--accent);
  }
  .dev a.actif {
    font-weight: 700;
    text-decoration: none;
  }
</style>
