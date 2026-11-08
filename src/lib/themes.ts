import image0 from '../assets/themes/selection/illustrations/astronomie.webp';
import icone0 from '../assets/themes/selection/icons/astronomie-24.svg';
import image1 from '../assets/themes/selection/illustrations/corps-humain.webp';
import icone1 from '../assets/themes/selection/icons/corps-humain-24.svg';
import image2 from '../assets/themes/selection/illustrations/animaux.webp';
import icone2 from '../assets/themes/selection/icons/animaux-24.svg';
import image3 from '../assets/themes/selection/illustrations/geographie.webp';
import icone3 from '../assets/themes/selection/icons/geographie-24.svg';
import image4 from '../assets/themes/selection/illustrations/terre-geologie.webp';
import icone4 from '../assets/themes/selection/icons/terre-geologie-24.svg';
import image5 from '../assets/themes/selection/illustrations/physique-chimie.webp';
import icone5 from '../assets/themes/selection/icons/physique-chimie-24.svg';
import image6 from '../assets/themes/selection/illustrations/constructions-transports.webp';
import icone6 from '../assets/themes/selection/icons/constructions-transports-24.svg';
import image7 from '../assets/themes/selection/illustrations/histoire.webp';
import icone7 from '../assets/themes/selection/icons/histoire-24.svg';
import image8 from '../assets/themes/selection/illustrations/arts-culture.webp';
import icone8 from '../assets/themes/selection/icons/arts-culture-24.svg';
import image9 from '../assets/themes/selection/illustrations/sport-jeux.webp';
import icone9 from '../assets/themes/selection/icons/sport-jeux-24.svg';
import image10 from '../assets/themes/selection/illustrations/nombres-mesures.webp';
import icone10 from '../assets/themes/selection/icons/nombres-mesures-24.svg';
import image11 from '../assets/themes/selection/illustrations/nature-climat.webp';
import icone11 from '../assets/themes/selection/icons/nature-climat-24.svg';

export interface IllustrationTheme {
  src: string;
  icone: string;
  alt: string;
}

/** Famille Atomic Age validée ; provenance et choix dans docs/design/illustrations-themes/selection. */
const ILLUSTRATIONS: Record<string, IllustrationTheme> = {
  "Astronomie": { src: image0, icone: icone0, alt: "Télescope rétro bleu et planète à anneaux" },
  "Corps humain": { src: image1, icone: icone1, alt: "Main stylisée montrant les os, accompagnée d’un cœur" },
  "Animaux": { src: image2, icone: icone2, alt: "Léopard orange aux rosettes noires et à la longue queue courbe" },
  "Géographie": { src: image3, icone: icone3, alt: "Globe bleu sur son pied, traversé par un itinéraire" },
  "Terre et géologie": { src: image4, icone: icone4, alt: "Globe en coupe révélant ses couches internes, accompagné de cristaux" },
  "Physique et chimie": { src: image5, icone: icone5, alt: "Prisme décomposant la lumière en faisceaux colorés" },
  "Constructions et transports": { src: image6, icone: icone6, alt: "Train bleu et corail devant un viaduc" },
  "Histoire": { src: image7, icone: icone7, alt: "Amphore terracotta et branche de laurier" },
  "Arts et culture": { src: image8, icone: icone8, alt: "Casque framboise et turquoise autour d’un synthétiseur" },
  "Sport et jeux": { src: image9, icone: icone9, alt: "Cavalier d’échecs indigo accompagné d’un ballon" },
  "Nombres et mesures": { src: image10, icone: icone10, alt: "Compas et équerre bleu ardoise" },
  "Nature et climat": { src: image11, icone: icone11, alt: "Arbre aux feuillages verts et soleil corail" },
};

export function illustration(theme: string): IllustrationTheme | null {
  return Object.hasOwn(ILLUSTRATIONS, theme) ? ILLUSTRATIONS[theme] : null;
}
