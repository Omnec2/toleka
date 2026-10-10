import { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { SEED_FLASHS, catOf, timeAgo } from '../constants';
import Avatar from './Avatar';
import { BrandLogo } from './Brand';

interface Props {
  onLogin: () => void;
  loading: boolean;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

// Cartes démo : sans la carte "Moi/Créateur"
const DEMO_CARDS = SEED_FLASHS.filter(f => f.id !== 'seed-mine').concat([
  {
    id: 'demo-extra',
    authorId: 'u10',
    authorName: 'Léa M.',
    authorProfession: 'Photographe & Retoucheuse',
    authorPhoto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
    title: 'Photographe pour book artistique portrait',
    description: 'Session photo en studio pour créer un book de portraits artistiques avec éclairage cinématique.',
    targetCategory: 'photo' as const,
    targetSkill: 'Portrait & Studio',
    urgency: 'cette_semaine' as const,
    remuneration: 'paye' as const,
    budget: '180 €',
    createdAt: Date.now() - 10800000,
  }
]);

const DEMO_LIST = [...DEMO_CARDS, ...DEMO_CARDS];

export default function Landing({ onLogin, loading }: Props) {
  const [activeCard, setActiveCard] = useState(0);
  const [particlesVisible, setParticlesVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % DEMO_CARDS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeout(() => setParticlesVisible(true), 400);
  }, []);

  return (
    <main className="landing" style={{ textAlign: 'center', alignItems: 'center', padding: '40px 20px 32px', gap: '28px' }}>

      {/* Particles décoratives */}
      {particlesVisible && (
        <div className="landing-particles" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <span key={i} className={`particle p${i + 1}`} />
          ))}
        </div>
      )}

      {/* 1. Hero */}
      <div className="landing-hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>

        {/* Logo de marque unifié */}
        <BrandLogo size="clamp(3.2rem, 12vw, 5rem)" glow animated />

        {/* Headline */}
        <div style={{ maxWidth: '380px' }}>
          <h1 className="landing-headline">
            Trouve ton binôme créatif{' '}
            <span className="grad-text shimmer-text">en un swipe</span>
          </h1>
          <p className="landing-sub">
            Vidéo, Musique, Acting, Model, Tech ou Design.<br />
            Publiez vos besoins urgents ou postulez aux projets.
          </p>
        </div>
      </div>

      {/* 2. Marquee cartes démo */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Projets en direct
          </span>
          <span className="live-dot" />
        </div>

        <div className="landing-marquee-track">
          <div className="landing-marquee-inner">
            {DEMO_LIST.map((f, i) => {
              const cat = catOf(f.targetCategory);
              const isActive = i % DEMO_CARDS.length === activeCard;
              return (
                <div
                  key={`${f.id}-${i}`}
                  className={`demo-card-item${isActive ? ' demo-card-active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Avatar name={f.authorName} src={f.authorPhoto} size={30} ring={cat.c1} />
                    <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                      <b style={{ fontSize: '0.8rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.authorName}</b>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.authorProfession}</span>
                    </div>
                    <span style={{
                      fontSize: '0.66rem', padding: '2px 7px', borderRadius: 'var(--r-full)',
                      background: f.remuneration === 'paye' ? 'rgba(25, 215, 155, 0.15)' : 'rgba(245, 165, 36, 0.15)',
                      color: f.remuneration === 'paye' ? 'var(--ok)' : 'var(--brand-glow)',
                      fontWeight: 700, whiteSpace: 'nowrap'
                    }}>
                      {f.remuneration === 'paye' ? (f.budget || 'Rémunéré') : 'Collab'}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', textAlign: 'left',
                    margin: '0 0 6px 0', lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {f.title}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: cat.c1, fontWeight: 600 }}>{cat.label}</span>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-3)' }}>{timeAgo(f.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CTA — connexion directe Google */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onLogin}
          disabled={loading}
          id="btn-google"
          className="btn-start-cta"
        >
          <GoogleIcon />
          <span>{loading ? 'Connexion…' : 'Commencer'}</span>
          {!loading && <ArrowRight size={16} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-3)' }}>
          <ShieldCheck size={12} color="var(--ok)" />
          <span>Connexion sécurisée avec Google</span>
        </div>
      </div>

    </main>
  );
}
