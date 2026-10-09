import { useState, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type { Category, UserProfile, SocialLinks } from '../types/models';
import { CATEGORIES } from '../constants';
import { Globe, Upload, Trash2 } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Liens de réseaux sociaux
  const [socials, setSocials] = useState<SocialLinks>({
    instagram: initial?.socials?.instagram ?? '',
    youtube: initial?.socials?.youtube ?? '',
    tiktok: initial?.socials?.tiktok ?? '',
    portfolio: initial?.socials?.portfolio ?? '',
    linkedin: initial?.socials?.linkedin ?? '',
  });

  // Gestion de l'upload local de photo (conversion en Base64 optimisée)
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image valide.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("L'image est un peu volumineuse. Veuillez choisir une image de moins de 2 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoURL(result);
    };
    reader.readAsDataURL(file);
  };

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
      
      {/* Upload de photo de profil */}
      <div className="field">
        <label>Photo de profil</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px' }}>
          {photoURL ? (
            <img 
              src={photoURL} 
              alt="Aperçu avatar" 
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand)' }}
            />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-2)', border: '1px dashed var(--border-strong)', display: 'grid', placeItems: 'center', color: 'var(--text-3)' }}>
              Photo
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              style={{ display: 'none' }} 
            />
            <button 
              type="button" 
              className="btn btn-ghost btn-sm"
              onClick={() => fileInputRef.current?.click()}
              style={{ gap: '6px' }}
            >
              <Upload size={14} /> Importer une photo
            </button>
            {photoURL && (
              <button 
                type="button" 
                className="btn btn-danger-ghost btn-sm"
                onClick={() => setPhotoURL('')}
                title="Supprimer la photo"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Domaine d'activité */}
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
          placeholder="Ex : Acteur cinéma, Modèle photo, Beatmaker, Monteur…" 
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
