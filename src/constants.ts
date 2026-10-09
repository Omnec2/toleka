import { Camera, Clapperboard, Code, Headphones, Palette, PenLine, Sparkles, Theater, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category, FlashAnnouncement, CollabRequest } from './types/models';

export interface CategoryMeta {
  id: Category;
  label: string;
  Icon: LucideIcon;
  c1: string;
  c2: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'video', label: 'Vidéo & Cinéma', Icon: Clapperboard, c1: '#FF5E7E', c2: '#FF9A5E' },
  { id: 'musique', label: 'Musique & Son', Icon: Headphones, c1: '#16D9A0', c2: '#1AA8D9' },
  { id: 'design', label: 'Design & Graphisme', Icon: Palette, c1: '#9B6BFF', c2: '#E057FF' },
  { id: 'redaction', label: 'Écriture & Scénario', Icon: PenLine, c1: '#FFC24B', c2: '#FF8A4B' },
  { id: 'dev', label: 'Tech & Dév Web', Icon: Code, c1: '#3FA9FF', c2: '#5B6BFF' },
  { id: 'photo', label: 'Photo & Image', Icon: Camera, c1: '#27D3E6', c2: '#3F8CFF' },
  { id: 'acting', label: 'Acting & Théâtre', Icon: Theater, c1: '#EC4899', c2: '#F43F5E' },
  { id: 'model', label: 'Modèle & Mannequin', Icon: UserCheck, c1: '#D946EF', c2: '#8B5CF6' },
  { id: 'autre', label: 'Autre talent', Icon: Sparkles, c1: '#8C93B3', c2: '#B7A6FF' },
];

export const catOf = (id: Category): CategoryMeta =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export const URGENCY_LABEL: Record<FlashAnnouncement['urgency'], string> = {
  '48h': '48h',
  cette_semaine: 'Cette semaine',
  flexible: 'Flexible',
};

export const timeAgo = (ts: number): string => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
};

export const ME = 'me';

const now = Date.now();

export const SEED_FLASHS: FlashAnnouncement[] = [
  {
    id: 'f1', authorId: 'u2', authorName: 'Karim D.', authorProfession: 'Réalisateur & Scénariste',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    title: "Un monteur pour mon court-métrage de 7 min",
    description: "Rushs triés et synchronisés sous Premiere. Ambiance polar urbain. Premier cut attendu pour vendredi.",
    targetCategory: 'video', targetSkill: 'Montage Premiere / DaVinci', urgency: '48h',
    remuneration: 'paye', budget: '250 €', createdAt: now - 3600000,
  },
  {
    id: 'f2', authorId: 'u3', authorName: 'Sarah B.', authorProfession: 'Chanteuse Pop & RnB',
    authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    title: "Compositeur beatmaker pour mon single d'été",
    description: "Mélodies et textes prêts. Je veux une prod fraîche, percussions afrobeats / pop.",
    targetCategory: 'musique', targetSkill: 'Beatmaker / Producteur', urgency: 'cette_semaine',
    remuneration: 'collaboration', createdAt: now - 7200000,
  },
  {
    id: 'f3', authorId: 'u7', authorName: 'Marc V.', authorProfession: 'Directeur de Casting',
    authorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    title: "Comédien / Acteur pour rôle principal court-métrage",
    description: "Tournage prévu sur 2 jours. Profil recherché : jeune adulte expressif, aisance face caméra.",
    targetCategory: 'acting', targetSkill: 'Jeu d\'acteur & Élocution', urgency: 'cette_semaine',
    remuneration: 'paye', budget: '300 €', createdAt: now - 8500000,
  },
  {
    id: 'f4', authorId: 'u8', authorName: 'Inès T.', authorProfession: 'Créatrice de Marque Mode',
    authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    title: "Modèle photo pour shooting collection capsule",
    description: "Shooting extérieur à la lumière naturelle pour lookbook et campagne Instagram.",
    targetCategory: 'model', targetSkill: 'Pose & Expression corporelle', urgency: '48h',
    remuneration: 'collaboration', createdAt: now - 14000000,
  },
  {
    id: 'seed-mine', authorId: ME, authorName: 'Moi', authorProfession: 'Créateur',
    title: "Illustrateur pour une pochette d'album",
    description: "EP de 5 titres, univers sombre et onirique. Je cherche un style marqué.",
    targetCategory: 'design', targetSkill: 'Illustration digitale', urgency: 'cette_semaine',
    remuneration: 'paye', budget: '200 €', createdAt: now - 86400000,
  },
];

export const SEED_REQUESTS: CollabRequest[] = [
  {
    id: 'r1', flashId: 'seed-mine', flashTitle: "Illustrateur pour une pochette d'album",
    senderId: 'u5', senderName: 'Nadia M.', senderProfession: 'Illustratrice digitale',
    senderPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    receiverId: ME,
    message: "J'adore l'univers de ton projet ! Mon portfolio est en ligne, je suis dispo tout de suite.",
    contactInfo: 'nadia.art@gmail.com', status: 'en_attente', createdAt: now - 3600000 * 4,
  },
];
