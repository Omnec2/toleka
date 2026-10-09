import type { ChatMessage, CollabRequest } from '../types/models';

const READ_STORAGE_KEY_PREFIX = 'toleka_chat_last_read_';
const DEMO_MSGS_PREFIX = 'toleka_demo_chat_msgs_';

/** Récupère le timestamp de dernière lecture d'un chat */
export function getLastReadTime(userId: string, requestId: string): number {
  try {
    const raw = localStorage.getItem(`${READ_STORAGE_KEY_PREFIX}${userId}`);
    if (!raw) return 0;
    const map = JSON.parse(raw);
    return typeof map[requestId] === 'number' ? map[requestId] : 0;
  } catch {
    return 0;
  }
}

/** Enregistre le moment où le chat a été lu */
export function setLastReadTime(userId: string, requestId: string, time = Date.now()): void {
  try {
    const key = `${READ_STORAGE_KEY_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    map[requestId] = time;
    localStorage.setItem(key, JSON.stringify(map));
  } catch {}
}

/** Joue un son de notification doux et moderne via le Web Audio API */
export function playNotificationSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    // Note 1 : Fa#5 (739.99 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(739.99, now);
    gain1.gain.setValueAtTime(0.09, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // Note 2 : Si5 (987.77 Hz) - carillon cristallin
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08);
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  } catch {
    // Silencieux si audio non autorisé
  }
}

/** Demande la permission pour les notifications du navigateur */
export function requestNotificationPermission(): void {
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  } catch {}
}

/** Affiche une notification système (Desktop / Mobile) */
export function sendBrowserNotification(title: string, body: string, onClick?: () => void): void {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'toleka-chat',
      });
      if (onClick) {
        notif.onclick = () => {
          window.focus();
          onClick();
          notif.close();
        };
      }
    }
  } catch {}
}

/** Gestion des messages persistés en mode démo */
export function getDemoMessages(requestId: string, initialMsg?: ChatMessage): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${DEMO_MSGS_PREFIX}${requestId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialMsg ? [initialMsg] : [];
}

export function saveDemoMessages(requestId: string, msgs: ChatMessage[]): void {
  try {
    localStorage.setItem(`${DEMO_MSGS_PREFIX}${requestId}`, JSON.stringify(msgs));
  } catch {}
}

export function appendDemoMessage(requestId: string, msg: ChatMessage): void {
  const current = getDemoMessages(requestId);
  if (!current.some((m) => m.id === msg.id)) {
    const updated = [...current, msg];
    saveDemoMessages(requestId, updated);
  }
}

/** Event emitter local pour notifier la réception de message en mode démo */
type DemoMsgListener = (data: { request: CollabRequest; message: ChatMessage }) => void;
const demoListeners = new Set<DemoMsgListener>();

export function subscribeDemoIncomingMessages(listener: DemoMsgListener): () => void {
  demoListeners.add(listener);
  return () => {
    demoListeners.delete(listener);
  };
}

export function notifyDemoIncomingMessage(request: CollabRequest, message: ChatMessage): void {
  demoListeners.forEach((fn) => {
    try {
      fn({ request, message });
    } catch {}
  });
}
