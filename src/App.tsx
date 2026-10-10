import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Zap, PlusCircle, Inbox, User as UserIcon, LogOut, Sparkles, Target, Layers, Edit3, MapPin, Globe, Search, X } from 'lucide-react';
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from './components/SocialIcons';
import { onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';
import type { CollabRequest, FlashAnnouncement, UserProfile, ChatMessage } from './types/models';
import { auth, logOut, signInWithGoogle, checkRedirectLogin } from './lib/firebase';
import * as store from './lib/db';
import { ME, catOf } from './constants';
import Avatar from './components/Avatar';
import { BrandLogo, Wordmark } from './components/Brand';
import Landing from './components/Landing';
import ProfileForm from './components/ProfileForm';
import type { ProfileData } from './components/ProfileForm';
import SwipeDeck from './components/SwipeDeck';
import CreateFlash from './components/CreateFlash';
import type { FlashDraft } from './components/CreateFlash';
import Dashboard from './components/Dashboard';
import ChatModal from './components/ChatModal';
import UserProfileModal from './components/UserProfileModal';
import ChatNotificationToast from './components/ChatNotificationToast';
import {
  playNotificationSound,
  sendBrowserNotification,
  requestNotificationPermission,
  getLastReadTime,
  setLastReadTime,
  subscribeDemoIncomingMessages,
} from './lib/chatNotifications';

interface SessionUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

type Tab = 'swipe' | 'create' | 'dashboard' | 'profile';
const TABS: Tab[] = ['swipe', 'create', 'dashboard', 'profile'];

const isDemo = (u: SessionUser | null) => !!u && u.uid.startsWith('demo-');

// Nettoyage proactif de toute session démo résiduelle pour la production
if (typeof window !== 'undefined') {
  try {
    const rawUser = localStorage.getItem('toleka_user');
    if (rawUser && rawUser.includes('demo-')) {
      localStorage.removeItem('toleka_user');
      localStorage.removeItem('toleka_profile');
      localStorage.removeItem('toleka_flashs');
      localStorage.removeItem('toleka_requests');
    }
  } catch {}
}

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(() => {
    const u = load<SessionUser | null>('toleka_user', null);
    return isDemo(u) ? null : u;
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const u = load<SessionUser | null>('toleka_user', null);
    return isDemo(u) ? null : load('toleka_profile', null);
  });
  const [flashs, setFlashs] = useState<FlashAnnouncement[]>([]);
  const [requests, setRequests] = useState<CollabRequest[]>([]);

  const [tab, setTab] = useState<Tab>('swipe');
  // Filtres demandés : 'mine' (Pour moi) ou 'all' (Découverte)
  const [filter, setFilter] = useState<'mine' | 'all'>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [applying, setApplying] = useState<FlashAnnouncement | null>(null);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [booting, setBooting] = useState(() => !!load<SessionUser | null>('toleka_user', null) && !isDemo(load('toleka_user', null)));
  const [cloudError, setCloudError] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Modales interactives : Chat et Profil cliquable
  const [activeChatRequest, setActiveChatRequest] = useState<CollabRequest | null>(null);
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);

  // Gestion des notifications de chat et messages non lus
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [chatNotification, setChatNotification] = useState<{
    request: CollabRequest;
    message: ChatMessage;
    senderPhoto?: string;
  } | null>(null);

  const toastTimer = useRef<number | undefined>(undefined);

  const demo = isDemo(user);
  const me = user?.uid ?? ME;
  const isMine = (id: string) => id === me || id === ME;

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

  // Marquer un chat comme lu
  const markChatAsRead = (requestId: string) => {
    setLastReadTime(me, requestId, Date.now());
    setUnreadCounts((prev) => {
      if (!prev[requestId]) return prev;
      const copy = { ...prev };
      delete copy[requestId];
      return copy;
    });
    if (chatNotification?.request.id === requestId) {
      setChatNotification(null);
    }
  };

  const openChat = (req: CollabRequest) => {
    markChatAsRead(req.id);
    setActiveChatRequest(req);
    requestNotificationPermission();
  };

  // Persistance locale
  useEffect(() => localStorage.setItem('toleka_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('toleka_profile', JSON.stringify(profile)), [profile]);
  useEffect(() => { if (demo) localStorage.setItem('toleka_flashs', JSON.stringify(flashs)); }, [flashs, demo]);
  useEffect(() => { if (demo) localStorage.setItem('toleka_requests', JSON.stringify(requests)); }, [requests, demo]);

  // Session Firebase
  useEffect(() => {
    checkRedirectLogin().then((u) => {
      if (u) {
        setUser({ uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL });
      }
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({ uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL });
      } else {
        setUser(null);
      }
      setBooting(false);
    });

    return () => unsub();
  }, []);

  // Synchronisation temps réel Firestore
  const uid = user?.uid;
  useEffect(() => {
    if (!uid || demo) return;
    let cancelled = false;
    setCloudError(false);
    setBooting(true);
    const onError = () => {
      if (cancelled) return;
      setCloudError(true);
    };
    const u1 = store.subscribeFlashs(setFlashs, onError);
    const u2 = store.subscribeMyRequests(uid, setRequests, onError);
    store
      .fetchProfile(uid)
      .then((p) => !cancelled && setProfile((cur) => p ?? (cur?.uid === uid ? cur : null)))
      .catch(() => !cancelled && setProfile((cur) => (cur?.uid === uid ? cur : null)))
      .finally(() => !cancelled && setBooting(false));
    return () => { cancelled = true; u1(); u2(); };
  }, [uid, demo]);

  // Écoute en direct des nouveaux messages reçus pour tous les projets acceptés (Notifications & Badges)
  useEffect(() => {
    const acceptedRequests = requests.filter((r) => r.status === 'accepte');
    if (acceptedRequests.length === 0) return;

    if (demo) {
      const unsub = subscribeDemoIncomingMessages(({ request: r, message: m }) => {
        if (m.senderId === me) return;

        if (activeChatRequest?.id === r.id) {
          setLastReadTime(me, r.id, Date.now());
        } else {
          playNotificationSound();
          sendBrowserNotification(`Message de ${m.senderName}`, m.text, () => openChat(r));
          setChatNotification({
            request: r,
            message: m,
            senderPhoto: r.senderId === me ? undefined : r.senderPhoto,
          });
          setUnreadCounts((prev) => ({
            ...prev,
            [r.id]: (prev[r.id] || 0) + 1,
          }));
        }
      });
      return () => unsub();
    }

    const unsubs: (() => void)[] = [];
    const initialLoadDone: Record<string, boolean> = {};

    acceptedRequests.forEach((req) => {
      const lastRead = getLastReadTime(me, req.id);
      const unsub = store.subscribeChat(
        req.id,
        (msgs) => {
          if (!initialLoadDone[req.id]) {
            initialLoadDone[req.id] = true;
            const unread = msgs.filter((m) => m.senderId !== me && m.createdAt > lastRead).length;
            if (unread > 0) {
              setUnreadCounts((prev) => ({ ...prev, [req.id]: unread }));
            }
            return;
          }

          const latest = msgs[msgs.length - 1];
          if (!latest || latest.senderId === me) return;

          if (activeChatRequest?.id === req.id) {
            setLastReadTime(me, req.id, Date.now());
          } else {
            playNotificationSound();
            sendBrowserNotification(`Message de ${latest.senderName}`, latest.text, () => openChat(req));
            setChatNotification({
              request: req,
              message: latest,
              senderPhoto: req.senderId === me ? undefined : req.senderPhoto,
            });
            setUnreadCounts((prev) => ({
              ...prev,
              [req.id]: (prev[req.id] || 0) + 1,
            }));
          }
        },
        () => {}
      );
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [requests, demo, me, activeChatRequest?.id]);

  const cloud = (op: Promise<unknown>) => {
    if (demo) return;
    op.catch(() => {
      setCloudError(true);
      flash("Échec de synchronisation cloud");
    });
  };

  const login = async () => {
    setLoggingIn(true);
    try {
      const u = await signInWithGoogle();
      if (u) {
        setUser({ uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL });
      }
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        flash('Connexion annulée');
      } else {
        flash(`Erreur de connexion : ${err.code || err.message || 'échec'}`);
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    try { await logOut(); } catch {}
    setUser(null);
    setProfile(null);
    setFlashs([]);
    setRequests([]);
    setTab('swipe');
  };

  const saveProfile = (d: ProfileData) => {
    if (!user) return;
    const isNew = !profile;
    const p: UserProfile = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? 'Créateur',
      photoURL: d.photoURL || user.photoURL || undefined,
      profession: d.profession,
      category: d.category,
      skills: d.skills.length ? d.skills : [d.profession],
      bio: d.bio,
      city: d.city,
      socials: d.socials,
      stats: profile?.stats ?? { projectsDone: 0, projectsProposed: 0 },
      createdAt: profile?.createdAt ?? Date.now(),
    };
    setProfile(p);
    cloud(store.saveProfile(p));
    setIsEditingProfile(false);
    setFilter('mine');
    setTab(isNew ? 'swipe' : 'profile');
    flash(isNew ? 'Profil configuré avec succès !' : 'Profil mis à jour');
  };

  const publish = (d: FlashDraft) => {
    const created: FlashAnnouncement = {
      ...d,
      id: 'flash-' + Date.now(),
      authorId: me,
      authorName: profile?.displayName ?? 'Moi',
      authorPhoto: profile?.photoURL,
      authorProfession: profile?.profession ?? 'Créateur',
      createdAt: Date.now(),
    };
    setFlashs((f) => [created, ...f]);
    cloud(store.saveFlash(created));

    if (profile) {
      const updatedProfile = {
        ...profile,
        stats: {
          ...profile.stats,
          projectsProposed: (profile.stats?.projectsProposed ?? 0) + 1
        }
      };
      setProfile(updatedProfile);
      cloud(store.saveProfile(updatedProfile));
    }

    setTab('dashboard');
    flash('Flash publié avec succès !');
  };

  const sendApplication = (e: FormEvent) => {
    e.preventDefault();
    if (!applying || !profile) return;
    const req: CollabRequest = {
      id: 'req-' + Date.now(),
      flashId: applying.id,
      flashTitle: applying.title,
      senderId: me,
      senderName: profile.displayName,
      senderPhoto: profile.photoURL,
      senderProfession: profile.profession,
      receiverId: applying.authorId,
      message: message.trim(),
      contactInfo: contact.trim(),
      status: 'en_attente',
      createdAt: Date.now(),
    };
    setRequests((r) => [req, ...r]);
    cloud(store.saveRequest(req));
    setApplying(null);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.75 }, colors: ['#F5A524', '#FFD27A', '#ECEDEF'] });
    flash('Candidature envoyée !');
  };

  const decide = (id: string, status: 'accepte' | 'refuse') => {
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    cloud(store.setRequestStatus(id, status));
    
    if (status === 'accepte') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      flash('Collaborateur accepté ! Discussion débloquée.');
      const matched = requests.find((x) => x.id === id);
      if (matched) {
        openChat({ ...matched, status: 'accepte' });
      }
      if (profile) {
        const updated = {
          ...profile,
          stats: { ...profile.stats, projectsDone: (profile.stats?.projectsDone ?? 0) + 1 }
        };
        setProfile(updated);
        cloud(store.saveProfile(updated));
      }
    } else {
      flash('Proposition refusée');
    }
  };

  const deleteFlash = (id: string) => {
    setFlashs((f) => f.filter((x) => x.id !== id));
    cloud(store.removeFlash(id));
    flash('Flash supprimé');
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    flash('Copié dans le presse-papier');
  };

  const handleOpenAuthorProfile = async (authorId: string, authorName: string) => {
    if (authorId === me && profile) {
      setViewedProfile(profile);
      return;
    }

    // 1. Ouverture IMMÉDIATE à partir des données locales/flashs déjà en mémoire (0ms de latence)
    const relFlash = flashs.find((f) => f.authorId === authorId);
    const relReq = requests.find((r) => r.senderId === authorId);
    const instantProfile: UserProfile = {
      uid: authorId,
      displayName: authorName,
      email: relReq?.contactInfo || 'collaborateur@toleka.app',
      profession: relReq?.senderProfession ?? relFlash?.authorProfession ?? 'Créateur',
      category: relFlash?.targetCategory ?? 'photo',
      photoURL: relReq?.senderPhoto ?? relFlash?.authorPhoto,
      skills: [relReq?.senderProfession ?? relFlash?.targetSkill ?? 'Artiste'],
      bio: relFlash ? `Auteur du projet « ${relFlash.title} ».` : `Créateur actif sur Toleka.`,
      stats: { projectsDone: 1, projectsProposed: 1 }
    };

    setViewedProfile(instantProfile);

    // 2. Enrichissement asynchrone transparent sans bloquer l'affichage
    if (!demo) {
      store.fetchProfile(authorId).then((cloudProfile) => {
        if (cloudProfile) {
          setViewedProfile((cur) => (cur?.uid === authorId ? { ...instantProfile, ...cloudProfile } : cur));
        }
      }).catch(() => {
        // En cas d'erreur ou d'absence dans users, le profil instantané reste visible
      });
    }
  };

  // Données filtrées : 'mine' (Pour moi) ou 'all' (Découverte) + Barre de recherche
  const incoming = requests.filter((r) => isMine(r.receiverId));
  const outgoing = requests.filter((r) => isMine(r.senderId) && !isMine(r.receiverId));
  const myFlashs = flashs.filter((f) => isMine(f.authorId));
  const pending = incoming.filter((r) => r.status === 'en_attente').length;
  const totalUnreadMessages = Object.values(unreadCounts).reduce((acc, count) => acc + count, 0);

  const feed = useMemo(() => {
    const appliedIds = new Set(requests.filter((r) => isMine(r.senderId)).map((r) => r.flashId));
    return flashs
      .filter((f) => !isMine(f.authorId) && !appliedIds.has(f.id))
      .filter((f) => {
        if (filter === 'mine' && profile) {
          return f.targetCategory === profile.category;
        }
        return true; // 'all' (Découverte)
      })
      .filter((f) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.targetSkill.toLowerCase().includes(q) ||
          f.authorName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [flashs, requests, filter, profile, searchQuery, me]);

  const toastEl = toast && (
    <div className="toast"><Sparkles size={16} color="#F5A524" />{toast}</div>
  );

  if (!user) {
    return (
      <div className="shell">
        {toastEl}
        <Landing onLogin={login} loading={loggingIn} />
      </div>
    );
  }

  if (booting) {
    return (
      <div className="shell splash" aria-busy="true">
        <div className="splash-logo-wrap">
          <BrandLogo size={52} glow animated />
          <div className="splash-bar">
            <span className="splash-bar-progress" />
          </div>
        </div>
        <span className="muted splash-caption">Chargement de votre univers…</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="shell">
        {toastEl}
        <main className="screen" style={{ paddingTop: 28, paddingBottom: 40 }}>
          <Wordmark size={34} />
          <span className="chip chip-brand badge-step">Configuration du profil</span>
          <div>
            <h1 className="h1">Salut {user.displayName?.split(' ')[0] ?? ''},<br />définissez <span className="grad-text">votre talent</span></h1>
            <p className="muted" style={{ marginTop: 8 }}>Personnalisez votre activité pour recevoir des flashs correspondants.</p>
          </div>
          <ProfileForm initial={null} submitLabel="Accéder aux projets" onSave={saveProfile} />
        </main>
      </div>
    );
  }

  const NavBtn = ({ id, icon, label, badge }: { id: Tab; icon: ReactNode; label: string; badge?: number }) => (
    <button className={tab === id ? 'on' : ''} onClick={() => setTab(id)} id={`nav-${id}`} aria-label={label}>
      {icon}
      {label}
      {!!badge && <span className="dot">{badge}</span>}
    </button>
  );

  const myCat = catOf(profile.category);

  return (
    <div className="shell">
      {toastEl}


      {cloudError && (
        <div className="banner">
          Mode hors ligne
        </div>
      )}

      {/* 1. Écran Découverte des Flashs */}
      {tab === 'swipe' && (
        <div className="screen">
          
          {/* Barre de filtrage simplifiée : Pour moi / Découverte (Tous) + Bouton Recherche */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="filters" role="tablist" style={{ flex: 1, margin: 0, padding: 0 }}>
              <button 
                className={`filter ${filter === 'mine' ? 'on' : ''}`} 
                onClick={() => { setFilter('mine'); }}
              >
                <Target size={14} /> Pour moi
              </button>
              <button 
                className={`filter ${filter === 'all' ? 'on' : ''}`} 
                onClick={() => { setFilter('all'); }}
              >
                <Layers size={14} /> Découverte
              </button>
            </div>

            <button 
              className={`btn-icon-nav ${showSearch ? 'active' : ''}`}
              onClick={() => setShowSearch(!showSearch)}
              title="Rechercher des projets"
              aria-label="Rechercher des projets"
              style={{ flexShrink: 0, background: showSearch ? 'var(--brand)' : undefined, color: showSearch ? '#fff' : undefined }}
            >
              <Search size={16} />
            </button>
          </div>

          {/* Champ de recherche déroulant */}
          {showSearch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-2)', padding: '6px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <Search size={15} color="var(--text-2)" />
              <input 
                type="text" 
                placeholder="Rechercher par mot-clé, profil, compétence..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'none', border: 'none', padding: '6px 0', fontSize: '0.88rem' }}
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-3)' }}>
                  <X size={15} />
                </button>
              )}
            </div>
          )}

          <SwipeDeck
            flashs={feed}
            profile={profile}
            onAuthorClick={handleOpenAuthorProfile}
            onApply={(f) => {
              setApplying(f);
              setContact(user.email ?? '');
              setMessage(`Bonjour ${f.authorName.split(' ')[0]}, je suis ${profile.profession} et je souhaite collaborer sur votre projet !`);
            }}
            empty={
              <div className="glass empty" style={{ marginTop: 20 }}>
                <span className="empty-ico"><myCat.Icon size={30} /></span>
                <h2 className="h2">{flashs.length ? 'Tous les flashs consultés !' : 'Aucun projet trouvé'}</h2>
                <p className="muted">
                  {searchQuery 
                    ? `Aucun projet ne correspond à "${searchQuery}".` 
                    : filter === 'mine' 
                    ? "Aucun projet urgent ne recherche actuellement votre talent. Consultez la section Découverte !" 
                    : "Aucun projet disponible pour le moment."}
                </p>
                <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  {filter === 'mine' && <button className="btn btn-primary btn-sm" onClick={() => setFilter('all')}>Voir la Découverte</button>}
                  {searchQuery && <button className="btn btn-ghost btn-sm" onClick={() => setSearchQuery('')}>Effacer la recherche</button>}
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab('create')}>Publier un flash</button>
                </div>
              </div>
            }
          />
        </div>
      )}

      {/* 2. Création de Flash */}
      {tab === 'create' && <CreateFlash onPublish={publish} />}

      {/* 3. Dashboard avec Chat & Profils cliquables */}
      {tab === 'dashboard' && (
        <Dashboard
          incoming={incoming}
          outgoing={outgoing}
          myFlashs={myFlashs}
          requests={requests}
          unreadCounts={unreadCounts}
          onDecide={decide}
          onDeleteFlash={deleteFlash}
          onGoCreate={() => setTab('create')}
          onGoSwipe={() => setTab('swipe')}
          onCopy={copy}
          onOpenChat={openChat}
          onAuthorClick={handleOpenAuthorProfile}
        />
      )}

      {/* 4. Page Mon Profil Enrichie avec Upload */}
      {tab === 'profile' && (
        <div className="screen">
          <div className="glass profile-hero">
            <Avatar name={profile.displayName} src={profile.photoURL} size={88} ring="var(--brand)" />
            <h1 className="h2" style={{ fontSize: '1.4rem' }}>{profile.displayName}</h1>
            <span className="faint">{profile.email}</span>
            
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2px' }}>
              <span className="chip chip-brand"><myCat.Icon size={14} /> {profile.profession}</span>
              {profile.city && (
                <span className="chip"><MapPin size={13} /> {profile.city}</span>
              )}
            </div>

            {/* Statistiques projets discrètes */}
            <div className="profile-stats-discreet" style={{ marginTop: '10px' }}>
              <div className="stat-pill">
                <span className="stat-pill-num">{profile.stats?.projectsDone ?? 0}</span>
                <span className="stat-pill-label">Projets réalisés</span>
              </div>
              <span className="stat-pill-sep">·</span>
              <div className="stat-pill">
                <span className="stat-pill-num hot">{profile.stats?.projectsProposed ?? myFlashs.length}</span>
                <span className="stat-pill-label">Projets proposés</span>
              </div>
            </div>

            {/* Bio de l'utilisateur */}
            {profile.bio && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--r-sm)', padding: '12px', width: '100%', textAlign: 'left', marginTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Bio</span>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-1)', lineHeight: 1.4 }}>{profile.bio}</p>
              </div>
            )}

            {/* Réseaux sociaux & Portfolios */}
            {profile.socials && Object.values(profile.socials).some(Boolean) && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
                {profile.socials.instagram && (
                  <a href={`https://instagram.com/${profile.socials.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
                    <InstagramIcon color="#E1306C" /> Instagram
                  </a>
                )}
                {profile.socials.youtube && (
                  <a href={profile.socials.youtube} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
                    <YoutubeIcon color="#FF0000" /> YouTube
                  </a>
                )}
                {profile.socials.portfolio && (
                  <a href={profile.socials.portfolio} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
                    <Globe size={14} color="var(--brand)" /> Portfolio
                  </a>
                )}
                {profile.socials.linkedin && (
                  <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
                    <LinkedinIcon color="#0A66C2" /> LinkedIn
                  </a>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', width: '100%' }}>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ flex: 1, gap: '6px' }}
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                <Edit3 size={15} />
                <span>{isEditingProfile ? 'Fermer la modification' : 'Modifier mon profil'}</span>
              </button>
              <button className="btn btn-danger-ghost btn-sm" onClick={logout} id="btn-logout" title="Déconnexion">
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {/* Formulaire de modification */}
          {isEditingProfile && (
            <div>
              <h2 className="h2" style={{ marginBottom: '10px' }}>Modifier les informations</h2>
              <ProfileForm initial={profile} submitLabel="Enregistrer les modifications" onSave={saveProfile} />
            </div>
          )}
        </div>
      )}

      {/* Navigation inférieure */}
      <nav className="nav" aria-label="Navigation principale" style={{ ['--i' as string]: TABS.indexOf(tab) }}>
        <NavBtn id="swipe" icon={<Zap size={21} />} label="Flashs" />
        <NavBtn id="create" icon={<PlusCircle size={21} />} label="Créer" />
        <NavBtn id="dashboard" icon={<Inbox size={21} />} label="Dashboard" badge={pending + totalUnreadMessages} />
        <NavBtn id="profile" icon={<UserIcon size={21} />} label="Profil" />
      </nav>

      {/* Toast de notification de message reçu */}
      {chatNotification && (
        <ChatNotificationToast 
          notification={chatNotification}
          onOpen={(req) => openChat(req)}
          onDismiss={() => setChatNotification(null)}
        />
      )}

      {/* Modal Candidature */}
      {applying && (
        <div className="overlay" onClick={() => setApplying(null)}>
          <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={sendApplication}>
            <div className="grabber" />
            <div>
              <h2 className="h2">Proposer ma collaboration</h2>
              <p className="muted" style={{ fontSize: '0.85rem' }}>Projet : « {applying.title} » par {applying.authorName}</p>
            </div>
            <div className="field">
              <label htmlFor="a-msg">Votre message</label>
              <textarea id="a-msg" className="input" rows={3} required value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="a-contact">Vos coordonnées directes (WhatsApp, Instagram, Email)</label>
              <input id="a-contact" className="input" required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="contact@example.com ou +33..." />
            </div>
            <button type="submit" className="btn btn-primary btn-block" id="btn-send-application">Envoyer ma proposition</button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setApplying(null)}>Annuler</button>
          </form>
        </div>
      )}

      {/* Modal Chat en direct si collaboration acceptée */}
      {activeChatRequest && (
        <ChatModal 
          request={activeChatRequest}
          currentUserId={me}
          currentUserName={profile.displayName}
          partnerName={
            activeChatRequest.senderId === me 
              ? (flashs.find((f) => f.id === activeChatRequest.flashId)?.authorName || 'Auteur du projet')
              : activeChatRequest.senderName
          }
          partnerPhoto={
            activeChatRequest.senderId === me
              ? flashs.find((f) => f.id === activeChatRequest.flashId)?.authorPhoto
              : activeChatRequest.senderPhoto
          }
          onClose={() => {
            markChatAsRead(activeChatRequest.id);
            setActiveChatRequest(null);
          }}
          onAuthorClick={handleOpenAuthorProfile}
          isDemo={demo}
        />
      )}

      {/* Modal Profil créateur cliquable */}
      {viewedProfile && (
        <UserProfileModal 
          profile={viewedProfile}
          onClose={() => setViewedProfile(null)}
        />
      )}

    </div>
  );
}
