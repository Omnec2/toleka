import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle } from 'lucide-react';
import { isStandalone, isIos, promptInstallApp, subscribeInstallPrompt } from '../lib/pwa';

export default function InstallPwaBanner() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('toleka_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const unsub = subscribeInstallPrompt((available) => {
      setCanInstall(available);
    });

    return () => unsub();
  }, []);

  if (installed || dismissed) return null;

  const handleInstallClick = async () => {
    if (isIos()) {
      setShowIosGuide(true);
      return;
    }

    if (canInstall) {
      const accepted = await promptInstallApp();
      if (accepted) {
        setInstalled(true);
      }
    } else {
      // Pour les navigateurs de bureau ou autres qui nécessitent le menu
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('toleka_pwa_dismissed', 'true');
    } catch {}
  };

  return (
    <>
      <div 
        className="glass" 
        style={{
          margin: '0 0 16px 0',
          padding: '12px 14px',
          borderRadius: 'var(--r-md)',
          border: '1px solid rgba(245, 165, 36, 0.35)',
          background: 'linear-gradient(135deg, rgba(245, 165, 36, 0.12), rgba(9, 10, 12, 0.85))',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          animation: 'fadeUp 0.3s ease-out'
        }}
      >
        <div 
          style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '10px', 
            background: 'var(--grad-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#090A0C',
            flexShrink: 0,
            boxShadow: '0 2px 10px rgba(245, 165, 36, 0.4)'
          }}
        >
          <Download size={20} strokeWidth={2.4} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <b style={{ fontSize: '0.86rem', color: 'var(--text)' }}>Installer l'app Toleka</b>
            <span className="chip chip-brand" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>PWA</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-2)', display: 'block' }}>
            Accès instantané, hors-ligne et plein écran.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleInstallClick}
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.78rem',
              fontWeight: 700,
              gap: '5px' 
            }}
          >
            <Download size={13} />
            <span>Installer</span>
          </button>

          <button 
            type="button"
            onClick={handleDismiss} 
            title="Masquer"
            aria-label="Masquer l'invitation"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-3)', 
              padding: '6px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Guide d'installation Safari iOS ou Desktop */}
      {showIosGuide && (
        <div className="overlay" onClick={() => setShowIosGuide(false)} role="dialog" aria-modal="true">
          <div className="sheet glass" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: '24px' }}>
            <div className="grabber" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    background: 'var(--grad-primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#090A0C'
                  }}
                >
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="h3" style={{ margin: 0 }}>Installer sur votre appareil</h3>
                  <span className="muted" style={{ fontSize: '0.78rem' }}>Pour une expérience optimale plein écran</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-icon-nav" 
                onClick={() => setShowIosGuide(false)}
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
              <div className="glass" style={{ padding: '12px', borderRadius: 'var(--r-sm)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center' }}>
                  <Share size={22} />
                </div>
                <div style={{ fontSize: '0.84rem' }}>
                  <b>1. Sur iPhone / Safari :</b> Appuyez sur le bouton <b>Partager</b> dans la barre de navigation.
                </div>
              </div>

              <div className="glass" style={{ padding: '12px', borderRadius: 'var(--r-sm)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center' }}>
                  <PlusSquare size={22} />
                </div>
                <div style={{ fontSize: '0.84rem' }}>
                  <b>2. Ajouter à l'écran d'accueil :</b> Faites défiler vers le bas et sélectionnez <b>« Sur l'écran d'accueil »</b>.
                </div>
              </div>

              <div className="glass" style={{ padding: '12px', borderRadius: 'var(--r-sm)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ color: 'var(--ok)', display: 'flex', alignItems: 'center' }}>
                  <CheckCircle size={22} />
                </div>
                <div style={{ fontSize: '0.84rem' }}>
                  <b>3. Valider :</b> Appuyez sur <b>Ajouter</b>. L'icône Toleka apparaîtra sur votre écran comme une vraie application !
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-block"
              onClick={() => setShowIosGuide(false)}
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
