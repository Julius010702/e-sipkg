'use client';
// src/app/(admin-pusat)/anjab-abk/anjab/[jabatanId]/page.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DynamicRow { id: string; uraian: string; keterangan: string; }

interface AnjabForm {
  ikhtisarJabatan: string; uraianTugas: string;
  bahanKerja: DynamicRow[]; perangkatKerja: DynamicRow[]; hasilKerja: DynamicRow[];
  tanggungjawab: string[];
  pangkatGolonganTerendah: string; pangkatGolonganTertinggi: string;
  pendidikanTerendah: string; bidangPendidikanTerendah: string;
  pendidikanTertinggi: string; bidangPendidikanTertinggi: string;
  kursusPelatihanPemimpin: string[]; pengalamanKerja: string[];
  pengetahuan: string[]; keterampilan: string[];
}

interface JabatanInfo {
  id: string; kodeJabatan: string; namaJabatan: string;
  jenisJabatan: string; unitOrganisasi?: { namaUnit: string };
}

function useIsMobile(bp = 768) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const fn = () => setVal(window.innerWidth < bp);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return val;
}

const newRow = (): DynamicRow => ({ id: crypto.randomUUID(), uraian: '', keterangan: '' });
const defaultForm = (): AnjabForm => ({
  ikhtisarJabatan:'', uraianTugas:'',
  bahanKerja:[newRow()], perangkatKerja:[newRow()], hasilKerja:[newRow()],
  tanggungjawab:[''],
  pangkatGolonganTerendah:'', pangkatGolonganTertinggi:'',
  pendidikanTerendah:'', bidangPendidikanTerendah:'',
  pendidikanTertinggi:'', bidangPendidikanTertinggi:'',
  kursusPelatihanPemimpin:[''], pengalamanKerja:[''],
  pengetahuan:[''], keterampilan:[''],
});

