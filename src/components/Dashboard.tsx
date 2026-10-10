import { useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Copy, Inbox, Mail, MessageSquare, PartyPopper, Rocket, Send, Trash2, Zap } from 'lucide-react';
import type { CollabRequest, FlashAnnouncement } from '../types/models';
import { catOf, timeAgo } from '../constants';
import Avatar from './Avatar';

interface Props {
  incoming: CollabRequest[];
  outgoing: CollabRequest[];
  myFlashs: FlashAnnouncement[];
  requests: CollabRequest[];
  unreadCounts?: Record<string, number>;
  onDecide: (id: string, status: 'accepte' | 'refuse') => void;
  onDeleteFlash: (id: string) => void;
  onGoCreate: () => void;
  onGoSwipe: () => void;
  onCopy: (text: string) => void;
  onOpenChat: (req: CollabRequest) => void;
  onAuthorClick?: (authorId: string, authorName: string) => void;
}

const STATUS = {
  en_attente: { label: 'En attente', cls: 'chip-warn' },
  accepte: { label: 'Accepté', cls: 'chip-ok' },
  refuse: { label: 'Refusé', cls: 'chip-danger' },
} as const;

function Empty({ icon, title, text, cta, onCta }: { icon: ReactNode; title: string; text?: string; cta: string; onCta: () => void }) {
  return (
    <div className="glass empty">
      <span className="empty-ico">{icon}</span>
      <b>{title}</b>
      {text && <span className="muted">{text}</span>}
      <button className="btn btn-primary btn-sm" onClick={onCta}>{cta}</button>
    </div>
  );
}

