import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Category, UserProfile } from '../types/models';
import { CATEGORIES } from '../constants';

export interface ProfileData {
  profession: string;
  category: Category;
  skills: string[];
  city: string;
  bio: string;
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

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      profession: profession.trim(),
      category,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      city: city.trim(),
      bio: bio.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="glass panel" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="field">
        <label>Dans quel domaine êtes-vous ?</label>
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`cat-opt ${category === c.id ? 'on' : ''}`}
              style={{ ['--c1' as string]: c.c1 }}
              onClick={() => setCategory(c.id)}
            >
              <span className="ico" style={{ background: `linear-gradient(135deg, ${c.c1}, ${c.c2})` }}><c.Icon size={18} strokeWidth={2} /></span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="profession">Votre talent / profession *</label>
        <input id="profession" className="input" required placeholder="Ex : Monteur vidéo, Beatmaker, Graphiste…" value={profession} onChange={(e) => setProfession(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="skills">Compétences & outils (séparés par des virgules)</label>
        <input id="skills" className="input" placeholder="Premiere Pro, Étalonnage, Motion design" value={skills} onChange={(e) => setSkills(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="city">Ville ou télétravail</label>
        <input id="city" className="input" placeholder="Paris, Tunis, À distance…" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="bio">Bio ou lien portfolio</label>
        <textarea id="bio" className="input" rows={2} placeholder="5 ans d'expérience en clip et publicité…" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <button type="submit" className="btn btn-primary btn-block" id="btn-save-profile" disabled={!profession.trim()}>{submitLabel}</button>
    </form>
  );
}
