import {
  collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, setDoc, updateDoc, where,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { CollabRequest, FlashAnnouncement, UserProfile } from '../types/models';

type ErrCb = (e: Error) => void;

/** Tous les flashs, du plus récent au plus ancien (temps réel). */
export const subscribeFlashs = (cb: (f: FlashAnnouncement[]) => void, onError: ErrCb): Unsubscribe =>
  onSnapshot(
    query(collection(db, 'flashs'), orderBy('createdAt', 'desc')),
    (snap) => cb(snap.docs.map((d) => d.data() as FlashAnnouncement)),
    onError,
  );

/** Demandes que j'ai envoyées ou reçues : deux requêtes simples fusionnées (aucun index requis). */
export const subscribeMyRequests = (uid: string, cb: (r: CollabRequest[]) => void, onError: ErrCb): Unsubscribe => {
  const sent = new Map<string, CollabRequest>();
  const received = new Map<string, CollabRequest>();
  const emit = () =>
    cb([...new Map([...sent, ...received]).values()].sort((a, b) => b.createdAt - a.createdAt));
  const listen = (field: 'senderId' | 'receiverId', store: Map<string, CollabRequest>) =>
    onSnapshot(
      query(collection(db, 'requests'), where(field, '==', uid)),
      (snap) => {
        store.clear();
        snap.docs.forEach((d) => store.set(d.id, d.data() as CollabRequest));
        emit();
      },
      onError,
    );
  const u1 = listen('senderId', sent);
  const u2 = listen('receiverId', received);
  return () => { u1(); u2(); };
};

export const saveFlash = (f: FlashAnnouncement) => setDoc(doc(db, 'flashs', f.id), f);
export const removeFlash = (id: string) => deleteDoc(doc(db, 'flashs', id));
export const saveRequest = (r: CollabRequest) => setDoc(doc(db, 'requests', r.id), r);
export const setRequestStatus = (id: string, status: CollabRequest['status']) =>
  updateDoc(doc(db, 'requests', id), { status });

export const saveProfile = (p: UserProfile) => setDoc(doc(db, 'users', p.uid), p);
export const fetchProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};
