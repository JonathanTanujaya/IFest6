import { useState, Suspense } from 'react'
import Scene from './components/Scene'
import Popup from './components/Popup'

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
      
      {activeMenu && (
        <div className="ui-container interactive-ui">
          <Popup item={activeMenu} onClose={closePopup} />
        </div>
      )}
    </>
  )
}

export default App
