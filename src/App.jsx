import { useState, Suspense, useEffect } from 'react'
import Scene from './components/Scene'
import Popup from './components/Popup'
import AboutPopup from './components/AboutPopup'
import BandPopup from './components/BandPopup'
import MLPopup from './components/MLPopup'

function App() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fade out loading screen after scene mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 2500);
    return () => clearTimeout(timer);
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
              <span style={{'--i': 1}}>♠</span>
              <span style={{'--i': 2}}>♥</span>
              <span style={{'--i': 3}}>♦</span>
              <span style={{'--i': 4}}>♣</span>
            </div>
          </div>
          <div className="loading-title">IFest 6.0</div>
          <div className="loading-subtitle">REWIND: THE MAGIC RETURNS</div>
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
          <span className="frame-title">IFest 6.0</span>
          <span className="frame-divider">◆</span>
          <span className="frame-subtitle">REWIND: THE MAGIC RETURNS</span>
        </div>

        {/* Bottom edge text */}
        <div className="frame-label frame-bottom">
          <span className="frame-hint">✧ Geser layar untuk mengeksplorasi 360° ✧ Klik orbit untuk info kompetisi ✧</span>
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
          ) : (
            <Popup item={activeMenu} onClose={closePopup} />
          )}
        </div>
      )}
    </>
  )
}

export default App
