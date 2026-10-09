import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Send, X } from 'lucide-react';
import type { ChatMessage, CollabRequest } from '../types/models';
import { subscribeChat, sendChatMessage } from '../lib/db';
import {
  getDemoMessages,
  appendDemoMessage,
  notifyDemoIncomingMessage,
  subscribeDemoIncomingMessages,
  setLastReadTime
} from '../lib/chatNotifications';
import Avatar from './Avatar';

interface Props {
  request: CollabRequest;
  currentUserId: string;
  currentUserName: string;
  partnerName?: string;
  partnerPhoto?: string;
  partnerProfession?: string;
  onClose: () => void;
  onAuthorClick?: (userId: string, userName: string) => void;
  isDemo?: boolean;
}

export default function ChatModal({
  request,
  currentUserId,
  currentUserName,
  partnerName,
  partnerPhoto,
  onClose,
  onAuthorClick,
  isDemo
}: Props) {
  const partnerId = currentUserId === request.senderId ? request.receiverId : request.senderId;
  const resolvedPartnerName = partnerName || (currentUserId === request.senderId ? 'Auteur du projet' : request.senderName);
  const resolvedPartnerPhoto = partnerPhoto || (currentUserId === request.senderId ? undefined : request.senderPhoto);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initMsg: ChatMessage = {
      id: 'init-msg',
      requestId: request.id,
      senderId: request.senderId,
      senderName: request.senderName,
      text: request.message,
      createdAt: request.createdAt,
    };
    if (isDemo) {
      return getDemoMessages(request.id, initMsg);
    }
    return [initMsg];
  });

  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  // Marquer comme lu à l'ouverture et lors de la réception de messages tant que la fenêtre est ouverte
  useEffect(() => {
    setLastReadTime(currentUserId, request.id, Date.now());
  }, [currentUserId, request.id, messages.length]);

  // Synchronisation temps réel Firestore si non-démo
  useEffect(() => {
    if (isDemo) {
      // Écoute des messages démo émis en local
      const unsubDemo = subscribeDemoIncomingMessages(({ request: r, message: m }) => {
        if (r.id === request.id) {
          setMessages((prev) => {
            if (prev.some((x) => x.id === m.id)) return prev;
            return [...prev, m];
          });
        }
      });
      return () => unsubDemo();
    }

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
    const textToSend = input.trim();
    if (!textToSend) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      requestId: request.id,
      senderId: currentUserId,
      senderName: currentUserName,
      text: textToSend,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    if (isDemo) {
      appendDemoMessage(request.id, newMsg);

      // Simulation de réponse automatique pour tester les notifications et les échanges
      setTimeout(() => {
        const demoResponses = [
          "Super ! J'ai bien reçu ton message. Travaillons ensemble là-dessus, quand es-tu dispo ?",
          "Parfait, ravi d'échanger avec toi ! Regarde mon profil si tu veux voir plus de réalisations.",
          "Génial ! On peut se caler un appel ou continuer d'échanger ici pour finaliser les détails."
        ];
        const randomText = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        const replyMsg: ChatMessage = {
          id: 'demo-reply-' + Date.now(),
          requestId: request.id,
          senderId: partnerId,
          senderName: resolvedPartnerName,
          text: randomText,
          createdAt: Date.now(),
        };
        appendDemoMessage(request.id, replyMsg);
        notifyDemoIncomingMessage(request, replyMsg);
      }, 2500);
    } else {
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

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div 
        className="sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ height: '85dvh', display: 'flex', flexDirection: 'column', padding: '16px 18px 20px' }}
      >
        <div className="grabber" />
        
        {/* En-tête du Chat avec profil cliquable */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <button
            type="button"
            onClick={() => onAuthorClick?.(partnerId, resolvedPartnerName)}
            className="chat-header-user-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              padding: '2px 4px',
              cursor: onAuthorClick ? 'pointer' : 'default',
              textAlign: 'left',
              color: 'inherit',
              borderRadius: '12px'
            }}
            title={onAuthorClick ? `Voir le profil de ${resolvedPartnerName}` : undefined}
          >
            <Avatar name={resolvedPartnerName} src={resolvedPartnerPhoto} size={38} ring="var(--ok)" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <b style={{ fontSize: '0.95rem', textDecoration: onAuthorClick ? 'underline' : 'none', textDecorationColor: 'var(--brand)' }}>
                  {resolvedPartnerName}
                </b>
                <span className="chip chip-ok" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Projet validé</span>
              </div>
              <span className="faint" style={{ display: 'block' }}>« {request.flashTitle} »</span>
            </div>
          </button>
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
                {!isMe ? (
                  <button
                    type="button"
                    onClick={() => onAuthorClick?.(m.senderId, m.senderName)}
                    className="chat-bubble-sender-btn"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0 4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--brand)',
                      cursor: onAuthorClick ? 'pointer' : 'default',
                      textAlign: 'left',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      width: 'fit-content'
                    }}
                    title={onAuthorClick ? `Voir le profil de ${m.senderName}` : undefined}
                  >
                    <span>{m.senderName}</span>
                    {onAuthorClick && <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>↗</span>}
                  </button>
                ) : null}
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
