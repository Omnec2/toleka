import type { CSSProperties } from 'react';
import { ArrowRight, Sparkles, Users, Zap } from 'lucide-react';
import { Clapperboard, Code, Headphones, Palette } from 'lucide-react';
import { Wordmark } from './Brand';

interface Props {
  onLogin: () => void;
  loading: boolean;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z" />
  </svg>
);

export default function Landing({ onLogin, loading }: Props) {
  return (
    <main className="landing">
      <Wordmark size={40} />

      <div className="orbit" aria-hidden="true">
        <div className="orbit-core"><Sparkles size={34} /></div>
        <div className="orbit-ring r1" /><div className="orbit-ring r2" />
        <span className="orbit-node n1" style={{ '--c1': '#FF5E7E', '--c2': '#FF9A5E' } as CSSProperties}><Clapperboard size={22} /></span>
        <span className="orbit-node n2" style={{ '--c1': '#16D9A0', '--c2': '#1AA8D9' } as CSSProperties}><Headphones size={22} /></span>
        <span className="orbit-node n3" style={{ '--c1': '#9B6BFF', '--c2': '#E057FF' } as CSSProperties}><Palette size={22} /></span>
        <span className="orbit-node n4" style={{ '--c1': '#3FA9FF', '--c2': '#5B6BFF' } as CSSProperties}><Code size={22} /></span>
      </div>

      <div className="rise" style={{ animationDelay: '0.1s' }}>
        <h1 className="h1" style={{ fontSize: '2.3rem' }}>
          Le talent qu'il te faut,<br /><span className="grad-text shimmer-text">en un swipe.</span>
        </h1>
        <p className="muted" style={{ marginTop: 10 }}>
          Publie une annonce flash ou propose tes compétences aux créateurs qui en ont besoin.
        </p>
      </div>

      <div className="steps">
        {[
          { Icon: Users, t: 'Crée ton profil', d: 'Ton talent, ta profession, ton activité' },
          { Icon: Zap, t: 'Swipe les flashs', d: 'Les annonces adaptées à ce que tu sais faire' },
          { Icon: Sparkles, t: 'Collabore', d: 'Suis tes demandes depuis le tableau de bord' },
        ].map(({ Icon, t, d }, i) => (
          <div key={t} className="glass step rise" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
            <span className="num"><Icon size={19} /></span>
            <div><b>{t}</b><span>{d}</span></div>
          </div>
        ))}
      </div>

      <button className="btn btn-white btn-block btn-xl rise" onClick={onLogin} disabled={loading} id="btn-google" style={{ marginTop: 'auto', animationDelay: '0.5s' }}>
        <GoogleIcon /> {loading ? 'Connexion…' : 'Continuer avec Google'} {!loading && <ArrowRight size={18} />}
      </button>
    </main>
  );
}
