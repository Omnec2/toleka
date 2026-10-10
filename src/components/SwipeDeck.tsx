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
  const CatIcon = cat.Icon;
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
      {/* Arrière-plan thématique dynamique : icône de catégorie floutée en filigrane subtil & halos ambiants */}
      <div className="fc-bg-art" aria-hidden="true">
        {/* Halos lumineux subtils aux couleurs de la catégorie */}
        <div className="fc-bg-glow fc-bg-glow-1" />
        <div className="fc-bg-glow fc-bg-glow-2" />

        {/* Grande icône de catégorie en flou subtil d'arrière-plan */}
        <div className="fc-bg-icon-wrap">
          <CatIcon className="fc-bg-icon" size={260} strokeWidth={1.3} />
        </div>

        {/* Trame géométrique texturée subtile */}
        <div className="fc-bg-pattern" />
      </div>

      {/* 1. Entête professionnelle : Auteur & badges */}
      <div className="fc-pro-header">
        <button 
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAuthorClick?.(flash.authorId, flash.authorName);
          }}
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 'var(--r-full)', background: 'var(--brand-soft)', border: '1px solid var(--brand-line)', color: 'var(--brand-glow)', fontSize: '0.74rem', fontWeight: 700 }}>
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

  // Carte en arrière-plan selon la direction du geste :
  // - Swipe gauche (dragX < 0 ou exit 'left') : la carte suivante (index + 1)
  // - Swipe droite (dragX > 0 ou exit 'right') : la carte précédente (index - 1)
  const isRightSwipe = exitDirection === 'right' || (isDragging && dragX > 0);
  const underFlash = isRightSwipe
    ? flashs[(index - 1 + total) % total]
    : flashs[(index + 1) % total];

  // Déclencher le passage à la carte suivante / précédente avec animation complète hors écran
  const triggerExit = (dir: 'left' | 'right') => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setExitDirection(dir);
    setDragX(dir === 'right' ? 450 : -450);

    setTimeout(() => {
      setIndex((prev) => (dir === 'right' ? (prev - 1 + total) % total : (prev + 1) % total));
      setExitDirection(null);
      setDragX(0);
      isAnimatingRef.current = false;
    }, 320);
  };

  const nextCard = () => {
    triggerExit('left');
  };

  // Drag horizontal de la carte
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (isAnimatingRef.current) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, input, textarea')) {
      return;
    }
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

  // Calcul du style de la carte du dessus (animation fluide vers la sortie)
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

  // Calcul du style de la carte arrivante :
  // Cohérence demandée :
  // - Quand on swap à gauche : la prochaine vient d'en bas (+54px) et monte vers 0
  // - Quand on swap à droite : inversement, elle vient d'en haut (-54px) et descend vers 0
  const getUnderCardStyle = (): React.CSSProperties => {
    const isRight = exitDirection === 'right' || (isDragging && dragX > 0);
    const progress = Math.min(Math.abs(dragX) / 140, 1);
    const scale = 0.94 + progress * 0.06;
    const opacity = 0.55 + progress * 0.45;

    const initialOffset = isRight ? -54 : 54;
    const translateY = (1 - progress) * initialOffset;

    if (exitDirection) {
      return {
        transform: 'scale(1) translateY(0)',
        opacity: 1,
        transition: 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease-out',
        pointerEvents: 'none',
      };
    }

    return {
      transform: `scale(${scale}) translateY(${translateY}px)`,
      opacity,
      transition: isDragging ? 'none' : 'transform 0.28s var(--ease), opacity 0.28s var(--ease)',
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
          {/* Carte en dessous (prête à apparaître selon la direction du geste) */}
          {total > 1 && (
            <div className="slot-pro under" style={getUnderCardStyle()}>
              <FlashCard 
                flash={underFlash} 
                match={isMatch(underFlash)} 
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
