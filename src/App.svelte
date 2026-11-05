<script lang="ts">
  import type { Question, ResultatQuestion } from './lib/types';
  import { defisParCycle, questionsDuDefi, questionsJouables } from './lib/daily';
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
    maitrise,
    MAITRISE_MAX,
  } from './lib/collection';
  import Jeu from './lib/Jeu.svelte';
  import CollectionVue from './lib/CollectionVue.svelte';
  import JoueursVue from './lib/JoueursVue.svelte';
  import Accueil from './lib/Accueil.svelte';
  import {
    choisirJoueur,
    creerJoueur,
    joueurActif,
    lireJoueurs,
    majJoueur,
    nettoyerAnciennesDonnees,
    supprimerJoueur,
  } from './lib/joueurs';

  const params = lireParametres();
  nettoyerAnciennesDonnees();
  // Comptes simulés : le défi du jour est le jour simulé du joueur actif.
  const joueur = joueurActif();
  const joueurs = lireJoueurs();
  const numero = joueur?.jour ?? 1;
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
  type Ecran =
    | 'joueurs'
    | 'tutoIntro'
    | 'tuto'
    | 'tutoBilan'
    | 'accueil'
    | 'defi'
    | 'bilan'
    | 'collection'
    | 'revision'
    | 'bilanRevision';
  let ecran = $state<Ecran>(
    !joueur
      ? 'joueurs'
      : !joueur.tutoFait
        ? 'tutoIntro'
        : 'accueil',
  );
  let stats = $state(lireStats());
  let messagePartage = $state('');

  // Collection : fiches gagnées en défi, à réviser.
  let collection = $state(lireCollection());
  let nouvellesFiches = $state<string[]>([]);
  const possedees = $derived(fichesPossedees(collection, stock));
  const nbARevoirTotal = $derived(possedees.filter((q) => maitrise(collection[q.id]) === 0).length);
  const nbMaitrisees = $derived(possedees.filter((q) => maitrise(collection[q.id]) === MAITRISE_MAX).length);

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

  // Premier défi (tuto) : 5 questions connues, avec le mode d'emploi, avant le défi du jour.
  const TUTO = ['corps-os-adulte', 'terre-everest', 'astro-terre-lune', 'corps-dents-adulte', 'humanite-tour-eiffel-hauteur'];
  const questionsTuto = TUTO.map((id) => stock.find((q) => q.id === id)).filter((q): q is Question => !!q);
  let tuto = $state<{ resultats: ResultatQuestion[] }>({ resultats: [] });

  function resultatTuto(res: ResultatQuestion) {
    tuto.resultats.push(res);
    // Fiches du premier défi : défi n°0.
    gagnerFiche(res.id, 0, res.gagne);
    collection = lireCollection();
  }

  function finTuto() {
    if (joueur) majJoueur(joueur.id, { tutoFait: true });
    ecran = 'tutoBilan';
  }

  // Joueurs et jours simulés : chaque changement recharge la page avec les données du joueur.
  const recharger = () => location.assign(lien());

  // Menu de test : fermé par défaut, état mémorisé dans ce navigateur.
  let devOuvert = $state(lireDevOuvert());
  function lireDevOuvert(): boolean {
    try {
      return localStorage.getItem('numero:devOuvert') === '1';
    } catch {
      return false;
    }
  }
  function basculerDev() {
    devOuvert = !devOuvert;
    try {
      localStorage.setItem('numero:devOuvert', devOuvert ? '1' : '0');
    } catch {
      /* rien */
    }
  }
  function nouveauJoueur(pseudo: string) {
    creerJoueur(pseudo, 1);
    recharger();
  }
  function changerJoueur(id: string) {
    choisirJoueur(id);
    recharger();
  }
  function retirerJoueur(id: string) {
    supprimerJoueur(id);
    recharger();
  }
  function allerAuJour(n: number) {
    if (!joueur || n < 1) return;
    majJoueur(joueur.id, { jour: n });
    recharger();
  }
  function rejouerDefi() {
    effacerPartie(numero);
    recharger();
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
      ? `${partie.resultats.reduce((s, r) => s + r.points, 0)} / ${questions.length * 100} pts`
      : `${partie.resultats.filter((r) => r.gagne).length} / ${questions.length}`,
  );
  const aRevoir = $derived(nouvellesFiches.filter((id) => !partie.resultats.find((r) => r.id === id)?.gagne).length);

  /** Lien de test avec les réglages voulus (le jour vient du joueur actif). */
  function lien({ meca = partie.meca, score = partie.variante, brouillons = params.brouillons, reset = false } = {}) {
    return `?meca=${meca}&score=${score}${reset ? '&reset=1' : ''}${brouillons ? '' : '&brouillons=0'}`;
  }

  function reinitialiserStats() {
    effacerStats();
    stats = lireStats();
  }

  function viderCollection() {
    effacerCollection();
    collection = lireCollection();
  }

</script>

