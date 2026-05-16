import { useState, useMemo } from 'react';
import './ClosedPopup.css';
import { getDeadlineLabel } from '../utils/registrationDeadlines';

const SUITS_ARR = ['♠', '♥', '♦', '♣'];

/**
 * ClosedPopup
 * Shown when a user clicks a competition card whose registration has closed.
 * Click anywhere to dismiss (same UX as AnnouncementPopup).
 *
 * Props:
 *  - item    : { id, title }   — the competition menu item
 *  - onClose : () => void
 */
export default function ClosedPopup({ item, onClose }) {
  const deadlineLabel = getDeadlineLabel(item.id);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 350);
  };

  // Decorative floating suits
  const suitsData = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      suit: SUITS_ARR[i % 4],
      left: Math.random() * 100,
      duration: 12 + Math.random() * 20,
      delay: Math.random() * 12,
    }));
  }, []);

  return (
    <div
      className={`closed-popup-overlay${isClosing ? ' closed-overlay-closing' : ''}`}
      onClick={handleClose}
    >
      <div className={`closed-popup-container${isClosing ? ' closed-closing' : ''}`}>

        {/* Decorative glow layers */}
        <div className="closed-popup-glow" aria-hidden="true" />

        {/* Floating card suits */}
        <div className="closed-popup-suits" aria-hidden="true">
          {suitsData.map((s, i) => (
            <span
              key={i}
              className="closed-suit"
              style={{
                left: `${s.left}%`,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
              }}
            >
              {s.suit}
            </span>
          ))}
        </div>

        {/* Main content */}
        <div className="closed-popup-body">

          {/* Lock icon */}
          <div className="closed-icon-ring" aria-hidden="true">🔒</div>

          {/* Status badge */}
          <div className="closed-badge">Pendaftaran Ditutup</div>

          {/* Heading */}
          <div className="closed-title">Pendaftaran Telah Berakhir</div>

          {/* Competition name */}
          <div className="closed-comp-name">{item.title}</div>

          {/* Divider */}
          <div className="closed-ornament">◆</div>

          {/* Info card */}
          <div className="closed-info-card">
            <div className="closed-info-row">
              <span className="closed-info-label">Lomba</span>
              <span className="closed-info-value">{item.title}</span>
            </div>
            <div className="closed-info-sep" />
            <div className="closed-info-row">
              <span className="closed-info-label">Batas Pendaftaran</span>
              <span className="closed-info-value">{deadlineLabel}</span>
            </div>
            <div className="closed-info-sep" />
            <div className="closed-info-row">
              <span className="closed-info-label">Status</span>
              <span className="closed-info-value red">✕ Sudah Ditutup</span>
            </div>
          </div>



          {/* Hint */}
          <div className="closed-tap-hint">Ketuk di mana saja untuk menutup</div>

        </div>
      </div>
    </div>
  );
}
