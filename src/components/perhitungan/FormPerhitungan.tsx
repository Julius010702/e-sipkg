"use client";
// src/components/perhitungan/FormPerhitungan.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { toast } from "@/components/ui/Toast";

export interface PerhitunganInput {
  tahunAjaran: string;
  jumlahRombel: number;
  jumlahJamPelajaran: number;
  bebanMengajar: number;
  jumlahGuruTersedia: number;
  jumlahGuruPNS: number;
  jumlahGuruPPPK: number;
  catatan: string;
}

export interface PerhitunganOutput {
  kebutuhanGuru: number;
  kekuranganGuru: number;
  kelebihanGuru: number;
  statusKebutuhan: "KURANG" | "LEBIH" | "SESUAI";
}

interface FormPerhitunganProps {
  sekolahId: string;
  existingId?: string;
  onResult?: (input: PerhitunganInput, output: PerhitunganOutput) => void;
  onSaved?: () => void;
}

const TAHUN_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = new Date().getFullYear() - 1 + i;
  return { value: `${y}/${y + 1}`, label: `${y}/${y + 1}` };
});

function hitungKebutuhan(input: PerhitunganInput): PerhitunganOutput {
  const kebutuhan = parseFloat(
    ((input.jumlahRombel * input.jumlahJamPelajaran) / input.bebanMengajar).toFixed(2)
  );
  const selisih = kebutuhan - input.jumlahGuruTersedia;
  return {
    kebutuhanGuru: kebutuhan,
    kekuranganGuru: selisih > 0 ? Math.ceil(selisih) : 0,
    kelebihanGuru: selisih < 0 ? Math.ceil(Math.abs(selisih)) : 0,
    statusKebutuhan: selisih > 0.5 ? "KURANG" : selisih < -0.5 ? "LEBIH" : "SESUAI",
  };
}

export function FormPerhitungan({ sekolahId, existingId, onResult, onSaved }: FormPerhitunganProps) {
  const [form, setForm] = useState<PerhitunganInput>({
    tahunAjaran: TAHUN_OPTIONS[1].value,
    jumlahRombel: 0,
    jumlahJamPelajaran: 36,
    bebanMengajar: 24,
    jumlahGuruTersedia: 0,
    jumlahGuruPNS: 0,
    jumlahGuruPPPK: 0,
    catatan: "",
  });

  const [preview, setPreview] = useState<PerhitunganOutput | null>(null);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!existingId) return;
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/perhitungan/kebutuhan/${existingId}`);
        const data = await res.json();
        if (data.data) {
          const d = data.data;
          setForm({
            tahunAjaran: d.tahunAjaran,
            jumlahRombel: d.jumlahRombel || 0,
            jumlahJamPelajaran: d.jumlahJamPelajaran || 36,
            bebanMengajar: d.bebanMengajar || 24,
            jumlahGuruTersedia: d.jumlahGuruTersedia || 0,
            jumlahGuruPNS: d.jumlahGuruPNS || 0,
            jumlahGuruPPPK: d.jumlahGuruPPPK || 0,
            catatan: d.catatan || "",
          });
        }
      } catch { toast.error("Gagal memuat data"); }
      finally { setLoading(false); }
    }
    load();
  }, [existingId]);

  // Live preview saat form berubah
  useEffect(() => {
    if (form.jumlahRombel > 0 && form.jumlahJamPelajaran > 0 && form.bebanMengajar > 0) {
      setPreview(hitungKebutuhan(form));
    } else {
      setPreview(null);
    }
  }, [form]);

  function set(field: keyof PerhitunganInput, value: string | number) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSave() {
    if (!preview) { toast.error("Lengkapi data terlebih dahulu"); return; }
    setSaving(true);
    try {
      const url    = existingId ? `/api/perhitungan/kebutuhan/${existingId}` : "/api/perhitungan/kebutuhan";
      const method = existingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...preview, sekolahId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Perhitungan berhasil disimpan");
      onResult?.(form, preview);
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  const statusColor = { KURANG: "#ef4444", LEBIH: "#f59e0b", SESUAI: "#10b981" };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
      <div style={{ width:32, height:32, border:"3px solid rgba(255,255,255,0.05)", borderTopColor:"#3b82f6", borderRadius:"50%", animation:"spin 0.7s linear infinite"}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Rumus info */}
      <div style={{ background:"rgba(59,130,246,0.07)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:10, padding:"12px 16px", fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>
        <strong style={{ color:"#60a5fa" }}>Rumus:</strong> Kebutuhan Guru = (Jumlah Rombel × Jam Pelajaran per Minggu) ÷ Beban Mengajar Guru
      </div>

      {/* Form fields */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Select label="Tahun Ajaran" options={TAHUN_OPTIONS} value={form.tahunAjaran} onChange={(v) => set("tahunAjaran", v)} required fullWidth />
        <Input label="Jumlah Rombel" type="number" value={form.jumlahRombel || ""} onChange={(e) => set("jumlahRombel", Number(e.target.value))} placeholder="cth: 30" hint="Jumlah rombongan belajar" required fullWidth />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Input label="Jam Pelajaran / Minggu" type="number" value={form.jumlahJamPelajaran || ""} onChange={(e) => set("jumlahJamPelajaran", Number(e.target.value))} hint="Total jam mapel per minggu per kelas" required fullWidth />
        <Input label="Beban Mengajar Guru (jam/minggu)" type="number" value={form.bebanMengajar || ""} onChange={(e) => set("bebanMengajar", Number(e.target.value))} hint="Standar 24 jam/minggu" required fullWidth />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
        <Input label="Guru Tersedia (Total)" type="number" value={form.jumlahGuruTersedia || ""} onChange={(e) => { const v = Number(e.target.value); set("jumlahGuruTersedia", v); }} required fullWidth />
        <Input label="Guru PNS" type="number" value={form.jumlahGuruPNS || ""} onChange={(e) => set("jumlahGuruPNS", Number(e.target.value))} fullWidth />
        <Input label="Guru PPPK" type="number" value={form.jumlahGuruPPPK || ""} onChange={(e) => set("jumlahGuruPPPK", Number(e.target.value))} fullWidth />
      </div>
      <Input label="Catatan" value={form.catatan} onChange={(e) => set("catatan", e.target.value)} placeholder="Catatan tambahan..." fullWidth />

      {/* Live Preview */}
      {preview && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"16px 20px" }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(255,255,255,0.4)", marginBottom:14 }}>
            Preview Hasil Perhitungan
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
            {[
              { label:"Kebutuhan Guru",   value: preview.kebutuhanGuru.toFixed(1), color:"#3b82f6",  sub:"orang" },
              { label:"Guru Tersedia",    value: form.jumlahGuruTersedia,            color:"#8b5cf6", sub:"orang" },
              { label:"Kekurangan",       value: preview.kekuranganGuru,             color:"#ef4444", sub:"orang" },
              { label:"Kelebihan",        value: preview.kelebihanGuru,              color:"#f59e0b", sub:"orang" },
              { label:"Status",           value: preview.statusKebutuhan,            color: statusColor[preview.statusKebutuhan], sub:"" },
            ].map(({ label, value, color, sub }) => (
              <div key={label} style={{ background:"rgba(0,0,0,0.25)", borderRadius:8, padding:"10px 12px", borderLeft:`3px solid ${color}` }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
                <div style={{ fontSize:22, fontWeight:900, color, marginTop:4 }}>{value}</div>
                {sub && <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>{sub}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <Button variant="primary" onClick={handleSave} loading={saving} disabled={!preview}>
          Simpan Perhitungan
        </Button>
      </div>
    </div>
  );
}