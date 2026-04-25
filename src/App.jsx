import { useState, Suspense, useEffect } from 'react'
import Scene from './components/Scene'
import Popup from './components/Popup'
import AboutPopup from './components/AboutPopup'
import BandPopup from './components/BandPopup'
import MLPopup from './components/MLPopup'
import KPOPPopup from './components/KPOPPopup'
import UIXPopup from './components/UIXPopup'
import CompePopup from './components/CompePopup'
import PDPopup from './components/PDPopup'
import MachinePopup from './components/MachinePopup'

// Map of valid ?form= values to their menu item objects
const FORM_MAP = {
  'uix-design': { id: 'uiux', title: 'UI/UX Design' },
  'poster-digital': { id: 'poster', title: 'Poster Digital' },
  'turnamen-mobile-legend': { id: 'ml', title: 'Mobile Legends' },
  'kpop-dance-cover': { id: 'kpop', title: 'K-Pop Dance Cover' },
  'band-competition': { id: 'band', title: 'Band Competition' },
  'machine-learning': { id: 'machine', title: 'Machine Learning Competition' },
  'competitive-programming': { id: 'compe', title: 'Competitive Programming' },
};

function App() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Redirect unknown paths (e.g. /random) back to homepage
  useEffect(() => {
    if (window.location.pathname !== '/') {
      // Preserve query string (e.g. ?form=band) if present
      const search = window.location.search;
      window.history.replaceState({}, '', '/' + search);
    }
  }, []);

  // Fade out loading screen after scene mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Deep-link: auto-open popup from ?form= query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formKey = params.get('form')?.toLowerCase();
    if (!formKey) {
      return;
    }

    if (!FORM_MAP[formKey]) {
      // Unknown/typo form key: clean query and stay on homepage.
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (FORM_MAP[formKey]) {
      // Wait for loading screen to fade, then open the popup
      const timer = setTimeout(() => {
        setActiveMenu(FORM_MAP[formKey]);
        // Clean URL so refresh doesn't re-trigger
        window.history.replaceState({}, '', window.location.pathname);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleMenuClick = (menuItem) => {
    setActiveMenu(menuItem);
  };

  const closePopup = () => {
    setActiveMenu(null);
  };

  return (
    <>
      {/* Loading screen */}
      <div className={`loading-screen ${isLoaded ? 'loaded' : ''}`}>
        <div className="loading-bg-elements">
          <div className="loading-star s1">✦</div>
          <div className="loading-star s2">✦</div>
          <div className="loading-star s3">✦</div>
          <div className="loading-star s4">✦</div>
          <div className="loading-star s5">✦</div>
        </div>
        <div className="loading-content">
          <div className="magic-circle">
            <div className="inner-circle"></div>
            <div className="suit-spinner">
              <span style={{ '--i': 1 }}>♠</span>
              <span style={{ '--i': 2 }}>♥</span>
              <span style={{ '--i': 3 }}>♦</span>
              <span style={{ '--i': 4 }}>♣</span>
            </div>
          </div>
          <div className="loading-title">I-Fest 6.0</div>
          <div className="loading-subtitle">CTRL: Convergence of the Realms</div>
          <div className="loading-bar-container">
            <div className="loading-bar"></div>
          </div>
          <div className="loading-hint">Memasuki Dunia Ajaib...</div>
        </div>
      </div>

      {/* 3D panorama canvas */}
      <div className="canvas-container">
        <Suspense fallback={null}>
          <Scene onMenuClick={handleMenuClick} />
        </Suspense>
      </div>

      {/* Decorative border frame — does not block interaction */}
      <div className="border-frame" aria-hidden="true">
        {/* Corner ornaments */}
        <div className="corner corner-tl">✦</div>
        <div className="corner corner-tr">✦</div>
        <div className="corner corner-bl">✦</div>
        <div className="corner corner-br">✦</div>

        {/* Top edge text */}
        <div className="frame-label frame-top">
          <span className="frame-title">I-Fest 6.0</span>
          <span className="frame-divider">◆</span>
          <span className="frame-subtitle">CTRL: Convergence of the Realms</span>
        </div>

        {/* Bottom edge text */}
        <div className="frame-label frame-bottom">
          <span className="frame-hint">✧ Geser layar untuk mengeksplorasi 360° ✧</span>
        </div>

        {/* Left edge text */}
        <div className="frame-label frame-left">
          <span>INFORMATICS FESTIVAL</span>
        </div>

        {/* Right edge text */}
        <div className="frame-label frame-right">
          <span>2026</span>
        </div>
      </div>

      {activeMenu && (
        <div className="ui-container interactive-ui">
          {activeMenu.id === 'about' ? (
            <AboutPopup item={activeMenu} onClose={closePopup} />
          ) : activeMenu.id === 'band' ? (
            <BandPopup onClose={closePopup} />
          ) : activeMenu.id === 'ml' ? (
            <MLPopup onClose={closePopup} />
          ) : activeMenu.id === 'kpop' ? (
            <KPOPPopup onClose={closePopup} />
          ) : activeMenu.id === 'uiux' ? (
            <UIXPopup onClose={closePopup} />
          ) : activeMenu.id === 'compe' ? (
            <CompePopup onClose={closePopup} />
          ) : activeMenu.id === 'poster' ? (
            <PDPopup onClose={closePopup} />
          ) : activeMenu.id === 'machine' ? (
            <MachinePopup onClose={closePopup} />
          ) : (
            <Popup item={activeMenu} onClose={closePopup} />
          )}
        </div>
      )}
    </>
  )
}

export default App
