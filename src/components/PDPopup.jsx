import React, { useMemo, useRef, useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { processFilesParallel, validateFile, FILE_ACCEPT } from '../utils/fileUtils';
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
      color: i % 2 === 0 ? '#d4a93f' : '#8b22a1',
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

    if (decl1 !== 'Setuju' || decl2 !== 'Setuju' || decl3 !== 'Setuju') {
      errors.push('Seluruh pernyataan (Setuju)');
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
        decl1,
        decl2,
        decl3,
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
        <div className="pd-popup-container pd-success-container" onClick={(e) => e.stopPropagation()}>
          <button className="pd-close-btn" onClick={onClose}><X size={20} /></button>

          <div className="pd-suits-bg">
            {suitsData.map((s, i) => (
              <div
                key={i}
                className="pd-suit"
                style={{
                  left: `${s.left}%`,
                  bottom: `${s.bottom}px`,
                  animationDuration: `${s.duration}s`,
                  animationDelay: `${s.delay}s`,
                  color: s.color,
                }}
              >
                {s.suit}
              </div>
            ))}
          </div>

          <div className="pd-success-screen" style={{ display: 'block' }}>
            <span className="pd-success-emoji">🏆</span>
            <h2 className="pd-success-title">Pendaftaran Berhasil!</h2>
            <p className="pd-success-sub">
              Terima kasih telah mendaftar Poster Digital Competition I-Fest 6.0 2026.
              <br />
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <div className="pd-divider-ornament" style={{ margin: '0 auto 20px' }}>♠ ♥ ♦ ♣</div>
            <p className="pd-success-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
            <div style={{ marginTop: '28px' }}>
              <a href="https://chat.whatsapp.com/KGFy79xuyskEAyqdeXRRZu" target="_blank" rel="noreferrer" className="pd-contact-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                💬 Join Grup WhatsApp
              </a>
            </div>
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
                bottom: `${s.bottom}px`,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
                color: s.color,
              }}
            >
              {s.suit}
            </div>
          ))}
        </div>

        <button className="pd-close-btn" onClick={onClose}><X size={20} /></button>

        <div className="pd-header">
          <div className="pd-header-corner tl">♠</div>
          <div className="pd-header-corner tr">♥</div>
          <div className="pd-header-corner bl">♣</div>
          <div className="pd-header-corner br">♦</div>
          <p className="pd-header-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>
          <img src="/Compress/maskot.webp" className="about-crown" aria-hidden="true" />
          <h1>Poster Digital<br />I-Fest 6.0</h1>
          <h2>Formulir Pendaftaran Poster Digital Competition I-Fest 6.0</h2>
          <div className="pd-divider-ornament">♠ ♥ ♦ ♣</div>
        </div>

        <div className="pd-description-card">
          <p className="pd-desc-text">
            Selamat datang di <strong style={{ color: 'var(--text)' }}>Poster Digital Competition I-Fest 6.0 2026!</strong> 🎩 ♥️
            <br />
            Kompetisi yang diselenggarakan secara daring oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang. Kompetisi ini melibatkan peserta dari kalangan umum di seluruh wilayah Indonesia untuk menyalurkan kreativitas, menuangkan ide, serta mengembangkan kemampuan desain grafis digital.
          </p>

          <p className="pd-desc-text" style={{ marginBottom: '18px' }}>
            <strong style={{ color: 'var(--gold)' }}>🗝️ Tema: “Magical World”</strong>
            <br />
            Tema ini mengajak peserta untuk mengeksplorasi imajinasi tanpa batas melalui karya poster digital. Peserta diharapkan mampu menghadirkan visual yang kreatif dan unik dengan menggambarkan dunia penuh keajaiban, fantasi, dan keindahan yang tidak terbatas oleh realitas, serta menyampaikan pesan yang menarik dan bermakna.
          </p>

          <div className="pd-info-grid">
            <div className="pd-info-card">
              <span className="pd-ic-label">💰 HTM</span>
              <div className="pd-ic-value">
                Rp35.000,-
                <br />
                <small style={{ color: 'var(--text-muted)' }}>BCA 0210999396<br />a.n. Yayasan Multi Data Palembang</small>
              </div>
            </div>
            <div className="pd-info-card">
              <span className="pd-ic-label">📑 Panduan</span>
              <div className="pd-ic-value">
                <span
                  className="pd-guidebook-btn"
                  style={{ display: 'inline-flex', marginTop: '4px', fontSize: '12px' }}
                >
                  📖 Guidebook I-Fest 6.0 2026
                </span>
              </div>
            </div>
          </div>

          <div className="pd-info-card" style={{ marginBottom: '18px' }}>
            <span className="pd-ic-label">📌 Persyaratan Peserta</span>
            <ul className="pd-req-list" style={{ marginTop: '8px' }}>
              <li>Peserta merupakan Warga Negara Indonesia (WNI);</li>
              <li>Peserta berpartisipasi secara individu;</li>
              <li>Peserta wajib mengikuti seluruh rangkaian kegiatan dan mematuhi semua aturan kompetisi;</li>
              <li>Peserta yang mengikuti lomba harus merupakan peserta yang telah terdaftar dan tidak dapat digantikan oleh orang lain.</li>
            </ul>
          </div>

          <p className="pd-desc-text" style={{ textAlign: 'center', marginBottom: '16px' }}>
            💡 Wujudkan Imaginasimu dengan Satu Karya Terbaikmu di panggung #ImagIFest! 🖌️
          </p>

          <div className="pd-contact-row" style={{ justifyContent: 'center' }}>
            <a href="https://wa.me/6285788122188" target="_blank" rel="noreferrer" className="pd-contact-btn">
              📞 Deasty (WA)
            </a>
            <a href="https://wa.me/628893972567" target="_blank" rel="noreferrer" className="pd-contact-btn">
              📞 Jayson (WA)
            </a>
          </div>
        </div>

        <form onSubmit={validateAndSubmit}>
          <div className="pd-form-section">
            <div className="pd-section-header">
              <div className="ml-section-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="/Compress/maskot.webp"
                  alt=""
                  aria-hidden="true"
                  style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div className="pd-section-title-group">
                <span className="pd-section-number">Bagian I</span>
                <div className="pd-section-title">Informasi Peserta</div>
              </div>
            </div>

            <div className="pd-field">
              <div className="pd-field-label">Nama Lengkap <span className="req">*</span></div>
              <div className="pd-field-hint">Hanya huruf (tanpa angka)</div>
              <input
                className="pd-text-input"
                type="text"
                placeholder="Nama peserta..."
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              />
            </div>

            <div className="pd-field">
              <div className="pd-field-label">Asal Kota <span className="req">*</span></div>
              <input
                className="pd-text-input"
                type="text"
                placeholder="Kota domisili Anda..."
                required
                value={asalKota}
                onChange={(e) => setAsalKota(e.target.value)}
              />
            </div>

            <div className="pd-field">
              <div className="pd-field-label">Asal Instansi <span className="req">*</span></div>
              <input
                className="pd-text-input"
                type="text"
                placeholder="Nama sekolah / instansi..."
                required
                value={asalInstansi}
                onChange={(e) => setAsalInstansi(e.target.value)}
              />
            </div>

            <div className="pd-field">
              <div className="pd-field-label">Username Instagram Peserta <span className="req">*</span></div>
              <div className="pd-field-hint">Peserta wajib mengunggah karya melalui akun Instagram yang telah didaftarkan. Penggunaan akun lain di luar data pendaftaran tidak diperkenankan.</div>
              <input
                className="pd-text-input"
                type="text"
                placeholder="@username..."
                required
                value={usernameIg}
                onChange={(e) => setUsernameIg(e.target.value)}
              />
            </div>

            <div className="pd-field">
              <div className="pd-field-label">Email Peserta <span className="req">*</span></div>
              <input
                className="pd-text-input"
                type="email"
                placeholder="emailAnda@contoh.com..."
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
              />
            </div>

            <div className="pd-field">
              <div className="pd-field-label">No. WhatsApp Peserta <span className="req">*</span></div>
              <div className="pd-field-hint">Hanya angka (tanpa teks)</div>
              <input
                className="pd-text-input"
                type="tel"
                placeholder="08xxxxxxxxxx"
                required
                value={wa}
                onChange={(e) => setWa(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>

            <div className="pd-field" style={{ marginTop: '24px' }}>
              <div className="pd-field-label">Bukti Pembayaran <span className="req">*</span></div>
              <div className="pd-field-hint">
                Format Penamaan File: <strong style={{ color: 'var(--gold-dim)' }}>TRANSFER-PD-NamaPeserta</strong><br />
                BCA 0210999396 a.n. Yayasan Multi Data Palembang
              </div>
              <div className="pd-file-drop">
                <input
                  type="file"
                  accept={FILE_ACCEPT}
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const err = validateFile(file);
                    if (err) { setErrorMsg(err); e.target.value = ''; setBuktiBayar(null); return; }
                    setErrorMsg(''); setBuktiBayar(file);
                  }}
                />
                <span className="pd-file-drop-icon"><CreditCard size={28} style={{ margin: '0 auto', display: 'block' }} /></span>
                <div className="pd-file-drop-text">Seret & lepas bukti PDF di sini, atau <span>klik untuk memilih</span></div>
                {buktiBayar && <div className="pd-file-name-display" style={{ display: 'block' }}>📎 {buktiBayar.name}</div>}
              </div>
            </div>
          </div>

          <div className="pd-form-section">
            <div className="pd-section-header">
             <div className="ml-section-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="/Compress/maskot.webp"
                  alt=""
                  aria-hidden="true"
                  style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div className="pd-section-title-group">
                <span className="pd-section-number">Bagian II</span>
                <div className="pd-section-title">Pernyataan</div>
              </div>
            </div>

            <div className="pd-declaration-note">
              Mohon pastikan seluruh data sudah benar sebelum memilih <strong>'Setuju'</strong>. Anda masih dapat melakukan perbaikan data sebelum formulir dikirimkan.
            </div>

            {[
              {
                text: "Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.",
                val: decl1, set: setDecl1
              },
              {
                text: "Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam Poster Digital Competition I-Fest 6.0 2026.",
                val: decl2, set: setDecl2
              },
              {
                text: "Jika saya melakukan pelanggaran terhadap peraturan yang berlaku, saya siap menerima sanksi yang diberikan, termasuk kemungkinan diskualifikasi dari kompetisi.",
                val: decl3, set: setDecl3
              }
            ].map((decl, i) => (
              <div className="pd-decl-item" key={i}>
                <div className="pd-decl-text">{decl.text}</div>
                <div className="pd-decl-choices">
                  <div className="pd-decl-choice agree">
                    <input type="radio" name={`decl${i}`} id={`decl${i}y`} value="Setuju" required onChange={e => decl.set(e.target.value)} />
                    <label className="pd-decl-choice-label" htmlFor={`decl${i}y`}>✓ Setuju</label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pd-submit-section">
            {errorMsg && <div className="pd-alert error show" style={{ display: 'block' }}>{errorMsg}</div>}
            <div className="pd-submit-divider">✦ Siap Mengirim Karya ✦</div>
            <button type="submit" className="pd-submit-btn" disabled={isSubmitting}>
              {!isSubmitting ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/Compress/maskot.webp"
                  alt=""
                  aria-hidden="true"
                  style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }}
                />
                Kirim Pendaftaran
              </span> : <div className="pd-loader-ring" style={{ display: 'block' }}></div>}
            </button>
            {isSubmitting && submitStatus && (
              <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--gold-dim)', fontStyle: 'italic' }}>
                {submitStatus}
              </p>
            )}
            <p style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Dengan mengirimkan formulir ini, Anda menyetujui seluruh ketentuan yang berlaku.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
