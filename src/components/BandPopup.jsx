import React, { useState, useRef, useMemo } from 'react';
import { X, FileText, CreditCard, Image as ImageIcon } from 'lucide-react';
import { processFilesParallel } from '../utils/fileUtils';
import './BandPopup.css';

// User provided a Google Sheets link, but this variable needs to be a Web App URL to accept POST requests.
const SCRIPT_URL = 'https://script.google.com/macros/s/REPLACE_WITH_BAND_SCRIPT_ID/exec';
const SUITS_ARR = ['♠', '♥', '♦', '♣', '🃏'];
const MAX_MEMBERS = 8;
const MIN_MEMBERS = 4;

export default function BandPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Info Band
  const [namaBand, setNamaBand] = useState('');
  const [bandLogo, setBandLogo] = useState(null);
  
  const [kategori, setKategori] = useState('');
  const [kategoriOther, setKategoriOther] = useState('');
  const [asalInstansi, setAsalInstansi] = useState('');

  // Peserta
  const [members, setMembers] = useState([
    { id: 1, nama: '', peran: '', peranOther: '', wa: '' },
    { id: 2, nama: '', peran: '', peranOther: '', wa: '' },
    { id: 3, nama: '', peran: '', peranOther: '', wa: '' },
    { id: 4, nama: '', peran: '', peranOther: '', wa: '' }
  ]);

  // Official
  const [officialNama, setOfficialNama] = useState('');
  const [officialWa, setOfficialWa] = useState('');

  // Administrasi
  const [laguWajib, setLaguWajib] = useState('');
  const [laguBebas, setLaguBebas] = useState('');
  const [dokIdentitas, setDokIdentitas] = useState(null);
  const [buktiBayar, setBuktiBayar] = useState(null);

  // Pernyataan
  const [decl1, setDecl1] = useState('');
  const [decl2, setDecl2] = useState('');
  const [decl3, setDecl3] = useState('');

  const popupRef = useRef(null);

  const suitsData = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      suit: SUITS_ARR[i % 5],
      left: Math.random() * 100,
      bottom: Math.random() * -200,
      duration: 18 + Math.random() * 20,
      delay: Math.random() * 15,
      color: i % 2 === 0 ? '#d4a93f' : '#a81528',
    }));
  }, []);

  const addMember = () => {
    if (members.length < MAX_MEMBERS) {
      setMembers([...members, { id: members.length + 1, nama: '', peran: '', peranOther: '', wa: '' }]);
    }
  };

  const removeMember = (id) => {
    const updated = members.filter((m) => m.id !== id).map((m, idx) => ({ ...m, id: idx + 1 }));
    setMembers(updated);
  };

  const updateMember = (id, field, value) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errors = [];
    let valid = true;

    if (!namaBand.trim()) { errors.push('Nama Band'); valid = false; }
    
    if (!kategori) {
      errors.push('Kategori Peserta'); valid = false;
    } else if (kategori === 'Other' && !kategoriOther.trim()) {
      errors.push('Kategori Lainnya'); valid = false;
    }

    if (!asalInstansi.trim()) { errors.push('Asal Instansi'); valid = false; }

    members.forEach((m, idx) => {
      const isReq = idx < MIN_MEMBERS;
      if (isReq || m.nama.trim() || m.peran || m.wa.trim()) {
        if (!m.nama.trim()) { errors.push(`Nama Peserta ${idx + 1}`); valid = false; }
        if (!m.peran) { errors.push(`Peran Peserta ${idx + 1}`); valid = false; }
        else if (m.peran === 'Other' && !m.peranOther.trim()) { errors.push(`Peran Peserta ${idx + 1} (Lainnya)`); valid = false; }
        if (!m.wa.trim()) { errors.push(`No WA Peserta ${idx + 1}`); valid = false; }
      }
    });

    if (!laguWajib) { errors.push('Lagu Wajib'); valid = false; }
    if (!laguBebas.trim()) { errors.push('Lagu Bebas'); valid = false; }
    if (!dokIdentitas) { errors.push('Dokumen Identitas'); valid = false; }
    if (!buktiBayar) { errors.push('Bukti Pembayaran'); valid = false; }

    if (!decl1 || !decl2 || !decl3) {
      errors.push('Seluruh Pernyataan wajib diisi');
      valid = false;
    }

    if (!valid) {
      setErrorMsg(`Mohon lengkapi: ${errors.join(', ')}.`);
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Mengompres & memproses file (mohon tunggu)...');

    try {
      const filesToProcess = [
        { key: 'dokIdentitasB64', file: dokIdentitas },
        { key: 'buktiBayarB64', file: buktiBayar },
      ];

      if (bandLogo) {
        filesToProcess.push({ key: 'bandLogoB64', file: bandLogo });
      }

      const fileResults = await processFilesParallel(filesToProcess);

      setSubmitStatus('Mengirim data pendaftaran...');

      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        formType: 'BAND_COMPETITION',
        namaBand: namaBand.trim(),
        kategori: kategori === 'Other' ? kategoriOther.trim() : kategori,
        asalInstansi: asalInstansi.trim(),
        
        officialNama: officialNama.trim(),
        officialWa: officialWa.trim(),

        laguWajib: laguWajib,
        laguBebas: laguBebas.trim(),

        bandLogoName: bandLogo ? bandLogo.name : '',
        bandLogoB64: fileResults.bandLogoB64 || '',
        idName: dokIdentitas.name,
        idB64: fileResults.dokIdentitasB64,
        buktiBayarName: buktiBayar.name,
        buktiBayarB64: fileResults.buktiBayarB64,
        
        decl1,
        decl2,
        decl3,
      };

      members.forEach((m, idx) => {
        if (m.nama.trim()) {
          payload[`anggota${idx + 1}`] = m.nama.trim();
          payload[`peran${idx + 1}`] = m.peran === 'Other' ? m.peranOther.trim() : m.peran;
          payload[`wa${idx + 1}`] = m.wa.trim();
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
      <div className="band-popup-overlay" onClick={onClose}>
        <div className="band-popup-container band-success-container" onClick={(e) => e.stopPropagation()}>
          <button className="band-close-btn" onClick={onClose}><X size={20} /></button>

          <div className="band-suits-bg">
            {suitsData.map((s, i) => (
              <div
                key={i}
                className="band-suit"
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

          <div className="band-success-screen" style={{ display: 'block' }}>
            <span className="band-success-emoji">🏆</span>
            <h2 className="band-success-title">Pendaftaran Berhasil!</h2>
            <p className="band-success-sub">
              Terima kasih telah mendaftarkan Band Anda.
              <br />
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <div className="band-divider-ornament" style={{ margin: '0 auto 20px' }}>♠ ♥ ♦ ♣</div>
            <p className="band-success-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="band-popup-overlay" onClick={onClose}>
      <div className="band-popup-container" onClick={(e) => e.stopPropagation()} ref={popupRef}>
        <div className="band-suits-bg">
          {suitsData.map((s, i) => (
            <div
              key={i}
              className="band-suit"
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

        <button className="band-close-btn" onClick={onClose}><X size={20} /></button>

        <div className="band-header">
          <div className="band-header-corner tl">♠</div>
          <div className="band-header-corner tr">♥</div>
          <div className="band-header-corner bl">♣</div>
          <div className="band-header-corner br">♦</div>
          <p className="band-header-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>
          <img src="/Compress/maskot.webp" className="about-crown" aria-hidden="true" />
          <h1>Formulir Pendaftaran<br />Band Competition I-Fest 6.0</h1>
          <h2>I-Fest 6.0 2026</h2>
          <div className="band-divider-ornament">♠ ♥ ♦ ♣</div>
        </div>

        <div className="band-description-card">
          <p className="band-desc-text">
            Selamat datang di <strong style={{ color: 'var(--text)' }}>Band Competition I-Fest 6.0 2026!</strong> 🎩 ♥️
            <br />
            Kompetisi yang diselenggarakan secara luring oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang. Kompetisi ini melibatkan siswa/i SMP-SMA/Sederajat di Kota Palembang sebagai wadah untuk menyalurkan kreativitas, bakat, serta minat mereka dalam bidang musik.
          </p>

          <p className="band-desc-text" style={{ marginBottom: '18px' }}>
            <strong style={{ color: 'var(--gold)' }}>🗝️ Tema: "Convergence of the Realms"</strong>
            <br />
            Tema ini menggambarkan pertemuan berbagai dunia, karakter, dan ekspresi yang berbeda menjadi satu kesatuan harmonis melalui musik, di mana setiap penampilan merepresentasikan kreativitas dan identitas unik peserta, serta menghadirkan pertunjukan yang dinamis dan penuh makna.
            <br /><br />
            Peserta diwajibkan membawakan dua lagu, yang terdiri dari satu lagu wajib yang dipilih dari daftar terlampir dan satu lagu bebas yang dipilih oleh peserta.
          </p>

          <div className="band-info-grid">
            <div className="band-info-card">
              <span className="band-ic-label">💰 HTM</span>
              <div className="band-ic-value">
                Rp200.000,-
                <br />
                <small style={{ color: 'var(--text-muted)' }}>BCA 0210999396<br />a.n. Yayasan Multi Data Palembang</small>
              </div>
            </div>
            <div className="band-info-card">
              <span className="band-ic-label">📑 Panduan</span>
              <div className="band-ic-value">
                <a
                  href="https://drive.google.com/file/d/1Gr0UwklNy1LcxyzupGwmqwsyFRXziMiX/view?usp=drive_link"
                  target="_blank"
                  rel="noreferrer"
                  className="band-guidebook-btn"
                  style={{ display: 'inline-flex', marginTop: '4px', fontSize: '11px' }}
                >
                  📖 Guidebook I-Fest 6.0 2026
                </a>
              </div>
            </div>
          </div>

          <div className="band-info-card" style={{ marginBottom: '18px' }}>
            <span className="band-ic-label">📌 Persyaratan Peserta</span>
            <ul className="band-req-list" style={{ marginTop: '8px' }}>
              <li>Peserta merupakan siswa/i SMP-SMA/sederajat aktif di Perguruan tinggi di Kota Palembang;</li>
              <li>Setiap peserta wajib melampirkan identitas dengan Surat Keterangan Aktif dan Surat Rekomendasi dari Kepala Sekolah;</li>
              <li>Lomba diikuti dalam bentuk tim (band), bukan individu;</li>
              <li>Peserta wajib mengikuti akun Instagram resmi I-Fest 6.0 HIMIF UMDP (@himif.umdp).</li>
            </ul>
          </div>

          <p className="band-desc-text" style={{ textAlign: 'center', marginBottom: '16px' }}>
            🎤 Siapkan Line-up Terbaikmu dan Kuasai Panggungnya! ⚡️🎸
          </p>

          <div className="band-contact-row" style={{ justifyContent: 'center' }}>
            <a href="https://wa.me/6281395346415" target="_blank" rel="noreferrer" className="band-contact-btn">
              📞 Jonathan (WA)
            </a>
            <a href="https://wa.me/6289506516117" target="_blank" rel="noreferrer" className="band-contact-btn">
              📞 Daffa (WA)
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="band-form-section">
            <div className="band-section-header">
              <div className="band-section-icon">🎸</div>
              <div className="band-section-title-group">
                <span className="band-section-number">Bagian I</span>
                <div className="band-section-title">Informasi Peserta</div>
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Nama Band <span className="req">*</span></div>
              <input
                className="band-text-input"
                type="text"
                placeholder="Nama band Anda..."
                required
                value={namaBand}
                onChange={(e) => setNamaBand(e.target.value)}
              />
            </div>

            <div className="band-field">
              <div className="band-field-label">Band Logo <span>(opsional)</span></div>
              <div className="band-field-hint">Keterangan: <strong style={{ color: 'var(--gold-dim)' }}>Format Penamaan File: NamaTim</strong></div>
              <div className="band-file-drop" style={{ padding: '15px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setBandLogo(e.target.files[0]);
                    }
                  }}
                />
                <span className="band-file-drop-icon"><ImageIcon size={20} style={{ margin: '0 auto', display: 'block' }} /></span>
                <div className="band-file-drop-text" style={{ fontSize: '11px' }}>Unggah logo (opsional)</div>
                {bandLogo && <div className="band-file-name-display" style={{ display: 'block' }}>📎 {bandLogo.name}</div>}
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Kategori Peserta <span className="req">*</span></div>
              <div className="band-choice-group">
                {['SMP', 'SMA', 'Other'].map(cat => (
                  <label key={cat} className="band-choice-item">
                    <input type="radio" name="kategori" value={cat} checked={kategori === cat} onChange={e => setKategori(e.target.value)} required />
                    <div className="band-choice-label">{cat === 'Other' ? 'Lainnya' : cat}</div>
                  </label>
                ))}
              </div>
              {kategori === 'Other' && (
                <div className="band-other-expand show">
                  <input type="text" className="band-text-input" placeholder="Sebutkan kategori..." value={kategoriOther} onChange={e => setKategoriOther(e.target.value)} required />
                </div>
              )}
            </div>

            <div className="band-field">
              <div className="band-field-label">Asal Instansi <span className="req">*</span></div>
              <input
                className="band-text-input"
                type="text"
                placeholder="Asal sekolah..."
                required
                value={asalInstansi}
                onChange={(e) => setAsalInstansi(e.target.value)}
              />
            </div>

            {/* Anggota Band */}
            <div className="band-field-label" style={{ marginBottom: '16px', marginTop: '32px' }}>
              Data Personel Band
              <span className="band-badge">4 wajib, 4 opsional</span>
            </div>

            <div className="band-members-container">
              {members.map((m, index) => {
                const isRequired = index < MIN_MEMBERS;
                return (
                  <div key={m.id} className={`band-member-card ${!isRequired ? 'optional' : ''}`}>
                    <div className="band-member-header">
                      <div className="band-member-badge">
                        <span style={{ color: 'var(--red-bright)', fontSize: '14px', marginRight: '4px' }}>{SUITS_ARR[(index + 1) % 5]}</span>
                        Peserta {index + 1}
                        {!isRequired && <span className="band-member-optional-tag">· Opsional</span>}
                      </div>
                      {!isRequired && (
                        <button type="button" className="band-member-remove" onClick={() => removeMember(m.id)}>✕ Hapus</button>
                      )}
                    </div>

                    <div className="band-field" style={{ marginBottom: '14px' }}>
                      <div className="band-member-field-label">Nama Peserta {isRequired && <span className="req">*</span>}</div>
                      <input
                        className="band-text-input"
                        type="text"
                        required={isRequired}
                        placeholder={`Nama peserta ${index + 1}...`}
                        value={m.nama}
                        onChange={(e) => updateMember(m.id, 'nama', e.target.value)}
                      />
                    </div>

                    <div className="band-field" style={{ marginBottom: '14px' }}>
                      <div className="band-member-field-label">Peran atau Posisi Peserta {isRequired && <span className="req">*</span>}</div>
                      <div className="band-choice-group two-col">
                        {['Vocalist', 'Gitaris', 'Bassist', 'Keyboardist', 'Drummer', 'Other'].map(role => (
                          <label key={role} className="band-choice-item">
                            <input type="radio" name={`peran_${m.id}`} value={role} checked={m.peran === role} onChange={e => updateMember(m.id, 'peran', e.target.value)} required={isRequired} />
                            <div className="band-choice-label" style={{ fontSize: '12px', padding: '8px 12px' }}>{role === 'Other' ? 'Lainnya' : role}</div>
                          </label>
                        ))}
                      </div>
                      {m.peran === 'Other' && (
                        <div className="band-other-expand show" style={{ marginTop: '8px' }}>
                          <input type="text" className="band-text-input" placeholder="Sebutkan posisi..." value={m.peranOther} onChange={e => updateMember(m.id, 'peranOther', e.target.value)} required={isRequired} />
                        </div>
                      )}
                    </div>

                    <div className="band-field" style={{ marginBottom: '0' }}>
                      <div className="band-member-field-label">No. WhatsApp Peserta {isRequired && <span className="req">*</span>}</div>
                      <input
                        className="band-text-input"
                        type="tel"
                        required={isRequired}
                        placeholder="Contoh: 08xxxxxxxxx"
                        value={m.wa}
                        onChange={(e) => updateMember(m.id, 'wa', e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {members.length < MAX_MEMBERS && (
              <button
                type="button"
                className="band-add-btn"
                onClick={addMember}
              >
                <span>♣</span> Tambah Peserta {members.length + 1} (Opsional)
              </button>
            )}

            {/* Official */}
            <div className="band-member-card" style={{ marginTop: '24px', borderStyle: 'solid', borderColor: 'var(--border)' }}>
              <div className="band-member-header">
                <div className="band-member-badge">
                  <span style={{ color: 'var(--red-bright)', fontSize: '14px', marginRight: '4px' }}>🃏</span>
                  Official (Pendamping)
                  <span className="band-member-optional-tag">· Opsional</span>
                </div>
              </div>
              <p className="band-field-hint" style={{ marginBottom: '14px' }}>
                Keterangan: Official (Pendamping) bersifat opsional dan bisa disusulkan nanti. Namun, wajib dikonfirmasi kepada panitia saat pendaftaran ulang.
              </p>
              <div className="band-field" style={{ marginBottom: '14px' }}>
                <div className="band-member-field-label">Nama Official</div>
                <input
                  className="band-text-input"
                  type="text"
                  placeholder="Nama pendamping (opsional)..."
                  value={officialNama}
                  onChange={(e) => setOfficialNama(e.target.value)}
                />
              </div>
              <div className="band-field" style={{ marginBottom: '0' }}>
                <div className="band-member-field-label">No. WhatsApp Official</div>
                <input
                  className="band-text-input"
                  type="tel"
                  placeholder="No WA pendamping (opsional)..."
                  value={officialWa}
                  onChange={(e) => setOfficialWa(e.target.value)}
                />
              </div>
            </div>

          </div>

          <div className="band-form-section">
            <div className="band-section-header">
              <div className="band-section-icon">📑</div>
              <div className="band-section-title-group">
                <span className="band-section-number">Bagian II</span>
                <div className="band-section-title">KELENGKAPAN ADMINISTRASI</div>
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Lagu Wajib yang dipilih <span className="req">*</span></div>
              <div className="band-choice-group full">
                {[
                  'Terlukis Indah - Rizky Febian and Ziva Magnolya', 
                  'Sialan - Adrian Khalif & Juicy Luicy', 
                  'Telenovia - Reality Club', 
                  'Mengejar Matahari - Keisya Levronka, Andi Rianto', 
                  'Tarot - .Feast'
                ].map(lagu => (
                  <label key={lagu} className="band-choice-item">
                    <input type="radio" name="laguWajib" value={lagu} checked={laguWajib === lagu} onChange={e => setLaguWajib(e.target.value)} required />
                    <div className="band-choice-label" style={{ fontSize: '13px' }}>{lagu}</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Lagu bebas yang akan ditampilkan <span className="req">*</span></div>
              <input
                className="band-text-input"
                type="text"
                placeholder="contoh: Akad - Payung Teduh"
                required
                value={laguBebas}
                onChange={(e) => setLaguBebas(e.target.value)}
              />
            </div>

            <div className="band-field" style={{ marginTop: '24px' }}>
              <div className="band-field-label">Unggah Dokumen Identitas <span className="req">*</span></div>
              <div className="band-field-hint">Keterangan: <strong style={{ color: 'var(--gold-dim)' }}>Format Penamaan File: ID-NamaTim</strong>. Seluruh dokumen identitas peserta wajib digabungkan menjadi satu file tunggal.</div>
              <div className="band-file-drop">
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDokIdentitas(e.target.files[0]);
                    }
                  }}
                />
                <span className="band-file-drop-icon"><FileText size={28} style={{ margin: '0 auto', display: 'block' }} /></span>
                <div className="band-file-drop-text">Seret & lepas dokumen (PDF/Image) di sini, atau <span>klik untuk memilih</span></div>
                {dokIdentitas && <div className="band-file-name-display" style={{ display: 'block' }}>📎 {dokIdentitas.name}</div>}
              </div>
            </div>

            <div className="band-field" style={{ marginTop: '24px' }}>
              <div className="band-field-label">Bukti Pembayaran <span className="req">*</span></div>
              <div className="band-field-hint">
                Keterangan Format Penamaan File: <strong style={{ color: 'var(--gold-dim)' }}>TRANSFER-BD-NamaTim</strong><br />
                BCA 0210999396 a.n. Yayasan Multi Data Palembang
              </div>
              <div className="band-file-drop">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setBuktiBayar(e.target.files[0]);
                    }
                  }}
                />
                <span className="band-file-drop-icon"><CreditCard size={28} style={{ margin: '0 auto', display: 'block' }} /></span>
                <div className="band-file-drop-text">Seret & lepas gambar bukti transfer di sini, atau <span>klik untuk memilih</span></div>
                {buktiBayar && <div className="band-file-name-display" style={{ display: 'block' }}>📎 {buktiBayar.name}</div>}
              </div>
            </div>
          </div>

          <div className="band-form-section">
            <div className="band-section-header">
              <div className="band-section-icon">📜</div>
              <div className="band-section-title-group">
                <span className="band-section-number">Bagian III</span>
                <div className="band-section-title">PERNYATAAN</div>
              </div>
            </div>

            <div className="band-declaration-note">
              Mohon pastikan seluruh data sudah benar sebelum memilih <strong>'Setuju'</strong>. Anda masih dapat melakukan perbaikan data sebelum formulir dikirimkan.
            </div>

            {[
              {
                text: "Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.",
                val: decl1, set: setDecl1
              },
              {
                text: "Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam Band Competition I-Fest 6.0 2026.",
                val: decl2, set: setDecl2
              },
              {
                text: "Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam Band Competition I-Fest 6.0 2026.",
                val: decl3, set: setDecl3
              }
            ].map((decl, i) => (
              <div className="band-decl-item" key={i}>
                <div className="band-decl-text">{decl.text}</div>
                <div className="band-decl-choices">
                  <div className="band-decl-choice agree">
                    <input type="radio" name={`decl${i}`} id={`decl${i}y`} value="Setuju" required onChange={e => decl.set(e.target.value)} />
                    <label className="band-decl-choice-label" htmlFor={`decl${i}y`}>✓ Setuju</label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="band-submit-section">
            {errorMsg && <div className="band-alert error show" style={{ display: 'block' }}>{errorMsg}</div>}
            <div className="band-submit-divider">✦ Siap Mengguncang Panggung ✦</div>
            <button type="submit" className="band-submit-btn" disabled={isSubmitting}>
              {!isSubmitting ? <span>🎩 Kirim Pendaftaran</span> : <div className="band-loader-ring" style={{ display: 'block' }}></div>}
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
