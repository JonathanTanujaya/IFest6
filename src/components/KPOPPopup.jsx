import React, { useState, useRef, useMemo } from 'react';
import { X } from 'lucide-react';
import { compressAndEncode, validateFile, FILE_ACCEPT } from '../utils/fileUtils';
import './KPOPPopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAjMpwZYQBaCMKY_VqAE8iQRt9okImQyzLY0Q1ZoWBaQ-nYnMRgy9KETLc_f-JDczn/exec';

const NOTES = ['🎵', '🎶', '💃', '🎤', '✨', '🌸', '⭐', '💫', '🎧', '🌟'];
const MAX_PLAYERS = 10;
const REQ_PLAYERS = 3;

const EMPTY_PLAYER = (id) => ({ id, nama: '', gender: '', wa: '', email: '' });

export default function KPopPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  // Team info
  const [namaTim, setNamaTim] = useState('');
  const [asalInstansi, setAsalInstansi] = useState('');

  // Players: 1–3 required, 4–10 added by user on demand
  const [players, setPlayers] = useState(
    Array.from({ length: REQ_PLAYERS }, (_, i) => EMPTY_PLAYER(i + 1))
  );

  // Payment
  const [buktiBayar, setBuktiBayar] = useState(null);

  // Declarations
  const [decl1, setDecl1] = useState(false);
  const [decl2, setDecl2] = useState(false);
  const [decl3, setDecl3] = useState(false);

  const popupRef = useRef(null);

  const notesData = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      symbol: NOTES[i % NOTES.length],
      left: Math.random() * 100,
      duration: 18 + Math.random() * 22,
      delay: Math.random() * 18,
      color: i % 2 === 0 ? '#e2b953' : '#c91834',
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
    if (!decl1 || !decl2 || !decl3) { errors.push('Seluruh Pernyataan wajib disetujui'); valid = false; }

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
        decl1: decl1 ? 'Setuju' : '',
        decl2: decl2 ? 'Setuju' : '',
        decl3: decl3 ? 'Setuju' : '',
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
        headers: { 'Content-Type': 'text/plain' },
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
        <div className="kp-popup-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <button className="kp-close-btn" onClick={onClose}><X size={24} /></button>
          <div className="kp-notes-bg">
            {notesData.map((n, i) => (
              <div key={i} className="kp-note" style={{ left: `${n.left}%`, animationDuration: `${n.duration}s`, animationDelay: `${n.delay}s`, color: n.color }}>{n.symbol}</div>
            ))}
          </div>
          <div className="kp-success-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" className="kp-success-icon" />
            <h2 className="kp-success-title">Pendaftaran Berhasil!</h2>
            <p className="kp-success-text">
              Terima kasih telah mendaftarkan tim Anda untuk K-Pop Dance Cover I-Fest 6.0 2026.
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <a href="https://chat.whatsapp.com/ESQRkHH5MNtGfN9QsofJLX" target="_blank" rel="noreferrer" className="kp-wa-btn">
              💬 Join Grup WhatsApp
            </a>
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
            <div key={i} className="kp-note" style={{ left: `${n.left}%`, animationDuration: `${n.duration}s`, animationDelay: `${n.delay}s`, color: n.color }}>{n.symbol}</div>
          ))}
        </div>

        <button className="kp-close-btn" onClick={onClose}><X size={24} /></button>

        {/* HEADER */}
        <div className="kp-header">
          <div className="kp-maskot-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" />
          </div>
          <h1 className="kp-title">K-Pop Dance Cover<br />Competition</h1>
          <h2 className="kp-subtitle">I-Fest 6.0 • HIMIF UMDP 2026</h2>
          <div className="kp-ornament"></div>
        </div>

        {/* DESCRIPTION */}
        <div className="kp-desc-section">
          <div className="kp-glass-card full" style={{ marginBottom: '24px' }}>
            <div className="kp-card-title">🎩 Exploring Digital Wonderland</div>
            <p className="kp-card-text">
              Selamat datang di <strong style={{ color: 'var(--gold)' }}>K-Pop Dance Cover Competition I-Fest 6.0 2026!</strong> 💃🎶<br />
              Kompetisi ini diselenggarakan oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang dan terbuka untuk umum. Kegiatan ini bertujuan untuk menyalurkan kreativitas serta bakat peserta dalam bidang seni tari, khususnya K-Pop Dance Cover.
            </p>
          </div>

          <div className="kp-desc-grid">
            <div className="kp-glass-card">
              <div className="kp-card-title">💰 Biaya & Pembayaran</div>
              <p className="kp-card-text">
                <strong style={{ fontSize: '18px', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Rp80.000,-</strong>
                Transfer ke:<br />
                <strong style={{ color: 'var(--gold)' }}>BCA 0210999396</strong><br />
                a.n. Yayasan Multi Data Palembang
              </p>
            </div>

            <div className="kp-glass-card">
              <div className="kp-card-title">📌 Persyaratan Utama</div>
              <ul className="kp-list">
                <li>Terbuka untuk Umum (WNI)</li>
                <li>Tim terdiri dari 3-10 orang</li>
                <li>Wajib hadir offline jika lolos finalis</li>
              </ul>
              <a href="https://drive.google.com/file/d/1-0AQ9LUSPp4oUTYVQaX1tdOrBzqbiqkF/view?usp=drive_link" target="_blank" rel="noreferrer" className="kp-guide-btn">
                📖 Baca Guidebook Lengkap
              </a>
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit}>
          <div className="kp-form-wrapper">

            {/* SECTION 1 */}
            <div className="kp-form-step">
              <div className="kp-step-header">
                <div className="kp-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="kp-step-title">
                  <p>Bagian Pertama</p>
                  <h3>Informasi Tim & Peserta</h3>
                </div>
              </div>

              {/* Nama Tim */}
              <div className="kp-field-group">
                <label className="kp-label">Nama Tim <span className="req">*</span></label>
                <input
                  className="kp-input"
                  type="text"
                  placeholder="Nama tim Anda…"
                  required
                  value={namaTim}
                  onChange={e => setNamaTim(e.target.value)}
                />
              </div>

              {/* Asal Instansi */}
              <div className="kp-field-group">
                <label className="kp-label">Asal Instansi <span className="req">*</span></label>
                <input
                  className="kp-input"
                  type="text"
                  placeholder="Universitas / Sekolah / Komunitas…"
                  required
                  value={asalInstansi}
                  onChange={e => setAsalInstansi(e.target.value)}
                />
              </div>

              {/* PLAYERS */}
              <div className="kp-label" style={{ marginBottom: '16px', marginTop: '24px' }}>
                Anggota Tim <span className="req">*</span>
                <span className="kp-member-badge" style={{ marginLeft: '8px' }}>Maks. {MAX_PLAYERS} peserta</span>
              </div>

              {players.map((p, index) => {
                const isRequired = index < REQ_PLAYERS;
                const displayNum = index + 1;
                return (
                  <div key={p.id} className={`kp-member-box ${!isRequired ? 'optional' : ''}`}>
                    <div className="kp-member-header">
                      <div className="kp-member-title">
                        <span style={{ color: index === 0 ? 'var(--kp-pink)' : 'var(--text-dim)' }}>
                          {index === 0 ? '♛' : ['🎵', '🎶', '💃', '✨', '🌸'][index % 5]}
                        </span>
                        {index === 0 ? `Peserta 1 (Ketua Tim)` : `Peserta ${displayNum}`}
                        {!isRequired && <span className="kp-member-badge">Opsional</span>}
                      </div>
                      {!isRequired && (
                        <button type="button" className="kp-btn-remove" onClick={() => removePlayer(p.id)}>
                          <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="kp-remove-icon" /> Hapus
                        </button>
                      )}
                    </div>

                    <div className="kp-grid-2">
                      <div className="kp-field-group" style={{ marginBottom: 0 }}>
                        <label className="kp-label">Nama Peserta {isRequired && <span className="req">*</span>}</label>
                        <input
                          className="kp-input"
                          type="text"
                          placeholder={`Nama lengkap peserta ${displayNum}…`}
                          required={isRequired}
                          value={p.nama}
                          onChange={e => updatePlayer(p.id, 'nama', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                        />
                      </div>
                      <div className="kp-field-group" style={{ marginBottom: 0 }}>
                        <label className="kp-label">Gender Peserta {isRequired && <span className="req">*</span>}</label>
                        <div className="kp-radio-grid">
                          <label className="kp-radio-card">
                            <input
                              type="radio"
                              name={`gender_p${p.id}`}
                              value="Laki-Laki"
                              required={isRequired}
                              checked={p.gender === 'Laki-Laki'}
                              onChange={e => updatePlayer(p.id, 'gender', e.target.value)}
                            />
                            <div className="kp-radio-label">👦 Laki-Laki</div>
                          </label>
                          <label className="kp-radio-card">
                            <input
                              type="radio"
                              name={`gender_p${p.id}`}
                              value="Perempuan"
                              checked={p.gender === 'Perempuan'}
                              onChange={e => updatePlayer(p.id, 'gender', e.target.value)}
                            />
                            <div className="kp-radio-label">👧 Perempuan</div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="kp-grid-2" style={{ marginTop: '24px' }}>
                      <div className="kp-field-group" style={{ marginBottom: 0 }}>
                        <label className="kp-label">No. WhatsApp {isRequired && <span className="req">*</span>}</label>
                        <input
                          className="kp-input"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          required={isRequired}
                          value={p.wa}
                          onChange={e => updatePlayer(p.id, 'wa', e.target.value.replace(/[^0-9]/g, ''))}
                        />
                      </div>
                      <div className="kp-field-group" style={{ marginBottom: 0 }}>
                        <label className="kp-label">Email {isRequired && <span className="req">*</span>}</label>
                        <input
                          className="kp-input"
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

              {players.length < MAX_PLAYERS && (
                <button type="button" className="kp-btn-add" onClick={addPlayer}>
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="kp-add-icon" /> Tambah Anggota {players.length + 1}
                </button>
              )}
            </div>

            {/* Step 3: Pembayaran */}
            <div className="kp-form-step">
              <div className="kp-step-header">
                <div className="kp-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="kp-step-title">
                  <p>Bagian Kedua</p>
                  <h3>Pembayaran</h3>
                </div>
              </div>

              <div className="kp-field-group" style={{ marginBottom: 0 }}>
                <label className="kp-label">Bukti Pembayaran <span className="req">*</span></label>
                <div className="kp-hint">
                  Format Penamaan File: <strong style={{ color: 'var(--gold)' }}>TRANSFER-DC-NamaTim</strong><br />
                  BCA 0210999396 a.n. Yayasan Multi Data Palembang<br />
                  <strong style={{ color: 'var(--gold)' }}>Maks 1 MB, 1 file saja (Image/PDF)</strong>
                </div>
                <div className="kp-dropzone">
                  <input
                    type="file"
                    accept={FILE_ACCEPT}
                    required
                    onChange={e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const err = validateFile(file); if (err) { setErrorMsg(err); e.target.value = ''; setBuktiBayar(null); return; }
                      setErrorMsg(''); setBuktiBayar(file);
                    }}
                  />
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="kp-drop-icon-img" />
                  <div className="kp-drop-text">Seret atau lepas kartu di sini, <span>klik untuk memilih</span></div>
                  {buktiBayar && <div className="kp-file-name"><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="kp-file-icon" /> {buktiBayar.name}</div>}
                </div>
              </div>
            </div>

            {/* Step 4: Pernyataan */}
            <div className="kp-form-step" style={{ marginBottom: '24px' }}>
              <div className="kp-step-header">
                <div className="kp-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="kp-step-title">
                  <p>Bagian Terakhir</p>
                  <h3>Pernyataan</h3>
                </div>
              </div>

              {[
                { text: "Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.", val: decl1, set: setDecl1 },
                { text: "Saya dan tim berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam K-Pop Dance Cover I-Fest 6.0 2026.", val: decl2, set: setDecl2 },
                { text: "Jika saya atau tim saya melakukan pelanggaran terhadap peraturan yang berlaku, kami siap menerima sanksi yang diberikan, termasuk kemungkinan diskualifikasi dari kompetisi.", val: decl3, set: setDecl3 }
              ].map((decl, i) => (
                <div className="kp-decl-item" key={i}>
                  <div className="kp-decl-text">{decl.text}</div>
                  <div className="kp-decl-choices">
                    <div className="kp-decl-choice agree">
                      <input type="checkbox" id={`decl${i}y`} checked={decl.val} onChange={e => decl.set(e.target.checked)} required />
                      <label className="kp-decl-choice-label" htmlFor={`decl${i}y`}>✓ Setuju</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SUBMIT */}
            <div className="kp-submit-section">
              {errorMsg && (
                <div className="kp-alert error">
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="kp-inline-icon" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="kp-submit-divider">✨ Siap Tampil ✨</div>
              <button type="submit" className="kp-btn-submit" disabled={isSubmitting}>
                {!isSubmitting ? (
                  <><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="kp-submit-icon" /> Kirim Pendaftaran</>
                ) : (
                  <div className="kp-loader"></div>
                )}
              </button>
              {isSubmitting && submitStatus && (
                <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  {submitStatus}
                </p>
              )}
              <p style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                Dengan mengirimkan formulir ini, Anda menyetujui seluruh ketentuan yang berlaku.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}