import React, { useState, useRef, useMemo } from 'react';
import { X, Upload } from 'lucide-react';
import { compressAndEncode } from '../utils/fileUtils';
import './KPOPPopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTxpkL4Vp1Yz8a_M_SVwAK8NbEYGTifMzym9tdMC_heMDlEu7Kx_fj27yfX1n9tsJB/exec';

const NOTES = ['🎵', '🎶', '💃', '🎤', '✨', '🌸', '⭐', '💫', '🎧', '🌟'];
const MAX_PLAYERS = 6;
const REQ_PLAYERS = 3;

const EMPTY_PLAYER = (id) => ({ id, nama: '', gender: '', wa: '', email: '' });

export default function KPopPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Team info
  const [namaTim, setNamaTim] = useState('');
  const [asalInstansi, setAsalInstansi] = useState('');

  // Players: 1–3 required, 4–6 added by user on demand
  const [players, setPlayers] = useState(
    Array.from({ length: REQ_PLAYERS }, (_, i) => EMPTY_PLAYER(i + 1))
  );

  // Payment
  const [buktiBayar, setBuktiBayar] = useState(null);

  // Declarations
  const [decl1, setDecl1] = useState('');
  const [decl2, setDecl2] = useState('');
  const [decl3, setDecl3] = useState('');

  const popupRef = useRef(null);

  const notesData = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      symbol: NOTES[i % NOTES.length],
      left: Math.random() * 100,
      bottom: Math.random() * -200,
      duration: 18 + Math.random() * 22,
      delay: Math.random() * 18,
    })), []);

  const updatePlayer = (id, field, value) =>
    setPlayers(players.map(p => (p.id === id ? { ...p, [field]: value } : p)));

  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, EMPTY_PLAYER(Date.now())]);
    }
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const [submitStatus, setSubmitStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errors = [];
    let valid = true;

    if (!namaTim.trim()) { errors.push('Nama Tim'); valid = false; }
    if (!asalInstansi.trim()) { errors.push('Asal Instansi'); valid = false; }

    // All players in the list must be fully filled (optional ones are added intentionally)
    players.forEach((p, i) => {
      const label = `Peserta ${i + 1}`;
      if (!p.nama.trim()) { errors.push(`Nama ${label}`); valid = false; }
      if (!p.gender) { errors.push(`Gender ${label}`); valid = false; }
      if (!p.wa.trim()) { errors.push(`No. WA ${label}`); valid = false; }
      if (!p.email.trim()) { errors.push(`Email ${label}`); valid = false; }
    });

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
        formType: 'KPOP_DC',
        namaTim: namaTim.trim(),
        asalInstansi: asalInstansi.trim(),
        decl1, decl2, decl3,
        bayarName: buktiBayar.name,
        bayarB64,
      };

      players.forEach((p, i) => {
        const idx = i + 1;
        payload[`nama_p${idx}`] = p.nama.trim();
        payload[`gender_p${idx}`] = p.gender;
        payload[`wa_p${idx}`] = p.wa.trim();
        payload[`email_p${idx}`] = p.email.trim();
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
      <div className="kp-popup-overlay" onClick={onClose}>
        <div className="kp-popup-container kp-success-container" onClick={e => e.stopPropagation()}>
          <button className="kp-close-btn" onClick={onClose}><X size={20} /></button>
          <div className="kp-notes-bg">
            {notesData.map((n, i) => (
              <div key={i} className="kp-note" style={{
                left: `${n.left}%`, bottom: `${n.bottom}px`,
                animationDuration: `${n.duration}s`, animationDelay: `${n.delay}s`,
              }}>{n.symbol}</div>
            ))}
          </div>
          <div className="kp-success-screen">
            <span className="kp-success-emoji">🏆</span>
            <h2 className="kp-success-title">Pendaftaran Berhasil!</h2>
            <p className="kp-success-sub">
              Terima kasih telah mendaftarkan tim Anda untuk K-Pop Dance Cover I-Fest 6.0 2026.<br />
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <div className="kp-divider-ornament">🎵 💃 🎶 ✨</div>
            <p className="kp-success-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
            <div style={{ marginTop: '28px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://wa.me/6289530602592" target="_blank" rel="noreferrer" className="kp-contact-btn">📞 Grup WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN FORM ── */
  return (
    <div className="kp-popup-overlay" onClick={onClose}>
      <div className="kp-popup-container" onClick={e => e.stopPropagation()} ref={popupRef}>

        {/* Floating Notes Background */}
        <div className="kp-notes-bg">
          {notesData.map((n, i) => (
            <div key={i} className="kp-note" style={{
              left: `${n.left}%`, bottom: `${n.bottom}px`,
              animationDuration: `${n.duration}s`, animationDelay: `${n.delay}s`,
            }}>{n.symbol}</div>
          ))}
        </div>

        <button className="kp-close-btn" onClick={onClose}><X size={20} /></button>

        {/* HEADER */}
        <div className="kp-header">
          <div className="kp-header-corner tl">🎵</div>
          <div className="kp-header-corner tr">✨</div>
          <div className="kp-header-corner bl">💃</div>
          <div className="kp-header-corner br">🎶</div>
          <p className="kp-header-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>
          <span className="kp-hat-icon">💃</span>
          <h1>K-Pop Dance Cover<br />Competition</h1>
          <h2>Formulir Pendaftaran I-Fest 6.0 — 2026</h2>
          <div className="kp-divider-ornament">🎵 💃 🎶 ✨</div>
        </div>

        {/* DESCRIPTION */}
        <div className="kp-description-card">
          <p className="kp-desc-text">
            Selamat datang di <strong style={{ color: 'var(--kp-text)' }}>K-Pop Dance Cover Competition I-Fest 6.0 2026!</strong> 💃🎶<br />
            Kompetisi ini diselenggarakan oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang dan terbuka untuk umum. Kegiatan ini bertujuan untuk menyalurkan kreativitas serta bakat peserta dalam bidang seni tari, khususnya K-Pop Dance Cover.
          </p>

          <div className="kp-requirements-box">
            <div className="kp-req-title">📌 Persyaratan Peserta</div>
            <ul className="kp-req-list">
              <li>Peserta merupakan Warga Negara Indonesia (WNI).</li>
              <li>Lomba diikuti dalam bentuk tim, bukan individu.</li>
              <li>Setiap tim terdiri dari minimal 3 orang dan maksimal 6 orang.</li>
              <li>Setiap peserta hanya diperbolehkan tergabung dalam satu tim.</li>
              <li>Apabila lolos sebagai finalis, peserta dari luar kota wajib hadir dan tampil secara langsung (offline) di Palembang sesuai jadwal yang ditentukan panitia.</li>
              <li>Seluruh biaya transportasi, akomodasi, dan kebutuhan selama di Palembang menjadi tanggung jawab masing-masing peserta.</li>
              <li>Peserta wajib membawakan dance cover sesuai dengan gender asli dari grup yang dibawakan (dilarang keras cross-gender cover).</li>
              <li>Peserta wajib mengikuti akun Instagram resmi I-Fest 6.0 HIMIF UMDP (<strong style={{ color: 'var(--kp-lavender)' }}>@himif.umdp</strong>).</li>
            </ul>
          </div>

          <div className="kp-info-grid">
            <div className="kp-info-card">
              <span className="kp-ic-label">💰 HTM</span>
              <div className="kp-ic-value">
                Rp80.000,-<br />
                <small style={{ color: 'var(--kp-text-muted)' }}>BCA 0210999396<br />a.n. Yayasan Multi Data Palembang</small>
              </div>
            </div>
            <div className="kp-info-card">
              <span className="kp-ic-label">📑 Panduan</span>
              <div className="kp-ic-value">
                <a href="https://drive.google.com/file/d/1vYkt3xO0yBsxkQRVGh_GukCCfE_YY-XU/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="kp-guidebook-btn">
                  📖 Guidebook I-Fest 6.0 2026 ↗
                </a>
              </div>
            </div>
          </div>

          <p className="kp-desc-text" style={{ textAlign: 'center', margin: '16px 0 14px' }}>
            🔥 Siapkan Tim Terbaikmu dan <strong style={{ color: 'var(--kp-pink)' }}>Tunjukkan Performa Terbaikmu!</strong> 🏆
          </p>

          <div className="kp-contact-row">
            <a href="https://wa.me/6289530602592" target="_blank" rel="noreferrer" className="kp-contact-btn">📞 Wewen (WA)</a>
            <a href="https://wa.me/6282281371274" target="_blank" rel="noreferrer" className="kp-contact-btn">📞 Dea (WA)</a>
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit}>

          {/* SECTION 1 */}
          <div className="kp-form-section">
            <div className="kp-section-header">
              <div className="kp-section-icon">💃</div>
              <div className="kp-section-title-group">
                <span className="kp-section-number">Bagian I</span>
                <div className="kp-section-title">Informasi Tim &amp; Peserta</div>
              </div>
            </div>

            {/* Nama Tim */}
            <div className="kp-field">
              <div className="kp-field-label">Nama Tim <span className="req">*</span></div>
              <input
                className="kp-text-input"
                type="text"
                placeholder="Nama tim Anda…"
                required
                value={namaTim}
                onChange={e => setNamaTim(e.target.value)}
              />
            </div>

            {/* Asal Instansi */}
            <div className="kp-field">
              <div className="kp-field-label">Asal Instansi <span className="req">*</span></div>
              <input
                className="kp-text-input"
                type="text"
                placeholder="Universitas / Sekolah / Komunitas…"
                required
                value={asalInstansi}
                onChange={e => setAsalInstansi(e.target.value)}
              />
            </div>

            {/* PLAYERS */}
            <div className="kp-field-label" style={{ marginBottom: '16px', marginTop: '8px' }}>
              Anggota Tim <span className="req">*</span>
              <span className="kp-badge" style={{ marginLeft: '8px' }}>Maks. {MAX_PLAYERS} peserta</span>
            </div>

            <div className="kp-members-container">
              {players.map((p, index) => {
                const isRequired = index < REQ_PLAYERS;
                const displayNum = index + 1;
                return (
                  <div key={p.id} className={`kp-player-card${index === 0 ? ' kapten' : ''}${!isRequired ? ' optional' : ''}`}>
                    <div className="kp-player-header">
                      <div className="kp-player-badge">
                        <span style={{ color: index === 0 ? 'var(--kp-pink)' : 'var(--kp-text-muted)', marginRight: '4px' }}>
                          {index === 0 ? '♛' : ['🎵', '🎶', '💃', '✨', '🌸'][index % 5]}
                        </span>
                        {index === 0 ? `Peserta 1 (Ketua Tim)` : `Peserta ${displayNum}`}
                        {!isRequired && (
                          <span className="kp-badge" style={{ marginLeft: '8px' }}>· Opsional</span>
                        )}
                      </div>
                      {!isRequired && (
                        <button type="button" className="kp-member-remove" onClick={() => removePlayer(p.id)}>✕ Hapus</button>
                      )}
                    </div>

                    {/* Row 1: Nama + Gender */}
                    <div className="kp-player-grid" style={{ marginBottom: '12px' }}>
                      <div>
                        <div className="kp-member-field-label">
                          Nama Peserta {displayNum} {isRequired && <span className="req">*</span>}
                        </div>
                        <input
                          className="kp-text-input"
                          type="text"
                          placeholder={`Nama lengkap peserta ${displayNum}…`}
                          required={isRequired}
                          value={p.nama}
                          onChange={e => updatePlayer(p.id, 'nama', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                        />
                      </div>
                      <div>
                        <div className="kp-member-field-label">
                          Gender Peserta {displayNum} {isRequired && <span className="req">*</span>}
                        </div>
                        <div className="kp-gender-group">
                          <div className="kp-gender-option">
                            <input
                              type="radio"
                              name={`gender_p${p.id}`}
                              id={`gender_p${p.id}_l`}
                              value="Laki-Laki"
                              required={isRequired}
                              checked={p.gender === 'Laki-Laki'}
                              onChange={e => updatePlayer(p.id, 'gender', e.target.value)}
                            />
                            <label className="kp-gender-label" htmlFor={`gender_p${p.id}_l`}>
                              👦 Laki-Laki
                            </label>
                          </div>
                          <div className="kp-gender-option">
                            <input
                              type="radio"
                              name={`gender_p${p.id}`}
                              id={`gender_p${p.id}_p`}
                              value="Perempuan"
                              checked={p.gender === 'Perempuan'}
                              onChange={e => updatePlayer(p.id, 'gender', e.target.value)}
                            />
                            <label className="kp-gender-label" htmlFor={`gender_p${p.id}_p`}>
                              👧 Perempuan
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: WA + Email */}
                    <div className="kp-player-grid">
                      <div>
                        <div className="kp-member-field-label">
                          No. WhatsApp Peserta {displayNum} {isRequired && <span className="req">*</span>}
                        </div>
                        <input
                          className="kp-text-input"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          required={isRequired}
                          value={p.wa}
                          onChange={e => updatePlayer(p.id, 'wa', e.target.value.replace(/[^0-9]/g, ''))}
                        />
                      </div>
                      <div>
                        <div className="kp-member-field-label">
                          Email Peserta {displayNum} {isRequired && <span className="req">*</span>}
                        </div>
                        <input
                          className="kp-text-input"
                          type="email"
                          placeholder="email@contoh.com"
                          required={isRequired}
                          value={p.email}
                          onChange={e => updatePlayer(p.id, 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" className="kp-add-btn" onClick={addPlayer} disabled={players.length >= MAX_PLAYERS}>
              <span>🎵</span> {players.length >= MAX_PLAYERS ? `Maks. ${MAX_PLAYERS} Anggota Tercapai` : `Tambah Anggota (${players.length}/${MAX_PLAYERS})`}
            </button>

            {/* BUKTI BAYAR */}
            <div className="kp-field" style={{ marginTop: '24px' }}>
              <div className="kp-field-label">Bukti Pembayaran <span className="req">*</span></div>
              <div className="kp-field-hint">
                Format Penamaan File: <strong style={{ color: 'var(--kp-gold-dim)' }}>TRANSFER-DC-NamaTim</strong><br />
                BCA 0210999396 a.n. Yayasan Multi Data Palembang
              </div>
              <div className="kp-file-drop">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={e => { if (e.target.files?.[0]) setBuktiBayar(e.target.files[0]); }}
                />
                <span className="kp-file-drop-icon">
                  <Upload size={28} style={{ margin: '0 auto', display: 'block' }} />
                </span>
                <div className="kp-file-drop-text">
                  Seret &amp; lepas bukti transfer di sini, atau <span>klik untuk memilih</span>
                </div>
                {buktiBayar && <div className="kp-file-name-display">📎 {buktiBayar.name}</div>}
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="kp-form-section">
            <div className="kp-section-header">
              <div className="kp-section-icon">📜</div>
              <div className="kp-section-title-group">
                <span className="kp-section-number">Bagian II</span>
                <div className="kp-section-title">Pernyataan</div>
              </div>
            </div>

            <div className="kp-declaration-note">
              ⚠️ Mohon pastikan seluruh data sudah benar sebelum memilih <strong>'Setuju'</strong>. Anda masih dapat melakukan perbaikan data sebelum formulir dikirimkan.
            </div>

            {[
              {
                text: 'Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.',
                val: decl1, set: setDecl1,
              },
              {
                text: 'Saya dan tim berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam K-Pop Dance Cover I-Fest 6.0 2026.',
                val: decl2, set: setDecl2,
              },
              {
                text: 'Jika saya atau tim saya melakukan pelanggaran terhadap peraturan yang berlaku, kami siap menerima sanksi yang diberikan, termasuk kemungkinan diskualifikasi dari kompetisi.',
                val: decl3, set: setDecl3,
              },
            ].map((decl, i) => (
              <div className="kp-decl-item" key={i}>
                <div className="kp-decl-text">{decl.text}</div>
                <div className="kp-decl-choices">
                  <div className="kp-decl-choice agree">
                    <input
                      type="radio"
                      name={`kpdecl${i}`}
                      id={`kpdecl${i}y`}
                      value="Setuju"
                      required
                      onChange={e => decl.set(e.target.value)}
                    />
                    <label className="kp-decl-choice-label" htmlFor={`kpdecl${i}y`}>✓ Setuju</label>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT */}
          <div className="kp-submit-section">
            {errorMsg && <div className="kp-alert error">{errorMsg}</div>}
            <div className="kp-submit-divider">✨ Siap Tampil ✨</div>
            <button type="submit" className="kp-submit-btn" disabled={isSubmitting}>
              {!isSubmitting
                ? <span>💃 Kirim Pendaftaran</span>
                : <div className="kp-loader-ring"></div>}
            </button>
            {isSubmitting && submitStatus && <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--kp-text-muted)', fontStyle: 'italic' }}>{submitStatus}</p>}
            <p style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--kp-text-muted)', fontStyle: 'italic' }}>
              Dengan mengirimkan formulir ini, Anda menyetujui seluruh ketentuan yang berlaku.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}