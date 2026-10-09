import { X, MapPin, Globe, CheckCircle2 } from 'lucide-react';
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from './SocialIcons';
import type { UserProfile } from '../types/models';
import { catOf } from '../constants';
import Avatar from './Avatar';

interface Props {
  profile: UserProfile;
  onClose: () => void;
}

export default function UserProfileModal({ profile, onClose }: Props) {
  const cat = catOf(profile.category);

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div 
        className="sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxHeight: '85dvh', padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div className="grabber" />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-icon-nav" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* Hero profil */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
          <Avatar name={profile.displayName} src={profile.photoURL} size={80} ring={`var(--cat-${profile.category})`} />
          <h2 className="h2" style={{ fontSize: '1.4rem' }}>{profile.displayName}</h2>
          
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="chip chip-brand">
              <cat.Icon size={14} /> {profile.profession}
            </span>
            {profile.city && (
              <span className="chip">
                <MapPin size={13} /> {profile.city}
              </span>
            )}
          </div>
        </div>

        {/* Statistiques de projets */}
        <div className="stats">
          <div className="glass stat">
            <b>{profile.stats?.projectsDone ?? 0}</b>
            <span>Projets réalisés</span>
          </div>
          <div className="glass stat hot">
            <b>{profile.stats?.projectsProposed ?? 1}</b>
            <span>Projets proposés</span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="glass panel" style={{ padding: '14px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Bio & Parcours
            </span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-1)', lineHeight: 1.5 }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* Compétences */}
        {profile.skills && profile.skills.length > 0 && (
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Compétences
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {profile.skills.map((s, idx) => (
                <span key={idx} className="chip">
                  <CheckCircle2 size={12} color="var(--ok)" /> {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Réseaux sociaux & Portfolios */}
        {profile.socials && Object.values(profile.socials).some(Boolean) && (
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Réseaux & Portfolios
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {profile.socials.instagram && (
                <a 
                  href={profile.socials.instagram.startsWith('http') ? profile.socials.instagram : `https://instagram.com/${profile.socials.instagram.replace('@', '')}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-ghost btn-sm"
                  style={{ gap: '6px' }}
                >
                  <InstagramIcon color="#E1306C" /> Instagram
                </a>
              )}
              {profile.socials.youtube && (
                <a 
                  href={profile.socials.youtube.startsWith('http') ? profile.socials.youtube : `https://youtube.com/${profile.socials.youtube}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-ghost btn-sm"
                  style={{ gap: '6px' }}
                >
                  <YoutubeIcon color="#FF0000" /> YouTube
                </a>
              )}
              {profile.socials.portfolio && (
                <a 
                  href={profile.socials.portfolio.startsWith('http') ? profile.socials.portfolio : `https://${profile.socials.portfolio}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-ghost btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Globe size={14} color="var(--brand)" /> Portfolio
                </a>
              )}
              {profile.socials.linkedin && (
                <a 
                  href={profile.socials.linkedin.startsWith('http') ? profile.socials.linkedin : `https://${profile.socials.linkedin}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-ghost btn-sm"
                  style={{ gap: '6px' }}
                >
                  <LinkedinIcon color="#0A66C2" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        )}

        <button 
          className="btn btn-ghost btn-block" 
          onClick={onClose} 
          style={{ marginTop: 'auto' }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
