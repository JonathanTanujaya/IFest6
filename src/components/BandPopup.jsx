import React, { useState } from 'react';
import { X } from 'lucide-react';
import './BandPopup.css';

const ROLES = ['Vocalist', 'Gitaris', 'Bassist', 'Keyboardist', 'Drummer', 'Lainnya'];
const ROLE_EMOJIS = ['🎤', '🎸', '🎵', '🎹', '🥁', '✏️'];
const SUITS_ARR = ['♠', '♥', '♦', '♣'];

export default function BandPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [members, setMembers] = useState([
    { id: 1, nama: '', wa: '', peran: '' },
    { id: 2, nama: '', wa: '', peran: '' },
    { id: 3, nama: '', wa: '', peran: '' },
    { id: 4, nama: '', wa: '', peran: '' }
  ]);
  const [kategori, setKategori] = useState('');
  const [kategoriOther, setKategoriOther] = useState('');
  
  const addMember = () => {
    if (members.length < 8) {
      setMembers([...members, { id: Date.now(), nama: '', wa: '', peran: '' }]);
    }
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const updateMember = (id, field, value) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="band-popup-overlay">
        <div className="band-popup-container" style={{ padding: '80px 40px', textAlign: 'center' }}>
          <button className="band-close-btn" onClick={onClose}><X size={20} /></button>
          <span className="band-hat-icon" style={{ fontSize: '80px' }}>🎩</span>
          <h2 className="band-header h1" style={{ fontSize: '26px' }}>Pendaftaran Berhasil!</h2>
          <p className="band-desc-text" style={{ maxWidth: '480px', margin: '0 auto 30px' }}>
            Terima kasih telah mendaftarkan band Anda untuk Band Competition I-Fest 6.0 2026.<br/>
            Data Anda telah tercatat. Panitia akan menghubungi Anda segera.
          </p>
          <div className="band-divider-ornament">♠ ♥ ♦ ♣</div>
          <button className="band-contact-btn" onClick={onClose}>Kembali ke Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="band-popup-overlay" onClick={onClose}>
      <div className="band-popup-container" onClick={e => e.stopPropagation()}>
        <button className="band-close-btn" onClick={onClose}><X size={20} /></button>

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

        <div className="band-description-card">
          <p className="band-desc-text">
            Selamat datang di <strong style={{color: 'var(--text)'}}>Band Competition I-Fest 6.0 2026!</strong> 🎩♥️<br/>
            Kompetisi yang diselenggarakan secara luring oleh Himpunan Mahasiswa Informatika (HIMIF) Universitas Multi Data Palembang.
          </p>
          
          <div className="band-info-grid">
            <div className="band-info-card" style={{ gridColumn: 'span 2' }}>
              <span className="band-ic-label">🎶 Lagu Wajib (pilih salah satu)</span>
              <ol className="band-song-list" style={{margin:0, padding:0}}>
                <li><span className="band-song-num">1.</span>Terlukis Indah — Rizky Febian & Ziva Magnolya</li>
                <li><span className="band-song-num">2.</span>Sialan — Adrian Khalif & Juicy Luicy</li>
                <li><span className="band-song-num">3.</span>Telenovia — Reality Club</li>
              </ol>
            </div>
          </div>
        </div>

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
              <input className="band-text-input" type="text" placeholder="Nama band Anda…" required />
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
              </div>
            </div>

            <div className="band-field">
              <div className="band-field-label">Asal Instansi <span className="req">*</span></div>
              <input className="band-text-input" type="text" placeholder="Nama sekolah / instansi Anda…" required />
            </div>

            <div className="band-field-label" style={{marginBottom:'16px', marginTop:'24px'}}>
              Anggota Band <span className="req">*</span>
              <span className="band-badge">Maks. 8 peserta</span>
            </div>

            {members.map((m, index) => {
              const isRequired = index < 4;
              return (
                <div key={m.id} className={`band-member-card ${!isRequired ? 'optional' : ''}`}>
                  <div className="band-member-header">
                    <div className="band-member-badge">
                      <span style={{color: 'var(--red-bright)', fontSize:'14px'}}>{SUITS_ARR[index % 4]}</span> Peserta {index + 1} {!isRequired && ' (Opsional)'}
                    </div>
                    {!isRequired && (
                      <button type="button" onClick={() => removeMember(m.id)} style={{background:'none', border:'none', color:'var(--red)', cursor:'pointer'}}>✕ Hapus</button>
                    )}
                  </div>
                  <div className="band-member-grid">
                    <div>
                      <div className="band-field-label" style={{fontSize:'10px'}}>Nama Lengkap {isRequired && '*'}</div>
                      <input className="band-text-input" type="text" placeholder={`Nama peserta ${index + 1}…`} required={isRequired} />
                    </div>
                    <div>
                      <div className="band-field-label" style={{fontSize:'10px'}}>No. WhatsApp {isRequired && '*'}</div>
                      <input className="band-text-input" type="tel" placeholder="08xxxxxxxxxx" required={isRequired} />
                    </div>
                  </div>
                </div>
              );
            })}

            <button type="button" className="band-add-btn" onClick={addMember} disabled={members.length >= 8}>
              <span>♣</span> {members.length >= 8 ? 'Maks. 8 Anggota Tercapai' : `Tambah Anggota (${members.length}/8)`}
            </button>
          </div>

          <div className="band-submit-section">
            <div className="band-submit-divider" style={{display:'flex', alignItems:'center', gap:'14px', marginBottom:'28px', color:'var(--gold-dim)', fontSize:'11px', letterSpacing:'3px', justifyContent:'center'}}>
              ✦ Siap untuk Tampil ✦
            </div>
            <button type="submit" className="band-submit-btn">
              <span>🎩 Kirim Pendaftaran</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
