import { X } from 'lucide-react';

// Alice in Wonderland themed SVG icons
const WonderlandIcons = {
  potion: (
    <svg viewBox="0 0 64 64" className="wonderland-icon" aria-hidden="true">
      <defs>
        <linearGradient id="potionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path d="M26 8h12v6h-12z" fill="#94a3b8" />
      <path d="M24 14h16l4 10v24c0 4-4 8-12 8s-12-4-12-8V24z" fill="url(#potionGrad)" opacity="0.9" />
      <ellipse cx="32" cy="40" rx="8" ry="4" fill="#e9d5ff" opacity="0.5" />
      <circle cx="28" cy="34" r="2" fill="#fbbf24" opacity="0.8">
        <animate attributeName="cy" values="34;30;34" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="35" cy="38" r="1.5" fill="#fbbf24" opacity="0.6">
        <animate attributeName="cy" values="38;32;38" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <text x="28" y="26" fontSize="8" fill="white" fontFamily="serif">🏷️</text>
      <text x="24" y="20" fontSize="6" fill="white" fontStyle="italic" fontFamily="serif">drink me</text>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 64 64" className="wonderland-icon" aria-hidden="true">
      <defs>
        <linearGradient id="clockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="36" r="22" fill="url(#clockGrad)" />
      <circle cx="32" cy="36" r="18" fill="#1e293b" />
      <circle cx="32" cy="36" r="16" fill="none" stroke="#fbbf24" strokeWidth="0.5" />
      {/* Clock markings */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 32 + 14 * Math.cos(angle);
        const y1 = 36 + 14 * Math.sin(angle);
        const x2 = 32 + 16 * Math.cos(angle);
        const y2 = 36 + 16 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="1.5" />;
      })}
      {/* Hour hand */}
      <line x1="32" y1="36" x2="32" y2="24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 32 36" to="360 32 36" dur="60s" repeatCount="indefinite" />
      </line>
      {/* Minute hand */}
      <line x1="32" y1="36" x2="38" y2="28" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 32 36" to="360 32 36" dur="10s" repeatCount="indefinite" />
      </line>
      <circle cx="32" cy="36" r="2" fill="#fbbf24" />
      {/* Chain */}
      <path d="M32 14 Q28 8 32 4 Q36 8 32 14" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
    </svg>
  ),
  cards: (
    <svg viewBox="0 0 64 64" className="wonderland-icon" aria-hidden="true">
      <defs>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
      </defs>
      {/* Back card */}
      <rect x="18" y="10" width="24" height="36" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" transform="rotate(-15 30 28)" />
      {/* Front card */}
      <rect x="22" y="12" width="24" height="36" rx="3" fill="white" stroke="#e2e8f0" strokeWidth="1" transform="rotate(5 34 30)" />
      {/* Heart symbol */}
      <path d="M34 24 C34 20 40 20 40 25 C40 30 34 35 34 35 C34 35 28 30 28 25 C28 20 34 20 34 24Z" fill="url(#cardGrad)" transform="rotate(5 34 30)" />
      {/* Floating sparkles */}
      <circle cx="48" cy="14" r="1" fill="#fbbf24">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="14" cy="42" r="1.2" fill="#c084fc">
        <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  ),
  key: (
    <svg viewBox="0 0 64 64" className="wonderland-icon" aria-hidden="true">
      <defs>
        <linearGradient id="keyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* Key handle (ornate circle) */}
      <circle cx="20" cy="22" r="10" fill="none" stroke="url(#keyGrad)" strokeWidth="3" />
      <circle cx="20" cy="22" r="5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      {/* Key shaft */}
      <rect x="30" y="20" width="24" height="4" rx="1" fill="url(#keyGrad)" />
      {/* Key teeth */}
      <rect x="48" y="24" width="3" height="6" rx="1" fill="#fbbf24" />
      <rect x="42" y="24" width="3" height="8" rx="1" fill="#fbbf24" />
      <rect x="36" y="24" width="3" height="5" rx="1" fill="#fbbf24" />
      {/* Sparkle */}
      <circle cx="20" cy="22" r="2" fill="#fef3c7">
        <animate attributeName="r" values="1;2.5;1" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  ),
  mushroom: (
    <svg viewBox="0 0 64 64" className="wonderland-icon" aria-hidden="true">
      <defs>
        <linearGradient id="mushGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
      </defs>
      {/* Mushroom cap */}
      <ellipse cx="32" cy="28" rx="20" ry="14" fill="url(#mushGrad)" />
      {/* Spots */}
      <circle cx="24" cy="22" r="4" fill="white" opacity="0.8" />
      <circle cx="36" cy="18" r="3" fill="white" opacity="0.8" />
      <circle cx="40" cy="28" r="2.5" fill="white" opacity="0.7" />
      <circle cx="28" cy="30" r="2" fill="white" opacity="0.6" />
      {/* Stem */}
      <path d="M26 28 Q26 42 24 50 L40 50 Q38 42 38 28" fill="#fef3c7" />
      {/* Grass */}
      <path d="M16 50 Q20 44 24 50 Q28 44 32 50 Q36 44 40 50 Q44 44 48 50" fill="none" stroke="#22c55e" strokeWidth="2" />
    </svg>
  ),
  teacup: (
    <svg viewBox="0 0 64 64" className="wonderland-icon" aria-hidden="true">
      <defs>
        <linearGradient id="teaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      {/* Cup body */}
      <path d="M12 22 L16 50 Q16 54 32 54 Q48 54 48 50 L52 22Z" fill="url(#teaGrad)" />
      {/* Tea liquid */}
      <ellipse cx="32" cy="26" rx="18" ry="4" fill="#92400e" opacity="0.6" />
      {/* Handle */}
      <path d="M52 28 Q62 28 62 38 Q62 46 52 46" fill="none" stroke="#c084fc" strokeWidth="3" />
      {/* Steam */}
      <path d="M24 18 Q22 12 26 8" fill="none" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M32 16 Q30 10 34 6" fill="none" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.4">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
      </path>
      <path d="M40 18 Q38 12 42 8" fill="none" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.8s" repeatCount="indefinite" />
      </path>
    </svg>
  ),
};

