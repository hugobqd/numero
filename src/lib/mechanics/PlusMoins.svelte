<script lang="ts">
  import type { Question, Reponse } from '../types';
  import { avecUnite, decadeDe, grand } from '../format';
  import { arrondiSignificatif } from '../propositions';

  /** Nombre de « plus / moins » demandés avant que la réponse soit arrêtée. */
  const COUPS = 7;

  let { question, onrepondre }: { question: Question; onrepondre: (r: Reponse) => void } = $props();

  // Intervalle de départ : 3 décades autour de la valeur (la sienne, une en dessous,
  // une au-dessus), pour ne pas dévoiler l'ordre de grandeur.
  const d = decadeDe(question.valeur_a_retenir);
  let bas = $state(10 ** (d - 1));
  let haut = $state(10 ** (d + 2));
  let historique = $state<{ valeur: number; choix: 'plus' | 'moins' }[]>([]);

  /** Milieu de l'intervalle, en échelle logarithmique, arrondi à un nombre « rond ». */
  function milieu(b: number, h: number): number {
    const m = Math.sqrt(b * h);
    let v = arrondiSignificatif(m, 2);
    // Si l'arrondi sort de l'intervalle ou le colle à une borne, on garde plus de chiffres.
    for (let c = 3; (v <= b || v >= h) && c <= 8; c++) v = arrondiSignificatif(m, c);
    return v;
  }

  const proposition = $derived(milieu(bas, haut));
  const affiche = $derived(grand(proposition, question.unite));

  function repondre(choix: 'plus' | 'moins') {
    historique.push({ valeur: proposition, choix });
    if (choix === 'plus') bas = proposition;
    else haut = proposition;

    if (historique.length >= COUPS) {
      const estimation = Math.round(Math.sqrt(bas * haut) / question.precision) * question.precision;
      onrepondre({ valeur: estimation, essai: COUPS });
    }
  }
</script>

<div class="plusmoins">
  <p class="consigne">La bonne valeur est-elle plus grande ou plus petite que…</p>

  <output class="valeur" aria-live="polite">
    <span class="chiffres">{affiche.chiffres}</span>
    <span class="unite">{affiche.unite}</span>
  </output>

  <div class="boutons">
    <button type="button" class="choix" onclick={() => repondre('moins')}>↓ Moins</button>
    <button type="button" class="choix" onclick={() => repondre('plus')}>↑ Plus</button>
  </div>

  <p class="progression">Coup {historique.length + 1} / {COUPS}</p>

  {#if historique.length}
    <ol class="historique">
      {#each historique as h}
        <li>
          <span class="chiffres-h">{avecUnite(h.valeur, question.unite)}</span>
          <span class="fleche">{h.choix === 'plus' ? '↑ plus' : '↓ moins'}</span>
        </li>
      {/each}
    </ol>
  {/if}
</div>

<style>
  .plusmoins {
    display: grid;
    gap: 1rem;
  }
  .consigne,
  .progression {
    margin: 0;
    color: var(--muted);
  }
  .progression {
    text-align: center;
    font-size: 0.85rem;
  }
  .valeur {
    display: flex;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .chiffres {
    font-size: clamp(2rem, 9vw, 3rem);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .unite {
    color: var(--muted);
  }
  .boutons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
  .choix {
    padding: 1.1rem;
    font-size: 1.2rem;
    font-weight: 700;
  }
  .historique {
    margin: 0;
    padding-left: 1.25rem;
    display: grid;
    gap: 0.2rem;
    font-size: 0.9rem;
    color: var(--muted);
  }
  .chiffres-h {
    font-variant-numeric: tabular-nums;
  }
  .fleche {
    color: var(--accent);
    margin-left: 0.5rem;
  }
</style>
