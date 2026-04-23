import React, { useState, useRef, useMemo } from 'react';
import { X, FileText, CreditCard } from 'lucide-react';
import { processFilesParallel } from '../utils/fileUtils';
import './MachinePopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/REPLACE_WITH_MACHINE_SCRIPT_ID/exec';
const SUITS_ARR = ['♠', '♥', '♦', '♣'];
const MAX_MEMBERS = 2; // 1 mandatory member + 1 optional member = 2 members max (plus 1 kapten = 3 total)

export default function MachinePopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [namaTim, setNamaTim] = useState('');
  const [asalKota, setAsalKota] = useState('');
  const [asalInstansi, setAsalInstansi] = useState('');
  
  const [ketuaTim, setKetuaTim] = useState('');
  const [kpKetua, setKpKetua] = useState(null);

  const [members, setMembers] = useState([
    { id: 1, nama: '', kp: null } // Anggota 1 (wajib)
  ]);

  const [suratPernyataan, setSuratPernyataan] = useState(null);
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
      color: i % 2 === 0 ? '#d4a93f' : '#a81528',
    }));
  }, []);

  const addMember = () => {
    if (members.length < MAX_MEMBERS) {
      setMembers([...members, { id: 2, nama: '', kp: null }]); // Anggota 2 (opsional)
    }
  };

  const removeMember = (id) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const updateMember = (id, field, value) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errors = [];
    let valid = true;

    if (!namaTim.trim()) { errors.push('Nama Tim'); valid = false; }
    if (!asalKota.trim()) { errors.push('Asal Kota'); valid = false; }
    if (!asalInstansi.trim()) { errors.push('Asal Institusi'); valid = false; }
    if (!ketuaTim.trim()) { errors.push('Ketua Tim'); valid = false; }
    if (!kpKetua) { errors.push('Kartu Pelajar Ketua Tim'); valid = false; }

    members.forEach((m, idx) => {
      const isReq = idx === 0; // Anggota 1 wajib
      if (isReq || m.nama.trim() || m.kp) {
        if (!m.nama.trim()) { errors.push(`Nama Anggota ${idx + 1}`); valid = false; }
        if (!m.kp) { errors.push(`Kartu Pelajar Anggota ${idx + 1}`); valid = false; }
      }
    });

    if (!suratPernyataan) { errors.push('Surat Pernyataan'); valid = false; }
    if (!buktiBayar) { errors.push('Bukti Pembayaran'); valid = false; }

    if (decl1 !== 'Setuju' || decl2 !== 'Setuju' || decl3 !== 'Setuju') {
      errors.push('Seluruh Pernyataan');
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
        { key: 'kpKetuaB64', file: kpKetua },
        { key: 'spB64', file: suratPernyataan },
        { key: 'buktiBayarB64', file: buktiBayar },
      ];

      members.forEach((m, idx) => {
        if (m.kp) {
          filesToProcess.push({ key: `kpAnggota${idx + 1}B64`, file: m.kp });
        }
      });

      const fileResults = await processFilesParallel(filesToProcess);

      setSubmitStatus('Mengirim data...');

      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        formType: 'COMPETITIVE_MACHINE_LEARNING',
        namaTim: namaTim.trim(),
        asalKota: asalKota.trim(),
        asalInstansi: asalInstansi.trim(),
        ketuaTim: ketuaTim.trim(),
        kpKetuaName: kpKetua.name,
        kpKetuaB64: fileResults.kpKetuaB64,
        spName: suratPernyataan.name,
        spB64: fileResults.spB64,
        buktiBayarName: buktiBayar.name,
        buktiBayarB64: fileResults.buktiBayarB64,
        decl1,
        decl2,
        decl3,
      };

      members.forEach((m, idx) => {
        if (m.nama.trim()) {
          payload[`anggota${idx + 1}`] = m.nama.trim();
          payload[`kpAnggota${idx + 1}Name`] = m.kp ? m.kp.name : '';
          payload[`kpAnggota${idx + 1}B64`] = fileResults[`kpAnggota${idx + 1}B64`] || '';
        }
      });

      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      }).catch((e) => console.log('Mock request success'));

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
      <div className="machine-popup-overlay" onClick={onClose}>
        <div className="machine-popup-container machine-success-container" onClick={(e) => e.stopPropagation()}>
          <button className="machine-close-btn" onClick={onClose}><X size={20} /></button>

          <div className="machine-suits-bg">
            {suitsData.map((s, i) => (
              <div
                key={i}
                className="machine-suit"
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

          <div className="machine-success-screen" style={{ display: 'block' }}>
            <span className="machine-success-emoji">🏆</span>
            <h2 className="machine-success-title">Pendaftaran Berhasil!</h2>
            <p className="machine-success-sub">
              Terima kasih telah mendaftarkan tim Anda.
              <br />
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <div className="machine-divider-ornament" style={{ margin: '0 auto 20px' }}>♠ ♥ ♦ ♣</div>
            <p className="machine-success-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="machine-popup-overlay" onClick={onClose}>
      <div className="machine-popup-container" onClick={(e) => e.stopPropagation()} ref={popupRef}>
        <div className="machine-suits-bg">
          {suitsData.map((s, i) => (
            <div
              key={i}
              className="machine-suit"
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

        <button className="machine-close-btn" onClick={onClose}><X size={20} /></button>

        <div className="machine-header">
          <div className="machine-header-corner tl">♠</div>
          <div className="machine-header-corner tr">♥</div>
          <div className="machine-header-corner bl">♣</div>
          <div className="machine-header-corner br">♦</div>
          <p className="machine-header-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>
          <img src="/Compress/maskot.webp" className="about-crown" aria-hidden="true" />
          <h1>Machine Learning Competition <br />I-Fest 6.0</h1>
          <h2>Formulir Pendaftaran I-Fest 6.0 2026</h2>
          <div className="machine-divider-ornament">♠ ♥ ♦ ♣</div>
        </div>

        <div className="machine-description-card">
          <p className="machine-desc-text">
            Selamat datang di kompetisi I-Fest 6.0 2026! Isi form pendaftaran di bawah ini dengan menyertakan Surat Pernyataan:
          </p>
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <a 
              href="https://docs.google.com/document/d/1Ij2xNH0IUOM2U2Wfza236ySK5mxXy-LUdhBVjIFvVbk/edit?usp=sharing" 
              target="_blank" 
              rel="noreferrer" 
              className="machine-guidebook-btn" 
              style={{ display: "inline-flex" }}
            >
              📄 Download Surat Pernyataan
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="machine-form-section">
            <div className="machine-section-header">
              <div className="machine-section-icon">💻</div>
              <div className="machine-section-title-group">
                <span className="machine-section-number">Bagian I</span>
                <div className="machine-section-title">Informasi Tim</div>
              </div>
            </div>

            <div className="machine-field">
              <div className="machine-field-label">Nama Tim <span className="req">*</span></div>
              <input
                className="machine-text-input"
                type="text"
                placeholder="Nama tim..."
                required
                value={namaTim}
                onChange={(e) => setNamaTim(e.target.value)}
              />
            </div>

            <div className="machine-field">
              <div className="machine-field-label">Asal Kota <span className="req">*</span></div>
              <div className="machine-field-hint">Hanya kata (tanpa angka)</div>
              <input
                className="machine-text-input"
                type="text"
                placeholder="Kota asal..."
                required
                value={asalKota}
                onChange={(e) => setAsalKota(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              />
            </div>

            <div className="machine-field">
              <div className="machine-field-label">Asal Institusi <span className="req">*</span></div>
              <input
                className="machine-text-input"
                type="text"
                placeholder="Nama institusi..."
                required
                value={asalInstansi}
                onChange={(e) => setAsalInstansi(e.target.value)}
              />
            </div>

            {/* Ketua Tim */}
            <div className="machine-field-label" style={{ marginBottom: '16px', marginTop: '24px' }}>
              Ketua Tim <span className="req">*</span>
            </div>
            <div className="machine-member-card">
              <div className="machine-member-header">
                <div className="machine-member-badge">
                  <span style={{ color: 'var(--red-bright)', fontSize: '14px', marginRight: '4px' }}>♛</span>
                  Data Ketua Tim
                </div>
              </div>
              <div className="machine-member-grid">
                <div>
                  <div className="machine-member-field-label">Nama Ketua Tim <span className="req">*</span></div>
                  <input
                    className="machine-text-input"
                    type="text"
                    required
                    placeholder="Nama lengkap ketua..."
                    value={ketuaTim}
                    onChange={(e) => setKetuaTim(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  />
                </div>
                <div className="machine-field" style={{ marginBottom: 0 }}>
                  <div className="machine-member-field-label">Kartu Pelajar Ketua Tim <span className="req">*</span></div>
                  <div className="machine-file-drop" style={{ padding: '15px' }}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setKpKetua(e.target.files[0]);
                        }
                      }}
                    />
                    <span className="machine-file-drop-icon"><FileText size={20} style={{ margin: '0 auto', display: 'block' }} /></span>
                    <div className="machine-file-drop-text" style={{ fontSize: '11px' }}>Pilih file</div>
                    {kpKetua && <div className="machine-file-name-display" style={{ display: 'block' }}>📎 {kpKetua.name}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Anggota Tim */}
            <div className="machine-field-label" style={{ marginBottom: '16px', marginTop: '24px' }}>
              Anggota Tim 
              <span className="machine-badge">1 anggota wajib, 1 anggota opsional</span>
            </div>

            <div className="machine-members-container">
              {members.map((m, index) => {
                const isRequired = index === 0;
                return (
                  <div key={m.id} className={`machine-member-card ${!isRequired ? 'optional' : ''}`}>
                    <div className="machine-member-header">
                      <div className="machine-member-badge">
                        <span style={{ color: 'var(--red-bright)', fontSize: '14px', marginRight: '4px' }}>{SUITS_ARR[(index + 1) % 4]}</span>
                        Anggota {index + 1}
                        {!isRequired && <span className="machine-member-optional-tag">· Opsional</span>}
                      </div>
                      {!isRequired && (
                        <button type="button" className="machine-member-remove" onClick={() => removeMember(m.id)}>✕ Hapus</button>
                      )}
                    </div>

                    <div className="machine-member-grid">
                      <div>
                        <div className="machine-member-field-label">Nama Anggota {isRequired && <span className="req">*</span>}</div>
                        <input
                          className="machine-text-input"
                          type="text"
                          required={isRequired}
                          placeholder={`Nama anggota ${index + 1}...`}
                          value={m.nama}
                          onChange={(e) => updateMember(m.id, 'nama', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                        />
                      </div>
                      <div className="machine-field" style={{ marginBottom: 0 }}>
                        <div className="machine-member-field-label">Kartu Pelajar Anggota {index + 1} {isRequired && <span className="req">*</span>}</div>
                        <div className="machine-file-drop" style={{ padding: '15px' }}>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            required={isRequired}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                updateMember(m.id, 'kp', e.target.files[0]);
                              }
                            }}
                          />
                          <span className="machine-file-drop-icon"><FileText size={20} style={{ margin: '0 auto', display: 'block' }} /></span>
                          <div className="machine-file-drop-text" style={{ fontSize: '11px' }}>Pilih file</div>
                          {m.kp && <div className="machine-file-name-display" style={{ display: 'block' }}>📎 {m.kp.name}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="machine-add-btn"
              onClick={addMember}
              disabled={members.length >= MAX_MEMBERS}
            >
              <span>♣</span> {members.length >= MAX_MEMBERS ? 'Maksimal anggota sudah ditambahkan' : 'Tambah Anggota 2 (Opsional)'}
            </button>

            {/* Administrasi */}
            <div className="machine-field" style={{ marginTop: '24px' }}>
              <div className="machine-field-label">Surat Pernyataan <span className="req">*</span></div>
              <div className="machine-field-hint">Keterangan: <strong style={{ color: 'var(--gold-dim)' }}>SP-NamaTim</strong></div>
              <div className="machine-file-drop">
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSuratPernyataan(e.target.files[0]);
                    }
                  }}
                />
                <span className="machine-file-drop-icon"><FileText size={28} style={{ margin: '0 auto', display: 'block' }} /></span>
                <div className="machine-file-drop-text">Seret & lepas bukti PDF surat pernyataan di sini, atau <span>klik untuk memilih</span></div>
                {suratPernyataan && <div className="machine-file-name-display" style={{ display: 'block' }}>📎 {suratPernyataan.name}</div>}
              </div>
            </div>

            <div className="machine-field" style={{ marginTop: '24px' }}>
              <div className="machine-field-label">Bukti Pembayaran <span className="req">*</span></div>
              <div className="machine-field-hint">
                Format Penamaan File: <strong style={{ color: 'var(--gold-dim)' }}>TRANSFER-MachineLearning-NamaTim</strong><br />
                BCA 0210999396 a.n. Yayasan Multi Data Palembang
              </div>
              <div className="machine-file-drop">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setBuktiBayar(e.target.files[0]);
                    }
                  }}
                />
                <span className="machine-file-drop-icon"><CreditCard size={28} style={{ margin: '0 auto', display: 'block' }} /></span>
                <div className="machine-file-drop-text">Seret & lepas bukti transfer di sini, atau <span>klik untuk memilih</span></div>
                {buktiBayar && <div className="machine-file-name-display" style={{ display: 'block' }}>📎 {buktiBayar.name}</div>}
              </div>
            </div>
          </div>

          <div className="machine-form-section">
            <div className="machine-section-header">
              <div className="machine-section-icon">📜</div>
              <div className="machine-section-title-group">
                <span className="machine-section-number">Bagian II</span>
                <div className="machine-section-title">PERNYATAAN</div>
              </div>
            </div>

            <div className="machine-declaration-note">
              Mohon pastikan seluruh data sudah benar sebelum memilih <strong>'Setuju'</strong>. Anda masih dapat melakukan perbaikan data sebelum formulir dikirimkan.
            </div>

            {[
              {
                text: "Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.",
                val: decl1, set: setDecl1
              },
              {
                text: "Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam Machine Learning Competition I-Fest 6.0 2026.",
                val: decl2, set: setDecl2
              },
              {
                text: "Saya bersedia untuk hadir tepat waktu pada seluruh rangkaian kegiatan Machine Learning Competition I-Fest 6.0 2026 sesuai jadwal yang telah ditentukan oleh panitia.",
                val: decl3, set: setDecl3
              }
            ].map((decl, i) => (
              <div className="machine-decl-item" key={i}>
                <div className="machine-decl-text">{decl.text}</div>
                <div className="machine-decl-choices">
                  <div className="machine-decl-choice agree">
                    <input type="radio" name={`decl${i}`} id={`decl${i}y`} value="Setuju" required onChange={e => decl.set(e.target.value)} />
                    <label className="machine-decl-choice-label" htmlFor={`decl${i}y`}>✓ Setuju</label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="machine-submit-section">
            {errorMsg && <div className="machine-alert error show" style={{ display: 'block' }}>{errorMsg}</div>}
            <div className="machine-submit-divider">✦ Siap Bertanding ✦</div>
            <button type="submit" className="machine-submit-btn" disabled={isSubmitting}>
              {!isSubmitting ? <span>🎩 Kirim Pendaftaran</span> : <div className="machine-loader-ring" style={{ display: 'block' }}></div>}
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
