<script lang="ts">
  import type { Mecanique, Question, ResultatQuestion } from './lib/types';
  import { defisParCycle, questionsDuDefi, questionsJouables } from './lib/daily';
  import { avecUnite } from './lib/format';
  import { estMecanique, lireParametres, MECA_PAR_DEFAUT } from './lib/params';
  import { effacerPartie, effacerStats, ecrirePartie, enregistrerFin, lirePartie, lireStats, type PartieDuJour } from './lib/storage';
  import { partager, texteDePartage } from './lib/share';
  import {
    choisirRevision,
    effacerCollection,
    enregistrerRevision,
    fichesPossedees,
    gagnerFiche,
    lireCollection,
    toutGagner,
  } from './lib/collection';
  import Jeu from './lib/Jeu.svelte';
  import CollectionVue from './lib/CollectionVue.svelte';
  import JoueursVue from './lib/JoueursVue.svelte';
  import Accueil from './lib/Accueil.svelte';
  import Reglages from './lib/Reglages.svelte';
  import Recap from './lib/Recap.svelte';
  import Inspecteur from './lib/Inspecteur.svelte';
  import Partage from './lib/Partage.svelte';
  import type { Difficulte } from './lib/propositions';
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

  // Mode de réponse : réglage du joueur (Mes réglages), mémorisé ; ?meca= dans l'URL le change aussi.
  if (params.meca && joueur) majJoueur(joueur.id, { meca: params.meca });
  let meca = $state<Mecanique>(params.meca ?? (estMecanique(joueur?.meca) ? joueur.meca : MECA_PAR_DEFAUT));
  function choisirMeca(m: Mecanique) {
    meca = m;
    if (joueur) majJoueur(joueur.id, { meca: m });
  }

  let partie = $state<PartieDuJour>(lirePartie(numero) ?? { numero, resultats: [], terminee: false });
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
    | 'bilanRevision'
    | 'reglages';
  let ecran = $state<Ecran>(
    !joueur
      ? 'joueurs'
      : !joueur.tutoFait
        ? 'tutoIntro'
        : 'accueil',
  );
  let stats = $state(lireStats());
  // Série en cours : remise à zéro si le joueur a manqué un jour.
  const serie = $derived(stats.dernierNumero !== null && stats.dernierNumero >= numero - 1 ? stats.serie : 0);

  // Navigation : pendant un défi, le tuto ou une révision, l'en-tête se réduit à un ✕ et la barre du bas disparaît.
  const enJeu = $derived(ecran === 'tuto' || ecran === 'defi' || ecran === 'revision');
  const avecBarre = $derived(!!joueur && !enJeu && ecran !== 'tutoIntro');
  const ongletActif = $derived(
    ecran === 'accueil' || ecran === 'bilan'
      ? 'accueil'
      : ecran === 'collection'
        ? 'collection'
        : ecran === 'reglages' || ecran === 'joueurs'
          ? 'reglages'
          : null,
  );
  $effect(() => {
    document.body.classList.toggle('avec-barre', avecBarre);
  });
  /** ✕ : retour à l'accueil ; les réponses déjà données sont enregistrées. */
  function fermerJeu() {
    ecran = 'accueil';
  }
  let messagePartage = $state('');

  // Code de triche : le joueur « hubert » possède toutes les fiches, acquises.
  if (joueur?.pseudo.trim().toLowerCase() === 'hubert') toutGagner(stock);

  // Collection : fiches gagnées en défi, à réviser.
  let collection = $state(lireCollection());
  let nouvellesFiches = $state<string[]>([]);
  const possedees = $derived(fichesPossedees(collection, stock));
  const nbAReviserTotal = $derived(possedees.filter((q) => collection[q.id].etat === 'decouverte').length);
  const nbAcquises = $derived(possedees.filter((q) => collection[q.id].etat === 'acquise').length);

  function resultatDefi(res: ResultatQuestion) {
    partie.resultats.push(res);
    ecrirePartie($state.snapshot(partie));
    // Toutes les fiches jouées rejoignent la collection ; les découvertes passent en priorité en révision.
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

  // Question affichée (outils de test : inspecteur).
  let enCours = $state<{ question: Question; graine: number; difficulte: Difficulte } | null>(null);

  /** Révision : l'exigence des propositions suit l'état de la fiche (découverte, normale, experte). */
  function difficulteRevision(q: Question): Difficulte {
    const etat = collection[q.id]?.etat ?? 'en-cours';
    return etat === 'decouverte' ? 'decouverte' : etat === 'acquise' ? 'experte' : 'normale';
  }

  // Menu de test : fermé par défaut, état mémorisé dans ce navigateur.
  let devOuvert = $state(lireDevOuvert());
  function lireDevOuvert(): boolean {
    try {
      return localStorage.getItem('numero:devOuvert') === '1';
    } catch {
      return false;
    }
  }
  // Panneau ouvert sur grand écran : le jeu se décale pour ne pas être recouvert (voir app.css).
  $effect(() => {
    document.body.classList.toggle('dev-ouvert', devOuvert);
  });
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
    const r = await partager(texteDePartage(numero, partie.resultats));
    messagePartage = r === 'copie' ? 'Copié dans le presse-papiers' : r === 'echec' ? 'Partage impossible' : '';
  }

  const total = $derived(`${partie.resultats.reduce((s, r) => s + r.points, 0)} / ${questions.length * 100} pts`);
  const aReviser = $derived(nouvellesFiches.filter((id) => !partie.resultats.find((r) => r.id === id)?.gagne).length);

  /** Lien de test avec les réglages voulus (le jour et le mode de réponse viennent du joueur actif). */
  function lien({ brouillons = params.brouillons, reset = false } = {}) {
    const q = [reset && 'reset=1', !brouillons && 'brouillons=0'].filter(Boolean).join('&');
    return q ? `?${q}` : location.pathname;
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

{#snippet marque()}
  <!-- Marque : un « 0 » en cercles concentriques et le nom en capitales étroites. -->
  <svg class="sigle" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="var(--terracotta)" />
    <circle cx="16" cy="16" r="10" fill="none" stroke="var(--ivoire)" stroke-width="1.4" />
    <circle cx="16" cy="16" r="5.5" fill="none" stroke="var(--ivoire)" stroke-width="1.4" />
    <circle cx="16" cy="16" r="1.8" fill="var(--ivoire)" />
  </svg>
  <span class="nom-marque">Numero</span>
{/snippet}

<main>
  {#if enJeu}
    <header class="en-jeu">
      <button type="button" class="fermer" onclick={fermerJeu} aria-label="Fermer et revenir à l'accueil">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </header>
  {:else}
    <header>
      <h1>
        {#if joueur?.tutoFait}
          <button type="button" class="titre" onclick={() => (ecran = 'accueil')}>{@render marque()}</button>
        {:else}{@render marque()}{/if}
      </h1>
      {#if joueur}
        <p class="serie" aria-label="Série : {serie} jour{serie > 1 ? 's' : ''} d'affilée">Série <span class="chiffres">{serie}</span></p>
      {/if}
    </header>
  {/if}

  {#if ecran === 'joueurs'}
    <JoueursVue
      {joueurs}
      actifId={joueur?.id ?? null}
      oncreer={nouveauJoueur}
      onchoisir={changerJoueur}
      onsupprimer={retirerJoueur}
      onretour={joueur ? () => (ecran = 'reglages') : undefined}
    />
  {:else if ecran === 'tutoIntro' && joueur}
    <section class="accueil">
      <h2>Bienvenue {joueur.pseudo} !</h2>
      <p>Numero, c'est <strong>5 nombres par jour</strong> à retenir <strong>au chiffre près</strong> : la distance Terre-Lune, le nombre d'os du corps humain, l'âge de la Terre…</p>
      <p>Chaque question jouée devient une <strong>fiche de ta collection</strong>. Celles que tu ne trouves pas du premier coup sont « à réviser » : tu les retrouves en révision jusqu'à les avoir acquises.</p>
      <p>Pour commencer, voici ton <strong>premier défi</strong> : {questionsTuto.length} questions, avec le mode d'emploi.</p>
      <button type="button" class="principal" onclick={() => (ecran = 'tuto')}>C'est parti</button>
    </section>
  {:else if ecran === 'tuto'}
    <Jeu
      questions={questionsTuto}
      {meca}
      graine={0}
      resultats={tuto.resultats}
      etiquette="Premier défi"
      aide
      onresultat={resultatTuto}
      onfin={finTuto}
      bind:enCours
    />
  {:else if ecran === 'tutoBilan'}
    <section class="bilan">
      <h2>Premier défi terminé</h2>
      <p class="score">
        {tuto.resultats.reduce((s, r) => s + r.points, 0)} / {questionsTuto.length * 100} pts
      </p>
      <Recap questions={questionsTuto} resultats={tuto.resultats} />
      <div class="gain">
        <p><strong class="gain-nombre">+{questionsTuto.length}</strong> fiches dans ta collection.</p>
        <p class="conseil">Les fiches pas encore trouvées sont « à réviser » : elles passeront en premier dans tes révisions.</p>
        <div class="actions">
          <button type="button" class="secondaire" onclick={() => (ecran = 'collection')}>Voir ma collection</button>
        </div>
      </div>
      <button type="button" class="principal" onclick={() => (ecran = 'defi')}>Jouer le défi du jour</button>
    </section>
  {:else if ecran === 'accueil'}
    <Accueil
      pseudo={joueur?.pseudo ?? ''}
      jour={numero}
      defi={{ faites: partie.resultats.length, total: questions.length, terminee: partie.terminee, score: total }}
      {serie}
      nbFiches={possedees.length}
      nbTotal={stock.length}
      nbAReviser={nbAReviserTotal}
      {nbAcquises}
      onjouer={() => (ecran = 'defi')}
      onbilan={() => (ecran = 'bilan')}
      onreviser={reviser}
      oncollection={() => (ecran = 'collection')}
    />
  {:else if ecran === 'defi'}
    <Jeu
      {questions}
      {meca}
      graine={numero}
      resultats={partie.resultats}
      onresultat={resultatDefi}
      onfin={finDefi}
      bind:enCours
    />
  {:else if ecran === 'bilan'}
    <section class="bilan">
      <p class="score">{total}</p>
      <Recap {questions} resultats={partie.resultats} />

      <div class="gain">
        {#if nouvellesFiches.length}
          <p>
            <strong class="gain-nombre">+{nouvellesFiches.length}</strong> fiche{nouvellesFiches.length > 1 ? 's' : ''}
            dans ta collection ({possedees.length} / {stock.length})
            {#if aReviser}· dont <strong>{aReviser} à réviser</strong>{/if}
          </p>
          {#if aReviser}<p class="conseil">Les fiches à réviser passent en premier dans tes révisions.</p>{/if}
        {:else}
          <p>Les fiches de ce défi sont dans ta collection ({possedees.length} / {stock.length}).</p>
        {/if}
        <div class="actions">
          {#if possedees.length}<button type="button" class="principal" onclick={reviser}>Réviser</button>{/if}
          <button type="button" class="secondaire" onclick={() => (ecran = 'collection')}>Ma collection</button>
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
      {meca}
      graine={revision.graine}
      resultats={revision.resultats}
      etiquette="Révision"
      onresultat={resultatRevision}
      onfin={() => (ecran = 'bilanRevision')}
      difficulte={difficulteRevision}
      bind:enCours
    />
  {:else if ecran === 'bilanRevision' && revision}
    <section class="bilan">
      <h2>Révision terminée</h2>
      <p class="score">{revision.resultats.filter((r) => r.gagne).length} / {revision.questions.length}</p>
      <Recap questions={revision.questions} resultats={revision.resultats} />
      <p class="demain">Une fiche réussie progresse (découverte, en cours, acquise) ; une erreur ne lui retire rien.</p>
      <div class="actions">
        <button type="button" class="principal" onclick={reviser}>Encore une révision</button>
        <button type="button" onclick={() => (ecran = 'collection')}>Ma collection</button>
        <button type="button" onclick={() => (ecran = 'accueil')}>← Accueil</button>
      </div>
    </section>
  {:else if ecran === 'reglages' && joueur}
    <Reglages pseudo={joueur.pseudo} {meca} onmeca={choisirMeca} onjoueurs={() => (ecran = 'joueurs')} />
  {/if}
</main>

{#if avecBarre}
  <!-- Barre du bas : trois écrans et un raccourci qui lance directement une révision. -->
  <nav class="barre" aria-label="Navigation principale">
    <button type="button" class:actif={ongletActif === 'accueil'} aria-current={ongletActif === 'accueil' ? 'page' : undefined} onclick={() => (ecran = 'accueil')}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7M6 9.5V20h4.5v-5.5h3V20H18V9.5" /></svg>
      Accueil
    </button>
    <button type="button" class:actif={ongletActif === 'collection'} aria-current={ongletActif === 'collection' ? 'page' : undefined} onclick={() => (ecran = 'collection')}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="11" height="14" rx="1.5" /><path d="M8 3.5h10.5a1.5 1.5 0 0 1 1.5 1.5v12.5" /></svg>
      Ma collection
    </button>
    <button type="button" onclick={reviser} disabled={!possedees.length} title={possedees.length ? undefined : 'Joue un défi pour avoir des fiches à réviser'}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1" /><path d="M17.5 3v4h-4M6.5 21v-4h4" /></svg>
      Réviser
    </button>
    <button type="button" class:actif={ongletActif === 'reglages'} aria-current={ongletActif === 'reglages' ? 'page' : undefined} onclick={() => (ecran = 'reglages')}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /><circle cx="12" cy="12" r="6.5" /></svg>
      Mes réglages
    </button>
  </nav>
{/if}

<footer class="version"><Partage {meca} /> · v{__VERSION__} · {__COMMIT__}</footer>

<!-- Outils de test : repliés derrière un petit ⚙ en bas à droite ; panneau latéral (ou en bas sur mobile). -->
<button
  type="button"
  class="dev-bouton"
  class:ouvert={devOuvert}
  onclick={basculerDev}
  aria-expanded={devOuvert}
  aria-controls="outils-test"
  title="Outils de test">{devOuvert ? 'Fermer' : 'Test'}</button
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
      <h3>Question en cours</h3>
      {#if enCours && (ecran === 'defi' || ecran === 'tuto' || ecran === 'revision')}
        <Inspecteur question={enCours.question} graine={enCours.graine} difficulte={enCours.difficulte} />
      {:else}
        <p>Aucune question affichée.</p>
      {/if}
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
    /* Discret par la couleur seulement : une opacité rendrait aussi transparente la fenêtre de partage. */
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  /* Outils de test : un petit ⚙ discret, qui ouvre un panneau par-dessus le jeu. */
  .dev-bouton {
    position: fixed;
    right: 0.75rem;
    bottom: 0.75rem;
    z-index: 11;
    padding: 0.35rem 0.7rem;
    font-size: 0.75rem;
    line-height: 1;
    color: var(--muted);
    opacity: 0.75;
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
    width: 21rem;
    max-height: 100vh;
    overflow-y: auto;
    padding: 1rem 1rem 3.5rem;
    font-size: 0.78rem;
    color: var(--muted);
    background: var(--bg);
    border-left: 2px solid var(--surface-2);
    border-top: 2px solid var(--surface-2);
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
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--fg);
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
    color: var(--muted);
  }
  .dev button:hover {
    color: var(--fg);
  }
  .dev button:disabled {
    opacity: 0.4;
  }
  .dev a {
    color: var(--accent);
    text-decoration: none;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0;
  }
  h1 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 900;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  h1,
  .titre {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .dev-bouton,
  .dev button {
    border-radius: var(--rayon-petit);
  }
  .sigle {
    width: 1.9rem;
    height: 1.9rem;
    flex: none;
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
    font-size: clamp(3.5rem, 18vw, 5rem);
    font-weight: 900;
    line-height: 0.95;
    font-stretch: 72%;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    text-align: center;
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
    font-size: 2.2rem;
    font-weight: 800;
    font-stretch: 72%;
    line-height: 1.05;
  }
  /* Série : pastille crème, mot et chiffre en capitales étroites. */
  .serie {
    margin: 0;
    padding: 0.3rem 0.75rem;
    background: var(--surface);
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-stretch: 72%;
    white-space: nowrap;
  }
  .serie .chiffres {
    font-size: 1.05rem;
    font-weight: 900;
    margin-left: 0.15rem;
  }
  header.en-jeu {
    justify-content: flex-end;
    padding: 0;
  }
  .fermer {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    background: none;
    color: var(--fg);
  }
  .fermer:hover {
    background: var(--surface);
  }
  .fermer svg {
    width: 1.5rem;
    height: 1.5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }
  /* Barre du bas : fixe, sur toute la largeur, contenu centré sur la colonne du jeu. */
  .barre {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 8.5rem));
    justify-content: center;
    padding: 0 0.25rem env(safe-area-inset-bottom);
    background: var(--bg);
    border-top: 2px solid var(--surface-2);
  }
  .barre button {
    position: relative;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 0.15rem;
    min-height: var(--hauteur-barre);
    padding: 0.4rem 0.15rem;
    background: none;
    border-radius: 0;
    color: var(--muted);
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1.15;
    text-align: center;
  }
  .barre button:hover:not(:disabled, .actif) {
    color: var(--fg);
  }
  .barre button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .barre button:disabled:active {
    transform: none;
  }
  .barre button.actif {
    color: var(--accent-texte);
  }
  /* Onglet actif : un trait terracotta en haut. */
  .barre button.actif::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 22%;
    right: 22%;
    height: 3px;
    border-radius: 0 0 3px 3px;
    background: var(--accent);
  }
  .barre svg {
    width: 1.5rem;
    height: 1.5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .gain {
    display: grid;
    gap: 0.5rem;
    padding: 1rem 1.1rem;
    background: var(--surface);
    border-radius: var(--rayon-carte);
  }
  .gain p {
    margin: 0;
  }
  .gain .secondaire {
    background: var(--surface-2);
  }
  .gain-nombre {
    font-size: 1.8rem;
    font-weight: 900;
    font-stretch: 72%;
    color: var(--accent-texte);
    margin-right: 0.2rem;
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
