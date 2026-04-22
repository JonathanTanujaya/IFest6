import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import './ComingSoonPopup.css';

// Competition metadata for coming-soon items
const COMP_META = {
  poster: {
    emoji: '🎨',
    name: 'Poster Digital Competition',
    desc: 'Kompetisi desain poster digital yang akan menguji kreativitas visualmu. Ubah kanvas kosong menjadi karya penuh makna.',
  },
  machine: {
    emoji: '🤖',
    name: 'Machine Learning Competition',
    desc: 'Ubah data menjadi wawasan, prediksi, dan keajaiban. Tunjukkan kecerdasan algoritmikmu dan ciptakan solusi masa depan yang cerdas!',
  },
  compe: {
    emoji: '💻',
    name: 'Competitive Programming',
    desc: 'Tantang dirimu dalam kompetisi coding yang menguji logika, efisiensi, dan kecepatan pemecahan masalah. Buktikan bahwa kamu adalah programmer terbaik!',
  },
};

export default function ComingSoonPopup({ compId, onClose }) {
  const meta = COMP_META[compId] || {
    emoji: '✨',
    name: 'Competition',
    desc: 'Kompetisi ini akan segera hadir. Stay tuned!',
  };

  // Floating shapes data
  const shapesData = useMemo(() =>
    Array.from({ length: 14 }).map((_, i) => ({
      symbol: ['◇', '△', '○', '□', '✦', '⬡', '◈', '⟡'][i % 8],
      left: Math.random() * 100,
      bottom: Math.random() * -150,
      duration: 16 + Math.random() * 20,
      delay: Math.random() * 16,
    })), []);

  // Sparkle particles
  const sparkles = useMemo(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      left: 20 + Math.random() * 60,
      top: 15 + Math.random() * 70,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 4,
      size: 2 + Math.random() * 3,
    })), []);

  return (
    <div className="cs-popup-overlay" onClick={onClose}>
      <div className="cs-popup-container" onClick={e => e.stopPropagation()}>

        {/* Floating Shapes Background */}
        <div className="cs-shapes-bg">
          {shapesData.map((s, i) => (
            <div key={i} className="cs-shape" style={{
              left: `${s.left}%`, bottom: `${s.bottom}px`,
              animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
            }}>{s.symbol}</div>
          ))}
        </div>

        {/* Sparkle particles */}
        {sparkles.map((sp, i) => (
          <div key={`sp-${i}`} className="cs-sparkle" style={{
            left: `${sp.left}%`, top: `${sp.top}%`,
            width: `${sp.size}px`, height: `${sp.size}px`,
            animationDuration: `${sp.duration}s`,
            animationDelay: `${sp.delay}s`,
          }} />
        ))}

        <button className="cs-close-btn" onClick={onClose}><X size={20} /></button>

        <div className="cs-content">
          {/* Animated Icon */}
          <div className="cs-icon-wrapper">
            <div className="cs-icon-ring" />
            <div className="cs-icon-ring-inner" />
            <div className="cs-icon-emoji">{meta.emoji}</div>
          </div>

          <p className="cs-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>

          <h1 className="cs-title">Coming Soon</h1>

          <p className="cs-comp-name">{meta.name}</p>

          <div className="cs-divider">◇ △ ○ □</div>

          <p className="cs-description">{meta.desc}</p>

          {/* Animated loading dots */}
          <div className="cs-countdown">
            <div className="cs-dot" />
            <div className="cs-dot" />
            <div className="cs-dot" />
          </div>

          {/* Info Card */}
          <div className="cs-info-card">
            <div className="cs-info-label">📢 Informasi</div>
            <p className="cs-info-text">
              Pendaftaran untuk kompetisi ini akan segera dibuka. Pantau terus media sosial kami untuk mendapatkan update terbaru!
            </p>
          </div>

          {/* Contact */}
          <div className="cs-contact-row">
            <a href="https://www.instagram.com/ifest_umdp/" target="_blank" rel="noreferrer" className="cs-contact-btn">📱 Instagram IFest</a>
          </div>

          <p className="cs-footer-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
        </div>
      </div>
    </div>
  );
}
