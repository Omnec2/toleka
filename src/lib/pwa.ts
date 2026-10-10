// Gestion de l'installation PWA et du Service Worker

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS Safari navigator.standalone
    window.navigator.standalone === true
  );
}

export function isIos(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function initPwa() {
  if (typeof window === 'undefined') return;

  // Enregistrement du Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker actif:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Échec enregistrement SW:', err);
        });
    });
  }

  // Écoute de l'événement d'installation du navigateur
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
    console.log('[PWA] Application installée avec succès !');
  });
}

function notifyListeners() {
  const can = !!deferredPrompt;
  listeners.forEach((cb) => cb(can));
}

export function subscribeInstallPrompt(cb: (canInstall: boolean) => void) {
  listeners.add(cb);
  cb(!!deferredPrompt);
  return () => {
    listeners.delete(cb);
  };
}

export async function promptInstallApp(): Promise<boolean> {
  if (!deferredPrompt) return false;
  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notifyListeners();
    return choice.outcome === 'accepted';
  } catch (err) {
    console.warn('[PWA] Erreur lors de l’invite d’installation:', err);
    return false;
  }
}
