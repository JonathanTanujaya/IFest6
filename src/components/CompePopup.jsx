import React, { useMemo, useRef, useState } from 'react';
import { X, FileText, CreditCard } from 'lucide-react';
import { processFilesParallel } from '../utils/fileUtils';
import './CompePopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/REPLACE_WITH_CP_SCRIPT_ID/exec';
const SUITS_ARR = ['♠', '♥', '♦', '♣'];
const MAX_MEMBERS = 3;
const REQ_MEMBERS = 2;

const EMPTY_MEMBER = (id) => ({
  id,
  nama: '',
  kartuPelajar: null,
  wa: '',
  email: '',
  hackerrank: '',
  instansi: '',
});

export default function CompePopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [namaTim, setNamaTim] = useState('');
  const [kategori, setKategori] = useState('');

  const [members, setMembers] = useState([
    EMPTY_MEMBER(1),
    EMPTY_MEMBER(2),
  ]);

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
      setMembers([...members, EMPTY_MEMBER(3)]);
    }
  };

  const removeMember = (id) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const updateMember = (id, field, value) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleMemberFile = (id, file) => {
    updateMember(id, 'kartuPelajar', file);
  };

  const validateAndSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errors = [];
    let valid = true;

    if (!namaTim.trim()) {
      errors.push('Nama Tim');
      valid = false;
    }

    if (!kategori) {
      errors.push('Kategori Peserta');
      valid = false;
    }

    if (members.length < REQ_MEMBERS) {
      errors.push('Minimal 2 peserta');
      valid = false;
    }

    members.forEach((m, i) => {
      const label = `Peserta ${i + 1}`;
      if (!m.nama.trim()) {
        errors.push(`Nama ${label}`);
        valid = false;
      }
      if (!m.kartuPelajar) {
        errors.push(`Kartu Pelajar ${label}`);
        valid = false;
      }
      if (!m.wa.trim()) {
        errors.push(`No. WhatsApp ${label}`);
        valid = false;
      }
      if (!m.email.trim()) {
        errors.push(`Email ${label}`);
        valid = false;
      }
      if (!m.hackerrank.trim()) {
        errors.push(`Username HackerRank ${label}`);
        valid = false;
      }
      if (!m.instansi.trim()) {
        errors.push(`Asal Instansi ${label}`);
        valid = false;
      }
    });

    if (!buktiBayar) {
      errors.push('Bukti Transfer Pembayaran');
      valid = false;
    }

    if (!decl1 || !decl2 || !decl3) {
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
        ...members.map((m, idx) => ({ key: `kartuP${idx + 1}B64`, file: m.kartuPelajar })),
      ];

      const fileResults = await processFilesParallel(filesToProcess);

      setSubmitStatus('Mengirim data...');

      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        formType: 'COMPETITIVE_PROGRAMMING',
        namaTim: namaTim.trim(),
        kategori,
        buktiBayarName: buktiBayar.name,
        buktiBayarB64: fileResults.buktiBayarB64,
        decl1,
        decl2,
        decl3,
      };

      members.forEach((m, idx) => {
        const n = idx + 1;
        payload[`nama_p${n}`] = m.nama.trim();
        payload[`kartu_p${n}_name`] = m.kartuPelajar ? m.kartuPelajar.name : '';
        payload[`kartu_p${n}_b64`] = fileResults[`kartuP${n}B64`] || '';
        payload[`wa_p${n}`] = m.wa.trim();
        payload[`email_p${n}`] = m.email.trim();
        payload[`hackerrank_p${n}`] = m.hackerrank.trim();
        payload[`instansi_p${n}`] = m.instansi.trim();
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
      setErrorMsg(`Terjadi kesalahan: ${err.message}. Silakan coba lagi atau hubungi panitia.`);
      setIsSubmitting(false);
      setSubmitStatus('');
      if (popupRef.current) popupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSuccess) {
    return (
      <div className="cp-popup-overlay" onClick={onClose}>
        <div className="cp-popup-container cp-success-container" onClick={(e) => e.stopPropagation()}>
          <button className="cp-close-btn" onClick={onClose}><X size={20} /></button>

          <div className="cp-suits-bg">
            {suitsData.map((s, i) => (
              <div
                key={i}
                className="cp-suit"
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

          <div className="cp-success-screen" style={{ display: 'block' }}>
            <span className="cp-success-emoji">🏆</span>
            <h2 className="cp-success-title">Pendaftaran Berhasil!</h2>
            <p className="cp-success-sub">
              Terima kasih telah mendaftarkan tim Anda untuk Competitive Programming Competition I-Fest 6.0 2026.
              <br />
              Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
            </p>
            <div className="cp-divider-ornament" style={{ margin: '0 auto 20px' }}>♠ ♥ ♦ ♣</div>
            <p className="cp-success-tag">I-Fest 6.0 · HIMIF UMDP · 2026</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-popup-overlay" onClick={onClose}>
      <div className="cp-popup-container" onClick={(e) => e.stopPropagation()} ref={popupRef}>
        <div className="cp-suits-bg">
          {suitsData.map((s, i) => (
            <div
              key={i}
              className="cp-suit"
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

        <button className="cp-close-btn" onClick={onClose}><X size={20} /></button>

        <div className="cp-header">
          <div className="cp-header-corner tl">♠</div>
          <div className="cp-header-corner tr">♥</div>
          <div className="cp-header-corner bl">♣</div>
          <div className="cp-header-corner br">♦</div>
          <p className="cp-header-eyebrow">Himpunan Mahasiswa Informatika • HIMIF UMDP</p>
          <img src="/Compress/maskot.webp" className="about-crown" aria-hidden="true" />
          <h1>Competitive Programming<br />I-Fest 6.0</h1>
          <h2>Formulir Pendaftaran Lomba Competitive Programming I-Fest 6.0</h2>
          <div className="cp-divider-ornament">♠ ♥ ♦ ♣</div>
        </div>

        <div className="cp-description-card">
          <p className="cp-desc-text">
            Selamat datang di <strong style={{ color: 'var(--text)' }}>Competitive Programming Competition IFEST 6.0 2026!</strong> 🎩 ♥️
            <br />
            Kompetisi yang diselenggarakan secara daring oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang. Kompetisi ini melibatkan SMA/Mahasiswa di Kota Palembang untuk menguji kemampuan dan nalar dari setiap peserta dalam menyelesaikan program komputer untuk memecahkan permasalahan yang diberikan dengan menggunakan bahasa pemrograman.
          </p>

          <p className="cp-desc-text">
            Peserta akan diberikan sejumlah permasalahan dan dalam kurun waktu 3 jam peserta harus menyusun dan mengumpulkan sebanyak mungkin program yang dapat menjawab masing-masing permasalahan tersebut dengan deskripsi yang telah diberikan pada setiap permasalahan.
          </p>

          <p className="cp-desc-text" style={{ marginBottom: '18px' }}>
            <strong style={{ color: 'var(--gold)' }}>🗝️ Tema: Beyond the Routine: Coding Daily Solutions</strong>
            <br />
            Dalam kehidupan sehari-hari, setiap individu dihadapkan pada berbagai permasalahan yang memerlukan ketelitian, logika, dan kemampuan mengambil keputusan secara tepat. Mulai dari mengatur waktu, menentukan prioritas, memilih solusi paling efisien, hingga menyusun strategi untuk menyelesaikan beberapa tugas sekaligus, semua merupakan bagian dari proses problem solving.
          </p>

          <div className="cp-info-grid">
            <div className="cp-info-card">
              <span className="cp-ic-label">💰 HTM</span>
              <div className="cp-ic-value">
                Rp50.000,-
                <br />
                <small style={{ color: 'var(--text-muted)' }}>BCA 0210999396<br />a.n. Yayasan Multi Data Palembang</small>
              </div>
            </div>
            <div className="cp-info-card">
              <span className="cp-ic-label">📑 Panduan</span>
              <div className="cp-ic-value">
                <span
                  className="cp-guidebook-btn"
                  style={{ display: 'inline-flex', marginTop: '4px', fontSize: '12px' }}
                >
                  📖 Guidebook EDC IFEST 6.0 2026
                </span>
              </div>
            </div>
          </div>

          <p className="cp-desc-text" style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--gold)' }}>Catatan:</strong> Tambahkan kode unik (akan diumumkan) di belakang jumlah transfer. Contoh: Rp50.00x,- atau Rp200.00x,-.
          </p>

          <div className="cp-info-card" style={{ marginBottom: '18px' }}>
            <span className="cp-ic-label">📌 Persyaratan Peserta</span>
            <ul className="cp-req-list" style={{ marginTop: '8px' }}>
              <li>Peserta adalah siswa aktif Sekolah Menengah Atas Se-Kota Palembang atau mahasiswa aktif Perguruan Tinggi Se-Kota Palembang dengan dibuktikan oleh Kartu Pelajar atau Kartu Tanda Mahasiswa dan bukan panitia Informatics Festival 6.0.</li>
              <li>Peserta berpartisipasi secara tim (2-3 orang) pada kategori yang terpisah (SMA / Mahasiswa). Setiap Sekolah Menengah Atas atau Perguruan Tinggi boleh mengirimkan lebih dari 1 peserta untuk mengikuti cabang kompetisi ini.</li>
              <li>Peserta wajib memiliki akun HackerRank, dan username akun akan didaftarkan saat pendaftaran.</li>
              <li>Peserta dihimbau untuk memfollow akun Instagram resmi HIMIF UMDP (@himifumdp).</li>
              <li>Peserta boleh terdaftar pada cabang kompetisi lain dengan syarat tidak boleh menjadi ketua tim pada cabang kompetisi lainnya.</li>
              <li>Peserta yang mengikuti lomba merupakan peserta yang sudah terdaftar dan tidak boleh digantikan oleh orang lain.</li>
              <li>Peserta bersedia mengikuti semua rangkaian acara, prosedur dan ketentuan lomba dan lainnya.</li>
              <li>Peserta yang tidak mengkonfirmasi kehadiran pada waktu kompetisi maka akan dianggap mengundurkan diri.</li>
              <li>Tindakan pendaftaran untuk kompetisi ini berarti telah menyetujui semua persyaratan, aturan, dan regulasi yang dinyatakan secara keseluruhan.</li>
              <li>Peraturan yang belum tercantum akan ditambahkan di kemudian hari bila diperlukan.</li>
            </ul>
          </div>

          <p className="cp-desc-text" style={{ textAlign: 'center', marginBottom: '16px' }}>
            💡 Siapkan Tim Terbaikmu dan Jadilah JUARA! 🏆🍷
          </p>

          <div className="cp-contact-row" style={{ justifyContent: 'center' }}>
            <a href="https://wa.me/6281379153814" target="_blank" rel="noreferrer" className="cp-contact-btn">
              📞 Michael (WA)
            </a>
            <a href="https://wa.me/6289624889157" target="_blank" rel="noreferrer" className="cp-contact-btn">
              📞 Dervin (WA)
            </a>
          </div>
        </div>

        <form onSubmit={validateAndSubmit}>
          <div className="cp-form-section">
            <div className="cp-section-header">
              <div className="cp-section-icon">💻</div>
              <div className="cp-section-title-group">
                <span className="cp-section-number">Bagian I</span>
                <div className="cp-section-title">Informasi Tim &amp; Peserta</div>
              </div>
            </div>

            <div className="cp-field">
              <div className="cp-field-label">Nama Tim <span className="req">*</span></div>
              <input
                className="cp-text-input"
                type="text"
                placeholder="Nama tim Anda..."
                required
                value={namaTim}
                onChange={(e) => setNamaTim(e.target.value)}
              />
            </div>

            <div className="cp-field">
              <div className="cp-field-label">Kategori Peserta <span className="req">*</span></div>
              <div className="cp-choice-group two-col">
                <div className="cp-choice-item">
                  <input
                    type="radio"
                    name="kategori"
                    id="cp-k-sma"
                    value="SMA"
                    required
                    onChange={(e) => setKategori(e.target.value)}
                  />
                  <label className="cp-choice-label" htmlFor="cp-k-sma">🏫 SMA</label>
                </div>
                <div className="cp-choice-item">
                  <input
                    type="radio"
                    name="kategori"
                    id="cp-k-mahasiswa"
                    value="Mahasiswa"
                    onChange={(e) => setKategori(e.target.value)}
                  />
                  <label className="cp-choice-label" htmlFor="cp-k-mahasiswa">🎓 Mahasiswa</label>
                </div>
              </div>
            </div>

            <div className="cp-field-label" style={{ marginBottom: '16px', marginTop: '24px' }}>
              Data Peserta <span className="req">*</span>
              <span className="cp-badge">2 peserta wajib, peserta 3 opsional</span>
            </div>

            <div className="cp-members-container">
              {members.map((m, index) => {
                const isRequired = index < REQ_MEMBERS;
                return (
                  <div key={m.id} className={`cp-member-card ${!isRequired ? 'optional' : ''}`}>
                    <div className="cp-member-header">
                      <div className="cp-member-badge">
                        <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: '14px', marginRight: '4px', fontWeight: 'bold' }}>{SUITS_ARR[index % 4]}</span>
                        Peserta {index + 1}
                        {!isRequired && <span className="cp-member-optional-tag">· Opsional</span>}
                      </div>
                      {!isRequired && (
                        <button type="button" className="cp-member-remove" onClick={() => removeMember(m.id)}>✕ Hapus</button>
                      )}
                    </div>

                    <div className="cp-member-grid">
                      <div>
                        <div className="cp-member-field-label">Nama Peserta {isRequired && <span className="req">*</span>}</div>
                        <input
                          className="cp-text-input"
                          type="text"
                          required={isRequired}
                          placeholder={`Nama peserta ${index + 1}...`}
                          value={m.nama}
                          onChange={(e) => updateMember(m.id, 'nama', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                        />
                      </div>
                      <div>
                        <div className="cp-member-field-label">No. WhatsApp {isRequired && <span className="req">*</span>}</div>
                        <input
                          className="cp-text-input"
                          type="tel"
                          required={isRequired}
                          placeholder="08xxxxxxxxxx"
                          value={m.wa}
                          onChange={(e) => updateMember(m.id, 'wa', e.target.value.replace(/[^0-9]/g, ''))}
                        />
                      </div>
                    </div>

                    <div className="cp-member-grid" style={{ marginTop: '12px' }}>
                      <div>
                        <div className="cp-member-field-label">Email {isRequired && <span className="req">*</span>}</div>
                        <input
                          className="cp-text-input"
                          type="email"
                          required={isRequired}
                          placeholder="email@contoh.com"
                          value={m.email}
                          onChange={(e) => updateMember(m.id, 'email', e.target.value.trim())}
                        />
                      </div>
                      <div>
                        <div className="cp-member-field-label">Username HackerRank {isRequired && <span className="req">*</span>}</div>
                        <input
                          className="cp-text-input"
                          type="text"
                          required={isRequired}
                          placeholder="username_hackerrank"
                          value={m.hackerrank}
                          onChange={(e) => updateMember(m.id, 'hackerrank', e.target.value.trim())}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <div className="cp-member-field-label">Asal Instansi Peserta {index + 1} {isRequired && <span className="req">*</span>}</div>
                      <input
                        className="cp-text-input"
                        type="text"
                        required={isRequired}
                        placeholder="Nama sekolah / perguruan tinggi..."
                        value={m.instansi}
                        onChange={(e) => updateMember(m.id, 'instansi', e.target.value)}
                      />
                    </div>

                    <div className="cp-field" style={{ marginTop: '12px' }}>
                      <div className="cp-member-field-label">Kartu Pelajar/KTM Peserta {index + 1} {isRequired && <span className="req">*</span>}</div>
                      <div className="cp-field-hint">Format: <strong style={{ color: 'var(--gold-dim)' }}>KP-NamaPeserta{index + 1}</strong></div>
                      <div className="cp-file-drop">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          required={isRequired}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleMemberFile(m.id, e.target.files[0]);
                            }
                          }}
                        />
                        <span className="cp-file-drop-icon"><FileText size={28} style={{ margin: '0 auto', display: 'block' }} /></span>
                        <div className="cp-file-drop-text">Seret & lepas kartu di sini, atau <span>klik untuk memilih</span></div>
                        {m.kartuPelajar && <div className="cp-file-name-display" style={{ display: 'block' }}>📎 {m.kartuPelajar.name}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="cp-add-btn"
              onClick={addMember}
              disabled={members.length >= MAX_MEMBERS}
            >
              <span>♣</span> {members.length >= MAX_MEMBERS ? 'Peserta 3 sudah ditambahkan' : 'Tambah Peserta 3 (Opsional)'}
            </button>

            <div className="cp-field" style={{ marginTop: '24px' }}>
              <div className="cp-field-label">Bukti Transfer Pembayaran <span className="req">*</span></div>
              <div className="cp-field-hint">Unggah bukti transfer pembayaran HTM.</div>
              <div className="cp-file-drop">
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
                <span className="cp-file-drop-icon"><CreditCard size={28} style={{ margin: '0 auto', display: 'block' }} /></span>
                <div className="cp-file-drop-text">Seret & lepas bukti transfer di sini, atau <span>klik untuk memilih</span></div>
                {buktiBayar && <div className="cp-file-name-display" style={{ display: 'block' }}>📎 {buktiBayar.name}</div>}
              </div>
            </div>
          </div>

          <div className="cp-form-section">
            <div className="cp-section-header">
              <div className="cp-section-icon">📜</div>
              <div className="cp-section-title-group">
                <span className="cp-section-number">Bagian II</span>
                <div className="cp-section-title">Pernyataan</div>
              </div>
            </div>

            <div className="cp-declaration-note">
              Mohon pastikan seluruh data sudah benar sebelum memilih <strong>'Setuju'</strong>. Anda masih dapat melakukan perbaikan data sebelum formulir dikirimkan.
            </div>

            {[
              {
                text: "Saya menyatakan bahwa semua data yang saya isi dalam formulir pendaftaran sudah benar dan sesuai dengan dokumen resmi yang dimiliki. Jika di kemudian hari terdapat kesalahan atau ketidaksesuaian data, saya menerima segala konsekuensi yang berlaku.",
                val: decl1, set: setDecl1
              },
              {
                text: "Saya dan tim berkomitmen untuk mematuhi seluruh persyaratan dan peraturan yang berlaku dalam Competitive Programming Competition IFEST 6.0 2026.",
                val: decl2, set: setDecl2
              },
              {
                text: "Jika saya atau tim saya melakukan pelanggaran terhadap peraturan yang berlaku, kami siap menerima sanksi yang diberikan, termasuk kemungkinan diskualifikasi dari kompetisi.",
                val: decl3, set: setDecl3
              }
            ].map((decl, i) => (
              <div className="cp-decl-item" key={i}>
                <div className="cp-decl-text">{decl.text}</div>
                <div className="cp-decl-choices">
                  <div className="cp-decl-choice agree">
                    <input type="radio" name={`decl${i}`} id={`decl${i}y`} value="Setuju" required onChange={e => decl.set(e.target.value)} />
                    <label className="cp-decl-choice-label" htmlFor={`decl${i}y`}>✓ Setuju</label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cp-submit-section">
            {errorMsg && <div className="cp-alert error show" style={{ display: 'block' }}>{errorMsg}</div>}
            <div className="cp-submit-divider">✦ Siap untuk Bertanding ✦</div>
            <button type="submit" className="cp-submit-btn" disabled={isSubmitting}>
              {!isSubmitting ? <span>🚀 Kirim Pendaftaran</span> : <div className="cp-loader-ring" style={{ display: 'block' }}></div>}
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