<main>
  <header>
    <h1>
      {#if joueur?.tutoFait}
        <button type="button" class="titre" onclick={() => (ecran = 'accueil')}>Numero</button>
      {:else}Numero{/if}
    </h1>
    <nav class="haut">
      {#if joueur}
        <button type="button" class="lien" onclick={() => (ecran = 'joueurs')}>👤 {joueur.pseudo}</button>
      {/if}

    </nav>
  </header>

  {#if ecran === 'joueurs'}
    <JoueursVue
      {joueurs}
      actifId={joueur?.id ?? null}
      oncreer={nouveauJoueur}
      onchoisir={changerJoueur}
      onsupprimer={retirerJoueur}
      onretour={joueur ? () => (ecran = joueur.tutoFait ? 'accueil' : 'tutoIntro') : undefined}
    />
  {:else if ecran === 'tutoIntro' && joueur}
    <section class="accueil">
      <h2>Bienvenue {joueur.pseudo} !</h2>
      <p>Numero, c'est <strong>5 nombres par jour</strong> à retenir <strong>au chiffre près</strong> : la distance Terre-Lune, le nombre d'os du corps humain, l'âge de la Terre…</p>
      <p>Chaque question jouée devient une <strong>fiche de ta collection</strong>. Celles que tu rates sont « à revoir » : tu les retravailles en révision jusqu'à les maîtriser (★★★).</p>
      <p>Pour commencer, voici ton <strong>premier défi</strong> : {questionsTuto.length} questions, avec le mode d'emploi.</p>
      <button type="button" class="principal" onclick={() => (ecran = 'tuto')}>C'est parti</button>
    </section>
  {:else if ecran === 'tuto'}
    <Jeu
      questions={questionsTuto}
      meca={partie.meca}
      variante={partie.variante}
      graine={0}
      resultats={tuto.resultats}
      etiquette="Premier défi"
      aide
      onresultat={resultatTuto}
      onfin={finTuto}
    />
  {:else if ecran === 'tutoBilan'}
    <section class="bilan">
      <h2>Premier défi terminé</h2>
      <p class="score">{tuto.resultats.filter((r) => r.gagne).length} / {questionsTuto.length}</p>
      <div class="gain">
        <p>🎴 <strong>+{questionsTuto.length} fiches</strong> dans ta collection.</p>
        <p class="conseil">Les fiches ratées sont « à revoir » : elles passeront en premier dans tes révisions.</p>
      </div>
      <button type="button" class="principal" onclick={() => (ecran = 'defi')}>Jouer le défi du jour</button>
      <button type="button" onclick={() => (ecran = 'collection')}>Voir ma collection</button>
    </section>
  {:else if ecran === 'accueil'}
    <Accueil
      pseudo={joueur?.pseudo ?? ''}
      jour={numero}
      defi={{ faites: partie.resultats.length, total: questions.length, terminee: partie.terminee, score: total }}
      serie={stats.dernierNumero !== null && stats.dernierNumero >= numero - 1 ? stats.serie : 0}
      nbFiches={possedees.length}
      nbTotal={stock.length}
      nbARevoir={nbARevoirTotal}
      {nbMaitrisees}
      onjouer={() => (ecran = 'defi')}
      onbilan={() => (ecran = 'bilan')}
      onreviser={reviser}
      oncollection={() => (ecran = 'collection')}
    />
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
      <button type="button" onclick={() => (ecran = 'accueil')}>← Accueil</button>
      {#if messagePartage}<p class="message">{messagePartage}</p>{/if}
      <dl class="stats">
        <div><dt>Joués</dt><dd>{stats.jouees}</dd></div>
        <div><dt>Série</dt><dd>{stats.serie}</dd></div>
        <div><dt>Record</dt><dd>{stats.meilleureSerie}</dd></div>
      </dl>
      <p class="demain">Prochain défi demain à minuit (heure de Paris).</p>
      <div class="actions centre">
        <button type="button" onclick={() => allerAuJour(numero + 1)}>Simuler le jour suivant →</button>
        <button type="button" onclick={rejouerDefi}>↻ Rejouer ce défi (test)</button>
      </div>
    </section>
  {:else if ecran === 'collection'}
    <CollectionVue
      {collection}
      {stock}
      onreviser={reviser}
      onretour={() => (ecran = 'accueil')}
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
        <button type="button" onclick={() => (ecran = 'accueil')}>← Accueil</button>
      </div>
    </section>
  {/if}

</main>

<footer class="version">v{__VERSION__} · {__COMMIT__}</footer>

<!-- Outils de test : repliés derrière un petit ⚙ en bas à droite ; panneau latéral (ou en bas sur mobile). -->
<button
  type="button"
  class="dev-bouton"
  class:ouvert={devOuvert}
  onclick={basculerDev}
  aria-expanded={devOuvert}
  aria-controls="outils-test"
  title="Outils de test">{devOuvert ? '✕ fermer' : '⚙ test'}</button
>
{#if devOuvert}
<aside class="dev" id="outils-test" aria-label="Outils de test">
    <p class="dev-titre">Outils de test</p>

    <section>
      <h3>Joueur</h3>
      {#if joueur}
        <p><strong>{joueur.pseudo}</strong> · jour {numero}</p>
        <div class="boutons">
          <button type="button" onclick={() => (ecran = 'joueurs')}>Changer</button>
          <button type="button" onclick={() => { majJoueur(joueur.id, { tutoFait: false }); recharger(); }}>Revoir le tuto</button>
        </div>
      {:else}
        <p>Aucun joueur</p>
      {/if}
    </section>

    {#if joueur}
      <section>
        <h3>Jour simulé</h3>
        <div class="boutons">
          <button type="button" onclick={() => allerAuJour(numero - 1)} disabled={numero <= 1}>← {numero - 1}</button>
          <button type="button" onclick={() => allerAuJour(numero + 1)}>{numero + 1} →</button>
          <button type="button" onclick={rejouerDefi}>↻ Rejouer</button>
        </div>
      </section>
    {/if}

    <section>
      <h3>Mécanique × score</h3>
      <table>
        <thead><tr><th></th>{#each VARIANTES as v}<th>{v}</th>{/each}</tr></thead>
        <tbody>
          {#each MECAS as m}
            <tr>
              <th>{m}</th>
              {#each VARIANTES as v}
                <td>
                  <a href={lien({ meca: m, score: v, reset: true })} class:actif={m === partie.meca && v === partie.variante}
                    >{m === partie.meca && v === partie.variante ? '●' : '○'}</a
                  >
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </section>

    <section>
      <h3>Contenu</h3>
      <p>
        {jouables.length} questions ({nbBrouillons} brouillons) · {defisParCycle(jouables)} défis avant répétition
      </p>
      <a href={lien({ brouillons: !params.brouillons })}>{params.brouillons ? 'Exclure' : 'Inclure'} les brouillons</a>
    </section>

    {#if joueur}
      <section>
        <h3>Données</h3>
        <div class="boutons">
          <button type="button" onclick={reinitialiserStats}>Effacer les stats</button>
          <button type="button" onclick={viderCollection}>Vider la collection</button>
        </div>
      </section>
    {/if}
</aside>
{/if}

<style>
  main {
    max-width: 34rem;
    margin: 0 auto;
    padding: 1rem 1rem 3rem;
    display: grid;
    gap: 1.5rem;
    align-content: start;
  }

  .version {
    padding: 0 1rem 1.25rem;
    text-align: center;
    font-size: 0.7rem;
    color: var(--muted);
    opacity: 0.6;
    font-variant-numeric: tabular-nums;
  }
  /* Outils de test : un petit ⚙ discret, qui ouvre un panneau par-dessus le jeu. */
  .dev-bouton {
    position: fixed;
    right: 0.75rem;
    bottom: 0.75rem;
    z-index: 11;
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    line-height: 1;
    color: var(--muted);
    opacity: 0.7;
  }
  .dev-bouton:hover,
  .dev-bouton.ouvert {
    opacity: 1;
  }
  .dev {
    position: fixed;
    z-index: 10;
    right: 0;
    bottom: 0;
    width: 16rem;
    max-height: 100vh;
    overflow-y: auto;
    padding: 1rem 1rem 3.5rem;
    font-size: 0.78rem;
    color: var(--muted);
    background: var(--bg);
    border-left: 1px solid var(--border);
    border-top: 1px solid var(--border);
    box-shadow: 0 0 1.5rem rgb(0 0 0 / 0.15);
  }
  @media (min-width: 52rem) {
    .dev {
      top: 0;
      border-top: none;
    }
  }
  @media (max-width: 51.99rem) {
    .dev {
      left: 0;
      width: auto;
      max-height: 70vh;
      border-left: none;
      border-radius: 0.8rem 0.8rem 0 0;
    }
  }
  .dev-titre {
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .dev section {
    display: grid;
    gap: 0.35rem;
    margin-top: 1rem;
  }
  .dev h3 {
    margin: 0;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }
  .dev p {
    margin: 0;
  }
  .dev .boutons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  .dev button {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 0.4rem;
    color: var(--muted);
  }
  .dev button:hover {
    color: var(--fg);
  }
  .dev button:disabled {
    opacity: 0.4;
  }
  .dev table {
    border-collapse: collapse;
  }
  .dev th,
  .dev td {
    padding: 0.15rem 0.35rem;
    text-align: left;
    font-weight: 400;
  }
  .dev td {
    text-align: center;
  }
  .dev a {
    color: var(--accent);
    text-decoration: none;
  }
  .dev a.actif {
    font-weight: 700;
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
  .accueil {
    display: grid;
    gap: 1.5rem;
    padding-top: 3rem;
  }
  button.titre {
    font: inherit;
    padding: 0;
    background: none;
    border: none;
    color: inherit;
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
  .gain p {
    margin: 0;
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
  .centre {
    justify-content: center;
  }
  .accueil h2 {
    margin: 0;
  }
  .accueil p {
    margin: 0;
  }
</style>
