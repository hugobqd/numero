interface InvitationInstallation extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Écoute dès le démarrage : l'invitation peut arriver avant l'ouverture des réglages.
export const installation = $state({
  invitation: null as InvitationInstallation | null,
  autonome: false,
  enCours: false,
  message: '',
});

export function suivreInstallation() {
  const mode = window.matchMedia('(display-mode: standalone)');
  const actualiser = () => {
    installation.autonome = mode.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone;
  };
  actualiser();
  mode.addEventListener('change', actualiser);
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installation.invitation = event as InvitationInstallation;
    installation.message = '';
  });
  window.addEventListener('appinstalled', () => {
    installation.invitation = null;
    installation.message = 'Numero est installé. Retrouve son icône sur ton écran d’accueil.';
  });
}

export async function installer() {
  const invitation = installation.invitation;
  if (!invitation || installation.enCours) return;
  installation.enCours = true;
  installation.message = '';
  try {
    await invitation.prompt();
    const choix = await invitation.userChoice;
    if (choix.outcome === 'accepted') installation.message = 'Installation demandée. Retrouve Numero sur ton écran d’accueil.';
  } catch {
    installation.message = 'Utilise le menu de ton navigateur pour ajouter Numero à l’écran d’accueil.';
  } finally {
    installation.invitation = null;
    installation.enCours = false;
  }
}
