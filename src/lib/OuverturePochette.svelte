<script lang="ts">
  import { themePrincipal, type Question } from './types';
  import { illustration } from './themes';

  let { questions, titre, onjouer, onfermer }: {
    questions: Question[]; titre: string; onjouer: () => void; onfermer: () => void;
  } = $props();
  let ouverte = $state(false);

  // Le passage au quiz fait partie de l'ouverture ; quitter l'écran annule l'attente.
  $effect(() => {
    if (!ouverte) return;
    const reduire = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delai = reduire ? 180 : 850 + questions.length * 70;
    const attente = window.setTimeout(onjouer, delai);
    return () => window.clearTimeout(attente);
  });
</script>

<section class="ouverture" class:ouverte aria-labelledby="titre-ouverture">
  <button class="fermer" onclick={onfermer} aria-label="Fermer et revenir à l'accueil">✕</button>
  <h1 id="titre-ouverture">{titre}</h1>
  <p class="invitation" aria-live="polite">{ouverte ? 'À toi de jouer !' : 'Touche la pochette pour lancer le défi.'}</p>
  <div class="scene">
    {#if ouverte}
      <ol class="pile" aria-label={`${questions.length} fiches face cachée`}>
        {#each questions as q, i (q.id)}
          {@const motif = illustration(themePrincipal(q))}
          <li class="dos palette-fiche" aria-label={`Fiche ${i + 1}, ${themePrincipal(q)}, face cachée`}
            style={`--i: ${i}; --decalage: ${(i - (questions.length - 1) / 2) * 11}px; --angle: ${(i - (questions.length - 1) / 2) * 4}deg`}>
            {#if motif}<img class="motif" src={motif.icone} alt="" width="112" height="112" />{/if}
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
</section>

<style>
  .ouverture { position: relative; text-align: center; padding: 3rem 0 1rem; }
  h1 { margin: 0; font-size: clamp(2rem, 8vw, 3rem); font-weight: 900; }
  .invitation { color: var(--muted); min-height: 3rem; margin: .75rem 1rem 0; }
  .fermer { position: absolute; right: 0; top: 0; background: transparent; width: 44px; height: 44px; padding: 0; }
  .scene { position: relative; isolation: isolate; height: 360px; width: 100%; max-width: 420px; margin: auto; }
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
  .dos { display: grid; place-items: center; position: absolute; top: 28px; left: calc(50% - 90px); width: 180px; aspect-ratio: 2 / 3; box-sizing: border-box; border-radius: 14px; background: var(--carte-fond); border: 1px solid var(--border); box-shadow: 0 3px 5px #142d340d, 0 10px 22px -14px #142d343d; transform: translateX(var(--decalage)) rotate(var(--angle)); animation: sortir 650ms cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(80ms + var(--i) * 70ms); }
  .motif { width: 64%; height: auto; aspect-ratio: 1; object-fit: contain; pointer-events: none; }
  @keyframes sortir {
    from { opacity: 0; transform: translateY(135px) rotate(-8deg) scale(.8); }
    55% { opacity: 1; transform: translate(var(--decalage), -20px) rotate(var(--angle)); }
    to { opacity: 1; transform: translateX(var(--decalage)) rotate(var(--angle)); }
  }
  @keyframes descendre { to { opacity: .35; transform: translateY(85px) rotate(-9deg) scale(.9); } }
  @keyframes fondu { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .dos { animation: fondu 160ms both; transform: translateX(var(--decalage)); }
    .ouverte .pochette { animation: none; opacity: .2; transform: none; }
  }
</style>