function calcProgress(form: AnjabForm): number {
  const checks = [
    form.ikhtisarJabatan.trim().length > 0, form.uraianTugas.trim().length > 0,
    form.bahanKerja.some(r => r.uraian.trim()), form.perangkatKerja.some(r => r.uraian.trim()),
    form.hasilKerja.some(r => r.uraian.trim()), form.tanggungjawab.some(t => t.trim()),
    form.pangkatGolonganTerendah.trim().length > 0, form.pangkatGolonganTertinggi.trim().length > 0,
    form.pendidikanTerendah.trim().length > 0, form.bidangPendidikanTerendah.trim().length > 0,
    form.pendidikanTertinggi.trim().length > 0, form.bidangPendidikanTertinggi.trim().length > 0,
    form.kursusPelatihanPemimpin.some(k => k.trim()), form.pengalamanKerja.some(p => p.trim()),
    form.pengetahuan.some(p => p.trim()), form.keterampilan.some(k => k.trim()),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ── Shared input styles — warna teks eksplisit #1e293b ──
const inputSt: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  fontSize: 13, border: "1px solid #e2e8f0", outline: "none",
  background: "white", boxSizing: "border-box",
  color: "#1e293b",          // ← fix: teks gelap
};
const textareaSt: React.CSSProperties = {
  ...inputSt, resize: "none" as const,
};
const selectSt: React.CSSProperties = {
  ...inputSt, cursor: "pointer",
};

// ── Style untuk input di dalam DynamicTable ──
const tableInputSt: React.CSSProperties = {
  width: "100%", padding: "7px 10px", borderRadius: 8,
  fontSize: 12, border: "1px solid #e2e8f0", outline: "none",
  boxSizing: "border-box", background: "white",
  color: "#1e293b",          // ← fix: teks gelap
};

// ── Style untuk input di dalam ArrayInput ──
const arrayInputSt: React.CSSProperties = {
  flex: 1, padding: "8px 12px", borderRadius: 10,
  fontSize: 13, border: "1px solid #e2e8f0", outline: "none",
  background: "white", boxSizing: "border-box",
  color: "#1e293b",          // ← fix: teks gelap
};

function DynamicTable({ rows, onChange, col1Label='Uraian', col2Label='Keterangan', showCol2=true }: {
  rows: DynamicRow[]; onChange: (rows: DynamicRow[]) => void;
  col1Label?: string; col2Label?: string; showCol2?: boolean;
}) {
  const addRow = () => onChange([...rows, newRow()]);
  const removeRow = (id: string) => onChange(rows.filter(r => r.id !== id));
  const updateRow = (id: string, field: 'uraian'|'keterangan', value: string) =>
    onChange(rows.map(r => r.id === id ? { ...r, [field]: value } : r));

  return (
    <div style={{ border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#f8fafc" }}>
            <th style={{ padding:"8px 12px", textAlign:"left", fontSize:11, fontWeight:600, color:"#64748b", width:32 }}>No</th>
            <th style={{ padding:"8px 12px", textAlign:"left", fontSize:11, fontWeight:600, color:"#64748b" }}>{col1Label}</th>
            {showCol2 && <th style={{ padding:"8px 12px", textAlign:"left", fontSize:11, fontWeight:600, color:"#64748b", width:"33%" }}>{col2Label}</th>}
            <th style={{ width:32 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} style={{ borderTop:"1px solid #f1f5f9" }}>
              <td style={{ padding:"6px 12px", fontSize:12, color:"#94a3b8", textAlign:"center" }}>{i+1}</td>
              <td style={{ padding:"4px 8px" }}>
                <input
                  value={row.uraian}
                  onChange={e => updateRow(row.id,'uraian',e.target.value)}
                  placeholder={`Masukkan ${col1Label.toLowerCase()}...`}
                  style={tableInputSt}
                />
              </td>
              {showCol2 && (
                <td style={{ padding:"4px 8px" }}>
                  <input
                    value={row.keterangan}
                    onChange={e => updateRow(row.id,'keterangan',e.target.value)}
                    placeholder={`${col2Label}...`}
                    style={tableInputSt}
                  />
                </td>
              )}
              <td style={{ padding:"4px 6px", textAlign:"center" }}>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(row.id)}
                    style={{ width:24, height:24, borderRadius:6, border:"none", background:"none", cursor:"pointer", color:"#cbd5e1", display:"flex", alignItems:"center", justifyContent:"center" }}
                    onMouseEnter={e => (e.currentTarget.style.color="#ef4444")}
                    onMouseLeave={e => (e.currentTarget.style.color="#cbd5e1")}
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding:"8px 12px", borderTop:"1px solid #f1f5f9" }}>
        <button onClick={addRow} style={{ fontSize:12, fontWeight:600, color:"#3b82f6", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah baris
        </button>
      </div>
    </div>
  );
}

function ArrayInput({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  const add = () => onChange([...items, '']);
  const remove = (i: number) => onChange(items.filter((_,idx) => idx !== i));
  const update = (i: number, v: string) => onChange(items.map((item,idx) => idx===i ? v : item));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#94a3b8", width:20, textAlign:"right", flexShrink:0 }}>{i+1}.</span>
          <input
            value={item}
            onChange={e => update(i,e.target.value)}
            placeholder={placeholder}
            style={arrayInputSt}
          />
          {items.length > 1 && (
            <button onClick={() => remove(i)}
              style={{ width:28, height:28, borderRadius:8, border:"none", background:"none", cursor:"pointer", color:"#cbd5e1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
              onMouseEnter={e => (e.currentTarget.style.color="#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color="#cbd5e1")}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      ))}
      <button onClick={add} style={{ fontSize:12, fontWeight:600, color:"#3b82f6", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, marginLeft:28 }}>
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Tambah
      </button>
    </div>
  );
}

const PANGKAT_OPTIONS = [
  'Ia – Juru Muda','Ib – Juru Muda Tk.I','Ic – Juru','Id – Juru Tk.I',
  'IIa – Pengatur Muda','IIb – Pengatur Muda Tk.I','IIc – Pengatur','IId – Pengatur Tk.I',
  'IIIa – Penata Muda','IIIb – Penata Muda Tk.I','IIIc – Penata','IIId – Penata Tk.I',
  'IVa – Pembina','IVb – Pembina Tk.I','IVc – Pembina Utama Muda','IVd – Pembina Utama Madya','IVe – Pembina Utama',
];
const PENDIDIKAN_OPTIONS = ['SD','SMP','SMA/SMK','D1','D2','D3','S1/D4','S2','S3'];

export default function AnjabPage() {
  const params    = useParams();
  const router    = useRouter();
  const jabatanId = params.jabatanId as string;
  const isMobile  = useIsMobile();

  const [jabatan, setJabatan]         = useState<JabatanInfo | null>(null);
  const [form, setForm]               = useState<AnjabForm>(defaultForm());
  const [anjabId, setAnjabId]         = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const progress      = calcProgress(form);
  const progressColor = progress === 100 ? '#10b981' : progress >= 60 ? '#f59e0b' : '#ef4444';

  const set = useCallback(<K extends keyof AnjabForm>(key: K, val: AnjabForm[K]) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [jabRes, anjabRes] = await Promise.all([
          fetch(`/api/jabatan/${jabatanId}`),
          fetch(`/api/anjab/${jabatanId}`),
        ]);
        const jabData = await jabRes.json();
        setJabatan(jabData);
        if (anjabRes.ok) {
          const d = await anjabRes.json();
          if (d?.id) {
            setAnjabId(d.id);
            setForm({
              ikhtisarJabatan: d.ikhtisarJabatan ?? '',
              uraianTugas: d.uraianTugas ?? '',
              bahanKerja: d.bahanKerja?.length ? d.bahanKerja : [newRow()],
              perangkatKerja: d.perangkatKerja?.length ? d.perangkatKerja : [newRow()],
              hasilKerja: d.hasilKerja?.length ? d.hasilKerja : [newRow()],
              tanggungjawab: d.tanggungjawab?.length ? d.tanggungjawab : [''],
              pangkatGolonganTerendah: d.pangkatGolonganTerendah ?? '',
              pangkatGolonganTertinggi: d.pangkatGolonganTertinggi ?? '',
              pendidikanTerendah: d.pendidikanTerendah ?? '',
              bidangPendidikanTerendah: d.bidangPendidikanTerendah ?? '',
              pendidikanTertinggi: d.pendidikanTertinggi ?? '',
              bidangPendidikanTertinggi: d.bidangPendidikanTertinggi ?? '',
              kursusPelatihanPemimpin: d.kursusPelatihanPemimpin?.length ? d.kursusPelatihanPemimpin : [''],
              pengalamanKerja: d.pengalamanKerja?.length ? d.pengalamanKerja : [''],
              pengetahuan: d.pengetahuan?.length ? d.pengetahuan : [''],
              keterampilan: d.keterampilan?.length ? d.keterampilan : [''],
            });
          }
        }
      } catch { toast.error('Gagal memuat data'); }
      finally { setLoading(false); }
    }
    load();
  }, [jabatanId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { jabatanId, ...form, progressPersen: progress };
      const url    = anjabId ? `/api/anjab/${anjabId}` : '/api/anjab';
      const method = anjabId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const saved = await res.json();
      if (!anjabId) setAnjabId(saved.id);
      toast.success('ANJAB berhasil disimpan');
    } catch (e: any) { toast.error(e.message || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const handleLanjutABK = async () => {
    await handleSave();
    router.push(`/jabatan/${jabatanId}/abk`);
  };

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:240 }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, border:"2px solid #3b82f6", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
          <p style={{ fontSize:13, color:"#94a3b8" }}>Memuat data ANJAB...</p>
        </div>
      </div>
    );
  }

  const sections = ['Identitas Jabatan','Ikhtisar & Uraian Tugas','Bahan & Perangkat Kerja','Hasil Kerja & Tanggung Jawab','Syarat Jabatan','Pelatihan & Pengalaman','Pengetahuan & Keterampilan'];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, paddingBottom:24 }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#94a3b8", marginBottom:4 }}>
            <Link href="/jabatan" style={{ color:"#94a3b8", textDecoration:"none" }}>Jabatan</Link>
            <span>›</span>
            <span style={{ color:"#475569", fontWeight:600 }}>ANJAB</span>
          </div>
          <h1 style={{ fontSize: isMobile?18:20, fontWeight:900, color:"#0f172a", margin:0 }}>Analisis Jabatan (ANJAB)</h1>
          {jabatan && (
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8, marginTop:6 }}>
              <span style={{ fontFamily:"monospace", fontSize:11, background:"#f1f5f9", color:"#475569", padding:"2px 8px", borderRadius:6 }}>{jabatan.kodeJabatan}</span>
              <span style={{ fontSize:13, fontWeight:600, color:"#334155" }}>{jabatan.namaJabatan}</span>
              {jabatan.unitOrganisasi && <span style={{ fontSize:12, color:"#94a3b8" }}>· {jabatan.unitOrganisasi.namaUnit}</span>}
            </div>
          )}
        </div>

        {/* Progress */}
        <div style={{ background:"white", borderRadius:16, border:"1px solid #f1f5f9", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", padding:"12px 18px", display:"flex", alignItems:"center", gap:14 }}>
          <div>
            <p style={{ fontSize:11, color:"#94a3b8", margin:"0 0 6px" }}>Progress ANJAB</p>
            <div style={{ width: isMobile?100:128, height:6, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:4, transition:"width 0.5s", width:`${progress}%`, background:progressColor }} />
            </div>
          </div>
          <span style={{ fontSize:22, fontWeight:900, color:progressColor }}>{progress}%</span>
        </div>
      </div>

      {/* ── Section tabs ── */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, flexWrap: isMobile?"nowrap":"wrap" }}>
        {sections.map((s, i) => (
          <button key={i} onClick={() => setActiveSection(i)}
            style={{ flexShrink:0, padding: isMobile?"7px 10px":"7px 14px", borderRadius:20, fontSize: isMobile?11:12, fontWeight:600, border:"none", cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
              background: activeSection===i ? "#3b82f6" : "#f1f5f9",
              color:       activeSection===i ? "white"   : "#64748b",
            }}>
            {i+1}. {isMobile ? s.split(' ')[0] : s}
          </button>
        ))}
      </div>

      {/* ── Jabatan info (readonly) ── */}
      <div style={{ background:"white", borderRadius:16, border:"1px solid #f1f5f9", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", padding:16 }}>
        <div style={{ display:"grid", gridTemplateColumns: isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:12 }}>
          {[
            { label:"Kode Jabatan", value:jabatan?.kodeJabatan, mono:true },
            { label:"Nama Jabatan", value:jabatan?.namaJabatan },
            { label:"Jenis Jabatan", value:jabatan?.jenisJabatan },
            { label:"Unit Organisasi", value:jabatan?.unitOrganisasi?.namaUnit },
          ].map(({label,value,mono}) => (
            <div key={label}>
              <p style={{ fontSize:11, color:"#94a3b8", margin:"0 0 3px" }}>{label}</p>
              <p style={{ fontSize:13, fontWeight:700, color:"#334155", margin:0, fontFamily: mono?"monospace":"inherit" }}>{value || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form section ── */}
      <div style={{ background:"white", borderRadius:16, border:"1px solid #f1f5f9", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", padding: isMobile?16:24 }}>
        <SectionLabel no={activeSection+1} title={sections[activeSection]} />

        {activeSection === 0 && (
          <div style={{ padding:14, borderRadius:12, background:"#f0f9ff", border:"1px solid #bae6fd" }}>
            <p style={{ fontSize:13, color:"#0369a1", margin:0 }}>
              ✓ Identitas jabatan telah terisi dari data jabatan. Lanjutkan ke bagian berikutnya.
            </p>
          </div>
        )}

        {activeSection === 1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={labelSt}>Ikhtisar Jabatan</label>
              <textarea rows={3} value={form.ikhtisarJabatan} onChange={e => set('ikhtisarJabatan', e.target.value)}
                placeholder="Tuliskan ikhtisar/ringkasan jabatan..." style={textareaSt} />
            </div>
            <div>
              <label style={labelSt}>Uraian Tugas</label>
              <textarea rows={5} value={form.uraianTugas} onChange={e => set('uraianTugas', e.target.value)}
                placeholder="Tuliskan uraian tugas jabatan..." style={textareaSt} />
            </div>
          </div>
        )}

        {activeSection === 2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div>
              <label style={labelSt}>Bahan Kerja</label>
              <DynamicTable rows={form.bahanKerja} onChange={rows => set('bahanKerja', rows)} col1Label="Bahan Kerja" col2Label="Penggunaan" />
            </div>
            <div>
              <label style={labelSt}>Perangkat Kerja</label>
              <DynamicTable rows={form.perangkatKerja} onChange={rows => set('perangkatKerja', rows)} col1Label="Perangkat Kerja" col2Label="Digunakan Untuk" />
            </div>
          </div>
        )}

        {activeSection === 3 && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div>
              <label style={labelSt}>Hasil Kerja</label>
              <DynamicTable rows={form.hasilKerja} onChange={rows => set('hasilKerja', rows)} col1Label="Hasil Kerja" col2Label="Satuan" />
            </div>
            <div>
              <label style={labelSt}>Tanggung Jawab</label>
              <ArrayInput items={form.tanggungjawab} onChange={items => set('tanggungjawab', items)} placeholder="Tuliskan tanggung jawab..." />
            </div>
          </div>
        )}

        {activeSection === 4 && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <label style={labelSt}>Pangkat / Golongan</label>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:12 }}>
              <div>
                <label style={subLabelSt}>Terendah <span style={{ color:"#ef4444" }}>*</span></label>
                <select value={form.pangkatGolonganTerendah} onChange={e => set('pangkatGolonganTerendah', e.target.value)} style={selectSt}>
                  <option value="">-- Pilih --</option>
                  {PANGKAT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={subLabelSt}>Tertinggi <span style={{ color:"#ef4444" }}>*</span></label>
                <select value={form.pangkatGolonganTertinggi} onChange={e => set('pangkatGolonganTertinggi', e.target.value)} style={selectSt}>
                  <option value="">-- Pilih --</option>
                  {PANGKAT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <label style={labelSt}>Pendidikan</label>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:12 }}>
              <div>
                <label style={subLabelSt}>Pendidikan Terendah <span style={{ color:"#ef4444" }}>*</span></label>
                <select value={form.pendidikanTerendah} onChange={e => set('pendidikanTerendah', e.target.value)} style={selectSt}>
                  <option value="">-- Pilih --</option>
                  {PENDIDIKAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={subLabelSt}>Bidang Pendidikan Terendah <span style={{ color:"#ef4444" }}>*</span></label>
                <input value={form.bidangPendidikanTerendah} onChange={e => set('bidangPendidikanTerendah', e.target.value)}
                  placeholder="cth: Manajemen Pendidikan" style={inputSt} />
              </div>
              <div>
                <label style={subLabelSt}>Pendidikan Tertinggi <span style={{ color:"#ef4444" }}>*</span></label>
                <select value={form.pendidikanTertinggi} onChange={e => set('pendidikanTertinggi', e.target.value)} style={selectSt}>
                  <option value="">-- Pilih --</option>
                  {PENDIDIKAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={subLabelSt}>Bidang Pendidikan Tertinggi <span style={{ color:"#ef4444" }}>*</span></label>
                <input value={form.bidangPendidikanTertinggi} onChange={e => set('bidangPendidikanTertinggi', e.target.value)}
                  placeholder="cth: Administrasi Pendidikan" style={inputSt} />
              </div>
            </div>
          </div>
        )}

        {activeSection === 5 && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div>
              <label style={labelSt}>Kursus / Pelatihan</label>
              <ArrayInput items={form.kursusPelatihanPemimpin} onChange={items => set('kursusPelatihanPemimpin', items)} placeholder="cth: Diklat Kepemimpinan Tingkat III..." />
            </div>
            <div>
              <label style={labelSt}>Pengalaman Kerja</label>
              <ArrayInput items={form.pengalamanKerja} onChange={items => set('pengalamanKerja', items)} placeholder="cth: Minimal 2 tahun di bidang pendidikan..." />
            </div>
          </div>
        )}

        {activeSection === 6 && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div>
              <label style={labelSt}>Pengetahuan</label>
              <ArrayInput items={form.pengetahuan} onChange={items => set('pengetahuan', items)} placeholder="cth: Pengetahuan tentang peraturan kepegawaian..." />
            </div>
            <div>
              <label style={labelSt}>Keterampilan</label>
              <ArrayInput items={form.keterampilan} onChange={items => set('keterampilan', items)} placeholder="cth: Mampu mengoperasikan komputer..." />
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", gap:8 }}>
          {activeSection > 0 && (
            <button onClick={() => setActiveSection(s => s-1)} style={navBtnSt}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {!isMobile && "Sebelumnya"}
            </button>
          )}
          {activeSection < sections.length - 1 && (
            <button onClick={() => setActiveSection(s => s+1)} style={navBtnSt}>
              {!isMobile && "Selanjutnya"}
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>

        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Link href="/jabatan" style={{ padding:"9px 14px", borderRadius:10, fontSize:13, fontWeight:600, border:"1px solid #e2e8f0", color:"#475569", textDecoration:"none", display:"flex", alignItems:"center" }}>
            Kembali
          </Link>
          <button onClick={handleSave} disabled={saving}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, fontSize:13, fontWeight:700, color:"white", border:"none", cursor: saving?"not-allowed":"pointer",
              background: saving?"#94a3b8":"linear-gradient(135deg,#3b82f6,#1d4ed8)",
              boxShadow: saving?"none":"0 4px 14px rgba(59,130,246,0.3)" }}>
            {saving ? <><LoadingSpinner /> Menyimpan...</> : "Simpan ANJAB"}
          </button>
          <button onClick={handleLanjutABK} disabled={saving || progress < 100}
            title={progress < 100 ? `Progress harus 100% (sekarang ${progress}%)` : 'Lanjut ke ABK'}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, fontSize:13, fontWeight:700, color:"white", border:"none", cursor: saving||progress<100?"not-allowed":"pointer",
              background:"linear-gradient(135deg,#10b981,#059669)", opacity: saving||progress<100?0.5:1,
              boxShadow:"0 4px 14px rgba(16,185,129,0.3)" }}>
            Lanjut ABK
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>

      {/* ── Global styles ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        /* Placeholder tetap abu-abu, teks yang diketik gelap */
        input::placeholder,
        textarea::placeholder { color: #cbd5e1 !important; }

        /* Teks yang diketik selalu gelap di semua input/textarea/select */
        input, textarea, select { color: #1e293b !important; }

        /* Focus ring */
        input:focus, textarea:focus, select:focus {
          border-color: #93c5fd !important;
          box-shadow: 0 0 0 3px rgba(147,197,253,0.25) !important;
        }

        /* Warna option di select tetap gelap */
        option { color: #1e293b; background: white; }
      `}</style>
    </div>
  );
}

function SectionLabel({ no, title }: { no: number; title: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <div style={{ width:28, height:28, borderRadius:8, background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"white", flexShrink:0 }}>{no}</div>
      <h3 style={{ fontSize:15, fontWeight:800, color:"#1e293b", margin:0 }}>{title}</h3>
    </div>
  );
}

function LoadingSpinner() {
  return <svg style={{ animation:"spin 0.8s linear infinite" }} width="14" height="14" fill="none" viewBox="0 0 24 24"><circle style={{ opacity:0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity:0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;
}

const labelSt: React.CSSProperties = { display:"block", fontSize:12, fontWeight:700, color:"#475569", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" };
const subLabelSt: React.CSSProperties = { display:"block", fontSize:12, fontWeight:600, color:"#64748b", marginBottom:6 };
const navBtnSt: React.CSSProperties = { display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, fontSize:13, fontWeight:600, border:"1px solid #e2e8f0", color:"#475569", background:"white", cursor:"pointer" };