import React, { useState, useRef, useMemo } from 'react';
import { X, CreditCard } from 'lucide-react';
import { compressAndEncode } from '../utils/fileUtils';
import './MLPopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxeFFD1Uw06gFk14VwAlp6DUSd46MEdGAcEdBvuyejjIXiphoo1_JdnXOyhGy3Lauk-/exec';

const SUITS_ARR = ['♠', '♥', '♦', '♣'];

export default function MLPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Team info
  const [namaTim, setNamaTim] = useState('');

  // Kapten
  const [namaKapten, setNamaKapten] = useState('');
  const [nickIdKapten, setNickIdKapten] = useState('');
  const [waKapten, setWaKapten] = useState('');

  // Players 2–5
  const [players, setPlayers] = useState([
    { id: 2, nama: '', nickId: '' },
    { id: 3, nama: '', nickId: '' },
    { id: 4, nama: '', nickId: '' },
    { id: 5, nama: '', nickId: '' },
  ]);

  // Sub (optional, added via button)
  const [showCadangan, setShowCadangan] = useState(false);
  const [cadangan, setCadangan] = useState({ nama: '', nickId: '' });

  // Payment
  const [buktiBayar, setBuktiBayar] = useState(null);

  // Declarations
  const [decl1, setDecl1] = useState('');
  const [decl2, setDecl2] = useState('');
  const [decl3, setDecl3] = useState('');

  const popupRef = useRef(null);

  const suitsData = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      suit: ['♠', '♥', '♦', '♣', '🃏'][i % 5],
      left: Math.random() * 100,
      bottom: Math.random() * -200,
      duration: 18 + Math.random() * 20,
      delay: Math.random() * 15,
      color: i % 2 === 0 ? '#d4a93f' : '#a81528',
    }));
  }, []);

  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addCadangan = () => {
    setShowCadangan(true);
    setCadangan({ nama: '', nickId: '' });
  };

  const removeCadangan = () => {
    setShowCadangan(false);
    setCadangan({ nama: '', nickId: '' });
  };

  const [submitStatus, setSubmitStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errors = [];
    let valid = true;

    if (!namaTim.trim()) { errors.push('Nama Tim'); valid = false; }
    if (!namaKapten.trim()) { errors.push('Nama Kapten'); valid = false; }
    if (!nickIdKapten.trim()) { errors.push('Nickname & ID Kapten'); valid = false; }
    if (!waKapten.trim()) { errors.push('No. WA Kapten'); valid = false; }

    players.forEach((p) => {
      if (!p.nama.trim()) { errors.push(`Nama Pemain ${p.id}`); valid = false; }
      if (!p.nickId.trim()) { errors.push(`Nickname & ID Pemain ${p.id}`); valid = false; }
    });

    // Validate cadangan only if shown
    if (showCadangan) {
      if (!cadangan.nama.trim()) { errors.push('Nama Pemain Cadangan'); valid = false; }
      if (!cadangan.nickId.trim()) { errors.push('Nickname & ID Pemain Cadangan'); valid = false; }
    }

    if (!buktiBayar) { errors.push('Bukti Pembayaran'); valid = false; }
    if (!decl1 || !decl2 || !decl3) { errors.push('Pernyataan'); valid = false; }

    if (!valid) {
      setErrorMsg('Mohon lengkapi: ' + errors.join(', ') + '.');
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Mengompres file...');

    try {
      const bayarB64 = await compressAndEncode(buktiBayar);

      setSubmitStatus('Mengirim data...');

      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        formType: 'MLBB',
        namaTim: namaTim.trim(),
        namaKapten: namaKapten.trim(),
        nickIdKapten: nickIdKapten.trim(),
        waKapten: waKapten.trim(),
        namaCadangan: showCadangan ? cadangan.nama.trim() : '',
        nickIdCadangan: showCadangan ? cadangan.nickId.trim() : '',
        decl1, decl2, decl3,
        bayarName: buktiBayar.name,
        bayarB64,
      };

      players.forEach((p) => {
        payload[`nama_p${p.id}`] = p.nama.trim();
        payload[`nickId_p${p.id}`] = p.nickId.trim();
      });

      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });

      setIsSuccess(true);
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan: ' + err.message + '. Silakan coba lagi atau hubungi panitia.');
      setIsSubmitting(false);
      setSubmitStatus('');
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ── SUCCESS SCREEN ── */
  if (isSuccess) {
    return (
      <div className="ml-popup-overlay" onClick={onClose}>
        <div className="ml-popup-container ml-success-container" onClick={e => e.stopPropagation()}>
          <button className="ml-close-btn" onClick={onClose}><X size={20} /></button>
          <div className="ml-suits-bg">
            {suitsData.map((s, i) => (
              <div key={i} className="ml-suit" style={{
                left: `${s.left}%`, bottom: `${s.bottom}px`,
                animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color,
              }}>{s.suit}</div>
            ))}
          </div>
          <div className="ml-success-screen">
            <span className="ml-success-emoji">🏆</span>
            <h2 className="ml-success-title">Pendaftaran Berhasil!</h2>
            <p className="ml-success-sub">
              Terima kasih telah mendaftarkan tim Anda untuk Online Tournament Mobile Legends I-Fest 6.0 2026.<br />
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <div className="ml-divider-ornament">♠ ♥ ♦ ♣</div>
            <p className="ml-success-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
            <div style={{ marginTop: '28px' }}>
              <a href="https://wa.me/6281282003811" target="_blank" rel="noreferrer" className="ml-contact-btn" style={{ display: 'inline-flex' }}>
                📞 Grup WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN FORM ── */
  return (
    <div className="ml-popup-overlay" onClick={onClose}>
      <div className="ml-popup-container" onClick={e => e.stopPropagation()} ref={popupRef}>

        {/* Floating Suits Background */}
        <div className="ml-suits-bg">
          {suitsData.map((s, i) => (
            <div key={i} className="ml-suit" style={{
              left: `${s.left}%`, bottom: `${s.bottom}px`,
              animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color,
            }}>{s.suit}</div>
          ))}
        </div>

        <button className="ml-close-btn" onClick={onClose}><X size={20} /></button>

        {/* HEADER */}
        <div className="ml-header">
          <div className="ml-header-corner tl">♠</div>
          <div className="ml-header-corner tr">♥</div>
          <div className="ml-header-corner bl">♣</div>
          <div className="ml-header-corner br">♦</div>
          <p className="ml-header-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>
          <span className="ml-hat-icon">🎮</span>
          <h1>Online Tournament<br />Mobile Legends</h1>
          <h2>Formulir Pendaftaran I-Fest 6.0 — 2026</h2>
          <div className="ml-divider-ornament">♠ ♥ ♦ ♣</div>
        </div>

        {/* DESCRIPTION */}
        <div className="ml-description-card">
          <p className="ml-desc-text">
            Selamat datang di <strong style={{ color: 'var(--ml-text)' }}>Turnamen Online Mobile Legends: Bang Bang I-Fest 6.0 2026!</strong> 🎩♥️<br />
            Kompetisi yang diselenggarakan secara daring oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang. Kompetisi ini mempertemukan tim-tim E-Sports Mobile Legends dari berbagai daerah sebagai wadah untuk menunjukkan kemampuan terbaik sekaligus mempererat hubungan antar komunitas gamer.
          </p>

          <div className="ml-info-grid">
            <div className="ml-info-card">
              <span className="ml-ic-label">💰 HTM</span>
              <div className="ml-ic-value">
                Rp60.000,-<br />
                <small style={{ color: 'var(--ml-text-muted)' }}>BCA 0210999396<br />a.n. Yayasan Multi Data Palembang</small>
              </div>
            </div>
            <div className="ml-info-card">
              <span className="ml-ic-label">📑 Panduan</span>
              <div className="ml-ic-value">
                <a href="https://drive.google.com/file/d/1Gr0UwklNy1LcxyzupGwmqwsyFRXziMiX/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="ml-guidebook-btn">
                  📖 Guidebook I-Fest 6.0 2026 ↗
                </a>
              </div>
            </div>
          </div>

          <p className="ml-desc-text" style={{ textAlign: 'center', margin: '18px 0 18px' }}>
            💡 Siapkan Tim Terbaikmu dan Jadilah <strong style={{ color: 'var(--ml-gold)' }}>JUARA!</strong> 🏆🍷
          </p>

          <div className="ml-contact-row">
            <a href="https://wa.me/6281282003811" target="_blank" rel="noreferrer" className="ml-contact-btn">📞 Klaudius (WA)</a>
            <a href="https://wa.me/6281279968881" target="_blank" rel="noreferrer" className="ml-contact-btn">📞 Reizan (WA)</a>
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit}>

          {/* SECTION 1 */}
          <div className="ml-form-section">
            <div className="ml-section-header">
              <div className="ml-section-icon">🎮</div>
              <div className="ml-section-title-group">
                <span className="ml-section-number">Bagian I</span>
                <div className="ml-section-title">Informasi Tim &amp; Pemain</div>
              </div>
            </div>

            {/* Nama Tim */}
            <div className="ml-field">
              <div className="ml-field-label">Nama Tim <span className="req">*</span></div>
              <input className="ml-text-input" type="text" placeholder="Nama tim Anda…" required value={namaTim} onChange={e => setNamaTim(e.target.value)} />
            </div>

            {/* --- KAPTEN --- */}
            <div className="ml-player-card kapten">
              <div className="ml-player-header">
                <div className="ml-player-badge">
                  <span style={{ color: 'var(--ml-gold)', marginRight: '4px' }}>♛</span> Kapten Tim
                </div>
              </div>
              <div className="ml-player-grid">
                <div>
                  <div className="ml-member-field-label">Nama Kapten <span className="req">*</span></div>
                  <input className="ml-text-input" type="text" placeholder="Nama lengkap kapten…" required value={namaKapten} onChange={e => setNamaKapten(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
                </div>
                <div>
                  <div className="ml-member-field-label">No. WhatsApp Kapten <span className="req">*</span></div>
                  <input className="ml-text-input" type="tel" placeholder="08xxxxxxxxxx" required value={waKapten} onChange={e => setWaKapten(e.target.value.replace(/[^0-9]/g, ''))} />
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <div className="ml-member-field-label">Nickname &amp; ID Kapten <span className="req">*</span></div>
                <div className="ml-field-hint">Contoh: Pemain1234 (12345678)</div>
                <input className="ml-text-input" type="text" placeholder="Nickname (ID-nya)…" required value={nickIdKapten} onChange={e => setNickIdKapten(e.target.value)} />
              </div>
            </div>

            {/* --- PLAYERS 2–5 --- */}
            {players.map((p, index) => (
              <div key={p.id} className="ml-player-card">
                <div className="ml-player-header">
                  <div className="ml-player-badge">
                    <span style={{ color: 'var(--ml-red)', fontSize: '14px', marginRight: '4px' }}>{SUITS_ARR[(index + 1) % 4]}</span> Pemain {p.id}
                  </div>
                </div>
                <div className="ml-player-grid">
                  <div>
                    <div className="ml-member-field-label">Nama Pemain {p.id} <span className="req">*</span></div>
                    <input className="ml-text-input" type="text" placeholder={`Nama pemain ${p.id}…`} required value={p.nama} onChange={e => updatePlayer(p.id, 'nama', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
                  </div>
                  <div>
                    <div className="ml-member-field-label">Nickname &amp; ID Pemain {p.id} <span className="req">*</span></div>
                    <div className="ml-field-hint">Contoh: Pemain1234 (12345678)</div>
                    <input className="ml-text-input" type="text" placeholder="Nickname (ID-nya)…" required value={p.nickId} onChange={e => updatePlayer(p.id, 'nickId', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {/* --- CADANGAN (optional, via button) --- */}
            {showCadangan && (
              <div className="ml-player-card optional">
                <div className="ml-player-header">
                  <div className="ml-player-badge">
                    <span style={{ color: 'var(--ml-text-muted)', fontSize: '14px', marginRight: '4px' }}>✦</span> Pemain Cadangan
                    <span className="ml-badge" style={{ marginLeft: '8px' }}>· Opsional</span>
                  </div>
                  <button type="button" className="ml-member-remove" onClick={removeCadangan}>✕ Hapus</button>
                </div>
                <div className="ml-player-grid">
                  <div>
                    <div className="ml-member-field-label">Nama Pemain Cadangan <span className="req">*</span></div>
                    <input className="ml-text-input" type="text" placeholder="Nama cadangan…" required value={cadangan.nama} onChange={e => setCadangan({ ...cadangan, nama: e.target.value.replace(/[^a-zA-Z\s]/g, '') })} />
                  </div>
                  <div>
                    <div className="ml-member-field-label">Nickname &amp; ID Pemain Cadangan <span className="req">*</span></div>
                    <div className="ml-field-hint">Contoh: Pemain1234 (12345678)</div>
                    <input className="ml-text-input" type="text" placeholder="Nickname (ID-nya)…" required value={cadangan.nickId} onChange={e => setCadangan({ ...cadangan, nickId: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            <button type="button" className="ml-add-btn" onClick={addCadangan} disabled={showCadangan}>
              <span>♣</span> {showCadangan ? 'Pemain Cadangan Sudah Ditambahkan' : 'Tambah Pemain Cadangan'}
            </button>

            {/* --- BUKTI BAYAR --- */}
            <div className="ml-field" style={{ marginTop: '24px' }}>
              <div className="ml-field-label">Bukti Pembayaran <span className="req">*</span></div>
              <div className="ml-field-hint">
                Format Penamaan File: <strong style={{ color: 'var(--ml-gold-dim)' }}>TRANSFER-MLBB-NamaTim</strong><br />
                BCA 0210999396 a.n. Yayasan Multi Data Palembang
              </div>
              <div className="ml-file-drop">
                <input type="file" accept="image/*" required onChange={e => { if (e.target.files?.[0]) setBuktiBayar(e.target.files[0]); }} />
                <span className="ml-file-drop-icon"><CreditCard size={28} style={{ margin: '0 auto', display: 'block' }} /></span>
                <div className="ml-file-drop-text">Seret &amp; lepas bukti transfer di sini, atau <span>klik untuk memilih</span></div>
                {buktiBayar && <div className="ml-file-name-display">📎 {buktiBayar.name}</div>}
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="ml-form-section">
            <div className="ml-section-header">
              <div className="ml-section-icon">📜</div>
              <div className="ml-section-title-group">
                <span className="ml-section-number">Bagian II</span>
                <div className="ml-section-title">Pernyataan</div>
              </div>
            </div>

            <div className="ml-declaration-note">
              ⚠️ Mohon pastikan seluruh data sudah benar sebelum memilih <strong>'Setuju'</strong>. Anda masih dapat melakukan perbaikan data sebelum formulir dikirimkan.
            </div>

            {[
              {
                text: 'Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.',
                val: decl1, set: setDecl1,
              },
              {
                text: 'Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam Mobile Legends I-Fest 6.0 2026.',
                val: decl2, set: setDecl2,
              },
              {
                text: 'Jika saya melakukan pelanggaran terhadap peraturan yang berlaku, saya siap menerima sanksi yang diberikan, termasuk kemungkinan diskualifikasi dari kompetisi.',
                val: decl3, set: setDecl3,
              },
            ].map((decl, i) => (
              <div className="ml-decl-item" key={i}>
                <div className="ml-decl-text">{decl.text}</div>
                <div className="ml-decl-choices">
                  <div className="ml-decl-choice agree">
                    <input type="radio" name={`decl${i}`} id={`mdecl${i}y`} value="Setuju" required onChange={e => decl.set(e.target.value)} />
                    <label className="ml-decl-choice-label" htmlFor={`mdecl${i}y`}>✓ Setuju</label>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT */}
          <div className="ml-submit-section">
            {errorMsg && <div className="ml-alert error">{errorMsg}</div>}
            <div className="ml-submit-divider">✦ Siap Bertanding ✦</div>
            <button type="submit" className="ml-submit-btn" disabled={isSubmitting}>
              {!isSubmitting
                ? <span>🎮 Kirim Pendaftaran</span>
                : <div className="ml-loader-ring"></div>}
            </button>
            {isSubmitting && submitStatus && <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--ml-text-muted)', fontStyle: 'italic' }}>{submitStatus}</p>}
            <p style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--ml-text-muted)', fontStyle: 'italic' }}>
              Dengan mengirimkan formulir ini, Anda menyetujui seluruh ketentuan yang berlaku.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}