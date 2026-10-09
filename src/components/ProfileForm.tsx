import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Category, UserProfile, SocialLinks } from '../types/models';
import { CATEGORIES } from '../constants';
import { Globe, Camera } from 'lucide-react';
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from './SocialIcons';

export interface ProfileData {
  profession: string;
  category: Category;
  skills: string[];
  city: string;
  bio: string;
  photoURL?: string;
  socials: SocialLinks;
}

interface Props {
  initial: UserProfile | null;
  submitLabel: string;
  onSave: (data: ProfileData) => void;
}

export default function ProfileForm({ initial, submitLabel, onSave }: Props) {
  const [profession, setProfession] = useState(initial?.profession ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'video');
  const [skills, setSkills] = useState(initial?.skills.join(', ') ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [photoURL, setPhotoURL] = useState(initial?.photoURL ?? '');
  
  // Liens de réseaux sociaux
  const [socials, setSocials] = useState<SocialLinks>({
    instagram: initial?.socials?.instagram ?? '',
    youtube: initial?.socials?.youtube ?? '',
    tiktok: initial?.socials?.tiktok ?? '',
    portfolio: initial?.socials?.portfolio ?? '',
    linkedin: initial?.socials?.linkedin ?? '',
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      profession: profession.trim(),
      category,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      city: city.trim(),
      bio: bio.trim(),
      photoURL: photoURL.trim() || undefined,
      socials,
    });
  };

  return (
    <form onSubmit={submit} className="glass panel" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      
      {/* Photo de profil (Lien ou avatar) */}
      <div className="field">
        <label htmlFor="photoURL" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Camera size={14} /> Photo de profil (Lien direct image)
        </label>
        <input 
          id="photoURL" 
          className="input" 
          placeholder="https://... (URL de votre photo ou avatar)" 
          value={photoURL} 
          onChange={(e) => setPhotoURL(e.target.value)} 
        />
        {photoURL && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <img 
              src={photoURL} 
              alt="Aperçu avatar" 
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand)' }}
              onError={(e) => { (e.target as any).style.display = 'none'; }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>Aperçu de votre photo</span>
          </div>
        )}
      </div>

      {/* Talent & Catégorie */}
      <div className="field">
        <label>Votre domaine d'activité *</label>
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`cat-opt ${category === c.id ? 'on' : ''}`}
              style={{ ['--c1' as string]: c.c1 }}
              onClick={() => setCategory(c.id)}
            >
              <span className="ico" style={{ background: `linear-gradient(135deg, ${c.c1}, ${c.c2})` }}>
                <c.Icon size={18} strokeWidth={2} />
              </span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="profession">Votre talent / profession précise *</label>
        <input 
          id="profession" 
          className="input" 
          required 
          placeholder="Ex : Comédien cinéma, Mannequin photo, Beatmaker, Monteur…" 
          value={profession} 
          onChange={(e) => setProfession(e.target.value)} 
        />
      </div>

      <div className="field">
        <label htmlFor="bio">Bio & Présentation créative</label>
        <textarea 
          id="bio" 
          className="input" 
          rows={3} 
          placeholder="Présentez votre parcours, vos expériences et ce qui vous passionne..." 
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
        />
      </div>

      <div className="field">
        <label htmlFor="skills">Compétences & Univers (séparés par des virgules)</label>
        <input 
          id="skills" 
          className="input" 
          placeholder="Ex: Théâtre, Défilé, Impro, DaVinci, Premiere Pro" 
          value={skills} 
          onChange={(e) => setSkills(e.target.value)} 
        />
      </div>

      <div className="field">
        <label htmlFor="city">Ville ou statut de travail</label>
        <input 
          id="city" 
          className="input" 
          placeholder="Paris, Tunis, Télétravail, Mobile..." 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
        />
      </div>

      {/* Réseaux sociaux & Portfolios */}
      <div className="field">
        <label>Réseaux sociaux & Portfolio en ligne</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InstagramIcon color="#E1306C" style={{ flexShrink: 0 }} />
            <input 
              className="input" 
              placeholder="Instagram (ex: @monprofil ou lien)" 
              value={socials.instagram || ''} 
              onChange={(e) => setSocials({ ...socials, instagram: e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <YoutubeIcon color="#FF0000" style={{ flexShrink: 0 }} />
            <input 
              className="input" 
              placeholder="Chaîne YouTube ou showreel" 
              value={socials.youtube || ''} 
              onChange={(e) => setSocials({ ...socials, youtube: e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--brand)" style={{ flexShrink: 0 }} />
            <input 
              className="input" 
              placeholder="Site Web / Book / Portfolio en ligne" 
              value={socials.portfolio || ''} 
              onChange={(e) => setSocials({ ...socials, portfolio: e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LinkedinIcon color="#0A66C2" style={{ flexShrink: 0 }} />
            <input 
              className="input" 
              placeholder="Lien LinkedIn" 
              value={socials.linkedin || ''} 
              onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })} 
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-block" id="btn-save-profile" disabled={!profession.trim()}>
        {submitLabel}
      </button>
    </form>
  );
}
