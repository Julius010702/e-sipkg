"use client";
// src/components/anjab/FormAnjab.tsx
// Form ANJAB lengkap — 16 komponen wajib

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { toast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────
interface BahanRow   { no: number; bahan: string; penggunaan: string; }
interface PerangkatRow { no: number; perangkat: string; penggunaan: string; }
interface HasilRow   { no: number; hasil: string; satuan: string; jumlah: number; }

interface AnjabFormData {
  // 1. Induk jabatan (dari jabatan parent)
  // 2. Kode jabatan (readonly dari jabatan)
  // 3. Jenis jabatan
  // 4. Nama jabatan
  // 5. Unit organisasi
  // 6. Ikhtisar jabatan
  ikhtisarJabatan: string;
  // 7. Uraian tugas
  uraianTugas: string;
  // 8. Bahan kerja
  bahanKerja: BahanRow[];
  // 9. Perangkat kerja
  perangkatKerja: PerangkatRow[];
  // 10. Hasil kerja
  hasilKerja: HasilRow[];
  // 11. Tanggung jawab
  tanggungjawab: string[];
  // 12. Syarat jabatan — pangkat/gol
  pangkatGolonganTerendah: string;
  pangkatGolonganTertinggi: string;
  // 13. Pendidikan
  pendidikanTerendah: string;
  bidangPendidikanTerendah: string;
  pendidikanTertinggi: string;
  bidangPendidikanTertinggi: string;
  // 14. Kursus/pelatihan
  kursusPelatihanPemimpin: string[];
  // 15. Pengalaman kerja
  pengalamanKerja: string[];
  // 16. Pengetahuan & Keterampilan
  pengetahuan: string[];
  keterampilan: string[];
}

interface FormAnjabProps {
  jabatanId: string;
  anjabId?: string;
  onSuccess?: () => void;
}

const PANGKAT_OPTIONS = [
  { value: "Juru Muda / I-a",             label: "Juru Muda / I-a" },
  { value: "Juru Muda Tk.I / I-b",        label: "Juru Muda Tk.I / I-b" },
  { value: "Juru / I-c",                  label: "Juru / I-c" },
  { value: "Juru Tk.I / I-d",             label: "Juru Tk.I / I-d" },
  { value: "Pengatur Muda / II-a",        label: "Pengatur Muda / II-a" },
  { value: "Pengatur Muda Tk.I / II-b",   label: "Pengatur Muda Tk.I / II-b" },
  { value: "Pengatur / II-c",             label: "Pengatur / II-c" },
  { value: "Pengatur Tk.I / II-d",        label: "Pengatur Tk.I / II-d" },
  { value: "Penata Muda / III-a",         label: "Penata Muda / III-a" },
  { value: "Penata Muda Tk.I / III-b",    label: "Penata Muda Tk.I / III-b" },
  { value: "Penata / III-c",              label: "Penata / III-c" },
  { value: "Penata Tk.I / III-d",         label: "Penata Tk.I / III-d" },
  { value: "Pembina / IV-a",              label: "Pembina / IV-a" },
  { value: "Pembina Tk.I / IV-b",         label: "Pembina Tk.I / IV-b" },
  { value: "Pembina Utama Muda / IV-c",   label: "Pembina Utama Muda / IV-c" },
  { value: "Pembina Utama Madya / IV-d",  label: "Pembina Utama Madya / IV-d" },
  { value: "Pembina Utama / IV-e",        label: "Pembina Utama / IV-e" },
];

const PENDIDIKAN_OPTIONS = [
  { value: "SD",   label: "SD"   },
  { value: "SMP",  label: "SMP"  },
  { value: "SMA",  label: "SMA/SMK/Sederajat" },
  { value: "D1",   label: "D1"   },
  { value: "D2",   label: "D2"   },
  { value: "D3",   label: "D3"   },
  { value: "D4",   label: "D4"   },
  { value: "S1",   label: "S1/D4" },
  { value: "S2",   label: "S2 / Magister" },
  { value: "S3",   label: "S3 / Doktor" },
];

const EMPTY: AnjabFormData = {
  ikhtisarJabatan: "",
  uraianTugas: "",
  bahanKerja: [{ no: 1, bahan: "", penggunaan: "" }],
  perangkatKerja: [{ no: 1, perangkat: "", penggunaan: "" }],
  hasilKerja: [{ no: 1, hasil: "", satuan: "", jumlah: 1 }],
  tanggungjawab: [""],
  pangkatGolonganTerendah: "",
  pangkatGolonganTertinggi: "",
  pendidikanTerendah: "",
  bidangPendidikanTerendah: "",
  pendidikanTertinggi: "",
  bidangPendidikanTertinggi: "",
  kursusPelatihanPemimpin: [""],
  pengalamanKerja: [""],
  pengetahuan: [""],
  keterampilan: [""],
};

// ── Dynamic array helpers ─────────────────────────────────────
function ArrayField({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", width: 18, textAlign: "right", flexShrink: 0 }}>{i + 1}.</span>
            <input
              value={item}
              onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
              placeholder={placeholder || `Item ${i + 1}`}
              style={{
                flex: 1, height: 36, padding: "0 10px",
                background: "rgba(255,255,255,0.05)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: 7, color: "white", fontSize: 13,
                fontFamily: "'Lato', sans-serif", outline: "none",
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0d6efd"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
            {items.length > 1 && (
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4, transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ""])}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 10px", background: "rgba(13,110,253,0.1)",
            border: "1px dashed rgba(13,110,253,0.3)", borderRadius: 7,
            color: "#3b82f6", fontSize: 12, cursor: "pointer", width: "fit-content",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(13,110,253,0.18)"}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(13,110,253,0.1)"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah {label}
        </button>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────
function SectionHeader({ no, title, filled }: { no: number; title: string; filled?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0 4px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 14 }}>
      <div style={{
        width: 24, height: 24, borderRadius: "50%",
        background: filled ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.15)",
        border: `1.5px solid ${filled ? "#10b981" : "#3b82f6"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: filled ? "#10b981" : "#3b82f6",
        flexShrink: 0,
      }}>
        {filled ? "✓" : no}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{title}</span>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>Kelengkapan ANJAB</span>
        <span style={{ fontSize: 14, fontWeight: 900, color: pct === 100 ? "#10b981" : "#3b82f6" }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: pct === 100 ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#3b82f6,#0d6efd)",
          borderRadius: 4, transition: "width 0.5s ease",
        }} />
      </div>
      {pct < 100 && (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
          Lengkapi semua field untuk bisa melanjutkan ke ABK
        </p>
      )}
    </div>
  );
}

// ── Main Form ────────────────────────────────────────────────
export function FormAnjab({ jabatanId, anjabId, onSuccess }: FormAnjabProps) {
  const router = useRouter();
  const [form, setForm]     = useState<AnjabFormData>(EMPTY);
  const [jabatan, setJabatan] = useState<{ kodeJabatan: string; namaJabatan: string; jenisJabatan: string; unitOrganisasi?: { namaUnit: string }; indukJabatan?: { namaJabatan: string } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);

  // Hitung progress
  function calcProgress(): number {
    const checks = [
      form.ikhtisarJabatan.trim().length > 0,
      form.uraianTugas.trim().length > 0,
      form.bahanKerja.some(b => b.bahan.trim()),
      form.perangkatKerja.some(p => p.perangkat.trim()),
      form.hasilKerja.some(h => h.hasil.trim()),
      form.tanggungjawab.some(t => t.trim()),
      !!form.pangkatGolonganTerendah,
      !!form.pangkatGolonganTertinggi,
      !!form.pendidikanTerendah,
      form.bidangPendidikanTerendah.trim().length > 0,
      !!form.pendidikanTertinggi,
      form.bidangPendidikanTertinggi.trim().length > 0,
      form.kursusPelatihanPemimpin.some(k => k.trim()),
      form.pengalamanKerja.some(p => p.trim()),
      form.pengetahuan.some(p => p.trim()),
      form.keterampilan.some(k => k.trim()),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  const progress = calcProgress();

  function setF<K extends keyof AnjabFormData>(key: K, val: AnjabFormData[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  // Load data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const jabRes = await fetch(`/api/jabatan/${jabatanId}`);
        const jabData = await jabRes.json();
        if (jabData.data) setJabatan(jabData.data);

        if (anjabId || jabData.data?.anjab) {
          const id  = anjabId || jabData.data.anjab.id;
          const res = await fetch(`/api/anjab/${id}`);
          const d   = await res.json();
          if (d.data) {
            setForm({
              ikhtisarJabatan:          d.data.ikhtisarJabatan || "",
              uraianTugas:              d.data.uraianTugas || "",
              bahanKerja:               d.data.bahanKerja || EMPTY.bahanKerja,
              perangkatKerja:           d.data.perangkatKerja || EMPTY.perangkatKerja,
              hasilKerja:               d.data.hasilKerja || EMPTY.hasilKerja,
              tanggungjawab:            d.data.tanggungjawab || EMPTY.tanggungjawab,
              pangkatGolonganTerendah:  d.data.pangkatGolonganTerendah || "",
              pangkatGolonganTertinggi: d.data.pangkatGolonganTertinggi || "",
              pendidikanTerendah:       d.data.pendidikanTerendah || "",
              bidangPendidikanTerendah: d.data.bidangPendidikanTerendah || "",
              pendidikanTertinggi:      d.data.pendidikanTertinggi || "",
              bidangPendidikanTertinggi:d.data.bidangPendidikanTertinggi || "",
              kursusPelatihanPemimpin:  d.data.kursusPelatihanPemimpin || EMPTY.kursusPelatihanPemimpin,
              pengalamanKerja:          d.data.pengalamanKerja || EMPTY.pengalamanKerja,
              pengetahuan:              d.data.pengetahuan || EMPTY.pengetahuan,
              keterampilan:             d.data.keterampilan || EMPTY.keterampilan,
            });
          }
        }
      } catch {
        toast.error("Gagal memuat data ANJAB");
      } finally {
        setLoading(false);
      }
    }
    if (jabatanId) load();
  }, [jabatanId, anjabId]);

  async function handleSave(andContinue = false) {
    setSaving(true);
    try {
      const res = await fetch(`/api/anjab`, {
        method: anjabId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jabatanId, progressPersen: progress }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("ANJAB berhasil disimpan");
      if (andContinue) {
        router.push(`/sekolah/jabatan/${jabatanId}/abk`);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan ANJAB");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.05)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Progress */}
      <ProgressBar pct={progress} />

      {/* Info jabatan (readonly) */}
      {jabatan && (
        <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { label: "Induk Jabatan",   value: jabatan.indukJabatan?.namaJabatan || "—" },
            { label: "Kode Jabatan",    value: jabatan.kodeJabatan },
            { label: "Jenis Jabatan",   value: jabatan.jenisJabatan },
            { label: "Nama Jabatan",    value: jabatan.namaJabatan },
            { label: "Unit Organisasi", value: jabatan.unitOrganisasi?.namaUnit || "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* 6. Ikhtisar Jabatan */}
        <div><SectionHeader no={6} title="Ikhtisar Jabatan" filled={form.ikhtisarJabatan.trim().length > 0} />
          <Textarea label="Ikhtisar Jabatan" value={form.ikhtisarJabatan} onChange={(e) => setF("ikhtisarJabatan", e.target.value)} placeholder="Ringkasan singkat tentang tugas pokok jabatan..." rows={3} required fullWidth />
        </div>

        {/* 7. Uraian Tugas */}
        <div><SectionHeader no={7} title="Uraian Tugas" filled={form.uraianTugas.trim().length > 0} />
          <Textarea label="Uraian Tugas" value={form.uraianTugas} onChange={(e) => setF("uraianTugas", e.target.value)} placeholder="Tuliskan uraian tugas secara rinci..." rows={4} required fullWidth />
        </div>

        {/* 8. Bahan Kerja */}
        <div>
          <SectionHeader no={8} title="Bahan Kerja" filled={form.bahanKerja.some(b => b.bahan.trim())} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {form.bahanKerja.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr auto", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>{i + 1}.</span>
                <input value={row.bahan} onChange={(e) => { const n = [...form.bahanKerja]; n[i].bahan = e.target.value; setF("bahanKerja", n); }} placeholder="Bahan kerja" style={{ height: 36, padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, fontFamily: "'Lato',sans-serif", outline: "none" }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0d6efd"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
                <input value={row.penggunaan} onChange={(e) => { const n = [...form.bahanKerja]; n[i].penggunaan = e.target.value; setF("bahanKerja", n); }} placeholder="Penggunaan" style={{ height: 36, padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, fontFamily: "'Lato',sans-serif", outline: "none" }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0d6efd"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
                {form.bahanKerja.length > 1 && <button type="button" onClick={() => setF("bahanKerja", form.bahanKerja.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4 }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
              </div>
            ))}
            <button type="button" onClick={() => setF("bahanKerja", [...form.bahanKerja, { no: form.bahanKerja.length + 1, bahan: "", penggunaan: "" }])} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(13,110,253,0.1)", border: "1px dashed rgba(13,110,253,0.3)", borderRadius: 7, color: "#3b82f6", fontSize: 12, cursor: "pointer", width: "fit-content" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Tambah Bahan Kerja
            </button>
          </div>
        </div>

        {/* 9. Perangkat Kerja */}
        <div>
          <SectionHeader no={9} title="Perangkat Kerja" filled={form.perangkatKerja.some(p => p.perangkat.trim())} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {form.perangkatKerja.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr auto", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>{i + 1}.</span>
                <input value={row.perangkat} onChange={(e) => { const n = [...form.perangkatKerja]; n[i].perangkat = e.target.value; setF("perangkatKerja", n); }} placeholder="Perangkat kerja" style={{ height: 36, padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, fontFamily: "'Lato',sans-serif", outline: "none" }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0d6efd"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
                <input value={row.penggunaan} onChange={(e) => { const n = [...form.perangkatKerja]; n[i].penggunaan = e.target.value; setF("perangkatKerja", n); }} placeholder="Penggunaan" style={{ height: 36, padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, fontFamily: "'Lato',sans-serif", outline: "none" }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0d6efd"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
                {form.perangkatKerja.length > 1 && <button type="button" onClick={() => setF("perangkatKerja", form.perangkatKerja.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4 }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
              </div>
            ))}
            <button type="button" onClick={() => setF("perangkatKerja", [...form.perangkatKerja, { no: form.perangkatKerja.length + 1, perangkat: "", penggunaan: "" }])} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(13,110,253,0.1)", border: "1px dashed rgba(13,110,253,0.3)", borderRadius: 7, color: "#3b82f6", fontSize: 12, cursor: "pointer", width: "fit-content" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Tambah Perangkat Kerja
            </button>
          </div>
        </div>

        {/* 10. Hasil Kerja */}
        <div>
          <SectionHeader no={10} title="Hasil Kerja" filled={form.hasilKerja.some(h => h.hasil.trim())} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {form.hasilKerja.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 2fr 1fr 80px auto", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>{i + 1}.</span>
                <input value={row.hasil} onChange={(e) => { const n = [...form.hasilKerja]; n[i].hasil = e.target.value; setF("hasilKerja", n); }} placeholder="Hasil kerja" style={{ height: 36, padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, fontFamily: "'Lato',sans-serif", outline: "none" }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0d6efd"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
                <input value={row.satuan} onChange={(e) => { const n = [...form.hasilKerja]; n[i].satuan = e.target.value; setF("hasilKerja", n); }} placeholder="Satuan" style={{ height: 36, padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, fontFamily: "'Lato',sans-serif", outline: "none" }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0d6efd"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
                <input type="number" value={row.jumlah} onChange={(e) => { const n = [...form.hasilKerja]; n[i].jumlah = Number(e.target.value); setF("hasilKerja", n); }} placeholder="Jml" style={{ height: 36, padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, fontFamily: "'Lato',sans-serif", outline: "none", textAlign: "center" }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0d6efd"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
                {form.hasilKerja.length > 1 && <button type="button" onClick={() => setF("hasilKerja", form.hasilKerja.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4 }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
              </div>
            ))}
            <button type="button" onClick={() => setF("hasilKerja", [...form.hasilKerja, { no: form.hasilKerja.length + 1, hasil: "", satuan: "", jumlah: 1 }])} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(13,110,253,0.1)", border: "1px dashed rgba(13,110,253,0.3)", borderRadius: 7, color: "#3b82f6", fontSize: 12, cursor: "pointer", width: "fit-content" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Tambah Hasil Kerja
            </button>
          </div>
        </div>

        {/* 11. Tanggung Jawab */}
        <div><SectionHeader no={11} title="Tanggung Jawab" filled={form.tanggungjawab.some(t => t.trim())} />
          <ArrayField label="Tanggung Jawab" items={form.tanggungjawab} onChange={(v) => setF("tanggungjawab", v)} placeholder="Tanggung jawab jabatan ini..." />
        </div>

        {/* 12. Syarat Jabatan — Pangkat */}
        <div>
          <SectionHeader no={12} title="Syarat Jabatan — Pangkat/Golongan" filled={!!form.pangkatGolonganTerendah && !!form.pangkatGolonganTertinggi} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Select label="Pangkat/Golongan Terendah" options={PANGKAT_OPTIONS} value={form.pangkatGolonganTerendah} onChange={(v) => setF("pangkatGolonganTerendah", v)} placeholder="Pilih pangkat terendah" required fullWidth />
            <Select label="Pangkat/Golongan Tertinggi" options={PANGKAT_OPTIONS} value={form.pangkatGolonganTertinggi} onChange={(v) => setF("pangkatGolonganTertinggi", v)} placeholder="Pilih pangkat tertinggi" required fullWidth />
          </div>
        </div>

        {/* 13. Pendidikan */}
        <div>
          <SectionHeader no={13} title="Syarat Jabatan — Pendidikan" filled={!!form.pendidikanTerendah && !!form.pendidikanTertinggi} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
            <Select label="Pendidikan Terendah" options={PENDIDIKAN_OPTIONS} value={form.pendidikanTerendah} onChange={(v) => setF("pendidikanTerendah", v)} placeholder="Pilih jenjang" required fullWidth />
            <Input label="Bidang Pendidikan Terendah" value={form.bidangPendidikanTerendah} onChange={(e) => setF("bidangPendidikanTerendah", e.target.value)} placeholder="cth: Kependidikan, Teknik Informatika" required fullWidth />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Select label="Pendidikan Tertinggi" options={PENDIDIKAN_OPTIONS} value={form.pendidikanTertinggi} onChange={(v) => setF("pendidikanTertinggi", v)} placeholder="Pilih jenjang" required fullWidth />
            <Input label="Bidang Pendidikan Tertinggi" value={form.bidangPendidikanTertinggi} onChange={(e) => setF("bidangPendidikanTertinggi", e.target.value)} placeholder="cth: Manajemen Pendidikan, IPA" required fullWidth />
          </div>
        </div>

        {/* 14. Kursus/Pelatihan */}
        <div><SectionHeader no={14} title="Kursus/Pelatihan (Pemimpin)" filled={form.kursusPelatihanPemimpin.some(k => k.trim())} />
          <ArrayField label="Kursus/Pelatihan" items={form.kursusPelatihanPemimpin} onChange={(v) => setF("kursusPelatihanPemimpin", v)} placeholder="cth: Diklat Prajabatan, PPG, PLPG..." />
        </div>

        {/* 15. Pengalaman Kerja */}
        <div><SectionHeader no={15} title="Pengalaman Kerja" filled={form.pengalamanKerja.some(p => p.trim())} />
          <ArrayField label="Pengalaman Kerja" items={form.pengalamanKerja} onChange={(v) => setF("pengalamanKerja", v)} placeholder="cth: Mengajar minimal 2 tahun..." />
        </div>

        {/* 16. Pengetahuan & Keterampilan */}
        <div>
          <SectionHeader no={16} title="Pengetahuan & Keterampilan" filled={form.pengetahuan.some(p => p.trim()) && form.keterampilan.some(k => k.trim())} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <ArrayField label="Pengetahuan" items={form.pengetahuan} onChange={(v) => setF("pengetahuan", v)} placeholder="cth: Pengetahuan kurikulum..." />
            <ArrayField label="Keterampilan" items={form.keterampilan} onChange={(v) => setF("keterampilan", v)} placeholder="cth: Mengoperasikan komputer..." />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 20, marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
        <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
          Kembali
        </Button>
        <Button variant="ghost" onClick={() => window.print()} disabled={saving}
          leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>}
        >
          Cetak
        </Button>
        <Button variant="primary" onClick={() => handleSave(false)} loading={saving}>
          Simpan ANJAB
        </Button>
        <Button variant="success" onClick={() => handleSave(true)} loading={saving} disabled={progress < 100}
          rightIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
        >
          Simpan & Lanjut ABK
        </Button>
      </div>
    </div>
  );
}