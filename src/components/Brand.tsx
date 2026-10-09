import { CalendarDays, Gift, Handshake, Leaf, Wallet, Zap } from 'lucide-react';
import type { FlashAnnouncement } from '../types/models';
import { URGENCY_LABEL } from '../constants';

/** Logo Toleka : un « T » dont la barre se prolonge en point lumineux (connexion). */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="logo-mark" style={{ width: size, height: size, borderRadius: size * 0.34 }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6.5h13M10.5 6.5V19" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="20" cy="6.5" r="2.1" fill="#fff" />
      </svg>
    </span>
  );
}

export function Wordmark({ size }: { size?: number }) {
  return (
    <span className="logo">
      <Logo size={size} />
      <span className="wordmark">Toleka</span>
    </span>
  );
}

export function UrgencyChip({ value, glass }: { value: FlashAnnouncement['urgency']; glass?: boolean }) {
  const Icon = value === '48h' ? Zap : value === 'cette_semaine' ? CalendarDays : Leaf;
  return (
    <span className={glass ? 'fc-badge' : `chip ${value === '48h' ? 'chip-warn' : ''}`}>
      <Icon size={13} /> {URGENCY_LABEL[value]}
    </span>
  );
}

export function RemunChip({ flash }: { flash: Pick<FlashAnnouncement, 'remuneration' | 'budget'> }) {
  const Icon = flash.remuneration === 'paye' ? Wallet : flash.remuneration === 'partage' ? Handshake : Gift;
  const label =
    flash.remuneration === 'paye' ? flash.budget || 'Rémunéré' : flash.remuneration === 'partage' ? 'Partage' : 'Échange';
  return (
    <span className={`chip ${flash.remuneration === 'paye' ? 'chip-ok' : ''}`}>
      <Icon size={13} /> {label}
    </span>
  );
}