export default function Dashboard({ 
  incoming, 
  outgoing, 
  myFlashs, 
  requests, 
  unreadCounts = {},
  onDecide, 
  onDeleteFlash, 
  onGoCreate, 
  onGoSwipe, 
  onCopy,
  onOpenChat,
  onAuthorClick
}: Props) {
  const [tab, setTab] = useState<'in' | 'out' | 'mine'>('in');
  const pending = incoming.filter((r) => r.status === 'en_attente').length;

  const inUnread = incoming.reduce((acc, r) => acc + (unreadCounts[r.id] || 0), 0);
  const outUnread = outgoing.reduce((acc, r) => acc + (unreadCounts[r.id] || 0), 0);

  return (
    <div className="screen">
      <div>
        <h1 className="h1">Tableau de <span className="grad-text">bord</span></h1>
        <p className="muted">Gérez vos demandes et échangez avec vos collaborateurs.</p>
      </div>

      {/* Statistiques visuelles et dynamiques */}
      <div className="dash-visual-stats">
        {/* 1. À traiter */}
        <div 
          className={`dash-kpi-card ${pending > 0 || inUnread > 0 ? 'kpi-pending-active' : ''}`}
          onClick={() => setTab('in')}
          role="button"
          tabIndex={0}
        >
          <div className="kpi-top">
            <span className="kpi-icon kpi-ico-in"><Inbox size={18} /></span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{pending}</span>
            <span className="kpi-label">À traiter</span>
          </div>
          <div className="kpi-bar-track">
            <div 
              className="kpi-bar-fill kpi-fill-orange" 
              style={{ width: `${Math.min(pending * 33, 100)}%` }} 
            />
          </div>
        </div>

        {/* 2. Envoyées */}
        <div 
          className="dash-kpi-card"
          onClick={() => setTab('out')}
          role="button"
          tabIndex={0}
        >
          <div className="kpi-top">
            <span className="kpi-icon kpi-ico-out"><Send size={18} /></span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{outgoing.length}</span>
            <span className="kpi-label">Envoyées</span>
          </div>
          <div className="kpi-bar-track">
            <div 
              className="kpi-bar-fill kpi-fill-blue" 
              style={{ width: `${Math.min(outgoing.length * 25, 100)}%` }} 
            />
          </div>
        </div>

        {/* 3. Mes flashs */}
        <div 
          className="dash-kpi-card"
          onClick={() => setTab('mine')}
          role="button"
          tabIndex={0}
        >
          <div className="kpi-top">
            <span className="kpi-icon kpi-ico-mine"><Rocket size={18} /></span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{myFlashs.length}</span>
            <span className="kpi-label">Mes flashs</span>
          </div>
          <div className="kpi-bar-track">
            <div 
              className="kpi-bar-fill kpi-fill-purple" 
              style={{ width: `${Math.min(myFlashs.length * 33, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="segment">
        <button className={tab === 'in' ? 'on' : ''} onClick={() => setTab('in')}>
          <Inbox size={15} /> 
          Reçues{pending ? ` (${pending})` : ''}
          {inUnread > 0 && <span className="dash-unread-pill">{inUnread}</span>}
        </button>
        <button className={tab === 'out' ? 'on' : ''} onClick={() => setTab('out')}>
          <Send size={15} /> 
          Envoyées
          {outUnread > 0 && <span className="dash-unread-pill">{outUnread}</span>}
        </button>
        <button className={tab === 'mine' ? 'on' : ''} onClick={() => setTab('mine')}>
          <Zap size={15} /> Mes flashs
        </button>
      </div>

      {/* Onglet Demandes Reçues */}
      {tab === 'in' && (
        <div className="list">
          {incoming.length === 0 && (
            <Empty icon={<Inbox size={30} />} title="Aucune demande reçue" text="Publiez un flash pour que des talents vous contactent." cta="Créer un flash" onCta={onGoCreate} />
          )}
          {incoming.map((r, i) => {
            const unreadCount = unreadCounts[r.id] || 0;
            return (
              <div key={r.id} className="glass item" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="item-head">
                  <button 
                    type="button" 
                    onClick={() => onAuthorClick?.(r.senderId, r.senderName)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: onAuthorClick ? 'pointer' : 'default', color: 'inherit' }}
                    title="Voir le profil du candidat"
                  >
                    <Avatar name={r.senderName} src={r.senderPhoto} />
                    <div className="grow">
                      <b style={{ textDecoration: onAuthorClick ? 'underline' : 'none', textDecorationColor: 'var(--brand)' }}>{r.senderName}</b>
                      <span>{r.senderProfession} · {timeAgo(r.createdAt)}</span>
                    </div>
                  </button>
                  <span className={`chip ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                </div>
                <span className="faint">Pour le projet : <b style={{ color: 'var(--text)' }}>{r.flashTitle}</b></span>
                <div className="quote">{r.message}</div>
                
                {r.status === 'en_attente' && (
                  <div className="row">
                    <button className="btn btn-ok btn-sm" style={{ flex: 1 }} onClick={() => onDecide(r.id, 'accepte')}>
                      <Check size={16} /> Accepter & Ouvrir Chat
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onDecide(r.id, 'refuse')}>Refuser</button>
                  </div>
                )}

                {r.status === 'accepte' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="contact">
                      <Mail size={18} color="var(--ok)" />
                      <div className="grow"><b>{r.contactInfo}</b></div>
                      <button className="btn btn-ghost btn-sm" onClick={() => onCopy(r.contactInfo)} aria-label="Copier le contact"><Copy size={14} /></button>
                    </div>
                    {/* Bouton pour ouvrir la messagerie intégrée */}
                    <button 
                      className="btn btn-primary btn-sm btn-block"
                      onClick={() => onOpenChat(r)}
                      style={{ gap: '8px', position: 'relative' }}
                    >
                      <MessageSquare size={16} />
                      <span>Ouvrir la discussion (Chat en direct)</span>
                      {unreadCount > 0 && (
                        <span className="badge-new-msg">
                          {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Onglet Demandes Envoyées */}
      {tab === 'out' && (
        <div className="list">
          {outgoing.length === 0 && (
            <Empty icon={<Rocket size={30} />} title="Aucune proposition envoyée" text="Sélectionnez un flash qui vous correspond." cta="Voir les flashs" onCta={onGoSwipe} />
          )}
          {outgoing.map((r, i) => {
            const unreadCount = unreadCounts[r.id] || 0;
            return (
              <div key={r.id} className="glass item" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="item-head">
                  <div className="grow"><b>{r.flashTitle}</b><span>{timeAgo(r.createdAt)}</span></div>
                  <span className={`chip ${STATUS[r.status].cls}`}>{r.status === 'en_attente' ? 'En attente de réponse' : STATUS[r.status].label}</span>
                </div>
                <div className="quote">{r.message}</div>
                
                {r.status === 'accepte' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="contact">
                      <PartyPopper size={18} color="var(--ok)" />
                      <div className="grow">Votre profil a été validé ! Contact : <b>{r.contactInfo}</b></div>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm btn-block"
                      onClick={() => onOpenChat(r)}
                      style={{ gap: '8px', position: 'relative' }}
                    >
                      <MessageSquare size={16} />
                      <span>Discuter avec l'auteur (Chat)</span>
                      {unreadCount > 0 && (
                        <span className="badge-new-msg">
                          {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Onglet Mes Flashs */}
      {tab === 'mine' && (
        <div className="list">
          {myFlashs.length === 0 && <Empty icon={<Zap size={30} />} title="Vous n'avez publié aucun flash" cta="Publier un flash" onCta={onGoCreate} />}
          {myFlashs.map((f, i) => {
            const c = catOf(f.targetCategory);
            const n = requests.filter((r) => r.flashId === f.id).length;
            return (
              <div key={f.id} className="glass item" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="item-head">
                  <span className="cat-tile" style={{ ['--c1' as string]: c.c1 }}><c.Icon size={22} /></span>
                  <div className="grow"><b>{f.title}</b><span>{f.targetSkill} · {timeAgo(f.createdAt)}</span></div>
                </div>
                <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`chip ${n ? 'chip-brand' : ''}`}>{n} candidature{n > 1 ? 's' : ''}</span>
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => onDeleteFlash(f.id)}><Trash2 size={14} /> Supprimer</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
