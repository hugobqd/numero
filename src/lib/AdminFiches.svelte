<script lang="ts">
  import { tick } from 'svelte';
  import { CRANS_DIFFICULTE, type Question } from './types';
  import { avecUnite, entier } from './format';
  import { indexerCatalogue, selectionnerFiches, filtresVides, libelleLot, cleLot, manqueRelecture, type FicheCatalogue, type ColonneTri, type OrdreTri } from './catalogue';

  const fichiers = import.meta.glob<Question[]>('../data/*.json', { eager: true, import: 'default' });
  const catalogue = indexerCatalogue(fichiers);
  const alphabet = (a: string, b: string) => a.localeCompare(b, 'fr');
  const themes = [...new Set(catalogue.map(({ fiche }) => fiche.theme))].sort(alphabet);
  const tags = [...new Set(catalogue.flatMap(({ fiche }) => fiche.tags))].sort(alphabet);
  const unites = [...new Set(catalogue.map(({ fiche }) => fiche.unite))].sort(alphabet);
  const lots = [...new Set(catalogue.map(({ lot }) => lot))].sort((a, b) => (a ?? Infinity) - (b ?? Infinity));
  const nbValidees = catalogue.filter(({ fiche }) => fiche.statut === 'valide').length;
  let filtres = $state(filtresVides());
  let colonne = $state<ColonneTri>('enonce');
  let ordre = $state<OrdreTri>('asc');
  let page = $state(1);
  let taille = $state(25);
  let selection = $state<FicheCatalogue | null>(null);
  let dialogue: HTMLDialogElement;
  const resultat = $derived(selectionnerFiches(catalogue, filtres, colonne, ordre));
  const nbPages = $derived(Math.max(1, Math.ceil(resultat.length / taille)));
  const pageCourante = $derived(Math.min(page, nbPages));
  const debut = $derived((pageCourante - 1) * taille);
  const lignes = $derived(resultat.slice(debut, debut + taille));
  const colonnes: { cle: ColonneTri; nom: string; numerique?: boolean }[] = [
    { cle: 'enonce', nom: 'Fiche' }, { cle: 'valeur', nom: 'Valeur à retenir', numerique: true }, { cle: 'theme', nom: 'Thème' }, { cle: 'tags', nom: 'Tags internes' },
    { cle: 'difficulte', nom: 'Difficulté' }, { cle: 'statut', nom: 'Statut' }, { cle: 'lot', nom: 'Lot' },
    { cle: 'consulte_le', nom: 'Source consultée', numerique: true },
  ];
  const couleursThemes: Record<string, [string, string]> = {
    Astronomie: ['#e8eafd', '#373e80'], 'Corps humain': ['#fce7ef', '#8c2852'],
    Animaux: ['#e5f2dd', '#355f26'], Géographie: ['#e0eff9', '#205a7b'],
    'Terre et géologie': ['#f3ead6', '#72531c'], 'Physique et chimie': ['#ddf3f1', '#205e5a'],
    'Constructions et transports': ['#e6edf5', '#43546d'], Histoire: ['#f3e4da', '#794727'],
    'Arts et culture': ['#efe4f7', '#70428a'], 'Sport et jeux': ['#fff0da', '#8b570f'],
    'Nombres et mesures': ['#e9edf2', '#485569'], 'Nature et climat': ['#ddf1e8', '#286445'],
  };
  function couleurTheme(theme: string): string {
    const [fond, texte] = couleursThemes[theme] ?? ['#eeeeee', '#555555'];
    return `--pastille-fond: ${fond}; --pastille-texte: ${texte}`;
  }
  const typesLeurre = { erreur_frequente: 'Erreur fréquente', autre_unite: 'Autre unité', autre_perimetre: 'Autre périmètre', proche: 'Proche' };

  function trier(cle: ColonneTri) {
    ordre = cle === colonne && ordre === 'asc' ? 'desc' : 'asc';
    colonne = cle;
    page = 1;
  }
  function reinitialiser() {
    filtres = filtresVides(); colonne = 'enonce'; ordre = 'asc'; page = 1;
  }
  async function ouvrir(ligne: FicheCatalogue) {
    selection = ligne;
    await tick();
    dialogue.showModal();
  }
</script>

<svelte:head><title>Fiches · Administration Numero</title></svelte:head>

