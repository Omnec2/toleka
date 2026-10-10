import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import type { Category, FlashAnnouncement } from '../types/models';
import type { FlashDraft } from './CreateFlash';
import { CATEGORIES } from '../constants';

interface Props {
  flash: FlashAnnouncement;
  onClose: () => void;
  onSave: (updates: FlashDraft) => void;
}

export default function EditFlashModal({ flash, onClose, onSave }: Props) {
  const [targetCategory, setCategory] = useState<Category>(flash.targetCategory);
  const [title, setTitle] = useState(flash.title);
  const [targetSkill, setSkill] = useState(flash.targetSkill);
  const [description, setDescription] = useState(flash.description);
  const [urgency, setUrgency] = useState<FlashDraft['urgency']>(flash.urgency);
  const [remuneration, setRemun] = useState<FlashDraft['remuneration']>(flash.remuneration);
  const [budget, setBudget] = useState(flash.budget || '');

  // Fermer avec la touche Echap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSave({
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
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-flash-title">
      <div 
        className="sheet glass" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxHeight: '90vh', 
          overflowY: 'auto',
          paddingBottom: '24px'
        }}
      >
        <div className="grabber" />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h2 id="edit-flash-title" className="h2" style={{ margin: 0 }}>Modifier mon <span className="grad-text">flash</span></h2>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Mettez à jour les critères de votre recherche de collaborateur.</p>
          </div>
          <button 
            type="button" 
            className="btn-icon-nav" 
            onClick={onClose} 
            title="Fermer"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  <span className="ico" style={{ ['--c1' as string]: c.c1 }}>
                    <c.Icon size={18} strokeWidth={2} />
                  </span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="edit-f-title">Titre de l'annonce *</label>
            <input
              id="edit-f-title"
              className="input"
              required
              placeholder="Ex : Monteur pour un teaser d'1 min"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="edit-f-skill">Compétence précise attendue</label>
            <input
              id="edit-f-skill"
              className="input"
              placeholder="Ex: DaVinci Resolve, Modèle lookbook, Acting émotif..."
              value={targetSkill}
              onChange={(e) => setSkill(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="edit-f-desc">Détails du projet *</label>
            <textarea
              id="edit-f-desc"
              className="input"
              rows={3}
              required
              placeholder="Expliquez votre projet, les attentes et la vision..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Délai</label>
            <div className="segment">
              {([['48h', '⚡ 48h'], ['cette_semaine', 'Semaine'], ['flexible', 'Flexible']] as const).map(([v, l]) => (
                <button
                  type="button"
                  key={v}
                  className={urgency === v ? 'on' : ''}
                  onClick={() => setUrgency(v)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Mode de rémunération</label>
            <div className="segment">
              {([['paye', '💰 Rémunéré'], ['collaboration', '🤝 Collaboration']] as const).map(([v, l]) => (
                <button
                  type="button"
                  key={v}
                  className={remuneration === v ? 'on' : ''}
                  onClick={() => setRemun(v)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {remuneration === 'paye' && (
            <div className="field">
              <label htmlFor="edit-f-budget">Budget prévu</label>
              <input
                id="edit-f-budget"
                className="input"
                placeholder="Ex: 250 €, 50 €/h, forfait..."
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, gap: '6px' }}
              disabled={!title.trim() || !description.trim()}
            >
              <Check size={16} />
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
