import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Category, FlashAnnouncement } from '../types/models';
import { CATEGORIES } from '../constants';

export type FlashDraft = Pick<
  FlashAnnouncement,
  'title' | 'description' | 'targetCategory' | 'targetSkill' | 'urgency' | 'remuneration' | 'budget'
>;

export default function CreateFlash({ onPublish }: { onPublish: (d: FlashDraft) => void }) {
  const [targetCategory, setCategory] = useState<Category>('video');
  const [title, setTitle] = useState('');
  const [targetSkill, setSkill] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<FlashDraft['urgency']>('48h');
  const [remuneration, setRemun] = useState<FlashDraft['remuneration']>('paye');
  const [budget, setBudget] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onPublish({
      title: title.trim(),
      description: description.trim(),
      targetCategory,
      targetSkill: targetSkill.trim() || CATEGORIES.find((c) => c.id === targetCategory)!.label,
      urgency,
      remuneration,
      budget: remuneration === 'paye' ? budget.trim() : undefined,
    });
  };

  return (
    <div className="screen">
      <div>
        <h1 className="h1">Nouveau <span className="grad-text">flash</span></h1>
        <p className="muted">Publiez votre besoin pour trouver un collaborateur rapidement.</p>
      </div>

      <form onSubmit={submit} className="glass panel" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="field">
          <label>Quel talent cherchez-vous ?</label>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <button 
                type="button" 
                key={c.id} 
                className={`cat-opt ${targetCategory === c.id ? 'on' : ''}`} 
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
          <label htmlFor="f-title">Titre de l'annonce *</label>
          <input id="f-title" className="input" required placeholder="Ex : Monteur pour un teaser d'1 min" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        
        <div className="field">
          <label htmlFor="f-skill">Compétence précise attendue</label>
          <input id="f-skill" className="input" placeholder="Ex: DaVinci Resolve, Modèle lookbook, Acting émotif..." value={targetSkill} onChange={(e) => setSkill(e.target.value)} />
        </div>
        
        <div className="field">
          <label htmlFor="f-desc">Détails du projet *</label>
          <textarea id="f-desc" className="input" rows={3} required placeholder="Expliquez votre projet, les attentes et la vision..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="field">
          <label>Délai</label>
          <div className="segment">
            {([['48h', '⚡ 48h'], ['cette_semaine', 'Semaine'], ['flexible', 'Flexible']] as const).map(([v, l]) => (
              <button type="button" key={v} className={urgency === v ? 'on' : ''} onClick={() => setUrgency(v)}>{l}</button>
            ))}
          </div>
        </div>

        {/* Modalité de rémunération : Payé ou Collaboration */}
        <div className="field">
          <label>Mode de rémunération</label>
          <div className="segment">
            {([['paye', '💰 Rémunéré'], ['collaboration', '🤝 Collaboration']] as const).map(([v, l]) => (
              <button type="button" key={v} className={remuneration === v ? 'on' : ''} onClick={() => setRemun(v)}>{l}</button>
            ))}
          </div>
        </div>

        {remuneration === 'paye' && (
          <div className="field">
            <label htmlFor="f-budget">Budget prévu</label>
            <input id="f-budget" className="input" placeholder="Ex: 250 €, 50 €/h, forfait..." value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" id="btn-publish" disabled={!title.trim() || !description.trim()}>
          Publier le flash
        </button>
      </form>
    </div>
  );
}
