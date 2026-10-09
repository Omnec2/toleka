import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Send, X } from 'lucide-react';
import type { ChatMessage, CollabRequest } from '../types/models';
import { subscribeChat, sendChatMessage } from '../lib/db';
import Avatar from './Avatar';

interface Props {
  request: CollabRequest;
  currentUserId: string;
  currentUserName: string;
  onClose: () => void;
  isDemo?: boolean;
}

export default function ChatModal({ request, currentUserId, currentUserName, onClose, isDemo }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Message initial automatique basé sur la proposition
    return [
      {
        id: 'init-msg',
        requestId: request.id,
        senderId: request.senderId,
        senderName: request.senderName,
        text: request.message,
        createdAt: request.createdAt,
      }
    ];
  });
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  // Synchronisation temps réel Firestore si non-démo
  useEffect(() => {
    if (isDemo) return;
    const unsub = subscribeChat(
      request.id,
      (cloudMsgs) => {
        if (cloudMsgs.length > 0) {
          setMessages(cloudMsgs);
        }
      },
      () => {
        // En cas d'erreur de règles, fallback local
      }
    );
    return () => unsub();
  }, [request.id, isDemo]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      requestId: request.id,
      senderId: currentUserId,
      senderName: currentUserName,
      text: input.trim(),
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    if (!isDemo) {
      try {
        await sendChatMessage(request.id, {
          requestId: newMsg.requestId,
          senderId: newMsg.senderId,
          senderName: newMsg.senderName,
          text: newMsg.text,
          createdAt: newMsg.createdAt,
        });
      } catch (err) {
        console.warn("Erreur envoi message cloud", err);
      }
    }
  };

  const partnerName = currentUserId === request.senderId ? 'Auteur du projet' : request.senderName;

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div 
        className="sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ height: '85dvh', display: 'flex', flexDirection: 'column', padding: '16px 18px 20px' }}
      >
        <div className="grabber" />
        
        {/* En-tête du Chat */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar name={partnerName} size={38} ring="var(--ok)" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <b style={{ fontSize: '0.95rem' }}>{partnerName}</b>
                <span className="chip chip-ok" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Projet validé</span>
              </div>
              <span className="faint" style={{ display: 'block' }}>« {request.flashTitle} »</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-nav" aria-label="Fermer le chat">
            <X size={18} />
          </button>
        </div>

        {/* Zone de discussion */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ textAlign: 'center', margin: '4px 0' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', background: 'var(--surface)', padding: '4px 10px', borderRadius: 'var(--r-full)' }}>
              🎉 La collaboration a été acceptée. Vous pouvez échanger directement ici.
            </span>
          </div>

          {messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            return (
              <div 
                key={m.id} 
                style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                {!isMe && (
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-2)', marginLeft: '4px' }}>
                    {m.senderName}
                  </span>
                )}
                <div 
                  style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? 'var(--brand-grad)' : 'var(--surface-solid)',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                    boxShadow: isMe ? 'var(--glow)' : 'none'
                  }}
                >
                  {m.text}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', alignSelf: isMe ? 'flex-end' : 'flex-start', marginRight: '4px' }}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Champ de saisie */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <input 
            className="input" 
            placeholder="Écrivez votre message..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            style={{ borderRadius: 'var(--r-full)', padding: '12px 18px' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '46px', height: '46px', borderRadius: '50%', padding: 0, flexShrink: 0 }}
            disabled={!input.trim()}
            aria-label="Envoyer"
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
