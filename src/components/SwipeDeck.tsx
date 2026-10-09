import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode, PointerEvent } from 'react';
import { Clock, Send, Target, X } from 'lucide-react';
import type { FlashAnnouncement, UserProfile } from '../types/models';
import { catOf, timeAgo } from '../constants';
import Avatar from './Avatar';
import { RemunChip, UrgencyChip } from './Brand';

export function FlashCard({ flash, match }: { flash: FlashAnnouncement; match: boolean }) {
  const cat = catOf(flash.targetCategory);
  const style = { '--c1': cat.c1, '--c2': cat.c2 } as CSSProperties;
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
        <div className="fc-author">
          <Avatar name={flash.authorName} src={flash.authorPhoto} size={44} ring="var(--c1)" />
          <div>
            <b>{flash.authorName}</b>
            <span>{flash.authorProfession}</span>
          </div>
        </div>

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
  onPass: (f: FlashAnnouncement) => void;
  onApply: (f: FlashAnnouncement) => void;
  empty: ReactNode;
}

const THRESHOLD = 110;

export default function SwipeDeck({ flashs, profile, onPass, onApply, empty }: DeckProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exit, setExit] = useState<null | 'left' | 'right'>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const top = flashs[0];
  if (!top) return <>{empty}</>;

  const commit = (dir: 'left' | 'right') => {
    if (exit) return;
    setExit(dir);
    window.setTimeout(() => {
      setExit(null);
      setPos({ x: 0, y: 0 });
      if (dir === 'left') onPass(top);
      else onApply(top);
    }, 280);
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (exit) return;
    origin.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!origin.current) return;
    setPos({ x: e.clientX - origin.current.x, y: e.clientY - origin.current.y });
  };
  const up = () => {
    if (!origin.current) return;
    origin.current = null;
    setDragging(false);
    if (pos.x > THRESHOLD) commit('right');
    else if (pos.x < -THRESHOLD) commit('left');
    else setPos({ x: 0, y: 0 });
  };

  const x = exit === 'right' ? 560 : exit === 'left' ? -560 : pos.x;
  const topStyle: CSSProperties = {
    transform: `translate(${x}px, ${pos.y * 0.25}px) rotate(${x / 18}deg)`,
    transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    ['--shine' as string]: `${x * 1.4}px`,
  };
  const yes = Math.min(Math.max(pos.x, 0) / 90, 1);
  const no = Math.min(Math.max(-pos.x, 0) / 90, 1);
  const progress = Math.min(Math.abs(pos.x) / THRESHOLD, 1);
  const isMatch = (f: FlashAnnouncement) => !!profile && f.targetCategory === profile.category;

  return (
    <>
      <div className="deck">
        {flashs.slice(1, 3).reverse().map((f, i, arr) => (
          <div
            key={f.id}
            className={`slot ${arr.length - i === 1 ? 's1' : 's2'}`}
            style={arr.length - i === 1 ? { transform: `translateY(${14 - 14 * progress}px) scale(${0.95 + 0.05 * progress})` } : undefined}
          >
            <FlashCard flash={f} match={isMatch(f)} />
          </div>
        ))}
        <div
          key={top.id}
          className={`slot top ${dragging ? 'is-dragging' : ''}`}
          style={topStyle}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <span className="stamp yes" style={{ opacity: yes, transform: `rotate(-12deg) scale(${0.8 + yes * 0.3})` }}>Je propose</span>
          <span className="stamp no" style={{ opacity: no, transform: `rotate(12deg) scale(${0.8 + no * 0.3})` }}>Passer</span>
          <FlashCard flash={top} match={isMatch(top)} />
        </div>
      </div>

      <div className="actions">
        <button className="round no" onClick={() => commit('left')} aria-label="Passer cette annonce" id="btn-pass">
          <X size={26} strokeWidth={2.4} />
        </button>
        <button className="round yes" onClick={() => commit('right')} aria-label="Proposer ma collaboration" id="btn-apply">
          <Send size={28} strokeWidth={2.2} />
        </button>
      </div>
      <p className="hint">Glissez la carte · ← passer · proposer →</p>
    </>
  );
}
