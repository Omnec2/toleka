import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Zap, PlusCircle, Inbox, User as UserIcon, LogOut, Sparkles, Target, Layers } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';
import type { CollabRequest, FlashAnnouncement, UserProfile } from './types/models';
import { auth, logOut, signInWithGoogle } from './lib/firebase';
import * as store from './lib/db';
import { CATEGORIES, ME, SEED_FLASHS, SEED_REQUESTS, catOf } from './constants';
import Avatar from './components/Avatar';
import { Logo, Wordmark } from './components/Brand';
import Landing from './components/Landing';
import ProfileForm from './components/ProfileForm';
import type { ProfileData } from './components/ProfileForm';
import SwipeDeck from './components/SwipeDeck';
import CreateFlash from './components/CreateFlash';
import type { FlashDraft } from './components/CreateFlash';
import Dashboard from './components/Dashboard';

interface SessionUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

type Tab = 'swipe' | 'create' | 'dashboard' | 'profile';
const TABS: Tab[] = ['swipe', 'create', 'dashboard', 'profile'];

const isDemo = (u: SessionUser | null) => !!u && u.uid.startsWith('demo-');

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(() => load('toleka_user', null));
  const [profile, setProfile] = useState<UserProfile | null>(() => load('toleka_profile', null));
  const [flashs, setFlashs] = useState<FlashAnnouncement[]>(() => (isDemo(load('toleka_user', null)) ? load('toleka_flashs', SEED_FLASHS) : []));
  const [requests, setRequests] = useState<CollabRequest[]>(() => (isDemo(load('toleka_user', null)) ? load('toleka_requests', SEED_REQUESTS) : []));

  const [tab, setTab] = useState<Tab>('swipe');
  const [filter, setFilter] = useState<'mine' | 'all' | string>('mine');
  const [skipped, setSkipped] = useState<string[]>([]);
  const [applying, setApplying] = useState<FlashAnnouncement | null>(null);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [booting, setBooting] = useState(() => !!load<SessionUser | null>('toleka_user', null) && !isDemo(load('toleka_user', null)));
  const [cloudError, setCloudError] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  const demo = isDemo(user);
  const me = user?.uid ?? ME;
  const isMine = (id: string) => id === me || id === ME;

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

  // Persistance locale : profil toujours, flashs/demandes uniquement en mode démo
  useEffect(() => localStorage.setItem('toleka_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('toleka_profile', JSON.stringify(profile)), [profile]);
  useEffect(() => { if (demo) localStorage.setItem('toleka_flashs', JSON.stringify(flashs)); }, [flashs, demo]);
  useEffect(() => { if (demo) localStorage.setItem('toleka_requests', JSON.stringify(requests)); }, [requests, demo]);

  // Session Firebase : restaure l'utilisateur connecté
  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        if (u) setUser({ uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL });
        else setUser((cur) => (isDemo(cur) ? cur : null));
        setBooting((b) => (u ? b : false));
      }),
    [],
  );

  // Synchronisation temps réel avec Firestore pour les vrais comptes Google
  const uid = user?.uid;
  useEffect(() => {
    if (!uid || demo) return;
    let cancelled = false;
    setCloudError(false);
    setBooting(true);
    const onError = () => {
      if (cancelled) return;
      setCloudError(true);
      flash('Firestore inaccessible : publiez les règles de sécurité (firestore.rules)');
    };
    const u1 = store.subscribeFlashs(setFlashs, onError);
    const u2 = store.subscribeMyRequests(uid, setRequests, onError);
    store
      .fetchProfile(uid)
      .then((p) => !cancelled && setProfile((cur) => p ?? (cur?.uid === uid ? cur : null)))
      .catch(() => !cancelled && setProfile((cur) => (cur?.uid === uid ? cur : null)))
      .finally(() => !cancelled && setBooting(false));
    return () => { cancelled = true; u1(); u2(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, demo]);

  /** Écrit dans Firestore sans bloquer l'UI ; signale les échecs. */
  const cloud = (op: Promise<unknown>) => {
    if (demo) return;
    op.catch(() => {
      setCloudError(true);
      flash("Échec de l'enregistrement en ligne (règles Firestore ?)");
    });
  };

  const login = async () => {
    setLoggingIn(true);
    try {
      const u = await signInWithGoogle();
      setUser({ uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL });
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        flash('Connexion annulée');
      } else {
        // Google indisponible (provider désactivé, domaine non autorisé…) : mode démo local
        setFlashs(SEED_FLASHS);
        setRequests(SEED_REQUESTS);
        setUser({ uid: 'demo-' + Date.now(), displayName: 'Créateur Démo', email: 'demo@toleka.app', photoURL: null });
        flash('Connexion Google indisponible : mode démo local activé');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    try { await logOut(); } catch { /* session démo */ }
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
      photoURL: user.photoURL ?? undefined,
      profession: d.profession,
      category: d.category,
      skills: d.skills.length ? d.skills : [d.profession],
      bio: d.bio,
      city: d.city,
      createdAt: profile?.createdAt ?? Date.now(),
    };
    setProfile(p);
    cloud(store.saveProfile(p));
    setFilter('mine');
    setTab(isNew ? 'swipe' : 'profile');
    flash(isNew ? 'Profil créé, voici vos flashs !' : 'Profil mis à jour');
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
    setTab('dashboard');
    flash('Flash publié !');
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
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.75 }, colors: ['#7C6CFF', '#FF5EC8', '#19D79B'] });
    flash('Proposition envoyée !');
  };

  const decide = (id: string, status: 'accepte' | 'refuse') => {
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    cloud(store.setRequestStatus(id, status));
    if (status === 'accepte') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      flash('Collaborateur accepté ! Coordonnées débloquées');
    } else flash('Proposition refusée');
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

  // Données dérivées
  const incoming = requests.filter((r) => isMine(r.receiverId));
  const outgoing = requests.filter((r) => isMine(r.senderId) && !isMine(r.receiverId));
  const myFlashs = flashs.filter((f) => isMine(f.authorId));
  const pending = incoming.filter((r) => r.status === 'en_attente').length;

  const feed = useMemo(() => {
    const appliedIds = new Set(requests.filter((r) => isMine(r.senderId)).map((r) => r.flashId));
    return flashs
      .filter((f) => !isMine(f.authorId) && !appliedIds.has(f.id) && !skipped.includes(f.id))
      .filter((f) =>
        filter === 'all' ? true : filter === 'mine' ? (profile ? f.targetCategory === profile.category : true) : f.targetCategory === filter,
      )
      .sort((a, b) => b.createdAt - a.createdAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashs, requests, skipped, filter, profile, me]);

  // ---- Écrans d'entrée ----
  const toastEl = toast && (
    <div className="toast"><Sparkles size={16} color="#FF5EC8" />{toast}</div>
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
        <div className="splash-logo"><Logo size={72} /></div>
        <span className="muted">Chargement de votre espace…</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="shell">
        {toastEl}
        <main className="screen" style={{ paddingTop: 28, paddingBottom: 40 }}>
          <Wordmark size={34} />
          <span className="chip chip-brand badge-step">Votre profil</span>
          <div>
            <h1 className="h1">Salut {user.displayName?.split(' ')[0] ?? ''},<br />quel est <span className="grad-text">votre talent</span> ?</h1>
            <p className="muted" style={{ marginTop: 8 }}>On vous montrera les flashs qui correspondent à ce que vous savez faire.</p>
          </div>
          <ProfileForm initial={null} submitLabel="Découvrir les flashs" onSave={saveProfile} />
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

      <header className="topbar">
        <Wordmark />
        <button onClick={() => setTab('profile')} aria-label="Mon profil" className="top-avatar">
          <Avatar name={profile.displayName} src={profile.photoURL} size={38} ring="var(--brand)" />
        </button>
      </header>

      {(demo || cloudError) && (
        <div className="banner">
          {demo ? 'Mode démo : vos données restent sur cet appareil.' : 'Mode hors ligne : Firestore refuse l’accès (règles à publier).'}
        </div>
      )}

      {tab === 'swipe' && (
        <div className="screen">
          <div className="filters" role="tablist">
            <button className={`filter ${filter === 'mine' ? 'on' : ''}`} onClick={() => setFilter('mine')}><Target size={14} /> Pour moi</button>
            <button className={`filter ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}><Layers size={14} /> Tous</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`filter ${filter === c.id ? 'on' : ''}`} onClick={() => setFilter(c.id)}><c.Icon size={14} /> {c.label.split(' ')[0]}</button>
            ))}
          </div>

          <SwipeDeck
            flashs={feed}
            profile={profile}
            onPass={(f) => setSkipped((s) => [...s, f.id])}
            onApply={(f) => {
              setApplying(f);
              setContact(user.email ?? '');
              setMessage(`Bonjour ${f.authorName.split(' ')[0]}, je suis ${profile.profession} et je suis disponible pour votre projet !`);
            }}
            empty={
              <div className="glass empty" style={{ marginTop: 20 }}>
                <span className="empty-ico"><myCat.Icon size={30} /></span>
                <h2 className="h2">{flashs.length ? 'Vous avez tout vu !' : 'Aucun flash pour le moment'}</h2>
                <p className="muted">{flashs.length ? 'Plus de flash dans cette sélection.' : 'Soyez le premier à publier une annonce.'}</p>
                <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  {filter !== 'all' && flashs.length > 0 && <button className="btn btn-primary btn-sm" onClick={() => { setFilter('all'); setSkipped([]); }}>Voir tous les flashs</button>}
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab('create')}>Créer un flash</button>
                </div>
              </div>
            }
          />
        </div>
      )}

      {tab === 'create' && <CreateFlash onPublish={publish} />}

      {tab === 'dashboard' && (
        <Dashboard
          incoming={incoming}
          outgoing={outgoing}
          myFlashs={myFlashs}
          requests={requests}
          onDecide={decide}
          onDeleteFlash={deleteFlash}
          onGoCreate={() => setTab('create')}
          onGoSwipe={() => setTab('swipe')}
          onCopy={copy}
        />
      )}

      {tab === 'profile' && (
        <div className="screen">
          <div className="glass profile-hero">
            <Avatar name={profile.displayName} src={profile.photoURL} size={84} ring="var(--bg)" />
            <h1 className="h2">{profile.displayName}</h1>
            <span className="faint">{profile.email}</span>
            <span className="chip chip-brand"><myCat.Icon size={13} /> {profile.profession}</span>
            <button className="btn btn-danger-ghost btn-sm" onClick={logout} id="btn-logout" style={{ marginTop: 6 }}><LogOut size={14} /> Déconnexion</button>
          </div>
          <h2 className="h2">Modifier mon profil</h2>
          <ProfileForm initial={profile} submitLabel="Enregistrer" onSave={saveProfile} />
        </div>
      )}

      <nav className="nav" aria-label="Navigation principale" style={{ ['--i' as string]: TABS.indexOf(tab) }}>
        <NavBtn id="swipe" icon={<Zap size={21} />} label="Flashs" />
        <NavBtn id="create" icon={<PlusCircle size={21} />} label="Créer" />
        <NavBtn id="dashboard" icon={<Inbox size={21} />} label="Dashboard" badge={pending} />
        <NavBtn id="profile" icon={<UserIcon size={21} />} label="Profil" />
      </nav>

      {applying && (
        <div className="overlay" onClick={() => setApplying(null)}>
          <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={sendApplication}>
            <div className="grabber" />
            <div>
              <h2 className="h2">Proposer ma collaboration</h2>
              <p className="muted" style={{ fontSize: '0.85rem' }}>« {applying.title} » — {applying.authorName}</p>
            </div>
            <div className="field">
              <label htmlFor="a-msg">Votre message</label>
              <textarea id="a-msg" className="input" rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="a-contact">Vos coordonnées (email, WhatsApp, Instagram)</label>
              <input id="a-contact" className="input" required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="vous@gmail.com" />
              <span className="faint">Visibles uniquement si votre proposition est acceptée.</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block" id="btn-send-application">Envoyer ma proposition</button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setApplying(null)}>Annuler</button>
          </form>
        </div>
      )}
    </div>
  );
}
