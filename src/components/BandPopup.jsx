import React, { useState, useRef, useMemo } from 'react';
import { X, FileText, CreditCard, Image as ImageIcon } from 'lucide-react';
import './BandPopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxH5fAtMUh0MOgD76HecoB4xvJ_pdmI7J2J6baEFv77OFr2O8TGqh8a_Tlxnb_cFjR8/exec';
const ROLES = ['Vocalist', 'Gitaris', 'Bassist', 'Keyboardist', 'Drummer', 'Lainnya'];
const ROLE_EMOJIS = ['🎤', '🎸', '🎵', '🎹', '🥁', '✏️'];
const SUITS_ARR = ['♠', '♥', '♦', '♣'];
const MAX_MEMBERS = 8;
const REQ_MEMBERS = 4;

export default function BandPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [namaBand, setNamaBand] = useState('');
  const [kategori, setKategori] = useState('');
  const [kategoriOther, setKategoriOther] = useState('');
  const [asalInstansi, setAsalInstansi] = useState('');
  
  const [members, setMembers] = useState([
    { id: 1, nama: '', wa: '', peran: '', peranLainnya: '' },
    { id: 2, nama: '', wa: '', peran: '', peranLainnya: '' },
    { id: 3, nama: '', wa: '', peran: '', peranLainnya: '' },
    { id: 4, nama: '', wa: '', peran: '', peranLainnya: '' }
  ]);
  
  const [namaOfficial, setNamaOfficial] = useState('');
  const [waOfficial, setWaOfficial] = useState('');
  
  const [laguWajib, setLaguWajib] = useState('');
  const [laguBebas, setLaguBebas] = useState('');
  
  const [bandLogo, setBandLogo] = useState(null);
  const [dokIdentitas, setDokIdentitas] = useState(null);
  const [buktiBayar, setBuktiBayar] = useState(null);

  const [decl1, setDecl1] = useState('');
  const [decl2, setDecl2] = useState('');
  const [decl3, setDecl3] = useState('');

  const popupRef = useRef(null);

  // Generate random data for floating suits once
  const suitsData = useMemo(() => {
    return Array.from({length: 14}).map((_, i) => ({
      suit: ['♠','♥','♦','♣','🃏'][i % 5],
      left: Math.random() * 100,
      bottom: Math.random() * -200,
      duration: 18 + Math.random() * 20,
      delay: Math.random() * 15,
      color: i % 2 === 0 ? '#d4a93f' : '#a81528'
    }));
  }, []);

  const addMember = () => {
    if (members.length < MAX_MEMBERS) {
      setMembers([...members, { id: Date.now(), nama: '', wa: '', peran: '', peranLainnya: '' }]);
    }
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const updateMember = (id, field, value) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(',')[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Validation
    let valid = true;
    const errors = [];

    const finalKategori = kategori === 'other' ? kategoriOther.trim() : kategori;
    if (!finalKategori) { errors.push('Kategori'); valid = false; }
    
    const validMembers = [];
    members.forEach((m, i) => {
      const isReq = i < REQ_MEMBERS;
      let finalPeran = m.peran === 'Lainnya' ? m.peranLainnya.trim() : m.peran;
      if (isReq) {
        if (!m.nama.trim()) { errors.push(`Nama Peserta ${i+1}`); valid = false; }
        if (!m.wa.trim()) { errors.push(`No. WA Peserta ${i+1}`); valid = false; }
        if (!finalPeran) { errors.push(`Peran Peserta ${i+1}`); valid = false; }
      }
      if (m.nama.trim()) {
        validMembers.push({ nama: m.nama.trim(), wa: m.wa.trim(), peran: finalPeran });
      }
    });

    if (validMembers.filter((_,i) => i < REQ_MEMBERS).length < REQ_MEMBERS && valid) {
      errors.push('Lengkapi data 4 peserta utama'); valid = false;
    }

    if (!laguWajib) { errors.push('Lagu Wajib'); valid = false; }
    if (!dokIdentitas) { errors.push('Dokumen Identitas'); valid = false; }
    if (!buktiBayar) { errors.push('Bukti Pembayaran'); valid = false; }
    if (!decl1 || !decl2 || !decl3) { errors.push('Pernyataan'); valid = false; }

    if (!valid) {
      setErrorMsg('Mohon lengkapi: ' + errors.join(', ') + '.');
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const memberRows = validMembers.map((m, i) =>
        `Peserta ${i+1}: ${m.nama} | ${m.peran} | ${m.wa}`
      ).join('\n');

      let logoB64 = '', logoName = '';
      if (bandLogo) {
        logoB64 = await fileToBase64(bandLogo);
        logoName = bandLogo.name;
      }
      const dokIdB64 = await fileToBase64(dokIdentitas);
      const bayarB64 = await fileToBase64(buktiBayar);

      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        namaBand: namaBand.trim(),
        kategori: finalKategori,
        instansi: asalInstansi.trim(),
        anggota: memberRows,
        namaOfficial: namaOfficial.trim(),
        waOfficial: waOfficial.trim(),
        laguWajib,
        laguBebas: laguBebas.trim(),
        decl1,
        decl2,
        decl3,
        // Files
        logoName, logoB64,
        dokIdName: dokIdentitas.name, dokIdB64,
        bayarName: buktiBayar.name, bayarB64,
      };

      // Members individual columns
      validMembers.forEach((m, i) => {
        payload['nama_p' + (i+1)] = m.nama;
        payload['peran_p' + (i+1)] = m.peran;
        payload['wa_p' + (i+1)] = m.wa;
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
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSuccess) {
    return (
      <div className="band-popup-overlay" onClick={onClose}>
        <div className="band-popup-container band-success-container" onClick={e => e.stopPropagation()}>
          <button className="band-close-btn" onClick={onClose}><X size={20} /></button>
          
          <div className="band-suits-bg">
            {suitsData.map((s, i) => (
              <div key={i} className="band-suit" style={{
                left: `${s.left}%`, bottom: `${s.bottom}px`,
                animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color
              }}>{s.suit}</div>
            ))}
          </div>

          <div className="band-success-screen" style={{ display: 'block' }}>
            <span className="band-success-emoji">🎩</span>
            <h2 className="band-success-title">Pendaftaran Berhasil!</h2>
            <p className="band-success-sub">
              Terima kasih telah mendaftarkan band Anda untuk Band Competition I-Fest 6.0 2026.<br/>
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <div className="band-divider-ornament" style={{ margin: '0 auto 20px' }}>♠ ♥ ♦ ♣</div>
            <p className="band-success-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
            <div style={{ marginTop: '28px' }}>
              <a href="https://chat.whatsapp.com/L8EReuHY2g68fXIjnjC4sx?mode=gi_t" target="_blank" rel="noreferrer" className="band-contact-btn" style={{ display: 'inline-flex' }}>
                📞 Grup WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="band-popup-overlay" onClick={onClose}>
      <div className="band-popup-container" onClick={e => e.stopPropagation()} ref={popupRef}>
        
        {/* Floating Suits Background */}
        <div className="band-suits-bg">
          {suitsData.map((s, i) => (
            <div key={i} className="band-suit" style={{
              left: `${s.left}%`, bottom: `${s.bottom}px`,
              animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color
            }}>{s.suit}</div>
          ))}
        </div>

        <button className="band-close-btn" onClick={onClose}><X size={20} /></button>

        {/* HEADER */}
        <div className="band-header">
          <div className="band-header-corner tl">♠</div>
          <div className="band-header-corner tr">♥</div>
          <div className="band-header-corner bl">♣</div>
          <div className="band-header-corner br">♦</div>
          <p className="band-header-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>
          <span className="band-hat-icon">🎩</span>
          <h1>Band Competition<br/>I-Fest 6.0</h1>
          <h2>Formulir Pendaftaran 2026</h2>
          <div className="band-divider-ornament">♠ ♥ ♦ ♣</div>
        </div>

        {/* DESCRIPTION */}
        <div className="band-description-card">
          <p className="band-desc-text">
            Selamat datang di <strong style={{color: 'var(--text)'}}>Band Competition I-Fest 6.0 2026!</strong> 🎩♥️<br/>
            Kompetisi yang diselenggarakan secara luring oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang. Kompetisi ini melibatkan siswa/i SMP-SMA/Sederajat di Kota Palembang sebagai wadah untuk menyalurkan kreativitas, bakat, serta minat mereka dalam bidang musik.
          </p>
          <p className="band-desc-text" style={{marginBottom: '18px'}}>
            <strong style={{color: 'var(--gold)'}}>🗝️ Tema: "Convergence of the Realms"</strong><br/>
            Tema ini menggambarkan pertemuan berbagai dunia, karakter, dan ekspresi yang berbeda menjadi satu kesatuan harmonis melalui musik, di mana setiap penampilan merepresentasikan kreativitas dan identitas unik peserta.
          </p>
          <p className="band-desc-text" style={{marginBottom: '6px'}}>Peserta diwajibkan membawakan <strong style={{color: 'var(--text)'}}>dua lagu</strong>: satu lagu wajib dan satu lagu bebas.</p>

          <div className="band-info-grid">
            <div className="band-info-card" style={{ gridColumn: 'span 2' }}>
              <span className="band-ic-label">🎶 Lagu Wajib (pilih salah satu)</span>
              <ol className="band-song-list">
                <li><span className="band-song-num">1.</span>Terlukis Indah — Rizky Febian & Ziva Magnolya</li>
                <li><span className="band-song-num">2.</span>Sialan — Adrian Khalif & Juicy Luicy</li>
                <li><span className="band-song-num">3.</span>Telenovia — Reality Club</li>
                <li><span className="band-song-num">4.</span>Mengejar Matahari — Keisya Levronka, Andi Rianto</li>
                <li><span className="band-song-num">5.</span>Tarot — .Feast</li>
              </ol>
            </div>
            <div className="band-info-card">
              <span className="band-ic-label">💰 HTM</span>
              <div className="band-ic-value">Rp200.000,-<br/><small style={{color: 'var(--text-muted)'}}>BCA 0210999396<br/>a.n. Yayasan Multi Data Palembang</small></div>
            </div>
            <div className="band-info-card">
              <span className="band-ic-label">📑 Panduan</span>
              <div className="band-ic-value">
                <a href="#" target="_blank" rel="noopener noreferrer" className="band-guidebook-btn" style={{display: 'inline-flex', marginTop: '4px', fontSize: '12px'}}>
                  📖 Guidebook I-Fest 6.0 2026 ↗
                </a>
              </div>
            </div>
          </div>

          <div className="band-info-card" style={{marginBottom: '18px'}}>
            <span className="band-ic-label">📌 Persyaratan Peserta</span>
            <ul className="band-req-list" style={{marginTop: '8px'}}>
              <li>Peserta merupakan siswa/i SMP-SMA/sederajat aktif di Kota Palembang;</li>
              <li>Setiap peserta wajib melampirkan Surat Keterangan Aktif dan Surat Rekomendasi dari Kepala Sekolah;</li>
              <li>Lomba diikuti dalam bentuk tim (band), bukan individu;</li>
              <li>Peserta wajib mengikuti akun Instagram resmi I-Fest 6.0 HIMIF UMDP <a href="https://instagram.com/himif.umdp" target="_blank" rel="noreferrer" style={{color: 'var(--red-bright)'}}>@himif.umdp</a>.</li>
            </ul>
          </div>

          <p className="band-desc-text" style={{textAlign: 'center', marginBottom: '16px'}}>
            🎤 Siapkan Line-up Terbaikmu dan Kuasai Panggungnya! ⚡🎸
          </p>

          <div className="band-contact-row" style={{justifyContent: 'center'}}>
            <a href="https://wa.me/6281395346415" target="_blank" rel="noreferrer" className="band-contact-btn">
              📞 Jonathan (WA)
            </a>
            <a href="https://wa.me/6289506516117" target="_blank" rel="noreferrer" className="band-contact-btn">
              📞 Daffa (WA)
            </a>
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit}>
          
          {/* SECTION 1 */}
          <div className="band-form-section">
            <div className="band-section-header">
              <div className="band-section-icon">🎸</div>
              <div className="band-section-title-group">
                <span className="band-section-number">Bagian I</span>
                <div className="band-section-title">Informasi Band &amp; Peserta</div>
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Nama Band <span className="req">*</span></div>
              <input className="band-text-input" type="text" placeholder="Nama band Anda…" required value={namaBand} onChange={e => setNamaBand(e.target.value)} />
            </div>

            <div className="band-field">
              <div className="band-field-label">Band Logo <span className="band-badge">Opsional</span></div>
              <div className="band-field-hint">Format Penamaan File: <strong style={{color: 'var(--gold-dim)'}}>NamaTim</strong> &nbsp;·&nbsp; Hanya file gambar (JPG, PNG, WEBP)</div>
              <div className="band-file-drop">
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBandLogo)} />
                <span className="band-file-drop-icon"><ImageIcon size={28} style={{margin: '0 auto', display: 'block'}} /></span>
                <div className="band-file-drop-text">Seret & lepas logo di sini, atau <span>klik untuk memilih</span></div>
                {bandLogo && <div className="band-file-name-display" style={{display: 'block'}}>📎 {bandLogo.name}</div>}
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Kategori Peserta <span className="req">*</span></div>
              <div className="band-choice-group two-col">
                <div className="band-choice-item">
                  <input type="radio" name="kategori" id="k-smp" value="SMP" onChange={e => setKategori(e.target.value)} required />
                  <label className="band-choice-label" htmlFor="k-smp">🏫 SMP</label>
                </div>
                <div className="band-choice-item">
                  <input type="radio" name="kategori" id="k-sma" value="SMA" onChange={e => setKategori(e.target.value)} />
                  <label className="band-choice-label" htmlFor="k-sma">🏫 SMA / Sederajat</label>
                </div>
                <div className="band-choice-item">
                  <input type="radio" name="kategori" id="k-other" value="other" onChange={e => setKategori(e.target.value)} />
                  <label className="band-choice-label" htmlFor="k-other">✏️ Lainnya</label>
                </div>
              </div>
              {kategori === 'other' && (
                <div className="band-other-expand show">
                  <input className="band-text-input" type="text" placeholder="Sebutkan kategori Anda…" required value={kategoriOther} onChange={e => setKategoriOther(e.target.value)} />
                </div>
              )}
            </div>

            <div className="band-field">
              <div className="band-field-label">Asal Instansi <span className="req">*</span></div>
              <input className="band-text-input" type="text" placeholder="Nama sekolah / instansi Anda…" required value={asalInstansi} onChange={e => setAsalInstansi(e.target.value)} />
            </div>

            {/* MEMBERS */}
            <div className="band-field-label" style={{marginBottom: '16px', marginTop: '24px'}}>
              Anggota Band <span className="req">*</span>
              <span className="band-badge">Maks. {MAX_MEMBERS} peserta</span>
            </div>

            <div className="band-members-container">
              {members.map((m, index) => {
                const isRequired = index < REQ_MEMBERS;
                return (
                  <div key={m.id} className={`band-member-card ${!isRequired ? 'optional' : ''}`}>
                    <div className="band-member-header">
                      <div className="band-member-badge">
                        <span style={{color: 'var(--red-bright)', fontSize:'14px', marginRight: '4px'}}>{SUITS_ARR[index % 4]}</span> Peserta {index + 1} {!isRequired && <span className="band-member-optional-tag">· Opsional</span>}
                      </div>
                      {!isRequired && (
                        <button type="button" className="band-member-remove" onClick={() => removeMember(m.id)}>✕ Hapus</button>
                      )}
                    </div>
                    <div className="band-member-grid">
                      <div>
                        <div className="band-member-field-label">Nama Lengkap {isRequired && <span className="req">*</span>}</div>
                        <input className="band-text-input" type="text" placeholder={`Nama peserta ${index + 1}…`} required={isRequired} value={m.nama} onChange={e => updateMember(m.id, 'nama', e.target.value)} />
                      </div>
                      <div>
                        <div className="band-member-field-label">No. WhatsApp {isRequired && <span className="req">*</span>}</div>
                        <input className="band-text-input" type="tel" placeholder="08xxxxxxxxxx" required={isRequired} value={m.wa} onChange={e => updateMember(m.id, 'wa', e.target.value)} />
                      </div>
                    </div>
                    <div style={{marginTop: '14px'}}>
                      <div className="band-member-field-label">Peran / Posisi {isRequired && <span className="req">*</span>}</div>
                      <div className="band-role-grid">
                        {ROLES.map((r, i) => (
                          <div key={i} className="band-role-chip">
                            <input type="radio" name={`role_${m.id}`} id={`role_${m.id}_${i}`} value={r} required={isRequired} checked={m.peran === r} onChange={e => updateMember(m.id, 'peran', e.target.value)} />
                            <label className="band-role-chip-label" htmlFor={`role_${m.id}_${i}`}>{ROLE_EMOJIS[i]} {r}</label>
                          </div>
                        ))}
                      </div>
                      {m.peran === 'Lainnya' && (
                        <div className="band-other-expand show" style={{marginTop: '8px'}}>
                          <input className="band-text-input" type="text" placeholder="Sebutkan posisi Anda…" required={isRequired} value={m.peranLainnya} onChange={e => updateMember(m.id, 'peranLainnya', e.target.value)} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" className="band-add-btn" onClick={addMember} disabled={members.length >= MAX_MEMBERS}>
              <span>♣</span> {members.length >= MAX_MEMBERS ? `Maks. ${MAX_MEMBERS} Anggota Tercapai` : `Tambah Anggota (${members.length}/${MAX_MEMBERS})`}
            </button>

            {/* Official */}
            <div style={{marginTop: '32px'}}>
              <div className="band-field-label">Official / Pendamping <span className="band-badge">Opsional</span></div>
              <p className="band-section-note">Official (Pendamping) bersifat opsional dan bisa disusulkan nanti. Namun, wajib dikonfirmasi kepada panitia saat pendaftaran ulang.</p>
              <div className="band-official-box">
                <div className="band-field">
                  <div className="band-member-field-label">Nama Official / Pendamping</div>
                  <input className="band-text-input" type="text" placeholder="Nama pendamping (jika ada)…" value={namaOfficial} onChange={e => setNamaOfficial(e.target.value)} />
                </div>
                <div className="band-field" style={{marginBottom: 0}}>
                  <div className="band-member-field-label">No. WhatsApp Official</div>
                  <input className="band-text-input" type="tel" placeholder="Contoh: 08123456789" value={waOfficial} onChange={e => setWaOfficial(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="band-form-section">
            <div className="band-section-header">
              <div className="band-section-icon">📋</div>
              <div className="band-section-title-group">
                <span className="band-section-number">Bagian II</span>
                <div className="band-section-title">Kelengkapan Administrasi</div>
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Lagu Wajib yang Dipilih <span className="req">*</span></div>
              <div className="band-choice-group full">
                {[
                  'Terlukis Indah - Rizky Febian and Ziva Magnolya',
                  'Sialan - Adrian Khalif & Juicy Luicy',
                  'Telenovia - Reality Club',
                  'Mengejar Matahari - Keisya Levronka, Andi Rianto',
                  'Tarot - .Feast'
                ].map((lagu, idx) => {
                  const displayLagu = lagu.replace(' - ', ' — ');
                  return (
                    <div className="band-choice-item" key={idx}>
                      <input type="radio" name="laguWajib" id={`lw${idx}`} value={lagu} required onChange={e => setLaguWajib(e.target.value)} />
                      <label className="band-choice-label" htmlFor={`lw${idx}`}>🎵 {displayLagu}</label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Lagu Bebas yang Akan Ditampilkan <span className="req">*</span></div>
              <div className="band-field-hint">Contoh: Akad — Payung Teduh</div>
              <input className="band-text-input" type="text" placeholder="Nama lagu — Nama artis…" required value={laguBebas} onChange={e => setLaguBebas(e.target.value)} />
            </div>

            <div className="band-field">
              <div className="band-field-label">Unggah Dokumen Identitas <span className="req">*</span></div>
              <div className="band-field-hint">
                Format Penamaan File: <strong style={{color: 'var(--gold-dim)'}}>ID-NamaTim</strong><br/>
                Seluruh dokumen identitas peserta wajib digabungkan menjadi satu file tunggal. (PDF, Dokumen, atau Gambar)
              </div>
              <div className="band-file-drop">
                <input type="file" accept=".pdf,.doc,.docx,image/*" required onChange={(e) => handleFileChange(e, setDokIdentitas)} />
                <span className="band-file-drop-icon"><FileText size={28} style={{margin: '0 auto', display: 'block'}} /></span>
                <div className="band-file-drop-text">Seret & lepas dokumen di sini, atau <span>klik untuk memilih</span></div>
                {dokIdentitas && <div className="band-file-name-display" style={{display: 'block'}}>📎 {dokIdentitas.name}</div>}
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Bukti Pembayaran <span className="req">*</span></div>
              <div className="band-field-hint">
                Format Penamaan File: <strong style={{color: 'var(--gold-dim)'}}>TRANSFER-BD-NamaTim</strong><br/>
                BCA 0210999396 a.n. Yayasan Multi Data Palembang
              </div>
              <div className="band-file-drop">
                <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, setBuktiBayar)} />
                <span className="band-file-drop-icon"><CreditCard size={28} style={{margin: '0 auto', display: 'block'}} /></span>
                <div className="band-file-drop-text">Seret & lepas bukti transfer di sini, atau <span>klik untuk memilih</span></div>
                {buktiBayar && <div className="band-file-name-display" style={{display: 'block'}}>📎 {buktiBayar.name}</div>}
              </div>
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="band-form-section">
            <div className="band-section-header">
              <div className="band-section-icon">📜</div>
              <div className="band-section-title-group">
                <span className="band-section-number">Bagian III</span>
                <div className="band-section-title">Pernyataan</div>
              </div>
            </div>

            <div className="band-declaration-note">
              ⚠️ Mohon pastikan seluruh data sudah benar sebelum memilih <strong>'Setuju'</strong>. Anda masih dapat melakukan perbaikan data sebelum formulir dikirimkan.
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
                text: "Saya bersedia untuk hadir tepat waktu pada seluruh rangkaian kegiatan Band Competition I-Fest 6.0 2026 sesuai jadwal yang telah ditentukan oleh panitia.",
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
                  <div className="band-decl-choice disagree">
                    <input type="radio" name={`decl${i}`} id={`decl${i}n`} value="Tidak Setuju" onChange={e => decl.set(e.target.value)} />
                    <label className="band-decl-choice-label" htmlFor={`decl${i}n`}>✗ Tidak Setuju</label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT SECTION */}
          <div className="band-submit-section">
            {errorMsg && <div className="band-alert error show" style={{display: 'block'}}>{errorMsg}</div>}
            <div className="band-submit-divider">✦ Siap untuk Tampil ✦</div>
            <button type="submit" className="band-submit-btn" disabled={isSubmitting}>
              {!isSubmitting ? <span>🎩 Kirim Pendaftaran</span> : <div className="band-loader-ring" style={{display: 'block'}}></div>}
            </button>
            <p style={{marginTop: '16px', fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic'}}>
              Dengan mengirimkan formulir ini, Anda menyetujui seluruh ketentuan yang berlaku.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
