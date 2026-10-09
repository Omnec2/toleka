import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Logo, Wordmark } from './Brand';
import { SEED_FLASHS, catOf, timeAgo } from '../constants';
import Avatar from './Avatar';

interface Props {
  onLogin: () => void;
  loading: boolean;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export default function Landing({ onLogin, loading }: Props) {
  // Demo cards to scroll
  const demoList = [...SEED_FLASHS, ...SEED_FLASHS];
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % SEED_FLASHS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="landing" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'space-between', padding: '32px 18px 28px', gap: '20px' }}>
      
      {/* 1. Logo centré & Titre */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Logo size={56} />
          <Wordmark size={40} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 14px',
          borderRadius: 'var(--r-full)',
          background: 'rgba(124, 108, 255, 0.12)',
          border: '1px solid rgba(124, 108, 255, 0.28)',
          color: 'var(--brand-glow)',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.02em'
        }}>
          <Sparkles size={13} />
          Réseau créatif spontané
        </div>

        <div style={{ maxWidth: '380px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}>
            Trouve ton binôme créatif <span className="grad-text shimmer-text">en un swipe</span>
          </h1>
          <p className="muted" style={{ fontSize: '0.88rem', marginTop: '8px', lineHeight: 1.45 }}>
            Vidéo, Musique, Acting, Model, Tech ou Design. Publiez vos besoins urgents ou postulez directement aux projets.
          </p>
        </div>
      </div>

      {/* 2. Cartes de démonstration qui défilent */}
      <div style={{ width: '100%', overflow: 'hidden', padding: '10px 0', position: 'relative' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px' 
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Aperçu des projets en direct
          </span>
          <span className="live-dot" />
        </div>

        {/* Marquee animé avec cartes stylisées */}
        <div className="landing-marquee-track">
          <div className="landing-marquee-inner">
            {demoList.map((f, i) => {
              const cat = catOf(f.targetCategory);
              return (
                <div 
                  key={`${f.id}-${i}`} 
                  className="demo-card-item"
                  style={{
                    borderColor: i % SEED_FLASHS.length === activeCard ? 'var(--brand)' : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: i % SEED_FLASHS.length === activeCard ? '0 8px 24px -6px rgba(124, 108, 255, 0.35)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Avatar name={f.authorName} src={f.authorPhoto} size={30} ring={cat.c1} />
                    <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                      <b style={{ fontSize: '0.8rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.authorName}</b>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.authorProfession}</span>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.66rem', 
                        padding: '2px 7px', 
                        borderRadius: 'var(--r-full)', 
                        background: f.remuneration === 'paye' ? 'rgba(25, 215, 155, 0.15)' : 'rgba(124, 108, 255, 0.15)',
                        color: f.remuneration === 'paye' ? 'var(--ok)' : 'var(--brand-glow)',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {f.remuneration === 'paye' ? (f.budget || 'Rémunéré') : 'Collab'}
                    </span>
                  </div>

                  <p style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    color: 'var(--text)', 
                    textAlign: 'left', 
                    margin: '0 0 6px 0', 
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {f.title}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: cat.c1, fontWeight: 600 }}>
                      {cat.label}
                    </span>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-3)' }}>
                      {timeAgo(f.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Bouton Commencer (Connexion Google) */}
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={onLogin} 
          disabled={loading} 
          id="btn-google"
          className="btn-start-cta"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GoogleIcon />
            <span style={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
              {loading ? 'Connexion en cours…' : 'Commencer'}
            </span>
          </div>
          <ArrowRight size={18} color="#111" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-3)' }}>
          <ShieldCheck size={14} color="var(--ok)" />
          <span>Connexion rapide et sécurisée avec Google</span>
        </div>
      </div>

    </main>
  );
}
