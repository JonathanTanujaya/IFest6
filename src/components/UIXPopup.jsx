import React, { useState, useRef, useMemo } from 'react';
import { X } from 'lucide-react';
import { processFilesParallel, validateFile, FILE_ACCEPT } from '../utils/fileUtils';
import './UIXPopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxj5cmvTuTvhboPXuphqKRP7Js73TnwNzjrNAZPlB4U6u-0CV49GfLgZDPrjL5AOvww-Q/exec';

const MAX_MEMBERS = 3;
const REQ_MEMBERS = 1;
const ICONS = ['✦', '◆', '★'];

const EMPTY_MEMBER = (id) => ({ id, nama: '', kartuIdentitas: null, wa: '', email: '' });

export default function UIXPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
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
  const [decl1, setDecl1] = useState(false);
  const [decl2, setDecl2] = useState(false);
  const [decl3, setDecl3] = useState(false);

  const popupRef = useRef(null);

  // Floating shapes
  const shapesData = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      symbol: ['◇', '△', '○', '□', '✦', '⬡', '◈', '⟡'][i % 8],
      left: Math.random() * 100,
      duration: 18 + Math.random() * 22,
      delay: Math.random() * 18,
      color: i % 2 === 0 ? '#e2b953' : '#c91834',
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

  const handleMemberFile = (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setErrorMsg(err); e.target.value = ''; updateMember(id, 'kartuIdentitas', null); return; }
    setErrorMsg(''); updateMember(id, 'kartuIdentitas', file);
  };

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
    if (!decl1 || !decl2 || !decl3) { errors.push('Seluruh Pernyataan wajib disetujui'); valid = false; }

    if (!valid) {
      setErrorMsg('Mohon lengkapi: ' + errors.join(', ') + '.');
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Mengompres file...');

    try {
      // Collect ALL files and process in parallel (compressed)
      const filesToProcess = [
        { key: 'bayarB64', file: buktiBayar },
      ];

      members.forEach((m, i) => {
        if (m.kartuIdentitas) {
          filesToProcess.push({ key: `kipB64_p${i + 1}`, file: m.kartuIdentitas });
        }
      });

      setSubmitStatus(`Mengompres & memproses ${filesToProcess.length} file...`);
      const fileResults = await processFilesParallel(filesToProcess);

      setSubmitStatus('Mengirim data...');

      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        formType: 'UIX_DESIGN',
        namaTim: namaTim.trim(),
        kategori,
        asalInstansi: asalInstansi.trim(),
        decl1: decl1 ? 'Setuju' : '',
        decl2: decl2 ? 'Setuju' : '',
        decl3: decl3 ? 'Setuju' : '',
        bayarName: buktiBayar.name,
        bayarB64: fileResults.bayarB64,
      };

      // Members — file data already processed in parallel above
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const idx = i + 1;
        payload[`nama_p${idx}`] = m.nama.trim();
        payload[`wa_p${idx}`] = m.wa.trim();
        payload[`email_p${idx}`] = m.email.trim();
        if (m.kartuIdentitas) {
          payload[`kipName_p${idx}`] = m.kartuIdentitas.name;
          payload[`kipB64_p${idx}`] = fileResults[`kipB64_p${idx}`];
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
      setSubmitStatus('');
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSuccess) {
    return (
      <div className="uix-popup-overlay" onClick={onClose}>
        <div className="uix-popup-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <button className="uix-close-btn" onClick={onClose}><X size={24} /></button>
          <div className="uix-shapes-bg">
            {shapesData.map((s, i) => (
              <div key={i} className="uix-shape" style={{ left: `${s.left}%`, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color }}>{s.symbol}</div>
            ))}
          </div>
          <div className="uix-success-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" className="uix-success-icon" />
            <h2 className="uix-success-title">Pendaftaran Berhasil!</h2>
            <p className="uix-success-text">
              Terima kasih telah mendaftarkan tim Anda untuk UI/UX Design Competition I-Fest 6.0 2026.
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <a href="https://chat.whatsapp.com/FtWxugGQsvREjIcLDfqZJ7" target="_blank" rel="noreferrer" className="uix-wa-btn">
              💬 Join Grup WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="uix-popup-overlay" onClick={onClose}>
      <div className="uix-popup-container" onClick={e => e.stopPropagation()} ref={popupRef}>
        
        <div className="uix-shapes-bg">
          {shapesData.map((s, i) => (
            <div key={i} className="uix-shape" style={{ left: `${s.left}%`, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color }}>{s.symbol}</div>
          ))}
        </div>

        <button className="uix-close-btn" onClick={onClose}><X size={24} /></button>

        <div className="uix-header">
          <div className="uix-maskot-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" />
          </div>
          <h1 className="uix-title">UI/UX Design<br />Competition</h1>
          <h2 className="uix-subtitle">I-Fest 6.0 • HIMIF UMDP 2026</h2>
          <div className="uix-ornament"></div>
        </div>

        <div className="uix-desc-section">
          <div className="uix-glass-card full" style={{ marginBottom: '24px' }}>
            <div className="uix-card-title">🎩 Exploring Digital Wonderland</div>
            <p className="uix-card-text">
              Selamat datang di <strong style={{ color: 'var(--gold)' }}>UI/UX Competition I-Fest 6.0 2026!</strong> Kompetisi ini melibatkan siswa SMA dan Mahasiswa di seluruh wilayah Indonesia untuk menguji kemampuan peserta dalam merancang desain User Interface (UI) dan User Experience (UX) untuk aplikasi berbasis mobile.<br /><br />
              Peserta (individu atau tim beranggotakan 2–3 orang) akan diberikan subtema serta topik Sustainable Development Goals (SDGs) secara acak oleh panitia, yang kemudian harus dikembangkan menjadi solusi desain aplikasi mobile berbasis UI/UX.
            </p>
          </div>

          <div className="uix-desc-grid">
            <div className="uix-glass-card">
              <div className="uix-card-title">💰 Biaya & Pembayaran</div>
              <p className="uix-card-text">
                <strong style={{ fontSize: '18px', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Rp60.000,-</strong>
                Transfer ke:<br />
                <strong style={{ color: 'var(--gold)' }}>BCA 0210999396</strong><br />
                a.n. Yayasan Multi Data Palembang
              </p>
            </div>

            <div className="uix-glass-card">
              <div className="uix-card-title">📌 Persyaratan Utama</div>
              <ul className="uix-list">
                <li>Siswa SMA / Mahasiswa aktif</li>
                <li>Individu atau Tim (2-3 orang)</li>
                <li>Mewakili institusi / sekolah / universitas yang sama</li>
              </ul>
              <a href="https://drive.google.com/file/d/1RrfMFTB35t8Vhm4Dq2shydYO_WthBb2i/view?usp=drive_link" target="_blank" rel="noreferrer" className="uix-guide-btn">
                📖 Baca Guidebook Lengkap
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="uix-form-wrapper">
            {/* Step 1: Info Tim */}
            <div className="uix-form-step">
              <div className="uix-step-header">
                <div className="uix-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="uix-step-title">
                  <p>Bagian Pertama</p>
                  <h3>Informasi Tim</h3>
                </div>
              </div>

              <div className="uix-field-group">
                <label className="uix-label">Nama Tim <span className="req">*</span></label>
                <input className="uix-input" type="text" placeholder="Masukkan nama tim Anda..." value={namaTim} onChange={e => setNamaTim(e.target.value)} required />
              </div>

              <div className="uix-field-group">
                <label className="uix-label">Kategori <span className="req">*</span></label>
                <div className="uix-radio-grid">
                  {['SMA', 'Mahasiswa'].map(cat => (
                    <label key={cat} className="uix-radio-card">
                      <input type="radio" name="kategori" value={cat} checked={kategori === cat} onChange={e => setKategori(e.target.value)} required />
                      <div className="uix-radio-label">{cat === 'SMA' ? 'SMA / Sederajat' : 'Mahasiswa'}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="uix-field-group" style={{ marginBottom: 0 }}>
                <label className="uix-label">Asal Instansi <span className="req">*</span></label>
                <input className="uix-input" type="text" placeholder="Nama sekolah / universitas Anda..." value={asalInstansi} onChange={e => setAsalInstansi(e.target.value)} required />
              </div>
            </div>

            {/* Step 2: Anggota Tim */}
            <div className="uix-form-step">
              <div className="uix-step-header">
                <div className="uix-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="uix-step-title">
                  <p>Bagian Kedua</p>
                  <h3>Anggota Tim</h3>
                </div>
              </div>

              {members.map((m, index) => {
                const isRequired = index < REQ_MEMBERS;
                const displayNum = index + 1;
                return (
                  <div key={m.id} className={`uix-member-box ${!isRequired ? 'optional' : ''}`}>
                    <div className="uix-member-header">
                      <div className="uix-member-title">
                        <span style={{ color: index === 0 ? 'var(--gold)' : 'var(--text-dim)' }}>
                          {ICONS[index % 3]}
                        </span> Peserta {displayNum}
                        {!isRequired && <span className="uix-member-badge">Opsional</span>}
                      </div>
                      {!isRequired && (
                        <button type="button" className="uix-btn-remove" onClick={() => removeMember(m.id)}>
                          <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="uix-remove-icon" /> Hapus
                        </button>
                      )}
                    </div>

                    <div className="uix-grid-2">
                      <div className="uix-field-group">
                        <label className="uix-label">Nama Peserta {isRequired && <span className="req">*</span>}</label>
                        <input className="uix-input" type="text" placeholder={`Nama lengkap peserta ${displayNum}...`} required={isRequired} value={m.nama} onChange={e => updateMember(m.id, 'nama', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
                      </div>
                      <div className="uix-field-group">
                        <label className="uix-label">No. WhatsApp {isRequired && <span className="req">*</span>}</label>
                        <input className="uix-input" type="tel" placeholder="08xxxxxxxxxx" required={isRequired} value={m.wa} onChange={e => updateMember(m.id, 'wa', e.target.value.replace(/[^0-9]/g, ''))} />
                      </div>
                    </div>

                    <div className="uix-field-group">
                      <label className="uix-label">Email {isRequired && <span className="req">*</span>}</label>
                      <input className="uix-input" type="email" placeholder="email@contoh.com" required={isRequired} value={m.email} onChange={e => updateMember(m.id, 'email', e.target.value)} />
                    </div>

                    <div className="uix-field-group" style={{ marginBottom: 0 }}>
                      <label className="uix-label">Kartu Identitas {isRequired && <span className="req">*</span>}</label>
                      <div className="uix-hint">
                        Format: <strong style={{ color: 'var(--gold)' }}>KIP-NamaPeserta{displayNum}</strong><br/>
                        <strong style={{color:'var(--gold)'}}>Maks 1 MB, 1 file saja (PDF/Image)</strong>
                      </div>
                      <div className="uix-dropzone">
                        <input type="file" accept={FILE_ACCEPT} required={isRequired} onChange={e => handleMemberFile(m.id, e)} />
                        <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="uix-drop-icon-img" />
                        <div className="uix-drop-text">Seret atau lepas kartu di sini, <span>klik untuk memilih</span></div>
                        {m.kartuIdentitas && <div className="uix-file-name"><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="uix-file-icon" /> {m.kartuIdentitas.name}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {members.length < MAX_MEMBERS && (
                <button type="button" className="uix-btn-add" onClick={addMember}>
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="uix-add-icon" /> Tambah Peserta {members.length + 1}
                </button>
              )}
            </div>

            {/* Step 3: Pembayaran */}
            <div className="uix-form-step">
              <div className="uix-step-header">
                <div className="uix-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="uix-step-title">
                  <p>Bagian Ketiga</p>
                  <h3>Pembayaran</h3>
                </div>
              </div>

              <div className="uix-field-group" style={{ marginBottom: 0 }}>
                <label className="uix-label">Bukti Transfer Pembayaran <span className="req">*</span></label>
                <div className="uix-hint">
                  Format Penamaan File: <strong style={{ color: 'var(--gold)' }}>TRANSFER-UIX-NamaTim</strong><br />
                  BCA 0210999396 a.n. Yayasan Multi Data Palembang<br/>
                  <strong style={{color:'var(--gold)'}}>Maks 1 MB, 1 file saja (Image/PDF)</strong>
                </div>
                <div className="uix-dropzone">
                  <input type="file" accept={FILE_ACCEPT} required onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const err = validateFile(file); if (err) { setErrorMsg(err); e.target.value = ''; setBuktiBayar(null); return; }
                    setErrorMsg(''); setBuktiBayar(file);
                  }} />
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="uix-drop-icon-img" />
                  <div className="uix-drop-text">Seret atau lepas kartu di sini, <span>klik untuk memilih</span></div>
                  {buktiBayar && <div className="uix-file-name"><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="uix-file-icon" /> {buktiBayar.name}</div>}
                </div>
              </div>
            </div>

            {/* Step 4: Pernyataan */}
            <div className="uix-form-step" style={{ marginBottom: '24px' }}>
              <div className="uix-step-header">
                <div className="uix-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="uix-step-title">
                  <p>Bagian Terakhir</p>
                  <h3>Pernyataan</h3>
                </div>
              </div>

              {[
                { text: "Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.", val: decl1, set: setDecl1 },
                { text: "Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam UI/UX Design Competition I-Fest 6.0 2026.", val: decl2, set: setDecl2 },
                { text: "Jika saya melakukan pelanggaran terhadap peraturan yang berlaku, saya siap menerima sanksi yang diberikan, termasuk kemungkinan diskualifikasi dari kompetisi.", val: decl3, set: setDecl3 }
              ].map((decl, i) => (
                <div className="uix-decl-item" key={i}>
                  <div className="uix-decl-text">{decl.text}</div>
                  <div className="uix-decl-choices">
                    <div className="uix-decl-choice agree">
                      <input type="checkbox" id={`decl${i}y`} checked={decl.val} onChange={e => decl.set(e.target.checked)} required />
                      <label className="uix-decl-choice-label" htmlFor={`decl${i}y`}>✓ Setuju</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="uix-submit-section">
              {errorMsg && (
                <div className="uix-alert error">
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="uix-inline-icon" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="uix-submit-divider">✨ Siap Berkarya ✨</div>
              <button type="submit" className="uix-btn-submit" disabled={isSubmitting}>
                {!isSubmitting ? (
                  <><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="uix-submit-icon" /> Kirim Pendaftaran</>
                ) : (
                  <div className="uix-loader"></div>
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
