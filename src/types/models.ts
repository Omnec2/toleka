export type Category = 
  | 'video' 
  | 'musique' 
  | 'design' 
  | 'redaction' 
  | 'dev' 
  | 'photo' 
  | 'acting'
  | 'model'
  | 'autre';

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  portfolio?: string;
  linkedin?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  profession: string;       // Son talent ou profession principale
  category: Category;       // Sa catégorie principale
  bio?: string;
  city?: string;
  skills: string[];         // Compétences / mots-clés
  socials?: SocialLinks;    // Liens de réseaux sociaux & portfolio
  stats?: {
    projectsDone?: number;      // Projets réalisés
    projectsProposed?: number;  // Projets proposés
  };
  createdAt?: any;
}

export interface FlashAnnouncement {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  authorProfession: string;
  title: string;
  description: string;
  targetCategory: Category;
  targetSkill: string;
  urgency: '48h' | 'cette_semaine' | 'flexible';
  remuneration: 'paye' | 'collaboration'; // Rémunéré ou Collaboration
  budget?: string;
  createdAt: number;
}

export interface CollabRequest {
  id: string;
  flashId: string;
  flashTitle: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  senderProfession: string;
  receiverId: string;
  message: string;
  contactInfo: string;
  status: 'en_attente' | 'accepte' | 'refuse';
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}
