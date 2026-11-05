<script lang="ts">
  import type { Question, Reponse } from '../types';
  import { avecUnite, grand } from '../format';
  import { arrondiSignificatif, propositions } from '../propositions';

  let {
    question,
    numero,
    onrepondre,
  }: { question: Question; numero: number; onrepondre: (r: Reponse) => void } = $props();

  // Recherche par dichotomie parmi les 6 propositions du palier (invisibles pour le joueur) :
  // 3 coups au plus. Le jeu demande « plus ou moins que X ? », X étant un seuil rond
  // placé entre deux propositions voisines ; la proposition restante est la réponse.
  // Il faut au moins 2 pas d'écart entre deux candidats pour placer un seuil entier entre eux
  // (pas de « 205,5 os ») : on écarte les leurres trop proches d'un voisin, jamais la bonne réponse.
  const candidats = propositions(question, numero).reduce<number[]>((garde, v) => {
    const precedent = garde[garde.length - 1];
    if (precedent === undefined || v - precedent >= 2 * question.precision) garde.push(v);
    else if (v === question.valeur_a_retenir) garde[garde.length - 1] = v;
    return garde;
  }, []);
  const COUPS_MAX = Math.ceil(Math.log2(candidats.length));

  let bas = $state(0);
  let haut = $state(candidats.length - 1);
  let historique = $state<{ seuil: number; choix: 'plus' | 'moins' }[]>([]);

  /** Seuil le plus rond possible, multiple du pas de la question, strictement entre deux propositions voisines. */
  function seuilEntre(a: number, b: number): number {
    const p = question.precision;
    const m = Math.sqrt(a * b);
    for (let chiffres = 1; chiffres <= 9; chiffres++) {
      const v = Math.round(arrondiSignificatif(m, chiffres) / p) * p;
      if (v > a && v < b) return v;
    }
    // Dernier recours : le multiple du pas juste au-dessus de a (existe car b − a ≥ 2 pas).
    return Math.floor(a / p) * p + p;
  }

  const coupure = $derived(Math.ceil((bas + haut) / 2));
  const seuil = $derived(seuilEntre(candidats[coupure - 1], candidats[coupure]));
  const affiche = $derived(grand(seuil, question.unite));

  function repondre(choix: 'plus' | 'moins') {
    historique.push({ seuil, choix });
    if (choix === 'plus') bas = coupure;
    else haut = coupure - 1;
    if (bas === haut) onrepondre({ valeur: candidats[bas], essai: historique.length, propositions: candidats });
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

  <p class="progression">Coup {historique.length + 1} / {COUPS_MAX} au plus</p>

  {#if historique.length}
    <ol class="historique">
      {#each historique as h}
        <li>
          <span class="chiffres-h">{avecUnite(h.seuil, question.unite)}</span>
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
