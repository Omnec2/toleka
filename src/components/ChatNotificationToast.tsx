import { useEffect } from 'react';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import type { ChatMessage, CollabRequest } from '../types/models';
import Avatar from './Avatar';

interface Props {
  notification: {
    request: CollabRequest;
    message: ChatMessage;
    senderPhoto?: string;
  };
  onOpen: (request: CollabRequest) => void;
  onDismiss: () => void;
}

export default function ChatNotificationToast({ notification, onOpen, onDismiss }: Props) {
  const { request, message, senderPhoto } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  return (
    <div 
      className="chat-notif-toast"
      onClick={() => onOpen(request)}
      role="alert"
      aria-live="assertive"
    >
      <div className="chat-notif-avatar-wrap">
        <Avatar name={message.senderName} src={senderPhoto} size={36} ring="var(--brand)" />
        <span className="chat-notif-badge-icon">
          <MessageSquare size={11} color="#fff" />
        </span>
      </div>

      <div className="chat-notif-content">
        <div className="chat-notif-top">
          <span className="chat-notif-sender">{message.senderName}</span>
          <span className="chat-notif-tag">Nouveau message</span>
        </div>
        <p className="chat-notif-text">
          {message.text}
        </p>
      </div>

      <div className="chat-notif-actions" onClick={(e) => e.stopPropagation()}>
        <button 
          type="button" 
          className="chat-notif-reply-btn"
          onClick={() => onOpen(request)}
          title="Ouvrir la discussion"
        >
          <span>Répondre</span>
          <ArrowRight size={13} />
        </button>
        <button 
          type="button" 
          className="chat-notif-close-btn"
          onClick={onDismiss}
          aria-label="Fermer la notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
