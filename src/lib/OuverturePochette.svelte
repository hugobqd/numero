<script lang="ts">
  import { CRANS_DIFFICULTE, themePrincipal, type Question } from './types';
  import { couleurTheme, illustration } from './themes';

  let { questions, titre, onjouer, onfermer }: {
    questions: Question[]; titre: string; onjouer: () => void; onfermer: () => void;
  } = $props();
  let ouverte = $state(false);
</script>

<section class="ouverture" class:ouverte aria-labelledby="titre-ouverture">
  <button class="fermer" onclick={onfermer} aria-label="Fermer et revenir à l'accueil">✕</button>
  <h1 id="titre-ouverture">{titre}</h1>
  <p class="invitation" aria-live="polite">{ouverte ? `${questions.length} fiches à découvrir. À toi de jouer !` : 'Touche la pochette pour découvrir tes thèmes.'}</p>
  <div class="scene">
    {#if ouverte}
      <ol class="pile" aria-label="Fiches de la pochette, face cachée">
        {#each questions as q, i (q.id)}
          {@const image = illustration(themePrincipal(q))}
          <li class="dos palette-fiche" style={`--theme: ${couleurTheme(themePrincipal(q))}; --i: ${i}; --angle: ${(i - (questions.length - 1) / 2) * 3}deg`}>
            <span class="numero">{i + 1} / {questions.length}</span>
            {#if image}<img src={image.icone} alt="" width="24" height="24" />{/if}
            <strong>{themePrincipal(q)}</strong>
            <span class="cran">{q.difficulte ? CRANS_DIFFICULTE[q.difficulte.cran] : 'Cran non renseigné'}</span>
          </li>
        {/each}
      </ol>
    {/if}
    <button class="pochette" onclick={() => (ouverte = true)} disabled={ouverte} aria-label="Ouvrir la pochette" aria-expanded={ouverte}>
      <span class="rabat" aria-hidden="true"></span>
      <span class="marque">Numero</span>
      <span class="nombre">{questions.length}</span>
      <span class="legende">nombres à retenir</span>
      <span class="sceau" aria-hidden="true">↗</span>
    </button>
  </div>
  {#if ouverte}
    <button class="principal jouer" onclick={onjouer}>Jouer</button>
  {/if}
</section>

<style>
  .ouverture { position: relative; text-align: center; padding: 3rem 0 1rem; }
  h1 { margin: 0; font-size: clamp(2rem, 8vw, 3rem); font-weight: 900; }
  .invitation { color: var(--muted); min-height: 3rem; margin: .75rem 1rem 0; }
  .fermer { position: absolute; right: 0; top: 0; background: transparent; width: 44px; height: 44px; padding: 0; }
  .scene { position: relative; isolation: isolate; height: 440px; width: 100%; max-width: 420px; margin: auto; }
  .pochette { position: absolute; width: 220px; height: 260px; left: calc(50% - 110px); top: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--terracotta); color: var(--ivoire); border-radius: 8px 8px 20px 20px; box-shadow: 0 3px 0 var(--rouille), 0 16px 28px -14px #142d3455; transform: rotate(-6deg); transition: transform 300ms; }
  .pochette:hover { background: var(--terracotta); transform: rotate(-3deg) translateY(-6px); }
  .rabat { position: absolute; inset: 0 0 auto; height: 30px; border-bottom: 2px dashed currentColor; transform-origin: top; transition: transform 350ms, opacity 350ms; }
  .marque { font-weight: 900; font-stretch: 72%; font-size: 2rem; text-transform: uppercase; }
  .nombre { font-size: 6rem; font-weight: 900; line-height: 1.1; font-stretch: 72%; }
  .legende { font-size: .9rem; }
  .sceau { position: absolute; bottom: 12px; right: 16px; font-size: 1.5rem; }
  .ouverte .pochette { transform: translateY(70px) rotate(-9deg) scale(.9); z-index: -1; animation: descendre 800ms both; }
  .ouverte .rabat { transform: rotateX(170deg); opacity: 0; }
  .pile { list-style: none; padding: 0; margin: 0; position: absolute; inset: 0; }
  .dos { position: absolute; top: calc(12px + var(--i) * 62px); left: 12%; width: 76%; height: 120px; padding: .65rem .9rem; box-sizing: border-box; display: grid; grid-template-columns: 24px 1fr auto; gap: .25rem .6rem; align-content: start; align-items: center; text-align: left; border-radius: 12px; background: color-mix(in srgb, var(--theme) 12%, var(--carte-fond)); color: var(--fg); border: 1px solid color-mix(in srgb, var(--theme) 35%, var(--border)); border-left: 4px solid var(--theme); box-shadow: 0 3px 5px #142d340d, 0 10px 22px -14px #142d343d; transform: rotate(var(--angle)); animation: sortir 750ms cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(100ms + var(--i) * 90ms); }
  .numero { grid-column: 3; grid-row: 1 / 3; color: var(--muted); font-size: .75rem; }
  .dos strong { font-size: .9rem; line-height: 1.2; }
  .cran { grid-column: 2; font-size: .8rem; color: var(--muted); text-transform: capitalize; }
  .jouer { min-width: 200px; animation: arriver 300ms 850ms both; }
  @keyframes sortir { from { opacity: 0; transform: translateY(135px) rotate(-12deg) scale(.8); } 55% { opacity: 1; transform: translateY(-15px) rotate(var(--angle)); } to { opacity: 1; transform: rotate(var(--angle)); } }
  @keyframes descendre { to { opacity: .35; transform: translateY(85px) rotate(-9deg) scale(.9); } }
  @keyframes arriver { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes fondu { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .dos, .jouer { animation: fondu 160ms both; }
    .ouverte .pochette { animation: none; opacity: .2; transform: none; }
  }
</style>
