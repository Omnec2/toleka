import { useState, useRef } from 'react';
import type { ReactNode, PointerEvent } from 'react';
import { Clock, Send, Target, Zap, Calendar, ExternalLink } from 'lucide-react';
import type { FlashAnnouncement, UserProfile } from '../types/models';
import { catOf, timeAgo } from '../constants';
import Avatar from './Avatar';
import { RemunChip } from './Brand';

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

  // Format de la durée / urgence
  const getUrgencyDisplay = (urgency: FlashAnnouncement['urgency']) => {
    switch (urgency) {
      case '48h':
        return { label: 'Urgent · 48h', icon: <Zap size={13} color="var(--warn)" />, cls: 'chip-urgency-48h' };
      case 'cette_semaine':
        return { label: 'Cette semaine', icon: <Calendar size={13} color="var(--brand-glow)" />, cls: 'chip-urgency-week' };
      default:
        return { label: 'Délai flexible', icon: <Clock size={13} color="var(--text-2)" />, cls: 'chip-urgency-flex' };
    }
  };

  const urgencyInfo = getUrgencyDisplay(flash.urgency);

  return (
    <article className="flash-card-pro" style={style}>
      {/* 1. Entête professionnelle : Auteur & badges */}
      <div className="fc-pro-header">
        <button 
          type="button"
          onClick={() => onAuthorClick?.(flash.authorId, flash.authorName)}
          className="fc-author-btn-pro"
          title="Consulter le profil de l'auteur"
        >
          <Avatar name={flash.authorName} src={flash.authorPhoto} size={46} ring={cat.c1} />
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <b style={{ fontSize: '0.94rem', color: '#fff' }}>{flash.authorName}</b>
              <ExternalLink size={12} color="var(--text-3)" />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{flash.authorProfession}</span>
          </div>
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <span className="fc-cat-pill" style={{ color: cat.c1 }}>
            {cat.label}
          </span>
          <RemunChip flash={flash} />
        </div>
      </div>

      {/* 2. Corps du projet : Titre, description, compétences */}
      <div className="fc-pro-body">
        <h2 className="fc-pro-title">{flash.title}</h2>
        
        <p className="fc-pro-desc">{flash.description}</p>

        {/* Compétence recherchée */}
        <div className="fc-skill-target">
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 700 }}>
            Profil recherché
          </span>
          <b style={{ fontSize: '0.92rem', color: '#fff', display: 'block', marginTop: '2px' }}>
            {flash.targetSkill}
          </b>
        </div>

        {match && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 'var(--r-full)', background: 'rgba(124, 108, 255, 0.15)', border: '1px solid rgba(124, 108, 255, 0.3)', color: 'var(--brand-glow)', fontSize: '0.74rem', fontWeight: 700 }}>
            <Target size={13} /> Correspond à votre profil
          </div>
        )}
      </div>

      {/* 3. Pied de carte propre : Date de publication & Durée / Urgence */}
      <div className="fc-pro-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--text-2)' }}>
          <Clock size={13} />
          <span>Publié {timeAgo(flash.createdAt)}</span>
        </div>

        <div className={`fc-urgency-badge ${urgencyInfo.cls}`}>
          {urgencyInfo.icon}
          <span>{urgencyInfo.label}</span>
        </div>
      </div>
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
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const isAnimatingRef = useRef(false);

  if (flashs.length === 0) return <>{empty}</>;

  const total = flashs.length;
  const current = flashs[index % total];
  const nextFlash = flashs[(index + 1) % total];

  // Déclencher le passage à la carte suivante avec animation complète hors écran
  const triggerExit = (dir: 'left' | 'right') => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setExitDirection(dir);
    setDragX(dir === 'right' ? 450 : -450);

    setTimeout(() => {
      setIndex((prev) => (prev + 1) % total);
      setExitDirection(null);
      setDragX(0);
      isAnimatingRef.current = false;
    }, 300);
  };

  const nextCard = () => {
    triggerExit('left');
  };

  // Drag horizontal de la carte
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (isAnimatingRef.current) return;
    startX.current = e.clientX;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isAnimatingRef.current) return;
    setDragX(e.clientX - startX.current);
  };

  const handlePointerUp = () => {
    if (!isDragging || isAnimatingRef.current) return;
    setIsDragging(false);

    // Seuil de déclenchement du swipe hors de l'écran (70px)
    if (dragX > 70) {
      triggerExit('right');
    } else if (dragX < -70) {
      triggerExit('left');
    } else {
      setDragX(0);
    }
  };

  const isMatch = (f: FlashAnnouncement) => !!profile && f.targetCategory === profile.category;

  // Calcul du style de la carte du dessus (animation fluide)
  const getTopCardStyle = (): React.CSSProperties => {
    if (exitDirection) {
      const xOffset = exitDirection === 'right' ? '130vw' : '-130vw';
      const rotate = exitDirection === 'right' ? '24deg' : '-24deg';
      return {
        transform: `translateX(${xOffset}) rotate(${rotate})`,
        opacity: 0,
        transition: 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease-out',
        pointerEvents: 'none',
      };
    }

    return {
      transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)',
    };
  };

  // Calcul du style de la carte suivante (qui monte en même temps)
  const getNextCardStyle = (): React.CSSProperties => {
    const progress = Math.min(Math.abs(dragX) / 150, 1);
    const scale = 0.94 + progress * 0.06;
    const translateY = 14 - progress * 14;
    const opacity = 0.6 + progress * 0.4;

    return {
      transform: `scale(${scale}) translateY(${translateY}px)`,
      opacity,
      transition: isDragging ? 'none' : 'transform 0.3s var(--ease), opacity 0.3s var(--ease)',
      pointerEvents: 'none',
    };
  };

  return (
    <>
      <div className="deck-container">
        <div 
          className="deck-pro"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Carte en dessous (prête à apparaître en arrière-plan) */}
          {total > 1 && (
            <div className="slot-pro under" style={getNextCardStyle()}>
              <FlashCard 
                flash={nextFlash} 
                match={isMatch(nextFlash)} 
                onAuthorClick={onAuthorClick} 
              />
            </div>
          )}

          {/* Carte active au dessus */}
          <div className="slot-pro top" style={getTopCardStyle()}>
            <FlashCard 
              flash={current} 
              match={isMatch(current)} 
              onAuthorClick={onAuthorClick} 
            />
          </div>
        </div>
      </div>

      {/* Boutons d'action : Suivant / Postuler */}
      <div className="actions" style={{ gap: '12px', marginTop: '14px' }}>
        <button 
          className="btn btn-ghost" 
          onClick={nextCard} 
          style={{ flex: 1, padding: '14px', borderRadius: 'var(--r-md)' }}
          id="btn-skip-project"
          disabled={isAnimatingRef.current}
        >
          Suivant
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => onApply(current)} 
          style={{ flex: 2, padding: '14px', borderRadius: 'var(--r-md)' }}
          id="btn-select-project"
          disabled={isAnimatingRef.current}
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
