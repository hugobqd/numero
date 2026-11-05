import astronomie from '../assets/themes/astronomie.jpg';
import corpsHumain from '../assets/themes/corps-humain.jpg';
import terreGeologie from '../assets/themes/terre-geologie.jpg';
import physique from '../assets/themes/physique.jpg';
import animaux from '../assets/themes/animaux.jpg';
import humanite from '../assets/themes/humanite.jpg';

/**
 * Illustration de chaque thématique (prompt et palette dans le README, « Direction artistique »),
 * et ce qu'elle montre, pour le texte alternatif.
 */
const ILLUSTRATIONS: Record<string, { src: string; alt: string }> = {
  Astronomie: { src: astronomie, alt: 'Télescope devant une planète, un satellite et Saturne' },
  'Corps humain': { src: corpsHumain, alt: 'Silhouette humaine, une main et une empreinte digitale' },
  'Terre et géologie': { src: terreGeologie, alt: 'Coupe de la Terre, un cristal et un volcan' },
  Physique: { src: physique, alt: 'Prisme qui décompose la lumière, ondes et pendule de Newton' },
  Animaux: { src: animaux, alt: 'Un renard, un oiseau et un lièvre' },
  Humanité: { src: humanite, alt: "Une ville sur le globe, un plan de métro et une foule" },
};

export function illustration(theme: string): { src: string; alt: string } | null {
  return ILLUSTRATIONS[theme] ?? null;
}
