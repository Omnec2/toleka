import { CalendarDays, Handshake, Leaf, Wallet, Zap } from 'lucide-react';
import type { FlashAnnouncement } from '../types/models';
import { URGENCY_LABEL } from '../constants';

export interface BrandLogoProps {
  size?: number | string;
  glow?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * Logo Toleka Unifié — Partout le même style, typographie et dégradé premium.
 * Pas d'icône superflue, typographie distinctive Space Grotesk 900.
 */
export function BrandLogo({ size, glow = false, animated = false, className = '' }: BrandLogoProps) {
  const fontSize = typeof size === 'number' ? `${size}px` : size;
  const style = fontSize ? { fontSize } : undefined;

  return (
    <span className={`brand-logo-wrap ${animated ? 'brand-logo-animated' : ''} ${className}`}>
      <span className="brand-logo" style={style}>
        toleka
      </span>
      {glow && (
        <span className="brand-logo-glow" aria-hidden="true" style={style}>
          toleka
        </span>
      )}
    </span>
  );
}

/** Wordmark (alias de BrandLogo) */
export function Wordmark({ size, glow }: { size?: number | string; glow?: boolean }) {
  return <BrandLogo size={size} glow={glow} />;
}

/** Logo (alias de BrandLogo — remplace l'ancienne icône par le logo toleka officiel unifié) */
export function Logo({ size = 36, glow }: { size?: number | string; glow?: boolean }) {
  return <BrandLogo size={size} glow={glow} />;
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
  const isPaid = flash.remuneration === 'paye';
  const Icon = isPaid ? Wallet : Handshake;
  const label = isPaid ? (flash.budget || 'Rémunéré') : 'Collaboration';
  return (
    <span className={`chip ${isPaid ? 'chip-ok' : 'chip-brand'}`}>
      <Icon size={13} /> {label}
    </span>
  );
}