const aboutFeatures = [
  {
    icon: 'potion',
    title: 'Transformasi Digital',
    desc: 'Seperti ramuan ajaib yang mengubah segalanya, IFest 6.0 menghadirkan pengalaman digital yang transformatif.',
  },
  {
    icon: 'clock',
    title: 'Waktu yang Tepat',
    desc: 'Seperti jam saku White Rabbit, jangan sampai terlambat! Amankan tempatmu di festival kreativitas ini.',
  },
  {
    icon: 'cards',
    title: '6 Kompetisi',
    desc: 'Dari UI/UX hingga Band, pilih kartumu dan tunjukkan keahlianmu di arena yang kamu kuasai.',
  },
  {
    icon: 'key',
    title: 'Buka Potensimu',
    desc: 'Setiap peserta memiliki kunci unik. IFest 6.0 adalah pintu menuju kesempatan tanpa batas.',
  },
  {
    icon: 'mushroom',
    title: 'Tumbuh & Berkembang',
    desc: 'Seperti jamur ajaib Wonderland, setiap pengalaman di sini akan membuat skill-mu bertumbuh pesat.',
  },
  {
    icon: 'teacup',
    title: 'Tea Party Kreatif',
    desc: 'Bergabunglah dalam pesta kreativitas bersama ratusan peserta berbakat dari seluruh Indonesia.',
  },
];

export default function AboutPopup({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="popup-overlay about-overlay" onClick={onClose}>
      <div
        className="about-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating decorative elements */}
        <div className="wonderland-bg-decor" aria-hidden="true">
          <div className="floating-card card-1">♠</div>
          <div className="floating-card card-2">♥</div>
          <div className="floating-card card-3">♦</div>
          <div className="floating-card card-4">♣</div>
          <div className="floating-star star-1">✦</div>
          <div className="floating-star star-2">✧</div>
          <div className="floating-star star-3">✦</div>
        </div>

        <button className="close-button about-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header */}
        <div className="about-header">
          <div className="about-crown" aria-hidden="true">👑</div>
          <h2 className="about-title">About IFest 6.0</h2>
          <p className="about-tagline">✦ REWIND: THE MAGIC RETURNS ✦</p>
          <div className="about-divider" aria-hidden="true">
            <span>♠</span>
            <span>♥</span>
            <span>♦</span>
            <span>♣</span>
          </div>
        </div>

        {/* Main Description */}
        <div className="about-description">
          <p>
            Di IFest 6.0, kami membawa tema <em>"REWIND: THE MAGIC RETURNS"</em> — 
            terinspirasi dari dunia ajaib Alice in Wonderland. Seperti Alice yang menemukan 
            dunia penuh keajaiban di balik lubang kelinci, IFest 6.0 mengajakmu 
            menjelajahi dunia kreativitas dan teknologi tanpa batas.
          </p>
          <p className="about-quote">
            "Setiap dari kamu memiliki <strong>sihir untuk bersinar</strong>."
          </p>
        </div>

        {/* Feature Grid */}
        <div className="about-features-grid">
          {aboutFeatures.map((feature, index) => (
            <div
              className="about-feature-card"
              key={index}
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="feature-icon-wrapper">
                {WonderlandIcons[feature.icon]}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          className="about-cta"
          style={{ backgroundColor: item.color }}
        >
          ✨ Mulai Petualanganmu
        </button>
      </div>
    </div>
  );
}
