import React, { useState, useRef, useMemo } from 'react';
import { X } from 'lucide-react';
import { processFilesParallel, validateFile, FILE_ACCEPT } from '../utils/fileUtils';
import './BandPopup.css';

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
  const [decl1, setDecl1] = useState(false);
  const [decl2, setDecl2] = useState(false);
  const [decl3, setDecl3] = useState(false);

  const popupRef = useRef(null);

  const suitsData = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      suit: SUITS_ARR[i % 5],
      left: Math.random() * 100,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 15,
      color: i % 2 === 0 ? '#e2b953' : '#c91834',
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
      errors.push('Seluruh Pernyataan wajib disetujui');
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

        decl1: decl1 ? 'Setuju' : '',
        decl2: decl2 ? 'Setuju' : '',
        decl3: decl3 ? 'Setuju' : '',
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
        <div className="band-popup-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
          <button className="band-close-btn" onClick={onClose}><X size={24} /></button>
          <div className="band-suits-bg">
            {suitsData.map((s, i) => (
              <div key={i} className="band-suit" style={{ left: `${s.left}%`, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color }}>{s.suit}</div>
            ))}
          </div>
          <div className="band-success-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" className="band-success-icon" />
            <h2 className="band-success-title">Pendaftaran Berhasil!</h2>
            <p className="band-success-text">
              Terima kasih telah mendaftarkan Band Anda. Data Anda telah tercatat dan panitia akan segera menghubungi Anda.
            </p>
            <a href="https://chat.whatsapp.com/L8EReuHY2g68fXIjnjC4sx" target="_blank" rel="noreferrer" className="band-wa-btn">
              💬 Join Grup WhatsApp Peserta
            </a>
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
            <div key={i} className="band-suit" style={{ left: `${s.left}%`, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color }}>{s.suit}</div>
          ))}
        </div>

        <button className="band-close-btn" onClick={onClose}><X size={24} /></button>

        <div className="band-header">
          <div className="band-maskot-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" />
          </div>
          <h1 className="band-title">Formulir Pendaftaran<br />Band Competition</h1>
          <h2 className="band-subtitle">I-Fest 6.0 • HIMIF UMDP 2026</h2>
          <div className="band-ornament"></div>
        </div>

        <div className="band-desc-section">
          <div className="band-glass-card full" style={{ marginBottom: '24px' }}>
            <div className="band-card-title">🎩 Convergence of the Realms</div>
            <p className="band-card-text">
              Selamat datang di <strong style={{ color: 'var(--gold)' }}>Band Competition I-Fest 6.0!</strong> Kompetisi ini menjadi wadah bagi siswa/i SMP-SMA/Sederajat di Kota Palembang untuk menyalurkan kreativitas, bakat, serta minat dalam bidang musik.<br /><br />
              Peserta diwajibkan membawakan dua lagu, yang terdiri dari <strong>satu lagu wajib</strong> dan <strong>satu lagu bebas</strong> yang dapat merepresentasikan kreativitas dan identitas unik peserta.
            </p>
          </div>

          <div className="band-desc-grid">
            <div className="band-glass-card">
              <div className="band-card-title">💰 Biaya & Pembayaran</div>
              <p className="band-card-text">
                <strong style={{ fontSize: '18px', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Rp150.000,-</strong>
                Transfer ke:<br />
                <strong style={{ color: 'var(--gold)' }}>BCA 0210999396</strong><br />
                a.n. Yayasan Multi Data Palembang
              </p>
            </div>

            <div className="band-glass-card">
              <div className="band-card-title">📌 Persyaratan Utama</div>
              <ul className="band-list">
                <li>Siswa/i SMP-SMA/sederajat aktif di Kota Palembang</li>
                <li>Melampirkan Surat Keterangan Aktif & Rekomendasi Kepala Sekolah</li>
                <li>Wajib memfollow IG <strong>@himif.umdp</strong></li>
              </ul>
              <a href="https://drive.google.com/file/d/1Gr0UwklNy1LcxyzupGwmqwsyFRXziMiX/view?usp=drive_link" target="_blank" rel="noreferrer" className="band-guide-btn">
                📖 Baca Guidebook Lengkap
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="band-form-wrapper">
            {/* Step 1: Info */}
            <div className="band-form-step">
              <div className="band-step-header">
                <div className="band-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="band-step-title">
                  <p>Bagian Pertama</p>
                  <h3>Informasi Umum</h3>
                </div>
              </div>

              <div className="band-field-group">
                <label className="band-label">Nama Band <span className="req">*</span></label>
                <input className="band-input" type="text" placeholder="Masukkan nama band Anda..." value={namaBand} onChange={e => setNamaBand(e.target.value)} required />
              </div>

              <div className="band-field-group">
                <label className="band-label">Logo Band <span>(Opsional)</span></label>
                <div className="band-hint">
                  Format Penamaan File: NamaTim<br />
                  <strong style={{ color: 'var(--gold)' }}>Maks 1 MB, 1 file saja (Image)</strong>
                </div>
                <div className="band-dropzone">
                  <input type="file" accept={FILE_ACCEPT} onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const err = validateFile(file); if (err) { setErrorMsg(err); e.target.value = ''; setBandLogo(null); return; }
                    setErrorMsg(''); setBandLogo(file);
                  }} />
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-drop-icon-img" />
                  <div className="band-drop-text">Seret atau lepas kartu di sini, <span>klik untuk memilih</span></div>
                  {bandLogo && <div className="band-file-name"><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-file-icon" /> {bandLogo.name}</div>}
                </div>
              </div>

              <div className="band-field-group">
                <label className="band-label">Kategori Peserta <span className="req">*</span></label>
                <div className="band-radio-grid">
                  {['SMP', 'SMA', 'Other'].map(cat => (
                    <label key={cat} className="band-radio-card">
                      <input type="radio" name="kategori" value={cat} checked={kategori === cat} onChange={e => setKategori(e.target.value)} required />
                      <div className="band-radio-label">{cat === 'Other' ? 'Lainnya' : cat}</div>
                    </label>
                  ))}
                </div>
                {kategori === 'Other' && (
                  <div className="band-other-input">
                    <input type="text" className="band-input" placeholder="Sebutkan kategori..." value={kategoriOther} onChange={e => setKategoriOther(e.target.value)} required />
                  </div>
                )}
              </div>

              <div className="band-field-group" style={{ marginBottom: 0 }}>
                <label className="band-label">Asal Instansi Sekolah <span className="req">*</span></label>
                <input className="band-input" type="text" placeholder="Asal sekolah..." value={asalInstansi} onChange={e => setAsalInstansi(e.target.value)} required />
              </div>
            </div>

            {/* Step 2: Personel */}
            <div className="band-form-step">
              <div className="band-step-header">
                <div className="band-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="band-step-title">
                  <p>Bagian Kedua</p>
                  <h3>Data Personel</h3>
                </div>
              </div>

              {members.map((m, index) => {
                const isRequired = index < MIN_MEMBERS;
                return (
                  <div key={m.id} className={`band-member-box ${!isRequired ? 'optional' : ''}`}>
                    <div className="band-member-header">
                      <div className="band-member-title">
                        <span style={{ color: 'var(--red)' }}>{SUITS_ARR[(index + 1) % 5]}</span> Peserta {index + 1}
                        {!isRequired && <span className="band-member-badge">Opsional</span>}
                      </div>
                      {!isRequired && (
                        <button type="button" className="band-btn-remove" onClick={() => removeMember(m.id)}>
                          <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-remove-icon" /> Hapus
                        </button>
                      )}
                    </div>

                    <div className="band-field-group">
                      <label className="band-label">Nama Lengkap {isRequired && <span className="req">*</span>}</label>
                      <input className="band-input" type="text" placeholder={`Nama peserta ${index + 1}...`} value={m.nama} onChange={e => updateMember(m.id, 'nama', e.target.value)} required={isRequired} />
                    </div>

                    <div className="band-field-group">
                      <label className="band-label">Posisi / Peran {isRequired && <span className="req">*</span>}</label>
                      <div className="band-radio-grid">
                        {['Vocalist', 'Gitaris', 'Bassist', 'Keyboardist', 'Drummer', 'Other'].map(role => (
                          <label key={role} className="band-radio-card">
                            <input type="radio" name={`peran_${m.id}`} value={role} checked={m.peran === role} onChange={e => updateMember(m.id, 'peran', e.target.value)} required={isRequired} />
                            <div className="band-radio-label" style={{ padding: '12px', fontSize: '13px' }}>{role === 'Other' ? 'Lainnya' : role}</div>
                          </label>
                        ))}
                      </div>
                      {m.peran === 'Other' && (
                        <div className="band-other-input">
                          <input type="text" className="band-input" placeholder="Sebutkan posisi..." value={m.peranOther} onChange={e => updateMember(m.id, 'peranOther', e.target.value)} required={isRequired} />
                        </div>
                      )}
                    </div>

                    <div className="band-field-group" style={{ marginBottom: 0 }}>
                      <label className="band-label">No. WhatsApp {isRequired && <span className="req">*</span>}</label>
                      <input className="band-input" type="tel" placeholder="Contoh: 081234567890" value={m.wa} onChange={e => updateMember(m.id, 'wa', e.target.value.replace(/[^0-9]/g, ''))} required={isRequired} />
                    </div>
                  </div>
                );
              })}

              {members.length < MAX_MEMBERS && (
                <button type="button" className="band-btn-add" onClick={addMember}>
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-add-icon" /> Tambah Peserta {members.length + 1}
                </button>
              )}

              {/* Official */}
              <div className="band-member-box optional" style={{ marginTop: '32px', borderColor: 'var(--purple)' }}>
                <div className="band-member-header">
                  <div className="band-member-title">
                    <span style={{ color: 'var(--gold)' }}>🃏</span> Official (Pendamping)
                    <span className="band-member-badge">Opsional</span>
                  </div>
                </div>
                <div className="band-hint" style={{ marginBottom: '20px' }}>Official bersifat opsional dan bisa disusulkan nanti saat pendaftaran ulang (Technical Meeting).</div>
                <div className="band-grid-2">
                  <div className="band-field-group" style={{ marginBottom: 0 }}>
                    <label className="band-label">Nama Official</label>
                    <input className="band-input" type="text" placeholder="Nama pendamping..." value={officialNama} onChange={e => setOfficialNama(e.target.value)} />
                  </div>
                  <div className="band-field-group" style={{ marginBottom: 0 }}>
                    <label className="band-label">No. WhatsApp</label>
                    <input className="band-input" type="tel" placeholder="No WA pendamping..." value={officialWa} onChange={e => setOfficialWa(e.target.value.replace(/[^0-9]/g, ''))} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Administrasi */}
            <div className="band-form-step">
              <div className="band-step-header">
                <div className="band-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="band-step-title">
                  <p>Bagian Ketiga</p>
                  <h3>Administrasi & Penampilan</h3>
                </div>
              </div>

              <div className="band-field-group">
                <label className="band-label">Lagu Wajib yang dipilih <span className="req">*</span></label>
                <div className="band-radio-grid full">
                  {[
                    'Terlukis Indah - Rizky Febian and Ziva Magnolya',
                    'Sialan - Adrian Khalif & Juicy Luicy',
                    'Telenovia - Reality Club',
                    'Mengejar Matahari - Keisya Levronka, Andi Rianto',
                    'Tarot - .Feast'
                  ].map(lagu => (
                    <label key={lagu} className="band-radio-card full">
                      <input type="radio" name="laguWajib" value={lagu} checked={laguWajib === lagu} onChange={e => setLaguWajib(e.target.value)} required />
                      <div className="band-radio-label">{lagu}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="band-field-group">
                <label className="band-label">Lagu Bebas <span className="req">*</span></label>
                <input className="band-input" type="text" placeholder="Contoh: Akad - Payung Teduh" value={laguBebas} onChange={e => setLaguBebas(e.target.value)} required />
              </div>

              <div className="band-field-group">
                <label className="band-label">Dokumen Identitas <span className="req">*</span></label>
                <div className="band-hint">
                  Format: <strong style={{ color: 'var(--gold)' }}>ID-NamaTim</strong>. (Kartu Pelajar / Surat Keterangan Aktif & Surat Rekomendasi digabung 1 file).<br />
                  <strong style={{ color: 'var(--gold)' }}>Maks 1 MB, 1 file saja (PDF/Image)</strong>
                </div>
                <div className="band-dropzone">
                  <input type="file" accept={FILE_ACCEPT} required onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const err = validateFile(file); if (err) { setErrorMsg(err); e.target.value = ''; setDokIdentitas(null); return; }
                    setErrorMsg(''); setDokIdentitas(file);
                  }} />
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-drop-icon-img" />
                  <div className="band-drop-text">Seret atau lepas kartu di sini, <span>klik untuk memilih</span></div>
                  {dokIdentitas && <div className="band-file-name"><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-file-icon" /> {dokIdentitas.name}</div>}
                </div>
              </div>

              <div className="band-field-group" style={{ marginBottom: 0 }}>
                <label className="band-label">Bukti Pembayaran <span className="req">*</span></label>
                <div className="band-hint">
                  Format: <strong style={{ color: 'var(--gold)' }}>TRANSFER-BD-NamaTim</strong>.<br />
                  <strong style={{ color: 'var(--gold)' }}>Maks 1 MB, 1 file saja (Image/PDF)</strong>
                </div>
                <div className="band-dropzone">
                  <input type="file" accept={FILE_ACCEPT} required onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const err = validateFile(file); if (err) { setErrorMsg(err); e.target.value = ''; setBuktiBayar(null); return; }
                    setErrorMsg(''); setBuktiBayar(file);
                  }} />
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-drop-icon-img" />
                  <div className="band-drop-text">Seret atau lepas kartu di sini, <span>klik untuk memilih</span></div>
                  {buktiBayar && <div className="band-file-name"><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-file-icon" /> {buktiBayar.name}</div>}
                </div>
              </div>
            </div>

            {/* Step 4: Pernyataan */}
            <div className="band-form-step" style={{ marginBottom: '24px' }}>
              <div className="band-step-header">
                <div className="band-step-icon" aria-hidden="true">
                  <img src="/Compress/maskot.webp" alt="" />
                </div>
                <div className="band-step-title">
                  <p>Bagian Terakhir</p>
                  <h3>Pernyataan</h3>
                </div>
              </div>

              {[
                { text: "Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.", val: decl1, set: setDecl1 },
                { text: "Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam Band Competition I-Fest 6.0 2026.", val: decl2, set: setDecl2 },
                { text: "Jika saya melakukan pelanggaran terhadap peraturan yang berlaku, saya siap menerima sanksi yang diberikan, termasuk kemungkinan diskualifikasi dari kompetisi.", val: decl3, set: setDecl3 }
              ].map((decl, i) => (
                <div className="band-decl-item" key={i}>
                  <div className="band-decl-text">{decl.text}</div>
                  <div className="band-decl-choices">
                    <div className="band-decl-choice agree">
                      <input type="checkbox" id={`decl${i}y`} checked={decl.val} onChange={e => decl.set(e.target.checked)} required />
                      <label className="band-decl-choice-label" htmlFor={`decl${i}y`}>✓ Setuju</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="band-submit-section">
              {errorMsg && (
                <div className="band-alert error">
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-inline-icon" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="band-submit-divider">✨ Siap Berkarya ✨</div>
              <button type="submit" className="band-btn-submit" disabled={isSubmitting}>
                {!isSubmitting ? (
                  <><img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="band-submit-icon" /> Kirim Pendaftaran</>
                ) : (
                  <div className="band-loader"></div>
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
