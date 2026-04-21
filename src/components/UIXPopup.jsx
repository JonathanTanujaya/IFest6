import React, { useState, useRef, useMemo } from 'react';
import { X, CreditCard, FileText } from 'lucide-react';
import './UIXPopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxH5fAtMUh0MOgD76HecoB4xvJ_pdmI7J2J6baEFv77OFr2O8TGqh8a_Tlxnb_cFjR8/exec';

const MAX_MEMBERS = 3;
const REQ_MEMBERS = 1;
const ICONS = ['✦', '◆', '★'];

const EMPTY_MEMBER = (id) => ({ id, nama: '', kartuIdentitas: null, wa: '', email: '' });

export default function UIXPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Team info
  const [namaTim, setNamaTim] = useState('');
  const [kategori, setKategori] = useState('');
  const [asalInstansi, setAsalInstansi] = useState('');

  // Members: peserta 1 required, peserta 2–3 optional via button
  const [members, setMembers] = useState([EMPTY_MEMBER(1)]);

  // Payment
  const [buktiBayar, setBuktiBayar] = useState(null);

  // Declarations
  const [decl1, setDecl1] = useState('');
  const [decl2, setDecl2] = useState('');
  const [decl3, setDecl3] = useState('');

  const popupRef = useRef(null);

  // Floating shapes
  const shapesData = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      symbol: ['◇', '△', '○', '□', '✦', '⬡', '◈', '⟡'][i % 8],
      left: Math.random() * 100,
      bottom: Math.random() * -200,
      duration: 18 + Math.random() * 22,
      delay: Math.random() * 18,
    })), []);

  const addMember = () => {
    if (members.length < MAX_MEMBERS) {
      setMembers([...members, EMPTY_MEMBER(Date.now())]);
    }
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const updateMember = (id, field, value) =>
    setMembers(members.map(m => (m.id === id ? { ...m, [field]: value } : m)));

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleMemberFile = (id, e) => {
    if (e.target.files && e.target.files[0]) {
      updateMember(id, 'kartuIdentitas', e.target.files[0]);
    }
  };

  const fileToBase64 = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(',')[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errors = [];
    let valid = true;

    if (!namaTim.trim()) { errors.push('Nama Tim'); valid = false; }
    if (!kategori) { errors.push('Kategori'); valid = false; }
    if (!asalInstansi.trim()) { errors.push('Asal Instansi'); valid = false; }

    // All members in the list must be fully filled
    members.forEach((m, i) => {
      const label = `Peserta ${i + 1}`;
      if (!m.nama.trim()) { errors.push(`Nama ${label}`); valid = false; }
      if (!m.kartuIdentitas) { errors.push(`Kartu Identitas ${label}`); valid = false; }
      if (!m.wa.trim()) { errors.push(`No. WA ${label}`); valid = false; }
      if (!m.email.trim()) { errors.push(`Email ${label}`); valid = false; }
    });

    if (!buktiBayar) { errors.push('Bukti Pembayaran'); valid = false; }
    if (!decl1 || !decl2 || !decl3) { errors.push('Pernyataan'); valid = false; }

    if (!valid) {
      setErrorMsg('Mohon lengkapi: ' + errors.join(', ') + '.');
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const bayarB64 = await fileToBase64(buktiBayar);

      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        formType: 'UIX_DESIGN',
        namaTim: namaTim.trim(),
        kategori,
        asalInstansi: asalInstansi.trim(),
        decl1, decl2, decl3,
        bayarName: buktiBayar.name,
        bayarB64,
      };

      // Members
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const idx = i + 1;
        payload[`nama_p${idx}`] = m.nama.trim();
        payload[`wa_p${idx}`] = m.wa.trim();
        payload[`email_p${idx}`] = m.email.trim();
        if (m.kartuIdentitas) {
          payload[`kipName_p${idx}`] = m.kartuIdentitas.name;
          payload[`kipB64_p${idx}`] = await fileToBase64(m.kartuIdentitas);
        }
      }

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
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ── SUCCESS SCREEN ── */
  if (isSuccess) {
    return (
      <div className="uix-popup-overlay" onClick={onClose}>
        <div className="uix-popup-container uix-success-container" onClick={e => e.stopPropagation()}>
          <button className="uix-close-btn" onClick={onClose}><X size={20} /></button>
          <div className="uix-shapes-bg">
            {shapesData.map((s, i) => (
              <div key={i} className="uix-shape" style={{
                left: `${s.left}%`, bottom: `${s.bottom}px`,
                animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
              }}>{s.symbol}</div>
            ))}
          </div>
          <div className="uix-success-screen">
            <span className="uix-success-emoji">🏆</span>
            <h2 className="uix-success-title">Pendaftaran Berhasil!</h2>
            <p className="uix-success-sub">
              Terima kasih telah mendaftarkan tim Anda untuk UI/UX Design Competition I-Fest 6.0 2026.<br />
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <div className="uix-divider-ornament">◇ △ ○ □</div>
            <p className="uix-success-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
            <div style={{ marginTop: '28px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://wa.me/6281993996633" target="_blank" rel="noreferrer" className="uix-contact-btn">📞 Grup WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN FORM ── */
  return (
    <div className="uix-popup-overlay" onClick={onClose}>
      <div className="uix-popup-container" onClick={e => e.stopPropagation()} ref={popupRef}>

        {/* Floating Shapes Background */}
        <div className="uix-shapes-bg">
          {shapesData.map((s, i) => (
            <div key={i} className="uix-shape" style={{
              left: `${s.left}%`, bottom: `${s.bottom}px`,
              animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
            }}>{s.symbol}</div>
          ))}
        </div>

        <button className="uix-close-btn" onClick={onClose}><X size={20} /></button>

        {/* HEADER */}
        <div className="uix-header">
          <div className="uix-header-corner tl">◇</div>
          <div className="uix-header-corner tr">△</div>
          <div className="uix-header-corner bl">○</div>
          <div className="uix-header-corner br">□</div>
          <p className="uix-header-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>
          <span className="uix-hat-icon">🎨</span>
          <h1>UI/UX Design<br />Competition</h1>
          <h2>Formulir Pendaftaran I-Fest 6.0 — 2026</h2>
          <div className="uix-divider-ornament">◇ △ ○ □</div>
        </div>

        {/* DESCRIPTION */}
        <div className="uix-description-card">
          <p className="uix-desc-text">
            Selamat datang di <strong style={{ color: 'var(--uix-text)' }}>UI/UX Competition I-Fest 6.0 2026!</strong> 🎩♥️<br />
            Kompetisi yang diselenggarakan secara daring oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang. Kompetisi ini melibatkan siswa SMA dan Mahasiswa di seluruh wilayah Indonesia untuk menguji kemampuan peserta dalam merancang desain User Interface (UI) dan User Experience (UX) untuk aplikasi berbasis mobile.
          </p>
          <p className="uix-desc-text">
            Metode atau format yang digunakan dalam kompetisi ini adalah sistem berbasis design thinking dan project-based competition, di mana peserta akan mengikuti beberapa tahapan utama, mulai dari pendaftaran, technical meeting, pengerjaan karya, hingga presentasi dan penilaian akhir. Dalam kompetisi ini, peserta (individu atau tim beranggotakan 2–3 orang) akan diberikan subtema serta topik Sustainable Development Goals (SDGs) secara acak oleh panitia, yang kemudian harus dikembangkan menjadi solusi desain aplikasi mobile berbasis UI/UX.
          </p>
          <p className="uix-desc-text" style={{ marginBottom: '18px' }}>
            <strong style={{ color: 'var(--uix-cyan)' }}>🗝️ Tema: "Exploring Digital Wonderland: Designing Meaningful Solutions for a Better Future"</strong><br />
            Tema ini mengajak peserta untuk mengeksplorasi dan merancang solusi digital yang inovatif serta bermakna dalam menjawab berbagai permasalahan yang selaras dengan Sustainable Development Goals (SDGs). Peserta diharapkan mampu mengidentifikasi permasalahan nyata di berbagai sektor seperti pendidikan, kesehatan, lingkungan, sosial, dan smart city, kemudian mengembangkan solusi berbasis desain UI/UX yang berfokus pada kebutuhan pengguna (user-centered design).
          </p>

          <div className="uix-requirements-box">
            <div className="uix-req-title">📌 Persyaratan Peserta</div>
            <ul className="uix-req-list">
              <li>Peserta merupakan siswa aktif Sekolah Menengah Atas atau mahasiswa aktif Perguruan Tinggi yang dibuktikan dengan Kartu Pelajar atau Kartu Tanda Mahasiswa;</li>
              <li>Peserta dapat berpartisipasi secara individu maupun tim (2–3 orang) sesuai kategori (SMA sederajat/Mahasiswa);</li>
              <li>Peserta wajib mengikuti seluruh rangkaian kegiatan dan mematuhi semua aturan kompetisi;</li>
              <li>Peserta yang mengikuti lomba harus merupakan peserta yang telah terdaftar dan tidak dapat digantikan oleh orang lain.</li>
            </ul>
          </div>

          <div className="uix-info-grid">
            <div className="uix-info-card">
              <span className="uix-ic-label">💰 HTM</span>
              <div className="uix-ic-value">
                Rp60.000,-<br />
                <small style={{ color: 'var(--uix-text-muted)' }}>BCA 0210999396<br />a.n. Yayasan Multi Data Palembang</small>
              </div>
            </div>
            <div className="uix-info-card">
              <span className="uix-ic-label">📑 Panduan</span>
              <div className="uix-ic-value">
                <a href="https://drive.google.com/file/d/1RrfMFTB35t8Vhm4Dq2shydYO_WthBb2i/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="uix-guidebook-btn">
                  📖 Guidebook I-Fest 6.0 2026 ↗
                </a>
              </div>
            </div>
          </div>

          <p className="uix-desc-text" style={{ textAlign: 'center', margin: '16px 0 14px' }}>
            💡 Siapkan Tim Terbaikmu dan Jadilah <strong style={{ color: 'var(--uix-cyan)' }}>JUARA!</strong> 🏆
          </p>

          <div className="uix-contact-row">
            <a href="https://wa.me/6281993996633" target="_blank" rel="noreferrer" className="uix-contact-btn">📞 Migel (WA)</a>
            <a href="https://wa.me/6282179970473" target="_blank" rel="noreferrer" className="uix-contact-btn">📞 Fadhel (WA)</a>
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit}>

          {/* SECTION 1 */}
          <div className="uix-form-section">
            <div className="uix-section-header">
              <div className="uix-section-icon">🎨</div>
              <div className="uix-section-title-group">
                <span className="uix-section-number">Bagian I</span>
                <div className="uix-section-title">Informasi Tim &amp; Peserta</div>
              </div>
            </div>

            {/* Nama Tim */}
            <div className="uix-field">
              <div className="uix-field-label">Nama Tim <span className="req">*</span></div>
              <input
                className="uix-text-input"
                type="text"
                placeholder="Nama tim Anda…"
                required
                value={namaTim}
                onChange={e => setNamaTim(e.target.value)}
              />
            </div>

            {/* Kategori */}
            <div className="uix-field">
              <div className="uix-field-label">Kategori <span className="req">*</span></div>
              <div className="uix-choice-group">
                <div className="uix-choice-item">
                  <input type="radio" name="kategori" id="kat-sma" value="SMA" required onChange={e => setKategori(e.target.value)} />
                  <label className="uix-choice-label" htmlFor="kat-sma">🏫 SMA / Sederajat</label>
                </div>
                <div className="uix-choice-item">
                  <input type="radio" name="kategori" id="kat-mhs" value="Mahasiswa" onChange={e => setKategori(e.target.value)} />
                  <label className="uix-choice-label" htmlFor="kat-mhs">🎓 Mahasiswa</label>
                </div>
              </div>
            </div>

            {/* Asal Instansi */}
            <div className="uix-field">
              <div className="uix-field-label">Asal Instansi <span className="req">*</span></div>
              <input
                className="uix-text-input"
                type="text"
                placeholder="Nama sekolah / universitas Anda…"
                required
                value={asalInstansi}
                onChange={e => setAsalInstansi(e.target.value)}
              />
            </div>

            {/* MEMBERS */}
            <div className="uix-field-label" style={{ marginBottom: '16px', marginTop: '8px' }}>
              Anggota Tim <span className="req">*</span>
              <span className="uix-badge" style={{ marginLeft: '8px' }}>Maks. {MAX_MEMBERS} peserta</span>
            </div>

            <div className="uix-members-container">
              {members.map((m, index) => {
                const isRequired = index < REQ_MEMBERS;
                const displayNum = index + 1;
                return (
                  <div key={m.id} className={`uix-player-card${index === 0 ? ' leader' : ''}${!isRequired ? ' optional' : ''}`}>
                    <div className="uix-player-header">
                      <div className="uix-player-badge">
                        <span style={{ color: index === 0 ? 'var(--uix-cyan)' : 'var(--uix-text-muted)', marginRight: '6px' }}>
                          {ICONS[index % 3]}
                        </span>
                        Peserta {displayNum}
                        {!isRequired && (
                          <span className="uix-badge" style={{ marginLeft: '8px' }}>· Opsional</span>
                        )}
                      </div>
                      {!isRequired && (
                        <button type="button" className="uix-member-remove" onClick={() => removeMember(m.id)}>✕ Hapus</button>
                      )}
                    </div>

                    {/* Nama + WA */}
                    <div className="uix-player-grid" style={{ marginBottom: '12px' }}>
                      <div>
                        <div className="uix-member-field-label">Nama Peserta {displayNum} {isRequired && <span className="req">*</span>}</div>
                        <input
                          className="uix-text-input"
                          type="text"
                          placeholder={`Nama lengkap peserta ${displayNum}…`}
                          required={isRequired}
                          value={m.nama}
                          onChange={e => updateMember(m.id, 'nama', e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="uix-member-field-label">No. WhatsApp Peserta {displayNum} {isRequired && <span className="req">*</span>}</div>
                        <input
                          className="uix-text-input"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          required={isRequired}
                          value={m.wa}
                          onChange={e => updateMember(m.id, 'wa', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '12px' }}>
                      <div className="uix-member-field-label">Email Peserta {displayNum} {isRequired && <span className="req">*</span>}</div>
                      <input
                        className="uix-text-input"
                        type="email"
                        placeholder="email@contoh.com"
                        required={isRequired}
                        value={m.email}
                        onChange={e => updateMember(m.id, 'email', e.target.value)}
                      />
                    </div>

                    {/* Kartu Identitas */}
                    <div>
                      <div className="uix-member-field-label">Kartu Identitas Peserta {displayNum} {isRequired && <span className="req">*</span>}</div>
                      <div className="uix-field-hint">Format: <strong style={{ color: 'var(--uix-cyan-dim)' }}>KIP-NamaPeserta{displayNum}</strong></div>
                      <div className="uix-file-drop small">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          required={isRequired}
                          onChange={e => handleMemberFile(m.id, e)}
                        />
                        <span className="uix-file-drop-icon"><FileText size={22} style={{ margin: '0 auto', display: 'block' }} /></span>
                        <div className="uix-file-drop-text">Seret &amp; lepas file di sini, atau <span>klik untuk memilih</span></div>
                        {m.kartuIdentitas && <div className="uix-file-name-display">📎 {m.kartuIdentitas.name}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" className="uix-add-btn" onClick={addMember} disabled={members.length >= MAX_MEMBERS}>
              <span>◇</span> {members.length >= MAX_MEMBERS ? `Maks. ${MAX_MEMBERS} Peserta Tercapai` : `Tambah Peserta (${members.length}/${MAX_MEMBERS})`}
            </button>

            {/* BUKTI BAYAR */}
            <div className="uix-field" style={{ marginTop: '8px' }}>
              <div className="uix-field-label">Bukti Transfer Pembayaran <span className="req">*</span></div>
              <div className="uix-field-hint">
                Format Penamaan File: <strong style={{ color: 'var(--uix-cyan-dim)' }}>TRANSFER-UIX-NamaTim</strong><br />
                BCA 0210999396 a.n. Yayasan Multi Data Palembang
              </div>
              <div className="uix-file-drop">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={e => { if (e.target.files?.[0]) setBuktiBayar(e.target.files[0]); }}
                />
                <span className="uix-file-drop-icon"><CreditCard size={28} style={{ margin: '0 auto', display: 'block' }} /></span>
                <div className="uix-file-drop-text">Seret &amp; lepas bukti transfer di sini, atau <span>klik untuk memilih</span></div>
                {buktiBayar && <div className="uix-file-name-display">📎 {buktiBayar.name}</div>}
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="uix-form-section">
            <div className="uix-section-header">
              <div className="uix-section-icon">📜</div>
              <div className="uix-section-title-group">
                <span className="uix-section-number">Bagian II</span>
                <div className="uix-section-title">Pernyataan</div>
              </div>
            </div>

            <div className="uix-declaration-note">
              ⚠️ Mohon pastikan seluruh data sudah benar sebelum memilih <strong>'Setuju'</strong>. Anda masih dapat melakukan perbaikan data sebelum formulir dikirimkan.
            </div>

            {[
              {
                text: 'Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.',
                val: decl1, set: setDecl1,
              },
              {
                text: 'Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam UI/UX Design Competition I-Fest 6.0 2026.',
                val: decl2, set: setDecl2,
              },
              {
                text: 'Jika saya melakukan pelanggaran terhadap peraturan yang berlaku, saya siap menerima sanksi yang diberikan, termasuk kemungkinan diskualifikasi dari kompetisi.',
                val: decl3, set: setDecl3,
              },
            ].map((decl, i) => (
              <div className="uix-decl-item" key={i}>
                <div className="uix-decl-text">{decl.text}</div>
                <div className="uix-decl-choices">
                  <div className="uix-decl-choice agree">
                    <input
                      type="radio"
                      name={`uixdecl${i}`}
                      id={`uixdecl${i}y`}
                      value="Setuju"
                      required
                      onChange={e => decl.set(e.target.value)}
                    />
                    <label className="uix-decl-choice-label" htmlFor={`uixdecl${i}y`}>✓ Setuju</label>
                  </div>
                  <div className="uix-decl-choice disagree">
                    <input
                      type="radio"
                      name={`uixdecl${i}`}
                      id={`uixdecl${i}n`}
                      value="Tidak Setuju"
                      onChange={e => decl.set(e.target.value)}
                    />
                    <label className="uix-decl-choice-label" htmlFor={`uixdecl${i}n`}>✗ Tidak Setuju</label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT */}
          <div className="uix-submit-section">
            {errorMsg && <div className="uix-alert error">{errorMsg}</div>}
            <div className="uix-submit-divider">✦ Siap Berkarya ✦</div>
            <button type="submit" className="uix-submit-btn" disabled={isSubmitting}>
              {!isSubmitting
                ? <span>🎨 Kirim Pendaftaran</span>
                : <div className="uix-loader-ring"></div>}
            </button>
            <p style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--uix-text-muted)', fontStyle: 'italic' }}>
              Dengan mengirimkan formulir ini, Anda menyetujui seluruh ketentuan yang berlaku.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
