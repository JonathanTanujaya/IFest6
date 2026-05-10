import React, { useState, useEffect, useMemo, useRef } from 'react';
import './AnnouncementPopup.css';

// Target date: 31 May 2026, 13:00 WIB (UTC+7)
const TARGET_DATE = new Date('2026-05-31T13:00:00+07:00');
const SUITS_ARR = ['♠', '♥', '♦', '♣', '🃏'];

function getTimeRemaining() {
  const now = new Date();
  const diff = TARGET_DATE - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function AnnouncementPopup({ onClose }) {
  const [countdown, setCountdown] = useState(getTimeRemaining);
  const [isClosing, setIsClosing] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setCountdown(getTimeRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 350);
  };

  const suitsData = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      suit: SUITS_ARR[i % 5],
      left: Math.random() * 100,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 15,
      color: i % 2 === 0 ? '#e2b953' : '#c91834',
    }));
  }, []);

  return (
    <div className={`ann-popup-overlay${isClosing ? ' ann-overlay-closing' : ''}`} onClick={handleClose}>
      <div className={`ann-popup-container flexible${isClosing ? ' ann-closing' : ''}`} ref={popupRef}>
        
        <div className="ann-suits-bg">
          {suitsData.map((s, i) => (
            <div key={i} className="ann-suit" style={{ left: `${s.left}%`, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color }}>{s.suit}</div>
          ))}
        </div>

        <div className="ann-flex-content">
          <div className="ann-flex-header">
            <div className="ann-maskot-wrap flex-maskot">
              <img src="/Compress/maskot.webp" alt="Maskot" />
            </div>
            <div className="ann-header-titles flex-titles">
              <span className="ann-hook-badge">🎪 Puncak Acara</span>
              <h1 className="ann-title flex-title">Hari Puncak I-Fest 6.0</h1>
              <h2 className="ann-subtitle flex-subtitle">✦ Convergence of the Realms ✦</h2>
            </div>
          </div>

          <div className="ann-flex-banner">
            <img src="/Compress/maskot.webp" alt="Banner" className="ann-flex-banner-img" />
            <div className="ann-flex-banner-overlay">✧ MAIN EVENT ✧</div>
          </div>

          <div className="ann-flex-info">
            <div className="ann-flex-chip">
              <span className="ann-flex-emoji">📅</span>
              <div>
                <span className="ann-flex-lbl">Tanggal</span>
                <span className="ann-flex-val">Sabtu, 31 Mei 2026</span>
              </div>
            </div>
            <div className="ann-flex-chip">
              <span className="ann-flex-emoji">⏰</span>
              <div>
                <span className="ann-flex-lbl">Waktu</span>
                <span className="ann-flex-val">13:00 WIB</span>
              </div>
            </div>
            <div className="ann-flex-chip">
              <span className="ann-flex-emoji">📍</span>
              <div>
                <span className="ann-flex-lbl">Lokasi</span>
                <span className="ann-flex-val">Palembang Icon Mall</span>
              </div>
            </div>
          </div>

          <div className="ann-flex-cd">
            <div className="ann-flex-cd-label">✧ Menuju Hari Puncak ✧</div>
            <div className="ann-cd-row">
              {[
                { val: countdown.days, lbl: 'Hari' },
                { val: countdown.hours, lbl: 'Jam' },
                { val: countdown.minutes, lbl: 'Menit' },
                { val: countdown.seconds, lbl: 'Detik' },
              ].map((u, i) => (
                <div key={i} className="ann-cd-item-wrap" style={{ gap: '8px' }}>
                  {i > 0 && <span className="ann-cd-sep flex-cd-sep">:</span>}
                  <div className="ann-cd-item flex-cd-item">
                    <span className="ann-cd-num flex-cd-num">{String(u.val).padStart(2, '0')}</span>
                    <span className="ann-cd-txt flex-cd-txt">{u.lbl}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
