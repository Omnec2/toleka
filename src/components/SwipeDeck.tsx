import { useState, useRef } from 'react';
import type { ReactNode, PointerEvent } from 'react';
import { Clock, Send, Target, User } from 'lucide-react';
import type { FlashAnnouncement, UserProfile } from '../types/models';
import { catOf, timeAgo } from '../constants';
import Avatar from './Avatar';
import { RemunChip, UrgencyChip } from './Brand';

export function FlashCard({ 
  flash, 
  match, 
  onAuthorClick 
}: { 
  flash: FlashAnnouncement; 
  match: boolean; 
  onAuthorClick?: (authorId: string, authorName: string) => void; 
}) {
  const cat = catOf(flash.targetCategory);
  const style = { '--c1': cat.c1, '--c2': cat.c2 } as React.CSSProperties;
  
  return (
    <article className="flash-card" style={style}>
      <div className="fc-head">
        <div className="fc-mesh" />
        <cat.Icon className="fc-watermark" strokeWidth={1.2} />
        <div className="fc-top">
          <UrgencyChip value={flash.urgency} glass />
          <span className="fc-badge"><Clock size={13} /> {timeAgo(flash.createdAt)}</span>
        </div>
        <div className="fc-tile"><cat.Icon size={30} strokeWidth={1.8} /></div>
      </div>

      <div className="fc-body">
        {/* Profil auteur cliquable */}
        <button 
          type="button"
          onClick={() => onAuthorClick?.(flash.authorId, flash.authorName)}
          className="fc-author-btn"
          title="Voir le profil"
        >
          <Avatar name={flash.authorName} src={flash.authorPhoto} size={44} ring="var(--c1)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <b>{flash.authorName}</b>
              <User size={13} color="var(--brand-glow)" />
            </div>
            <span>{flash.authorProfession}</span>
          </div>
        </button>

        <h2 className="fc-title">{flash.title}</h2>
        <p className="fc-desc">{flash.description}</p>

        <div className="fc-tags">
          <RemunChip flash={flash} />
          {match && <span className="chip chip-brand"><Target size={13} /> Pour vous</span>}
        </div>

        <div className="fc-need">
          <span className="fc-need-ico"><cat.Icon size={20} /></span>
          <div>
            <small>Profil recherché</small>
            <b>{flash.targetSkill}</b>
          </div>
        </div>
      </div>
      <div className="fc-shine" />
    </article>
  );
}

interface DeckProps {
  flashs: FlashAnnouncement[];
  profile: UserProfile | null;
  onApply: (f: FlashAnnouncement) => void;
  onAuthorClick?: (authorId: string, authorName: string) => void;
  empty: ReactNode;
}

export default function SwipeDeck({ flashs, profile, onApply, onAuthorClick, empty }: DeckProps) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  if (flashs.length === 0) return <>{empty}</>;

  const current = flashs[index % flashs.length];
  const total = flashs.length;

  const nextCard = () => {
    setDragX(0);
    setIndex((prev) => (prev + 1) % total);
  };

  const prevCard = () => {
    setDragX(0);
    setIndex((prev) => (prev - 1 + total) % total);
  };

  // Drag horizontal dédié UNIQUEMENT à la navigation visuelle
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragX(e.clientX - startX.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > 70) {
      prevCard();
    } else if (dragX < -70) {
      nextCard();
    } else {
      setDragX(0);
    }
  };

  const isMatch = (f: FlashAnnouncement) => !!profile && f.targetCategory === profile.category;

  const cardStyle: React.CSSProperties = {
    transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)',
  };

  return (
    <>
      <div className="deck-container">
        <div 
          className="deck"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="slot top" style={cardStyle}>
            <FlashCard 
              flash={current} 
              match={isMatch(current)} 
              onAuthorClick={onAuthorClick} 
            />
          </div>
        </div>
      </div>

      {/* Boutons de commande : Suivant / Postuler */}
      <div className="actions" style={{ gap: '12px', marginTop: '16px' }}>
        <button 
          className="btn btn-ghost" 
          onClick={nextCard} 
          style={{ flex: 1, padding: '14px', borderRadius: 'var(--r-md)' }}
          id="btn-skip-project"
        >
          Suivant
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => onApply(current)} 
          style={{ flex: 2, padding: '14px', borderRadius: 'var(--r-md)' }}
          id="btn-select-project"
        >
          <Send size={18} />
          <span>Postuler à ce projet</span>
        </button>
      </div>

      <p className="hint" style={{ marginTop: '6px' }}>
        Glissez la carte pour naviguer • Bouton "Postuler" pour collaborer
      </p>
    </>
  );
}