<main class="admin">
  <header>
    <div><a href={location.pathname}>← Retour au jeu</a><h1>Numero · Fiches</h1></div>
    <p>Consultation seule · {catalogue.length} fiches · {nbValidees} validées · {catalogue.length - nbValidees} brouillons</p>
  </header>

  <form class="filtres" onsubmit={(e) => e.preventDefault()} oninput={() => (page = 1)} onchange={() => (page = 1)}>
    <label class="recherche">Rechercher
      <input type="search" bind:value={filtres.recherche} placeholder="Énoncé, identifiant, tag, nombre, source…" />
    </label>
    <label>Thème<select bind:value={filtres.theme}><option value="">Tous les thèmes</option>{#each themes as theme}<option>{theme}</option>{/each}</select></label>
    <label>Tag interne<select bind:value={filtres.tag}><option value="">Tous les tags</option>{#each tags as tag}<option>{tag}</option>{/each}</select></label>
    <label>Difficulté<select bind:value={filtres.cran}><option value="">Toutes les difficultés</option>{#each Object.entries(CRANS_DIFFICULTE) as [cran, nom]}<option value={cran}>{cran} · {nom}</option>{/each}<option value="inconnue">Non renseignée</option></select></label>
    <label>Statut<select bind:value={filtres.statut}><option value="">Tous les statuts</option><option value="brouillon">Brouillon</option><option value="valide">Validée</option></select></label>
    <label>Lot<select bind:value={filtres.lot}><option value="">Tous les lots</option>{#each lots as lot}<option value={cleLot(lot)}>{libelleLot(lot)}</option>{/each}</select></label>
    <label>Unité<select bind:value={filtres.unite}><option value="">Toutes les unités</option>{#each unites as unite}<option>{unite}</option>{/each}</select></label>
    <label class="case"><input type="checkbox" bind:checked={filtres.aCompleter} /> Sources ou justification à compléter</label>
    <button type="button" onclick={reinitialiser}>Réinitialiser</button>
  </form>

  <div class="resultats">
    <p role="status">{resultat.length} / {catalogue.length} fiches{#if resultat.length} · {debut + 1}–{Math.min(debut + taille, resultat.length)} affichées{/if}</p>
    <label>Par page<select bind:value={taille} onchange={() => (page = 1)}><option value={25}>25</option><option value={50}>50</option><option value={150}>150</option><option value={Math.max(151, catalogue.length)}>Toutes</option></select></label>
  </div>

  <!-- Le conteneur doit être atteignable au clavier pour faire défiler les colonnes. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="tableau" tabindex="0" role="region" aria-label="Tableau des fiches, défilement horizontal disponible">
    <table>
      <caption class="sr-only">Fiches Numero : sélectionner un énoncé pour consulter le détail. Les en-têtes permettent de trier.</caption>
      <thead><tr>{#each colonnes as c}<th scope="col" class:nombre={c.numerique} aria-sort={colonne === c.cle ? ordre === 'asc' ? 'ascending' : 'descending' : 'none'}><button type="button" onclick={() => trier(c.cle)}>{c.nom}{#if colonne === c.cle}<span aria-hidden="true"> {ordre === 'asc' ? '↑' : '↓'}</span>{/if}</button></th>{/each}</tr></thead>
      <tbody>
        {#each lignes as ligne (ligne.fiche.id)}
          {@const q = ligne.fiche}
          <tr>
            <td class="identite"><button class="ouvrir" type="button" onclick={() => ouvrir(ligne)}>{q.enonce}</button><small>{q.id}</small></td>
            <td class="nombre valeur">{avecUnite(q.valeur_a_retenir, q.unite, q.precision)}</td>
            <td><span class="pastille" style={couleurTheme(q.theme)}>{q.theme}</span></td><td class="tags">{q.tags.join(' · ') || '—'}</td>
            <td>{#if q.difficulte}<span class="pastille cran-{q.difficulte.cran}">{q.difficulte.cran} · {CRANS_DIFFICULTE[q.difficulte.cran]}</span>{:else}<span class="pastille">Non renseignée</span>{/if}</td>
            <td><span class="pastille statut-{q.statut}">{q.statut === 'valide' ? 'Validée' : 'Brouillon'}</span>{#if manqueRelecture(q)}<small>À compléter</small>{/if}</td>
            <td class="lot">{libelleLot(ligne.lot)}</td>
            <td class="nombre">{q.source.consulte_le || '—'}</td>
          </tr>
        {:else}<tr><td colspan={colonnes.length} class="vide">Aucune fiche ne correspond à ces critères. <button type="button" onclick={reinitialiser}>Réinitialiser les filtres</button></td></tr>{/each}
      </tbody>
    </table>
  </div>
  <nav class="pagination" aria-label="Pagination des fiches"><button type="button" disabled={pageCourante <= 1} onclick={() => (page = pageCourante - 1)}>← Précédent</button><span>Page {pageCourante} / {nbPages}</span><button type="button" disabled={pageCourante >= nbPages} onclick={() => (page = pageCourante + 1)}>Suivant →</button></nav>
</main>

<dialog bind:this={dialogue} onclose={() => (selection = null)} aria-labelledby="titre-fiche" class="detail admin">
  {#if selection}
    {@const q = selection.fiche}
    <div class="entete-detail"><h2 id="titre-fiche">{q.enonce}</h2><button type="button" onclick={() => dialogue.close()}>Fermer</button></div>
    <p class="reference">{q.id} · {selection.fichier} · {libelleLot(selection.lot)}</p>
    <dl class="metadonnees">
      <div><dt>Valeur à retenir</dt><dd>{avecUnite(q.valeur_a_retenir, q.unite, q.precision)}</dd></div>
      <div><dt>Valeur source</dt><dd>{avecUnite(q.valeur, q.unite)}</dd></div>
      <div><dt>Précision</dt><dd>{avecUnite(q.precision, q.unite)}</dd></div>
      <div><dt>Statut</dt><dd><span class="pastille statut-{q.statut}">{q.statut === 'valide' ? 'Validée' : 'Brouillon'}</span></dd></div>
      <div><dt>Thème</dt><dd><span class="pastille" style={couleurTheme(q.theme)}>{q.theme}</span></dd></div><div><dt>Tags internes</dt><dd>{q.tags.join(' · ') || '—'}</dd></div>
      <div><dt>Difficulté</dt><dd>{#if q.difficulte}<span class="pastille cran-{q.difficulte.cran}">{q.difficulte.cran} · {CRANS_DIFFICULTE[q.difficulte.cran]}</span>{:else}<span class="pastille">Non renseignée</span>{/if}</dd></div>
      <div><dt>Langue</dt><dd>{q.langue}</dd></div>
    </dl>
    <h3>Périmètre</h3><p>{q.perimetre}</p>
    <h3>Ancrage</h3><p>{q.ancrage}</p>
    {#if q.mnemo}<h3>Moyen mnémotechnique</h3><p>{q.mnemo}</p>{/if}
    <h3>Justification de difficulté</h3><p>{q.difficulte?.justification || 'Non renseignée'}</p>
    <h3>Sources</h3>
    <dl class="sources"><dt>Référence</dt><dd><a href={q.source.url} target="_blank" rel="noopener noreferrer">{q.source.url}</a></dd>
      <dt>Consultée le</dt><dd>{q.source.consulte_le || 'Non renseigné'}</dd>
      <dt>Recoupement</dt><dd>{#if q.source.recoupement}<a href={q.source.recoupement} target="_blank" rel="noopener noreferrer">{q.source.recoupement}</a>{:else}Non renseigné{/if}</dd>
      <dt>Source d’idée</dt><dd>{q.source.idee || 'Non renseignée'}</dd>
    </dl>
    <h3>Leurres · {q.leurres.length}</h3>
    <div class="tableau-leurres"><table><thead><tr><th scope="col" class="nombre">Valeur</th><th scope="col">Type</th><th scope="col">Note et source</th></tr></thead><tbody>{#each [...q.leurres].sort((a, b) => a.valeur - b.valeur) as leurre}<tr><td class="nombre">{entier(leurre.valeur)} {q.unite}</td><td>{typesLeurre[leurre.type]}</td><td>{leurre.note || '—'}</td></tr>{/each}</tbody></table></div>
  {/if}
</dialog>

<style>
  .admin { --fg: #171717; --muted: #595959; --surface: #fff; --surface-2: #eee; --accent: #171717; --accent-texte: #171717; --police: system-ui, sans-serif; color: var(--fg); background: #f8f8f8; color-scheme: light; font: 14px/1.45 system-ui, sans-serif; font-variant-numeric: tabular-nums; }
  main.admin { min-height: 100dvh; padding: 24px; }
  header { display: flex; align-items: end; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
  h1 { font: 600 24px/1.3 system-ui, sans-serif; margin: 8px 0 0; letter-spacing: 0; }
  header p, .reference { color: var(--muted); margin: 0; }
  a { color: inherit; text-underline-offset: 3px; }
  button, input, select { font: inherit; color: inherit; border: 1px solid #ccc; border-radius: 6px; background: #fff; padding: 7px 10px; min-height: 36px; }
  button { cursor: pointer; }
  button:hover { background: #eee; }
  button:disabled { opacity: .4; cursor: default; }
  button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible, .tableau:focus-visible { outline: 2px solid #171717; outline-offset: 2px; }
  .filtres { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; margin-bottom: 16px; }
  label { display: grid; gap: 4px; min-width: 130px; }
  .recherche { flex: 1 1 320px; }
  input, select { max-width: 100%; min-width: 0; }
  .filtres select { width: 100%; max-width: 230px; }
  .case { display: flex; align-items: center; align-self: center; gap: 7px; margin-top: 16px; }
  .case input { min-height: auto; }
  .resultats { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 8px; }
  .resultats p { margin: 0; }
  .resultats label { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .tableau { overflow: auto; max-height: max(300px, calc(100dvh - 290px)); background: #fff; border: 1px solid #ddd; }
  table { width: 100%; border-collapse: collapse; text-align: left; }
  .tableau > table { min-width: 1150px; }
  th, td { padding: 10px 12px; border-bottom: 1px solid #e8e8e8; vertical-align: top; }
  th { font-size: 12px; font-weight: 500; white-space: nowrap; }
  .tableau thead { position: sticky; top: 0; z-index: 1; background: #fff; }
  th button { padding: 0; border: none; border-radius: 0; min-height: 24px; background: none; font-size: inherit; text-align: inherit; }
  th button:hover { text-decoration: underline; background: none; }
  .nombre { text-align: right; }
  .valeur, .lot { white-space: nowrap; }
  .identite { width: 34%; min-width: 290px; }
  .ouvrir { display: block; border: none; padding: 0; border-radius: 0; min-height: auto; background: none; text-align: left; font-weight: 500; text-decoration: none; }
  .ouvrir:hover { background: none; }
  small { display: block; font-size: 12px; color: var(--muted); margin-top: 4px; }
  .pastille { display: inline-block; padding: 3px 8px; border-radius: 999px; background: var(--pastille-fond, #eee); color: var(--pastille-texte, #555); font-size: 12px; font-weight: 500; line-height: 1.5; white-space: nowrap; }
  .cran-1, .statut-valide { --pastille-fond: #e4f3e7; --pastille-texte: #236032; }
  .cran-2 { --pastille-fond: #e3eefb; --pastille-texte: #24568b; }
  .cran-3, .statut-brouillon { --pastille-fond: #fff0d4; --pastille-texte: #805116; }
  .cran-4 { --pastille-fond: #fbe4e4; --pastille-texte: #922f37; }
  .tags { min-width: 150px; max-width: 230px; }
  tbody tr:hover { background: #fafafa; }
  .vide { padding: 32px; text-align: center; }
  .vide button { margin-left: 8px; }
  .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  dialog.detail { width: min(960px, calc(100% - 32px)); max-height: calc(100dvh - 32px); margin: auto; padding: 24px; border: 1px solid #bbb; border-radius: 8px; background: #fff; }
  dialog::backdrop { background: #0006; }
  .entete-detail { display: flex; justify-content: space-between; align-items: start; gap: 20px; }
  h2 { font: 600 20px/1.4 system-ui, sans-serif; margin: 0; letter-spacing: 0; }
  h3 { margin: 24px 0 6px; font-size: 15px; }
  p { margin: 6px 0; }
  .reference { margin: 8px 0 20px; overflow-wrap: anywhere; }
  .metadonnees { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 24px; margin: 0; }
  dt { color: var(--muted); font-size: 12px; }
  dd { margin: 2px 0 0; }
  .sources { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 8px 12px; }
  .sources dd { overflow-wrap: anywhere; margin: 0; }
  .tableau-leurres { overflow: auto; }
  .tableau-leurres td:last-child { min-width: 230px; overflow-wrap: anywhere; }
  @media (max-width: 600px) {
    main.admin { padding: 16px; }
    .filtres { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .filtres label { min-width: 0; }
    .filtres select { max-width: 100%; }
    .recherche, .case { grid-column: 1 / -1; }
    .case { margin-top: 0; }
    .tableau { max-height: 65dvh; }
    button, input, select { min-height: 44px; }
    .resultats { align-items: end; }
    .resultats label { display: grid; }
    .pagination { gap: 8px; justify-content: space-between; }
    dialog.detail { padding: 16px; width: calc(100% - 16px); max-height: calc(100dvh - 16px); }
    .metadonnees { grid-template-columns: 1fr; }
    .sources { grid-template-columns: 1fr; gap: 2px; }
    .sources dd { margin-bottom: 10px; }
    .entete-detail { gap: 12px; }
  }
</style>
