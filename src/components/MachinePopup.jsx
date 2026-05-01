import React, { useState, useRef, useMemo } from 'react';
import { X } from 'lucide-react';
import { processFilesParallel, validateFile } from '../utils/fileUtils';
import './MachinePopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwbU9uhvJ3_RnYTaqD47LYNaKQgkl4Uxj8NPb8Onf08lPisohVaMFvbnm-rHByZRsZ/exec';
const SUITS_ARR = ['♠', '♥', '♦', '♣'];
const MAX_MEMBERS = 2;

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
  const [members, setMembers] = useState([]);
  const [suratPernyataan, setSuratPernyataan] = useState(null);
  const [buktiBayar, setBuktiBayar] = useState(null);
  const [decl1, setDecl1] = useState('');
  const [decl2, setDecl2] = useState('');
  const [decl3, setDecl3] = useState('');

  const popupRef = useRef(null);

  const suitsData = useMemo(() =>
    Array.from({ length: 14 }).map((_, i) => ({
      suit: ['♠', '♥', '♦', '♣', '🃏'][i % 5],
      left: Math.random() * 100,
      duration: 18 + Math.random() * 20,
      delay: Math.random() * 15,
      color: i % 2 === 0 ? '#e2b953' : '#c91834',
    })), []);

  const addMember = () => {
    if (members.length < MAX_MEMBERS)
      setMembers([...members, { id: Date.now(), nama: '', kp: null }]);
  };

  const removeMember = (id) =>
    setMembers(members.filter(m => m.id !== id));

  const updateMember = (id, field, value) =>
    setMembers(members.map(m => (m.id === id ? { ...m, [field]: value } : m)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const errors = [];
    let valid = true;

    if (!namaTim.trim())      { errors.push('Nama Tim'); valid = false; }
    if (!asalKota.trim())     { errors.push('Asal Kota'); valid = false; }
    if (!asalInstansi.trim()) { errors.push('Asal Institusi'); valid = false; }
    if (!ketuaTim.trim())     { errors.push('Ketua Tim'); valid = false; }
    if (!kpKetua)             { errors.push('Kartu Pelajar Ketua Tim'); valid = false; }

    members.forEach((m, idx) => {
      if (!m.nama.trim()) { errors.push(`Nama Anggota ${idx + 1}`); valid = false; }
      if (!m.kp)          { errors.push(`Kartu Pelajar Anggota ${idx + 1}`); valid = false; }
    });

    if (!suratPernyataan) { errors.push('Surat Pernyataan'); valid = false; }
    if (!buktiBayar)      { errors.push('Bukti Pembayaran'); valid = false; }
    if (decl1 !== 'Setuju' || decl2 !== 'Setuju' || decl3 !== 'Setuju') {
      errors.push('Seluruh Pernyataan'); valid = false;
    }

    if (!valid) {
      setErrorMsg(`Mohon lengkapi: ${errors.join(', ')}.`);
      popupRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
        if (m.kp) filesToProcess.push({ key: `kpAnggota${idx + 1}B64`, file: m.kp });
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
        decl1, decl2, decl3,
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
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      }).catch(() => {});

      setIsSuccess(true);
      popupRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMsg(`Terjadi kesalahan: ${err.message}. Silakan coba lagi atau hubungi panitia.`);
      setIsSubmitting(false);
      setSubmitStatus('');
      popupRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ── Floating suits helper ── */
  const FloatingSuits = () => (
    <div className="machine-suits-bg">
      {suitsData.map((s, i) => (
        <div key={i} className="machine-suit"
          style={{ left: `${s.left}%`, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`, color: s.color }}>
          {s.suit}
        </div>
      ))}
    </div>
  );

  /* ── Success Screen ── */
  if (isSuccess) {
    return (
      <div className="machine-popup-overlay" onClick={onClose}>
        <div className="machine-popup-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <button className="machine-close-btn" onClick={onClose}><X size={20} /></button>
          <FloatingSuits />
          <div className="machine-success-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" className="machine-success-icon" />
            <h2 className="machine-success-title">Pendaftaran Berhasil!</h2>
            <p className="machine-success-sub">
              Terima kasih telah mendaftarkan tim Anda untuk Machine Learning Competition I-Fest 6.0 2026.<br />
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <p className="machine-success-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
            <a href="https://chat.whatsapp.com/KVHugt5HAIK3WajEVGAul7" target="_blank" rel="noreferrer" className="machine-contact-btn">
              💬 Join Grup WhatsApp Peserta
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div className="machine-popup-overlay" onClick={onClose}>
      <div className="machine-popup-container" onClick={e => e.stopPropagation()} ref={popupRef}>
        <FloatingSuits />
        <button className="machine-close-btn" onClick={onClose}><X size={20} /></button>

        {/* ── HEADER ── */}
        <div className="machine-header">
          <div className="machine-header-corner tl">♠</div>
          <div className="machine-header-corner tr">♥</div>
          <div className="machine-header-corner bl">♣</div>
          <div className="machine-header-corner br">♦</div>
          <div className="machine-maskot-wrap">
            <img src="/Compress/maskot.webp" alt="Maskot" />
          </div>
          <p className="machine-header-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>
          <h1>Machine Learning<br />Competition</h1>
          <h2>I-Fest 6.0 • HIMIF UMDP 2026</h2>
          <div className="machine-ornament">♠ ♥ ♦ ♣</div>
        </div>

        {/* ── DESCRIPTION ── */}
        <div className="machine-desc-section">
          <p className="machine-desc-text">
            Selamat datang di <strong style={{ color: 'var(--text)' }}>Machine Learning Competition I-Fest 6.0 2026!</strong> 🧠⚡
            <br />
            Kompetisi yang diselenggarakan oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang. Kompetisi ini menantang para peserta untuk menyelesaikan model machine learning yang dapat mengatasi tantangan dengan cara yang paling efektif.
          </p>

          <p className="machine-desc-text">
            Melalui kompetisi ini, peserta diharapkan tidak hanya memahami mekanisme fundamental pembelajaran mesin, tetapi juga mampu mengimplementasikan pengetahuan tersebut untuk memecahkan masalah kompleks di dunia nyata.
          </p>

          <p className="machine-desc-text" style={{ marginBottom: '18px' }}>
            <strong style={{ color: 'var(--gold)' }}>🗝️ Fokus Kompetisi: Klasifikasi Penyakit Daun Tanaman</strong>
            <br />
            Dalam pengolahan citra digital, klasifikasi adalah proses menentukan kelas suatu citra berdasarkan atribut-atributnya. Kompetisi ini berfokus pada klasifikasi penyakit daun pada beberapa jenis tanaman. Peserta ditantang untuk membangun model machine learning yang mampu mengenali dan mengklasifikasikan penyakit daun secara akurat. Selain klasifikasi, terdapat juga clustering—proses mengelompokkan citra berdasarkan kemiripan atribut untuk sistem yang lebih kompleks.
          </p>

          <div className="machine-info-grid">
            <div className="machine-info-card">
              <span className="machine-ic-label">💰 HTM</span>
              <div className="machine-ic-value">
                Rp75.000,-
                <br />
                <small style={{ color: 'var(--text-muted)' }}>BCA 0210999396<br />a.n. Yayasan Multi Data Palembang</small>
              </div>
            </div>
            <div className="machine-info-card">
              <span className="machine-ic-label">📑 Panduan</span>
              <div className="machine-ic-value">
                <a
                  href="https://drive.google.com/drive/folders/1hHV4xLFIOTaYtasyXwIl4hQVXdDEQ_sL?usp=drive_link"
                  target="_blank"
                  rel="noreferrer"
                  className="machine-guidebook-btn"
                  style={{ display: 'inline-flex', marginTop: '4px', fontSize: '12px' }}
                >
                  Baca Guidebook Lengkap 
                </a>
              </div>
            </div>
          </div>

          <p className="machine-desc-text" style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--gold)' }}>📋 Struktur Kompetisi:</strong>
            <br />
            Lomba terdiri dari 2 tahap: Tahap Penyisihan (pembuat model machine learning secara live coding dengan sistem estafet) dan Tahap Final dengan dataset yang lebih menantang.
          </p>

          <div className="machine-resource-grid" style={{ marginBottom: '18px' }}>
            <div className="machine-info-card machine-resource-card dataset-card">
              <span className="machine-ic-label">📊 Dataset Babak Penyisihan</span>
              <div style={{ marginTop: '8px' }}>
                <a
                  href="https://drive.google.com/drive/folders/1qLNNt2258WtJvP3OcNR9nncORvjNyLBd"
                  target="_blank"
                  rel="noreferrer"
                  className="machine-guidebook-btn"
                  style={{ display: 'inline-flex', marginBottom: '8px' }}
                >
                  📂 Akses Dataset Penyisihan ↗
                </a>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Klik link di atas untuk mengakses dataset training dan testing untuk tahap penyisihan kompetisi.
                </p>
              </div>
            </div>

            <div className="machine-info-card machine-resource-card letter-card">
              <span className="machine-ic-label">📜 Surat Pernyataan</span>
              <div className="machine-letter-preview">
                <div className="machine-letter-preview-top">
                  <span className="machine-letter-chip">Dokumen Resmi</span>
                  <span className="machine-letter-eyebrow">Wajib Dibaca</span>
                </div>
                <div className="machine-letter-title">Buka surat pernyataan sebelum mengunggah file.</div>
                <p className="machine-letter-copy">
                  Dokumen ini berisi format dan isi surat yang harus disiapkan peserta.
                  Pastikan Anda membacanya agar file yang diunggah sesuai ketentuan.
                </p>
                <a
                  href="https://docs.google.com/document/d/1Ij2xNH0IUOM2U2Wfza236ySK5mxXy-LUdhBVjIFvVbk/edit?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="machine-letter-btn"
                >
                  👁️ Buka Surat Pernyataan
                </a>
              </div>
            </div>
          </div>

          <div className="machine-info-card">
            <span className="machine-ic-label">📌 Persyaratan Peserta</span>
            <ul className="machine-req-list" style={{ marginTop: '8px' }}>
              <li>Peserta adalah siswa aktif Mahasiswa aktif Perguruan Tinggi di Indonesia dengan kartu Tanda Mahasiswa yang masih berlaku.</li>
              <li>Peserta berpartisipasi secara tim (1–3 orang). Setiap sekolah atau perguruan tinggi dapat mengirimkan lebih dari 1 tim.</li>
              <li>Peserta wajib mengunggah Surat Pernyataan yang telah ditentukan oleh panitia.</li>
              <li>Peserta boleh terdaftar pada cabang kompetisi lain dengan syarat tidak menjadi ketua tim di cabang lainnya.</li>
              <li>Peserta harus hadir tepat waktu sesuai jadwal yang telah ditentukan oleh panitia.</li>
              <li>Tindakan pendaftaran berarti telah menyetujui seluruh persyaratan, aturan, dan regulasi kompetisi.</li>
            </ul>
          </div>

          <p className="machine-desc-text" style={{ textAlign: 'center', marginBottom: '16px', marginTop: '16px' }}>
            💡 Tunjukkan Potensi Machine Learning-mu dan Raih Kesempatan Menang! 🏆⭐
          </p>

          <div className="machine-contact-row" style={{ justifyContent: 'center' }}>
            <a href="https://wa.me/6285357268887" target="_blank" rel="noreferrer" className="machine-contact-btn">
              📞 Metta (WA)
            </a>
          </div>
        </div>

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit}>
          <div className="machine-form-wrapper">

            {/* STEP 1 — Informasi Tim */}
            <div className="machine-form-step">
              <div className="machine-step-header">
                <div className="machine-step-icon">
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" />
                </div>
                <div className="machine-step-title">
                  <p>Bagian Pertama</p>
                  <h3>Informasi Tim</h3>
                </div>
              </div>

              <div className="machine-field">
                <div className="machine-field-label">Nama Tim <span className="req">*</span></div>
                <input className="machine-text-input" type="text" placeholder="Nama tim Anda…"
                  required value={namaTim} onChange={e => setNamaTim(e.target.value)} />
              </div>

              <div className="machine-field">
                <div className="machine-field-label">Asal Kota <span className="req">*</span></div>
                <div className="machine-field-hint">Hanya huruf (tanpa angka)</div>
                <input className="machine-text-input" type="text" placeholder="Kota asal…"
                  required value={asalKota}
                  onChange={e => setAsalKota(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
              </div>

              <div className="machine-field">
                <div className="machine-field-label">Asal Institusi <span className="req">*</span></div>
                <input className="machine-text-input" type="text" placeholder="Universitas / Sekolah…"
                  required value={asalInstansi} onChange={e => setAsalInstansi(e.target.value)} />
              </div>

              {/* Ketua Tim */}
              <div className="machine-field-label" style={{ marginBottom: '16px', marginTop: '8px' }}>
                Ketua Tim <span className="req">*</span>
              </div>
              <div className="machine-member-card">
                <div className="machine-member-header">
                  <div className="machine-member-badge">
                    <span style={{ color: 'var(--red)' }}>♛</span> Data Ketua Tim
                  </div>
                </div>
                <div className="machine-member-grid">
                  <div>
                    <div className="machine-member-field-label">Nama Ketua Tim <span className="req">*</span></div>
                    <input className="machine-text-input" type="text" required
                      placeholder="Nama lengkap ketua…"
                      value={ketuaTim}
                      onChange={e => setKetuaTim(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
                  </div>
                  <div>
                    <div className="machine-member-field-label">Kartu Pelajar Ketua <span className="req">*</span></div>
                    <div className="machine-field-hint">Image / PDF, maks 1 MB</div>
                    <div className="machine-file-drop">
                      <input type="file" accept="image/*,.pdf" required
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const err = validateFile(file);
                          if (err) { setErrorMsg(err); e.target.value = ''; setKpKetua(null); return; }
                          setKpKetua(file);
                        }} />
                      <div className="machine-file-drop-icon">
                        <img src="/Compress/maskot.webp" alt="" aria-hidden="true" />
                      </div>
                      <div className="machine-file-drop-text">Seret atau lepas di sini, <span>klik untuk memilih</span></div>
                      {kpKetua && <div className="machine-file-name-display">📎 {kpKetua.name}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Anggota Opsional */}
              <div className="machine-field-label" style={{ marginBottom: '16px', marginTop: '28px' }}>
                Anggota Tim
                <span className="machine-badge">Opsional · maks. 2 anggota</span>
              </div>

              {members.map((m, index) => (
                <div key={m.id} className="machine-member-card optional">
                  <div className="machine-member-header">
                    <div className="machine-member-badge">
                      <span style={{ color: 'var(--red)' }}>{SUITS_ARR[(index + 1) % 4]}</span>
                      Anggota {index + 1}
                      <span className="machine-member-optional-tag">Opsional</span>
                    </div>
                    <button type="button" className="machine-member-remove" onClick={() => removeMember(m.id)}>
                      ✕ Hapus
                    </button>
                  </div>
                  <div className="machine-member-grid">
                    <div>
                      <div className="machine-member-field-label">Nama Anggota {index + 1}</div>
                      <input className="machine-text-input" type="text"
                        placeholder={`Nama anggota ${index + 1}…`}
                        value={m.nama}
                        onChange={e => updateMember(m.id, 'nama', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
                    </div>
                    <div>
                      <div className="machine-member-field-label">Kartu Pelajar Anggota {index + 1}</div>
                      <div className="machine-field-hint">Image / PDF, maks 1 MB</div>
                      <div className="machine-file-drop">
                        <input type="file" accept="image/*,.pdf"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const err = validateFile(file);
                            if (err) { setErrorMsg(err); e.target.value = ''; updateMember(m.id, 'kp', null); return; }
                            updateMember(m.id, 'kp', file);
                          }} />
                        <div className="machine-file-drop-icon">
                          <img src="/Compress/maskot.webp" alt="" aria-hidden="true" />
                        </div>
                        <div className="machine-file-drop-text">Seret atau lepas di sini, <span>klik untuk memilih</span></div>
                        {m.kp && <div className="machine-file-name-display">📎 {m.kp.name}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {members.length < MAX_MEMBERS && (
                <button type="button" className="machine-add-btn" onClick={addMember}>
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                  Tambah Anggota {members.length + 1} (Opsional)
                </button>
              )}
            </div>

            {/* STEP 2 — Administrasi */}
            <div className="machine-form-step">
              <div className="machine-step-header">
                <div className="machine-step-icon">
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" />
                </div>
                <div className="machine-step-title">
                  <p>Bagian Kedua</p>
                  <h3>Administrasi</h3>
                </div>
              </div>

              <div className="machine-field">
                <div className="machine-field-label">Surat Pernyataan <span className="req">*</span></div>
                <div className="machine-field-hint">Format nama file: <strong style={{ color: 'var(--gold)' }}>SP-NamaTim</strong> · PDF only · maks 1 MB</div>
                <div className="machine-file-drop">
                  <input type="file" accept=".pdf" required
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const err = validateFile(file);
                      if (err) { setErrorMsg(err); e.target.value = ''; setSuratPernyataan(null); return; }
                      setSuratPernyataan(file);
                    }} />
                  <div className="machine-file-drop-icon">
                    <img src="/Compress/maskot.webp" alt="" aria-hidden="true" />
                  </div>
                  <div className="machine-file-drop-text">Seret atau lepas di sini, <span>klik untuk memilih</span></div>
                  {suratPernyataan && <div className="machine-file-name-display">📎 {suratPernyataan.name}</div>}
                </div>
              </div>

              <div className="machine-field">
                <div className="machine-field-label">Bukti Pembayaran <span className="req">*</span></div>
                <div className="machine-field-hint">
                  Format nama file: <strong style={{ color: 'var(--gold)' }}>TRANSFER-MachineLearning-NamaTim</strong><br />
                  BCA 0210999396 a.n. Yayasan Multi Data Palembang · Image/PDF · maks 1 MB
                </div>
                <div className="machine-file-drop">
                  <input type="file" accept="image/*,.pdf" required
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const err = validateFile(file);
                      if (err) { setErrorMsg(err); e.target.value = ''; setBuktiBayar(null); return; }
                      setBuktiBayar(file);
                    }} />
                  <div className="machine-file-drop-icon">
                    <img src="/Compress/maskot.webp" alt="" aria-hidden="true" />
                  </div>
                  <div className="machine-file-drop-text">Seret atau lepas di sini, <span>klik untuk memilih</span></div>
                  {buktiBayar && <div className="machine-file-name-display">📎 {buktiBayar.name}</div>}
                </div>
              </div>
            </div>

            {/* STEP 3 — Pernyataan */}
            <div className="machine-form-step" style={{ marginBottom: '24px' }}>
              <div className="machine-step-header">
                <div className="machine-step-icon">
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" />
                </div>
                <div className="machine-step-title">
                  <p>Bagian Terakhir</p>
                  <h3>Pernyataan</h3>
                </div>
              </div>

              <div className="machine-declaration-note">
                Mohon pastikan seluruh data sudah benar sebelum memilih <strong>'Setuju'</strong>.
                Anda masih dapat melakukan perbaikan data sebelum formulir dikirimkan.
              </div>

              {[
                { text: "Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.", val: decl1, set: setDecl1 },
                { text: "Saya berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam Machine Learning Competition I-Fest 6.0 2026.", val: decl2, set: setDecl2 },
                { text: "Saya bersedia untuk hadir tepat waktu pada seluruh rangkaian kegiatan Machine Learning Competition I-Fest 6.0 2026 sesuai jadwal yang telah ditentukan oleh panitia.", val: decl3, set: setDecl3 },
              ].map((decl, i) => (
                <div className="machine-decl-item" key={i}>
                  <div className="machine-decl-text">{decl.text}</div>
                  <div className="machine-decl-choices">
                    <div className="machine-decl-choice agree">
                      <input type="radio" name={`decl${i}`} id={`decl${i}y`} value="Setuju"
                        required onChange={e => decl.set(e.target.value)} />
                      <label className="machine-decl-choice-label" htmlFor={`decl${i}y`}>✓ Setuju</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SUBMIT */}
            <div className="machine-submit-section">
              {errorMsg && (
                <div className="machine-alert error">
                  <img src="/Compress/maskot.webp" alt="" aria-hidden="true" style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="machine-submit-divider">✦ Siap Bertanding ✦</div>
              <button type="submit" className="machine-submit-btn" disabled={isSubmitting}>
                {!isSubmitting ? (
                  <>
                    <img src="/Compress/maskot.webp" alt="" aria-hidden="true" className="machine-submit-icon" />
                    Kirim Pendaftaran
                  </>
                ) : (
                  <div className="machine-loader-ring" />
                )}
              </button>
              {isSubmitting && submitStatus && (
                <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--gold-dim)', fontStyle: 'italic' }}>
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