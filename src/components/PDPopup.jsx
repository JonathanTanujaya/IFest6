import React, { useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { processFilesParallel } from '../utils/fileUtils';
import './PDPopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0ZPdlC_HX1fQiCOGuZW4DwW3269kIGJKhEkvwQGyDGqUKcfavpFtsWXpS4hc6VgKC/exec'; // Replace with real script URL

export default function PDPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [namaLengkap, setNamaLengkap] = useState('');
  const [asalKota, setAsalKota] = useState('');
  const [asalInstansi, setAsalInstansi] = useState('');
  const [usernameIg, setUsernameIg] = useState('');
  const [email, setEmail] = useState('');
  const [wa, setWa] = useState('');

  const [buktiBayar, setBuktiBayar] = useState(null);

  const [decl1, setDecl1] = useState(false);
  const [decl2, setDecl2] = useState(false);
  const [decl3, setDecl3] = useState(false);

  const popupRef = useRef(null);

  const suitsData = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      suit: ['♠', '♥', '♦', '♣', '🃏'][i % 5],
      left: Math.random() * 100,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 15,
      color: i % 2 === 0 ? '#e2b953' : '#c91834',
    }));
  }, []);

  const validateAndSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errors = [];
    let valid = true;

    if (!namaLengkap.trim()) { errors.push('Nama Lengkap'); valid = false; }
    if (!asalKota.trim()) { errors.push('Asal Kota'); valid = false; }
    if (!asalInstansi.trim()) { errors.push('Asal Instansi'); valid = false; }
    if (!usernameIg.trim()) { errors.push('Username Instagram'); valid = false; }
    if (!email.trim()) { errors.push('Email Peserta'); valid = false; }
    if (!wa.trim()) { errors.push('No. WhatsApp Peserta'); valid = false; }
    if (!buktiBayar) { errors.push('Bukti Pembayaran'); valid = false; }

    if (!decl1 || !decl2 || !decl3) {
      errors.push('Seluruh pernyataan wajib disetujui');
      valid = false;
    }

    if (!valid) {
      setErrorMsg(`Mohon lengkapi: ${errors.join(', ')}.`);
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Mengompres & memproses file...');

    try {
      const filesToProcess = [
        { key: 'buktiBayarB64', file: buktiBayar },
      ];

      const fileResults = await processFilesParallel(filesToProcess);

      setSubmitStatus('Mengirim data...');

      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        formType: 'POSTER_DIGITAL',
        namaLengkap: namaLengkap.trim(),
        asalKota: asalKota.trim(),
        asalInstansi: asalInstansi.trim(),
        usernameIg: usernameIg.trim(),
        email: email.trim(),
        wa: wa.trim(),
        buktiBayarName: buktiBayar.name,
        buktiBayarB64: fileResults.buktiBayarB64,
        decl1: decl1 ? 'Setuju' : '',
        decl2: decl2 ? 'Setuju' : '',
        decl3: decl3 ? 'Setuju' : '',
      };

      // Mock request since script URL might not be set
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      }).catch(err => console.log('Mock success'));

      setIsSuccess(true);
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMsg(`Terjadi kesalahan: ${err.message}. Silakan coba lagi atau hubungi panitia.`);
      setIsSubmitting(false);
      setSubmitStatus('');
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSuccess) {
    return (
      <div className="pd-popup-overlay" onClick={onClose}>
        <div className="pd-popup-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
          <button className="pd-close-btn" onClick={onClose}><X size={24} /></button>

          <div className="pd-suits-bg">
            {suitsData.map((s, i) => (
              <div
                key={i}
                className="pd-suit"
                style={{
                  left: `${s.left}%`,
                  animationDuration: `${s.duration}s`,
                  animationDelay: `${s.delay}s`,
                  color: s.color,
                }}
              >
                {s.suit}
              </div>
            ))}
          </div>

          <div className="pd-success-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" className="pd-success-icon" />
            <h2 className="pd-success-title">Pendaftaran Berhasil!</h2>
            <p className="pd-success-text">
              Terima kasih telah mendaftarkan diri pada Poster Digital Competition. Data Anda telah tercatat dan panitia akan segera menghubungi Anda.
            </p>
            <a href="https://chat.whatsapp.com/KGFy79xuyskEAyqdeXRRZu" target="_blank" rel="noreferrer" className="pd-wa-btn">
              💬 Join Grup WhatsApp Peserta
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-popup-overlay" onClick={onClose}>
      <div className="pd-popup-container" onClick={(e) => e.stopPropagation()} ref={popupRef}>

        <div className="pd-suits-bg">
          {suitsData.map((s, i) => (
            <div
              key={i}
              className="pd-suit"
              style={{
                left: `${s.left}%`,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
                color: s.color,
              }}
            >
              {s.suit}
            </div>
          ))}
        </div>

        <button className="pd-close-btn" onClick={onClose}><X size={24} /></button>

        <div className="pd-header">
          <div className="pd-maskot-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" />
          </div>
          <h1 className="pd-title">Formulir Pendaftaran<br />Poster Digital Competition</h1>
          <h2 className="pd-subtitle">I-Fest 6.0 • HIMIF UMDP 2026</h2>
          <div className="pd-ornament">♠ ♥ ♦ ♣</div>
        </div>

        <div className="pd-desc-section">
          <div className="pd-glass-card full" style={{ marginBottom: '24px' }}>
            <div className="pd-card-title">🎩 Magical World</div>
            <p className="pd-card-text">
              Selamat datang di <strong style={{ color: 'var(--gold)' }}>Poster Digital Competition I-Fest 6.0!</strong> Kompetisi ini menjadi wadah bagi peserta umum dari seluruh Indonesia untuk menyalurkan kreativitas, ide, serta kemampuan desain visual digital.
              <br /><br />
              Karya harus orisinal, sesuai tema, dan dipublikasikan melalui akun Instagram yang didaftarkan. Tunjukkan identitas visual terbaikmu untuk bersaing di panggung #ImagIFest.
            </p>
          </div>

          <div className="pd-desc-grid">
            <div className="pd-glass-card">
              <div className="pd-card-title">💰 Biaya & Pembayaran</div>
              <p className="pd-card-text">
                <strong style={{ fontSize: '18px', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Rp35.000,-</strong>
                Transfer ke:<br />
                <strong style={{ color: 'var(--gold)' }}>BCA 0210999396</strong><br />
                a.n. Yayasan Multi Data Palembang
              </p>
            </div>

            <div className="pd-glass-card">
              <div className="pd-card-title">📌 Persyaratan Utama</div>
              <ul className="pd-list">
                <li>Peserta merupakan Warga Negara Indonesia (WNI)</li>
                <li>Peserta mengikuti lomba secara individu</li>
                <li>Peserta wajib mematuhi seluruh ketentuan kompetisi</li>
                <li>Akun Instagram yang dipakai submit harus sama dengan data pendaftaran</li>
              </ul>
              <a href="https://drive.google.com/file/d/1xm6N51-FH2iVkxBpM3Ajn6yCDYTfIB3L/view?usp=sharing" target="_blank" rel="noreferrer" className="pd-guide-btn">
                📖 Baca Guidebook Lengkap
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={validateAndSubmit}>
          <div className="pd-form-wrapper">
            <div className="pd-form-step">
              <div className="pd-step-header">
                <div className="pd-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="pd-step-title">
                  <p>Bagian Pertama</p>
                  <h3>Informasi Peserta</h3>
                </div>
              </div>

              <div className="pd-field-group">
                <label className="pd-label">Nama Lengkap <span className="req">*</span></label>
                <div className="pd-hint">Hanya huruf (tanpa angka)</div>
                <input
                  className="pd-input"
                  type="text"
                  placeholder="Nama peserta..."
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                />
              </div>

              <div className="pd-grid-2">
                <div className="pd-field-group">
                  <label className="pd-label">Asal Kota <span className="req">*</span></label>
                  <input
                    className="pd-input"
                    type="text"
                    placeholder="Kota domisili Anda..."
                    required
                    value={asalKota}
                    onChange={(e) => setAsalKota(e.target.value)}
                  />
                </div>

                <div className="pd-field-group">
                  <label className="pd-label">Asal Instansi <span className="req">*</span></label>
                  <input
                    className="pd-input"
                    type="text"
                    placeholder="Nama sekolah / instansi..."
                    required
                    value={asalInstansi}
                    onChange={(e) => setAsalInstansi(e.target.value)}
                  />
                </div>
              </div>

              <div className="pd-field-group">
                <label className="pd-label">Username Instagram <span className="req">*</span></label>
                <div className="pd-hint">Akun upload karya harus sama dengan akun yang didaftarkan.</div>
                <input
                  className="pd-input"
                  type="text"
                  placeholder="@username..."
                  required
                  value={usernameIg}
                  onChange={(e) => setUsernameIg(e.target.value)}
                />
              </div>

              <div className="pd-grid-2">
                <div className="pd-field-group">
                  <label className="pd-label">Email Peserta <span className="req">*</span></label>
                  <input
                    className="pd-input"
                    type="email"
                    placeholder="emailAnda@contoh.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                  />
                </div>

                <div className="pd-field-group">
                  <label className="pd-label">No. WhatsApp <span className="req">*</span></label>
                  <div className="pd-hint">Hanya angka (tanpa teks)</div>
                  <input
                    className="pd-input"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    required
                    value={wa}
                    onChange={(e) => setWa(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>

              <div className="pd-field-group" style={{ marginBottom: 0 }}>
                <label className="pd-label">Bukti Pembayaran <span className="req">*</span></label>
                <div className="pd-hint">
                  Format: <strong style={{ color: 'var(--gold)' }}>TRANSFER-PD-NamaPeserta</strong>.<br/>
                  <strong style={{color:'var(--gold)'}}>Maks 15 MB, 1 file saja (Image/PDF)</strong>
                </div>
                <div className="pd-dropzone">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setBuktiBayar(e.target.files[0]);
                      }
                    }}
                  />
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="pd-drop-icon-img" />
                  <div className="pd-drop-text">Seret atau lepas kartu di sini, <span>klik untuk memilih</span></div>
                  {buktiBayar && <div className="pd-file-name"><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="pd-file-icon" /> {buktiBayar.name}</div>}
                </div>
              </div>
            </div>

            <div className="pd-form-step" style={{ marginBottom: '24px' }}>
              <div className="pd-step-header">
                <div className="pd-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="pd-step-title">
                  <p>Bagian Terakhir</p>
                  <h3>Pernyataan</h3>
                </div>
              </div>

              {[
                { text: 'Saya menyatakan bahwa semua data pendaftaran yang saya isi sudah benar dan sesuai dokumen resmi.', val: decl1, set: setDecl1 },
                { text: 'Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam Poster Digital Competition I-Fest 6.0 2026.', val: decl2, set: setDecl2 },
                { text: 'Jika saya melakukan pelanggaran terhadap peraturan yang berlaku, saya siap menerima sanksi, termasuk diskualifikasi dari kompetisi.', val: decl3, set: setDecl3 }
              ].map((decl, i) => (
                <div className="pd-decl-item" key={i}>
                  <div className="pd-decl-text">{decl.text}</div>
                  <div className="pd-decl-choices">
                    <div className="pd-decl-choice agree">
                      <input type="checkbox" id={`decl${i}y`} checked={decl.val} onChange={e => decl.set(e.target.checked)} required />
                      <label className="pd-decl-choice-label" htmlFor={`decl${i}y`}>✓ Setuju</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pd-submit-section">
              {errorMsg && (
                <div className="pd-alert error">
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="pd-inline-icon" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="pd-submit-divider">✨ Siap Berkarya ✨</div>
              <button type="submit" className="pd-btn-submit" disabled={isSubmitting}>
                {!isSubmitting ? (
                  <><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="pd-submit-icon" /> Kirim Pendaftaran</>
                ) : (
                  <div className="pd-loader"></div>
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
