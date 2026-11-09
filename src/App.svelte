<script lang="ts">
  import type { Mecanique, Question, ResultatQuestion } from './lib/types';
  import {
    ID_POCHETTE_OFFERTE,
    fichesNonReservees,
    ecrirePochette,
    effacerPochette,
    etatPochettesBonus,
    idPochetteDuJour,
    lirePochette,
    ouvrirPochetteBonus,
    ouvrirPochetteDuJour,
    ouvrirPochetteOfferte,
    questionsJouables,
    pochettesEnCours,
    type Pochette,
  } from './lib/pochettes';
  import {
    BONUS_REVISION_PARFAITE,
    ajouterNeurones,
    gainFiche,
    progression,
    lireNeurones,
    reglerPaliers,
  } from './lib/neurones';
  import { avecUnite } from './lib/format';
  import { estMecanique, lireParametres, MECA_PAR_DEFAUT } from './lib/params';
  import { enregistrerOuverture, lireStats, migrerStats, serieDuJour } from './lib/storage';
  import { partager, texteDePartage } from './lib/share';
  import {
    FICHES_PAR_REVISION,
    choisirRevision,
    enregistrerRevision,
    fichesPossedees,
    gagnerFiche,
    lireCollection,
    migrerCollection,
    toutGagner,
  } from './lib/collection';
  import Jeu from './lib/Jeu.svelte';
  import CompteurAnime from './lib/CompteurAnime.svelte';
  import { untrack } from 'svelte';
  import OuverturePochette from './lib/OuverturePochette.svelte';
  import CollectionVue from './lib/CollectionVue.svelte';
  import JoueursVue from './lib/JoueursVue.svelte';
  import Accueil from './lib/Accueil.svelte';
  import Reglages from './lib/Reglages.svelte';
  import JaugeNeurones from './lib/JaugeNeurones.svelte';
  import { pointsDuResultat, verdict } from './lib/score';
  import Recap from './lib/Recap.svelte';
  import Inspecteur from './lib/Inspecteur.svelte';
  import Partage from './lib/Partage.svelte';
  import type { Difficulte } from './lib/propositions';
  import {
    choisirJoueur,
    creerJoueur,
    effacerTout,
    joueurActif,
    lireJoueurs,
    majJoueur,
    nettoyerAnciennesDonnees,
    supprimerJoueur,
  } from './lib/joueurs';

  const params = lireParametres();
  // Données locales au format actuel dès le chargement : anciennes parties supprimées, collection et stats réécrites.
  nettoyerAnciennesDonnees();
  migrerCollection();
  migrerStats();
  // Comptes simulés : le jour est le jour simulé du joueur actif.
  const joueur = joueurActif();
  const joueurs = lireJoueurs();
  const numero = joueur?.jour ?? 1;
  if (params.reset) effacerPochette(idPochetteDuJour(numero));

  // Toutes les fiches de src/data/*.json (un fichier par thématique ou par lot).
  const fichiers = import.meta.glob<Question[]>('./data/*.json', { eager: true, import: 'default' });
  const stock: Question[] = Object.values(fichiers).flat();
  const jouables = questionsJouables(stock, params.brouillons);
  const nbBrouillons = jouables.filter((q) => q.statut === 'brouillon').length;
  const parId = (ids: string[]) => ids.map((id) => stock.find((q) => q.id === id)).filter((q): q is Question => !!q);

  // Mode de réponse : réglage du joueur (Mes réglages), mémorisé ; ?meca= dans l'URL le change aussi.
  if (params.meca && joueur) majJoueur(joueur.id, { meca: params.meca });
  let meca = $state<Mecanique>(params.meca ?? (estMecanique(joueur?.meca) ? joueur.meca : MECA_PAR_DEFAUT));
  function choisirMeca(m: Mecanique) {
    meca = m;
    if (joueur) majJoueur(joueur.id, { meca: m });
  }

  // Neurones : à l'arrivée, ceux gardés de la veille peuvent donner la pochette bonus du jour.
  let neurones = $state(joueur ? reglerPaliers().neurones : lireNeurones());
  // Une pochette bonus est tombée pendant le défi ou la révision en cours (annoncée au bilan).
  let bonusRecente = $state(false);
  /** Ajoute les neurones d'une réponse ou d'un bonus, et note la pochette bonus éventuellement gagnée. */
  function gagnerNeurones(gain: number) {
    if (gain <= 0) return;
    const r = ajouterNeurones(gain);
    neurones = r.neurones;
    if (r.bonusGagnees) bonusRecente = true;
  }
  const sommeNeurones = (res: ResultatQuestion[]) => res.reduce((s, r) => s + (r.neurones ?? 0), 0);

  // Pochettes enregistrées (du jour, bonus) : relues après chaque écriture.
  let versionPochettes = $state(0);
  // Pochette du jour : null tant qu'elle n'est pas ouverte ; ses fiches sont tirées à l'ouverture.
  const pochetteDuJour = $derived.by(() => {
    void versionPochettes;
    return lirePochette(idPochetteDuJour(numero));
  });
  const bonus = $derived.by(() => {
    void versionPochettes;
    return etatPochettesBonus(neurones.bonus);
  });
  const anciennesPochettes = $derived.by(() => {
    void versionPochettes;
    return pochettesEnCours().filter((p) => p.origine === 'offerte' || (p.origine === 'jour' && p.jour < numero));
  });
  // Pochette jouée en défi et montrée au bilan : celle du jour ou une pochette bonus.
  let pochette = $state<Pochette | null>(lirePochette(idPochetteDuJour(numero)));
  const questions = $derived(pochette ? parId(pochette.fiches) : []);
  const resultats = $derived(pochette?.resultats ?? []);
  type Ecran =
    | 'joueurs'
    | 'tuto'
    | 'tutoBilan'
    | 'accueil'
    | 'ouverture'
    | 'ouvertureTuto'
    | 'defi'
    | 'bilan'
    | 'collection'
    | 'revision'
    | 'bilanRevision'
    | 'reglages';
  let ecran = $state<Ecran>(joueur ? 'accueil' : 'joueurs');
  let stats = $state(lireStats());
  // Série en cours : remise à zéro si le joueur a manqué un jour.
  const serie = $derived(serieDuJour(stats, numero));

  // Navigation : pendant un défi, le tuto ou une révision, l'en-tête se réduit à un ✕ et la barre du bas disparaît.
  const enJeu = $derived(ecran === 'tuto' || ecran === 'defi' || ecran === 'revision' || ecran === 'ouverture' || ecran === 'ouvertureTuto' || ecran === 'bilan' || ecran === 'tutoBilan' || ecran === 'bilanRevision');
  const avecBarre = $derived(!!joueur && !enJeu);
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
  const possedees = $derived(fichesPossedees(collection, stock));
  // Dernières valeurs vues : gardées pendant le quiz, où le bandeau est démonté.
  const compteursVus = $state(untrack(() => ({ serie, neurones: neurones.total, fiches: possedees.length })));
  const nbAcquises = $derived(possedees.filter((q) => collection[q.id].etat === 'acquise').length);
  const nbAReviserTotal = $derived(possedees.filter((q) => collection[q.id].etat === 'decouverte').length);
  // Fiches que le joueur n'a pas encore : le tirage des pochettes se fait parmi elles.
  const aRecuperer = $derived(jouables.filter((q) => !collection[q.id]));

  const disponibles = $derived.by(() => {
    void versionPochettes;
    return fichesNonReservees(aRecuperer);
  });

  /** Ouvre la pochette du jour : tirage, série, puis l'écran de découverte de ses fiches. */
  function ouvrirPochette() {
    if (pochetteDuJour) return jouer(pochetteDuJour);
    if (!aRecuperer.length) return;
    const ouverte = ouvrirPochetteDuJour(numero, disponibles);
    if (!ouverte) return;
    jouer(ouverte, true);
    stats = enregistrerOuverture(numero);
  }

  /** Ouvre (ou reprend) la première pochette bonus pas encore terminée. */
  function ouvrirBonus() {
    if (!bonus) return;
    if (bonus.commencee) jouer(bonus.commencee);
    else if (disponibles.length) {
      const ouverte = ouvrirPochetteBonus(bonus.rang, numero, disponibles);
      if (ouverte) jouer(ouverte, true);
    }
  }

  /** Lance (ou reprend) le défi d'une pochette ; une pochette qui vient d'être ouverte repart d'un bilan vierge. */
  function jouer(p: Pochette, decouvrir = false) {
    pochette = p;
    bonusRecente = false;
    versionPochettes++;
    ecran = p.terminee ? 'bilan' : decouvrir ? 'ouverture' : 'defi';
  }

  /**
   * Fiche jouée dans le défi d'une pochette : elle rejoint la collection (les découvertes passent en priorité
   * en révision) et rapporte des neurones si elle est réussie.
   */
  function enregistrerFicheDefi(res: ResultatQuestion, q: Question, jour: number) {
    const avant = collection[res.id]?.etat ?? null;
    gagnerFiche(res.id, jour, res.gagne);
    collection = lireCollection();
    res.neurones = gainFiche(avant, collection[res.id]?.etat ?? 'decouverte', q.difficulte?.cran);
    gagnerNeurones(res.neurones);
  }

  function resultatDefi(res: ResultatQuestion, q: Question) {
    if (!pochette) return;
    enregistrerFicheDefi(res, q, pochette.jour);
    pochette.resultats.push(res);
    ecrirePochette($state.snapshot(pochette));
    versionPochettes++;
  }

  function finDefi() {
    if (pochette) {
      pochette.terminee = true;
      ecrirePochette($state.snapshot(pochette));
      versionPochettes++;
    }
    ecran = 'bilan';
  }

  // Pochette offerte (premier défi) : 5 fiches tout public tirées au hasard, avec le mode d'emploi,
  // Enregistrée comme les autres : un rechargement reprend où on en était.
  let offerte = $state<Pochette | null>(lirePochette(ID_POCHETTE_OFFERTE));
  const questionsTuto = $derived(offerte ? parId(offerte.fiches) : []);
  const resultatsTuto = $derived(offerte?.resultats ?? []);

  function commencerTuto() {
    if (!offerte) offerte = ouvrirPochetteOfferte(numero, aRecuperer);
    // Un compte de test peut déjà posséder tout le stock : aucune pochette à tirer.
    if (!offerte) {
      if (joueur) majJoueur(joueur.id, { tutoFait: true });
      ecran = 'accueil';
      return;
    }
    bonusRecente = false;
    versionPochettes++;
    ecran = offerte.resultats.length ? 'tuto' : 'ouvertureTuto';
  }

  function resultatTuto(res: ResultatQuestion, q: Question) {
    if (!offerte) return;
    // Fiches de la pochette offerte : jour 0.
    enregistrerFicheDefi(res, q, 0);
    offerte.resultats.push(res);
    ecrirePochette($state.snapshot(offerte));
    versionPochettes++;
  }

  function finTuto() {
    if (offerte) {
      offerte.terminee = true;
      ecrirePochette($state.snapshot(offerte));
      versionPochettes++;
    }
    if (joueur) majJoueur(joueur.id, { tutoFait: true });
    ecran = 'tutoBilan';
  }

  function reprendrePochette(p: Pochette) {
    if (p.origine === 'offerte') {
      offerte = p;
      commencerTuto();
    } else jouer(p);
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
  /** Test : oublie la pochette du jour pour en ouvrir une autre (les fiches déjà jouées restent acquises). */
  function nouvellePochette() {
    effacerPochette(idPochetteDuJour(numero));
    recharger();
  }

  // Révision : 5 fiches de la collection, propositions tirées au hasard à chaque séance.
  let revision = $state<{
    questions: Question[];
    resultats: ResultatQuestion[];
    graine: number;
    fichesProgressees: number;
    /** Neurones de bonus pour une révision parfaite (0 sinon). */
    bonus: number;
  } | null>(null);

  function reviser() {
    const qs = choisirRevision(collection, stock);
    if (!qs.length) return;
    revision = { questions: qs, resultats: [], graine: 1000 + Math.floor(Math.random() * 1_000_000), bonus: 0, fichesProgressees: 0 };
    bonusRecente = false;
    ecran = 'revision';
  }

  function resultatRevision(res: ResultatQuestion, q: Question) {
    const avant = collection[res.id]?.etat;
    enregistrerRevision(res.id, res.gagne);
    collection = lireCollection();
    const apres = collection[res.id]?.etat;
    res.neurones = avant && apres ? gainFiche(avant, apres, q.difficulte?.cran) : 0;
    gagnerNeurones(res.neurones);
    if (revision) {
      if (avant && apres && avant !== apres) revision.fichesProgressees++;
      revision.resultats.push(res);
    }
  }

  /** Fin de révision : une révision parfaite (5 / 5) rapporte un bonus de neurones. */
  function finRevision() {
    if (
      revision &&
      revision.questions.length === FICHES_PAR_REVISION &&
      revision.resultats.length === FICHES_PAR_REVISION &&
      revision.resultats.every((r) => r.gagne)
    ) {
      revision.bonus = BONUS_REVISION_PARFAITE;
      gagnerNeurones(revision.bonus);
    }
    ecran = 'bilanRevision';
  }

  async function onPartager() {
    const r = await partager(texteDePartage(pochette?.jour ?? numero, resultats));
    messagePartage = r === 'copie' ? 'Copié dans le presse-papiers' : r === 'echec' ? 'Partage impossible' : '';
  }

  const etatPochette = $derived(
    pochetteDuJour
      ? {
          etat: 'ouverte' as const,
          faites: pochetteDuJour.resultats.length,
          total: pochetteDuJour.fiches.length,
          terminee: pochetteDuJour.terminee,
        }
      : disponibles.length
        ? { etat: 'a-ouvrir' as const }
        : aRecuperer.length
          ? { etat: 'fiches-reservees' as const }
          : { etat: 'toutes-les-fiches' as const },
  );
  // Pochettes bonus sur l'accueil : celle commencée, ou le nombre à ouvrir s'il reste des fiches à récupérer.
  const etatBonus = $derived(
    bonus?.commencee
      ? { aOuvrir: bonus.aOuvrir, faites: bonus.commencee.resultats.length, total: bonus.commencee.fiches.length }
      : bonus && disponibles.length
        ? { aOuvrir: bonus.aOuvrir, faites: null, total: null }
        : null,
  );

  /** Lien de test avec les réglages voulus (le jour et le mode de réponse viennent du joueur actif). */
  function lien({ brouillons = params.brouillons, reset = false } = {}) {
    const q = [reset && 'reset=1', !brouillons && 'brouillons=0'].filter(Boolean).join('&');
    return q ? `?${q}` : location.pathname;
  }

  /** Test : efface toutes les données du jeu (tous les joueurs compris) et recharge la page. */
  function effacerLesDonnees() {
    effacerTout();
    location.replace(location.pathname);
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

{#snippet bilanPartie(titre: string, questions: Question[], resultats: ResultatQuestion[], revision: { bonus: number; fichesProgressees: number } | null = null, partage = false)}
  {@const gain = sommeNeurones(resultats) + (revision?.bonus ?? 0)}
  {@const reussies = resultats.filter((r) => verdict(r) === 'Gagné').length}
  {@const presque = resultats.filter((r) => verdict(r) === 'Presque').length}
  <section class="bilan palette-fiche" aria-labelledby="titre-bilan">
    <div class="entete-bilan">
      <h2 id="titre-bilan">{titre}</h2>
      <button type="button" class="fermer fermer-jeu" onclick={fermerJeu} aria-label="Fermer le bilan et revenir à l’accueil">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
    <p class="progression-bilan">
      {reussies} réussie{reussies > 1 ? 's' : ''}{#if presque} · {presque} presque{/if} · {resultats.length - reussies - presque} à revoir
    </p>
    {#if revision}
      <p class="progression-bilan">
        {#if revision.fichesProgressees}
          {revision.fichesProgressees} fiche{revision.fichesProgressees > 1 ? 's ont' : ' a'} progressé
        {:else}
          {resultats.filter((r) => r.gagne).length} sur {questions.length} trouvés
        {/if}
      </p>
    {/if}
    <div class="gains" class:deux-gains={!revision}>
      {#if !revision}
        <p><strong>+{resultats.length}</strong> fiche{resultats.length > 1 ? 's' : ''} gagnée{resultats.length > 1 ? 's' : ''}</p>
      {/if}
      <p><strong>+{gain}</strong> neurone{gain > 1 ? 's' : ''}{#if revision?.bonus}<small>dont {revision.bonus} de bonus</small>{/if}</p>
    </div>
    {#if gain}
      <JaugeNeurones {...progression(neurones)}>
        {#snippet titre()}Prochaine pochette bonus{/snippet}
      </JaugeNeurones>
    {/if}
    {#if bonusRecente}<p class="bonus-gagnee">Pochette bonus gagnée !</p>{/if}
    {#if revision && possedees.length}
      <button type="button" class="principal" onclick={reviser}>Réviser encore</button>
    {/if}
    <details class="details-bilan">
      <summary>Voir mes réponses</summary>
      {#if !revision}
        <p class="message">{resultats.reduce((s, r) => s + pointsDuResultat(r), 0)} / {questions.length * 100} pts</p>
      {/if}
      <Recap {questions} {resultats} />
    </details>
    {#if (bonusRecente && etatBonus) || revision || partage}
      <div class="actions">
        {#if bonusRecente && etatBonus}
          <button type="button" onclick={ouvrirBonus}>Ouvrir une pochette bonus</button>
        {/if}
        {#if revision}<button type="button" onclick={() => (ecran = 'collection')}>Ma collection</button>{/if}
        {#if partage}<button type="button" onclick={onPartager}>Partager</button>{/if}
      </div>
    {/if}
    {#if partage && messagePartage}<p class="message" role="status">{messagePartage}</p>{/if}
    {#if !revision}<button type="button" class="principal" onclick={fermerJeu}>Retour à l’accueil</button>{/if}
  </section>
{/snippet}

<svelte:window onkeydown={(event) => {
  if (event.key === 'Escape' && (ecran === 'bilan' || ecran === 'tutoBilan' || ecran === 'bilanRevision')) fermerJeu();
}} />

<main>
  {#if !enJeu}
    <header>
      <h1>
        {#if joueur}
          <button type="button" class="titre" onclick={() => (ecran = 'accueil')}>{@render marque()}</button>
        {:else}{@render marque()}{/if}
      </h1>
      {#if joueur}
        {@const palier = progression(neurones)}
        <div class="pastilles">
          <p class="pastille" aria-label="Série : {serie} jour{serie > 1 ? 's' : ''} d'affilée">Série <CompteurAnime valeur={serie} depuis={compteursVus.serie} onaffiche={(n) => (compteursVus.serie = n)} /></p>
          <div class="pastille pastille-neurones">
            <span>Neurones <CompteurAnime valeur={neurones.total} depuis={compteursVus.neurones} onaffiche={(n) => (compteursVus.neurones = n)} /></span>
            <progress
              aria-label="Progression vers la prochaine pochette bonus"
              aria-valuetext={`${palier.total} neurones sur ${palier.vers}`}
              value={palier.total - palier.depuis}
              max={palier.vers - palier.depuis}
            ></progress>
          </div>
          <button type="button" onclick={() => (ecran = 'collection')} class="pastille pastille-fiches" aria-label="Ouvrir Ma collection : {possedees.length} fiches sur {stock.length}">Fiches <CompteurAnime valeur={possedees.length} depuis={compteursVus.fiches} onaffiche={(n) => (compteursVus.fiches = n)} /></button>
        </div>
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
  {:else if ecran === 'ouverture' || ecran === 'ouvertureTuto'}
    {#key ecran}
      <OuverturePochette
        questions={ecran === 'ouvertureTuto' ? questionsTuto : questions}
        titre={ecran === 'ouvertureTuto' ? 'Ta pochette offerte' : pochette?.origine === 'bonus' ? 'Ta pochette bonus' : 'Ta pochette du jour'}
        onjouer={() => (ecran = ecran === 'ouvertureTuto' ? 'tuto' : 'defi')}
        onfermer={fermerJeu}
      />
    {/key}
  {:else if ecran === 'tuto'}
    <Jeu
      onfermer={fermerJeu}
      questions={questionsTuto}
      {meca}
      graine={0}
      resultats={resultatsTuto}
      etiquette="Premier défi"
      aide
      onresultat={resultatTuto}
      onfin={finTuto}
      bind:enCours
    />
  {:else if ecran === 'tutoBilan'}
    {@render bilanPartie('Premier défi terminé !', questionsTuto, resultatsTuto)}
  {:else if ecran === 'accueil'}
    <Accueil
      jour={numero}
      pochette={etatPochette}
      nbFiches={possedees.length}
      nbAReviser={nbAReviserTotal}
      {nbAcquises}
      bonus={etatBonus}
      onouvrirOfferte={joueur && !joueur.tutoFait && !offerte && disponibles.length ? commencerTuto : undefined}
      anciennesPochettes={anciennesPochettes.map((p) => ({ id: p.id, jour: p.jour, offerte: p.origine === 'offerte', faites: p.resultats.length, total: p.fiches.length }))}
      onreprendre={(id) => { const p = lirePochette(id); if (p) reprendrePochette(p); }}
      neurones={progression(neurones)}
      onouvrir={ouvrirPochette}
      onjouer={ouvrirPochette}
      onbilan={ouvrirPochette}
      onbonus={ouvrirBonus}
      onreviser={reviser}
      oncollection={() => (ecran = 'collection')}
    />
  {:else if ecran === 'defi'}
    <Jeu
      onfermer={fermerJeu}
      {questions}
      {meca}
      graine={pochette?.graine ?? numero}
      {resultats}
      onresultat={resultatDefi}
      onfin={finDefi}
      bind:enCours
    />
  {:else if ecran === 'bilan'}
    {@render bilanPartie(pochette?.origine === 'bonus' ? 'Pochette bonus terminée !' : 'Pochette terminée !', questions, resultats, null, pochette?.origine === 'jour')}
  {:else if ecran === 'collection'}
    <CollectionVue
      {collection}
      {stock}
      onreviser={reviser}
      onretour={() => (ecran = 'accueil')}
    />
  {:else if ecran === 'revision' && revision}
    <Jeu
      onfermer={fermerJeu}
      questions={revision.questions}
      {meca}
      graine={revision.graine}
      resultats={revision.resultats}
      etiquette="Révision"
      onresultat={resultatRevision}
      onfin={finRevision}
      difficulte={difficulteRevision}
      bind:enCours
    />
  {:else if ecran === 'bilanRevision' && revision}
    {@render bilanPartie('Révision terminée !', revision.questions, revision.resultats, revision)}
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
          <button type="button" onclick={() => gagnerNeurones(100)}>+100 neurones</button>
          <button type="button" onclick={() => { majJoueur(joueur.id, { tutoFait: false }); effacerPochette(ID_POCHETTE_OFFERTE); recharger(); }}>Revoir le tuto</button>
        </div>
      {:else}
        <p>Aucun joueur</p>
      {/if}
    </section>

    {#if joueur}
      <section>
        <h3>Jour simulé</h3>
        <div class="boutons">
          <button type="button" onclick={() => allerAuJour(numero + 1)}>Jour suivant</button>
          <button type="button" onclick={nouvellePochette} title="Oublie la pochette du jour pour en ouvrir une autre">↻ Pochette</button>
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
      <a href="?admin=fiches" target="_blank" rel="noopener">Consulter les fiches (tableau)</a>
      <p>
        {jouables.length} questions ({nbBrouillons} brouillons) · {aRecuperer.length} à récupérer
      </p>
      <a href={lien({ brouillons: !params.brouillons })}>{params.brouillons ? 'Exclure' : 'Inclure'} les brouillons</a>
    </section>

    {#if joueur}
      <section>
        <h3>Données</h3>
        <div class="boutons">
          <button type="button" onclick={effacerLesDonnees}>Effacer les données</button>
        </div>
      </section>
    {/if}
</aside>
{/if}

<style>
  main {
    max-width: 34rem;
    margin: 0 auto;
    padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) 3rem max(1rem, env(safe-area-inset-left));
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
    max-height: 100dvh;
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
    flex-wrap: wrap;
    gap: 0.5rem;
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
    gap: 1.25rem;
    padding: clamp(1.1rem, 4vw, 2rem);
    border-radius: 24px;
    border-top: 3px solid var(--accent);
    background: var(--carte-fond);
    box-shadow: 0 14px 36px -20px var(--carte-ombre), 0 3px 0 var(--surface-2);
  }
  .entete-bilan { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 0.75rem; }
  .gains { display: grid; gap: 0.6rem; }
  .deux-gains { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gains p {
    display: grid;
    margin: 0;
    padding: 0.8rem;
    border-radius: var(--rayon-carte);
    background: var(--surface);
    font-weight: 700;
  }
  .gains strong { font-size: clamp(2rem, 9vw, 3.5rem); line-height: 1; color: var(--accent-texte); }
  .gains small { font-weight: 400; }
  .progression-bilan,
  .message {
    margin: 0;
    color: var(--muted);
  }
  .details-bilan {
    display: grid;
    padding: 0.75rem 1rem;
    background: var(--surface);
    border-radius: var(--rayon-carte);
  }
  .details-bilan summary { cursor: pointer; font-weight: 700; }
  .details-bilan :global(.recap), .details-bilan .message { margin-top: 0.75rem; }
  .pastilles {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 0.35rem;
  }
  /* Série, neurones et collection : pastilles crème et chiffres réactifs. */
  .pastille {
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
  .pastille :global(.chiffres) {
    font-size: 1.05rem;
    font-weight: 900;
    margin-left: 0.15rem;
  }
  .pastille-neurones {
    display: grid;
    gap: 0.1rem;
  }
  .pastille-neurones progress {
    appearance: none;
    width: 100%;
    height: 3px;
    border: 0;
    border-radius: 999px;
    overflow: hidden;
    background: var(--border);
    color: var(--accent-texte);
  }
  .pastille-neurones progress::-webkit-progress-bar { background: var(--border); }
  .pastille-neurones progress::-webkit-progress-value { background: currentColor; }
  .pastille-neurones progress::-moz-progress-bar { background: currentColor; }
  .pastille-fiches {
    background: var(--sarcelle);
    color: var(--ivoire);
    padding-inline: 0.85rem;
  }
  .pastille-fiches:hover { background: var(--petrole); }
  .pastille-fiches :global(.chiffres) { font-size: 1.3rem; }
  /* Bandeau mobile : marque et trois compteurs sur une seule ligne. */
  @media (max-width: 30rem) {
    header {
      flex-wrap: nowrap;
      gap: 0.35rem;
    }
    h1 {
      font-size: 1.15rem;
      flex: none;
    }
    h1,
    .titre {
      gap: 0.25rem;
    }
    .sigle {
      width: 1.25rem;
      height: 1.25rem;
    }
    .pastilles {
      flex-wrap: nowrap;
      gap: 0.15rem;
    }
    .pastille {
      padding: 0.25rem 0.3rem;
      font-size: 0.65rem;
      letter-spacing: 0.01em;
    }
    .pastille :global(.chiffres) {
      font-size: 0.75rem;
      margin-left: 0.1rem;
    }
  }
  @media (max-width: 30rem) {
    .pastille-fiches { padding-inline: 0.5rem; }
    .pastille-fiches :global(.chiffres) { font-size: 0.95rem; }
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
    padding: 0 max(0.25rem, env(safe-area-inset-right)) env(safe-area-inset-bottom) max(0.25rem, env(safe-area-inset-left));
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
  .bonus-gagnee {
    font-weight: 700;
    color: var(--accent-texte);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
