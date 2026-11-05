<script lang="ts">
  import type { Question, ResultatQuestion } from './lib/types';
  import { defisParCycle, numeroDefi, questionsDuDefi, questionsJouables } from './lib/daily';
  import { avecUnite } from './lib/format';
  import { lireParametres, MECAS, VARIANTES } from './lib/params';
  import { effacerPartie, effacerStats, ecrirePartie, enregistrerFin, lirePartie, lireStats, type PartieDuJour } from './lib/storage';
  import { partager, texteDePartage } from './lib/share';
  import {
    choisirRevision,
    effacerCollection,
    enregistrerRevision,
    fichesPossedees,
    gagnerFiche,
    lireCollection,
  } from './lib/collection';
  import Jeu from './lib/Jeu.svelte';
  import CollectionVue from './lib/CollectionVue.svelte';

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
  type Ecran = 'accueil' | 'defi' | 'bilan' | 'collection' | 'revision' | 'bilanRevision';
  let ecran = $state<Ecran>(reprise?.terminee ? 'bilan' : reprise?.resultats.length ? 'defi' : 'accueil');
  let stats = $state(lireStats());
  let messagePartage = $state('');

  // Collection : fiches gagnées en défi, à réviser.
  let collection = $state(lireCollection());
  let nouvellesFiches = $state<string[]>([]);
  const possedees = $derived(fichesPossedees(collection, stock));

  function resultatDefi(res: ResultatQuestion) {
    partie.resultats.push(res);
    ecrirePartie($state.snapshot(partie));
    // Toutes les fiches jouées rejoignent la collection ; les ratées sont à revoir en priorité.
    if (gagnerFiche(res.id, numero, res.gagne)) {
      nouvellesFiches.push(res.id);
      collection = lireCollection();
    }
  }

  function finDefi() {
    partie.terminee = true;
    ecrirePartie($state.snapshot(partie));
    stats = enregistrerFin(numero);
    ecran = 'bilan';
  }

  // Révision : 5 fiches de la collection, propositions tirées au hasard à chaque séance.
  let revision = $state<{ questions: Question[]; resultats: ResultatQuestion[]; graine: number } | null>(null);

  function reviser() {
    const qs = choisirRevision(collection, stock);
    if (!qs.length) return;
    revision = { questions: qs, resultats: [], graine: 1000 + Math.floor(Math.random() * 1_000_000) };
    ecran = 'revision';
  }

  function resultatRevision(res: ResultatQuestion) {
    revision?.resultats.push(res);
    enregistrerRevision(res.id, res.gagne);
    collection = lireCollection();
  }

  async function onPartager() {
    const r = await partager(texteDePartage(numero, partie.variante, partie.resultats));
    messagePartage = r === 'copie' ? 'Copié dans le presse-papiers' : r === 'echec' ? 'Partage impossible' : '';
  }

  const total = $derived(
    partie.variante === 'progressif'
      ? `${partie.resultats.reduce((s, r) => s + r.points, 0)} / ${questions.length * 100}`
      : `${partie.resultats.filter((r) => r.gagne).length} / ${questions.length}`,
  );
  const aRevoir = $derived(nouvellesFiches.filter((id) => !partie.resultats.find((r) => r.id === id)?.gagne).length);

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

  function viderCollection() {
    effacerCollection();
    collection = lireCollection();
  }

  const enonce = (id: string) => stock.find((q) => q.id === id);
</script>

<main>
  <header>
    <h1>Numero</h1>
    <nav class="haut">
      {#if ecran !== 'collection' && ecran !== 'revision'}
        <button type="button" class="lien" onclick={() => (ecran = 'collection')}>
          Collection <strong>{possedees.length}</strong>
        </button>
      {/if}
      <span class="numero">#{numero}</span>
    </nav>
  </header>

  {#if ecran === 'accueil'}
    <section class="accueil">
      <p class="pitch">5 nombres qui régissent le monde. Retiens-les au chiffre près.</p>
      <button type="button" class="principal" onclick={() => (ecran = 'defi')}>Jouer le défi du jour</button>
      {#if possedees.length}
        <button type="button" onclick={reviser}>Réviser ma collection ({possedees.length} fiches)</button>
      {/if}
    </section>
  {:else if ecran === 'defi'}
    <Jeu
      {questions}
      meca={partie.meca}
      variante={partie.variante}
      graine={numero}
      resultats={partie.resultats}
      onresultat={resultatDefi}
      onfin={finDefi}
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

      <div class="gain">
        {#if nouvellesFiches.length}
          <p>
            🎴 <strong>+{nouvellesFiches.length} fiche{nouvellesFiches.length > 1 ? 's' : ''}</strong>
            dans ta collection ({possedees.length} / {stock.length})
            {#if aRevoir}· dont <strong>{aRevoir} à revoir</strong>{/if}
          </p>
          <ul>
            {#each nouvellesFiches as id}
              <li class:revoir={!partie.resultats.find((r) => r.id === id)?.gagne}>{enonce(id)?.enonce}</li>
            {/each}
          </ul>
          {#if aRevoir}<p class="conseil">Les fiches ratées passent en premier dans tes révisions.</p>{/if}
        {:else}
          <p>Les fiches de ce défi sont dans ta collection ({possedees.length} / {stock.length}).</p>
        {/if}
        <div class="actions">
          <button type="button" onclick={() => (ecran = 'collection')}>Ma collection</button>
          {#if possedees.length}<button type="button" onclick={reviser}>Réviser</button>{/if}
        </div>
      </div>

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
  {:else if ecran === 'collection'}
    <CollectionVue
      {collection}
      {stock}
      onreviser={reviser}
      onretour={() => (ecran = partie.terminee ? 'bilan' : partie.resultats.length ? 'defi' : 'accueil')}
    />
  {:else if ecran === 'revision' && revision}
    <Jeu
      questions={revision.questions}
      meca={partie.meca}
      variante={partie.variante}
      graine={revision.graine}
      resultats={revision.resultats}
      etiquette="Révision"
      onresultat={resultatRevision}
      onfin={() => (ecran = 'bilanRevision')}
    />
  {:else if ecran === 'bilanRevision' && revision}
    <section class="bilan">
      <h2>Révision terminée</h2>
      <p class="score">{revision.resultats.filter((r) => r.gagne).length} / {revision.questions.length}</p>
      <ul class="recap">
        {#each revision.resultats as r, i}
          <li class:gagne={r.gagne}>
            <span>{revision.questions[i].enonce}</span>
            <strong>{avecUnite(revision.questions[i].valeur_a_retenir, revision.questions[i].unite, revision.questions[i].precision)}</strong>
          </li>
        {/each}
      </ul>
      <p class="demain">Une fiche réussie gagne une étoile de maîtrise ; une erreur la ramène à une étoile.</p>
      <div class="actions">
        <button type="button" class="principal" onclick={reviser}>Encore une révision</button>
        <button type="button" onclick={() => (ecran = 'collection')}>Ma collection</button>
      </div>
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
      <button type="button" onclick={viderCollection}>Vider la collection</button>
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
  .stock {
    margin: 0.5rem 0 0;
  }
  .haut {
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }
  button.lien {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    font-size: 0.9rem;
  }
  .gain {
    display: grid;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px dashed var(--accent);
    border-radius: 0.6rem;
  }
  .gain p,
  .gain ul {
    margin: 0;
  }
  .gain ul {
    padding-left: 1.25rem;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .gain li.revoir::marker {
    content: '↻ ';
    color: var(--perdu);
  }
  .conseil {
    color: var(--muted);
    font-size: 0.85rem;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .bilan h2 {
    margin: 0;
    text-align: center;
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
