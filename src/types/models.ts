export type Category = 
  | 'video' 
  | 'musique' 
  | 'design' 
  | 'redaction' 
  | 'dev' 
  | 'photo' 
  | 'autre';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  profession: string;       // Son talent / profession (ex: "Monteur Vidéo", "Beatmaker", "Graphiste")
  category: Category;       // Sa catégorie de prédilection
  bio?: string;
  city?: string;
  skills: string[];         // Mots-clés / compétences
  createdAt?: any;
}

export interface FlashAnnouncement {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  authorProfession: string;
  title: string;            // Titre de l'annonce / besoin
  description: string;      // Détail du projet
  targetCategory: Category; // Quel talent est recherché
  targetSkill: string;      // Ex: "Cherche un coloriste DaVinci"
  urgency: '48h' | 'cette_semaine' | 'flexible';
  remuneration: 'paye' | 'partage' | 'benevole';
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
  message: string;          // Message court de proposition
  contactInfo: string;      // Email / WhatsApp / Téléphone
  status: 'en_attente' | 'accepte' | 'refuse';
  createdAt: number;
}
