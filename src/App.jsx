import { useState, Suspense } from 'react'
import Scene from './components/Scene'
import Popup from './components/Popup'
import AboutPopup from './components/AboutPopup'

function App() {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuClick = (menuItem) => {
    setActiveMenu(menuItem);
  };

  const closePopup = () => {
    setActiveMenu(null);
  };

  return (
    <>
      <div className="canvas-container">
        <Suspense fallback={<div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading 3D Environment...</div>}>
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
          <span className="frame-hint">✧ Geser layar untuk mengeksplorasi ✧ Klik orbit untuk info kompetisi ✧</span>
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
          ) : (
            <Popup item={activeMenu} onClose={closePopup} />
          )}
        </div>
      )}
    </>
  )
}

export default App
