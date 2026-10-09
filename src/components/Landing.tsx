import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Wordmark } from './Brand';

interface Props {
  onLogin: () => void;
  loading: boolean;
}

const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export default function Landing({ onLogin, loading }: Props) {
  return (
    <main className="landing" style={{ gap: '22px' }}>
      <Wordmark size={42} />

      {/* Hero épuré, percutant et élégant */}
      <div style={{ marginTop: '10px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: 'var(--r-full)',
          background: 'rgba(124, 108, 255, 0.14)',
          border: '1px solid rgba(124, 108, 255, 0.35)',
          color: 'var(--brand-glow)',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Sparkles size={13} />
          Le réseau des collaborations flash
        </div>

        <h1 className="h1" style={{ fontSize: '2.4rem', lineHeight: 1.15 }}>
          Trouve le bon profil.<br />
          <span className="grad-text shimmer-text">En un clin d'œil.</span>
        </h1>
        
        <p className="muted" style={{ marginTop: '12px', fontSize: '0.96rem', lineHeight: 1.5 }}>
          Vidéo, Musique, Design, Acting, Modèle, Tech... Publiez votre recherche urgente ou proposez votre talent directement aux créateurs.
        </p>
      </div>

      {/* Cartes d'aperçu expressives et simples */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div className="glass panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <b style={{ fontSize: '0.9rem' }}>Flashs Express</b>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>Projets 48h, cette semaine ou flexibles</span>
        </div>

        <div className="glass panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '1.4rem' }}>🤝</span>
          <b style={{ fontSize: '0.9rem' }}>Chat en direct</b>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>Discussion instantanée dès qu'un projet est validé</span>
        </div>
      </div>

      {/* BOUTON GOOGLE ULTRA-PRO ET MODERNE */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={onLogin} 
          disabled={loading} 
          id="btn-google"
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: 'var(--r-full)',
            background: '#FFFFFF',
            color: '#1F2937',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 10px 30px rgba(255, 255, 255, 0.25)',
            cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.25s ease'
          }}
        >
          <GoogleIcon />
          <span>{loading ? 'Connexion en cours…' : 'Continuer avec Google'}</span>
          {!loading && <ArrowRight size={18} color="#4B5563" />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-3)' }}>
          <ShieldCheck size={14} color="var(--ok)" />
          Connexion sécurisée en 1 clic via Gmail
        </div>
      </div>

    </main>
  );
}
