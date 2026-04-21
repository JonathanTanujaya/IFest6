import React, { useState, useRef } from 'react';
import { X, CreditCard } from 'lucide-react';
import './MLPopup.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxH5fAtMUh0MOgD76HecoB4xvJ_pdmI7J2J6baEFv77OFr2O8TGqh8a_Tlxnb_cFjR8/exec';

export default function DCPopup({ onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const popupRef = useRef(null);

  // TEAM
  const [namaTim, setNamaTim] = useState('');
  const [asalInstansi, setAsalInstansi] = useState('');

  // PESERTA (1–6)
  const [peserta, setPeserta] = useState([
    { id: 1, nama: '', gender: '', wa: '', email: '' },
    { id: 2, nama: '', gender: '', wa: '', email: '' },
    { id: 3, nama: '', gender: '', wa: '', email: '' },
    { id: 4, nama: '', gender: '', wa: '', email: '' }, // opsional
    { id: 5, nama: '', gender: '', wa: '', email: '' }, // opsional
    { id: 6, nama: '', gender: '', wa: '', email: '' }, // opsional
  ]);

  const [buktiBayar, setBuktiBayar] = useState(null);

  const [decl1, setDecl1] = useState('');
  const [decl2, setDecl2] = useState('');
  const [decl3, setDecl3] = useState('');

  const updatePeserta = (id, field, value) => {
    setPeserta(peserta.map(p => (p.id === id ? { ...p, [field]: value } : p)));
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

    let errors = [];

    if (!namaTim) errors.push('Nama Tim');
    if (!asalInstansi) errors.push('Asal Instansi');

    // wajib peserta 1-3
    peserta.slice(0, 3).forEach((p) => {
      if (!p.nama) errors.push(`Nama Peserta ${p.id}`);
      if (!p.gender) errors.push(`Gender Peserta ${p.id}`);
      if (!p.wa) errors.push(`WA Peserta ${p.id}`);
      if (!p.email) errors.push(`Email Peserta ${p.id}`);
    });

    if (!buktiBayar) errors.push('Bukti Pembayaran');
    if (!decl1 || !decl2 || !decl3) errors.push('Pernyataan');

    if (errors.length > 0) {
      setErrorMsg('Mohon lengkapi: ' + errors.join(', '));
      popupRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const bayarB64 = await fileToBase64(buktiBayar);

      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        formType: 'DANCE_COVER',
        namaTim,
        asalInstansi,
        bayarName: buktiBayar.name,
        bayarB64,
        decl1, decl2, decl3
      };

      peserta.forEach(p => {
        payload[`nama_p${p.id}`] = p.nama;
        payload[`gender_p${p.id}`] = p.gender;
        payload[`wa_p${p.id}`] = p.wa;
        payload[`email_p${p.id}`] = p.email;
      });

      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });

      setIsSuccess(true);
    } catch (err) {
      setErrorMsg('Terjadi kesalahan.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="ml-popup-overlay">
        <div className="ml-popup-container">
          <h2>Pendaftaran Berhasil!</h2>
          <p>Data Anda telah tercatat. Panitia akan menghubungi Anda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-popup-overlay" onClick={onClose}>
      <div className="ml-popup-container" onClick={e => e.stopPropagation()} ref={popupRef}>
        <button className="ml-close-btn" onClick={onClose}><X size={20}/></button>

        <h1>K-Pop Dance Cover</h1>
        <h2>Formulir Pendaftaran I-Fest 6.0 2026</h2>

        <p>
          Selamat datang di <b>K-Pop Dance Cover Competition I-Fest 6.0 2026! 💃🎶</b><br/>
          Kompetisi ini bertujuan menyalurkan kreativitas dalam seni tari K-Pop.
        </p>

        <p><b>HTM:</b> Rp80.000</p>

        <form onSubmit={handleSubmit}>

          {/* TEAM */}
          <input placeholder="Nama Tim" value={namaTim} onChange={e=>setNamaTim(e.target.value)} />
          <input placeholder="Asal Instansi" value={asalInstansi} onChange={e=>setAsalInstansi(e.target.value)} />

          {/* PESERTA */}
          {peserta.map((p) => (
            <div key={p.id}>
              <h4>Peserta {p.id} {p.id >= 4 && '(Opsional)'}</h4>

              <input placeholder="Nama" value={p.nama} onChange={e=>updatePeserta(p.id,'nama',e.target.value)} />

              <select value={p.gender} onChange={e=>updatePeserta(p.id,'gender',e.target.value)}>
                <option value="">Pilih Gender</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              <input placeholder="WhatsApp" value={p.wa} onChange={e=>updatePeserta(p.id,'wa',e.target.value)} />
              <input placeholder="Email" value={p.email} onChange={e=>updatePeserta(p.id,'email',e.target.value)} />
            </div>
          ))}

          {/* FILE */}
          <input type="file" accept="image/*" onChange={e=>setBuktiBayar(e.target.files[0])} />

          {/* DECLARATION */}
          <h3>PERNYATAAN</h3>

          {[setDecl1, setDecl2, setDecl3].map((set, i)=>(
            <div key={i}>
              <label>
                <input type="radio" name={`decl${i}`} value="Setuju" onChange={e=>set(e.target.value)} /> Setuju
              </label>
              <label>
                <input type="radio" name={`decl${i}`} value="Tidak Setuju" onChange={e=>set(e.target.value)} /> Tidak Setuju
              </label>
            </div>
          ))}

          {errorMsg && <div>{errorMsg}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}