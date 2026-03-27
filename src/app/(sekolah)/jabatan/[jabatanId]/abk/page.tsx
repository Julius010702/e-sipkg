"use client";
// src/app/(sekolah)/jabatan/[jabatanId]/abk/page.tsx

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Jabatan { id: string; kodeJabatan: string; namaJabatan: string; unitOrganisasi?: { namaUnit: string } | null; anjab?: { id: string; ikhtisarJabatan?: string; progressPersen: number } | null; }
interface DetailBK { no: number; uraianTugas: string; satuanHasil: string; volumeKerja: number; normaWaktu: number; bebanKerja: number; }
interface ABKData { id?: string; detailBebanKerja?: DetailBK[]; totalBebanKerja?: number; efektivitasNilai?: number; efektivitasJabatan?: string; kebutuhanPegawai?: number; statusKebutuhan?: string; jumlahKurangLebih?: number; }

const EJ_MAP: Record<string, { label: string; color: string }> = {
  A: { label: "A — Sangat Baik", color: "#22c55e" },
  B: { label: "B — Baik", color: "#10b981" },
  C: { label: "C — Cukup Baik", color: "#3b82f6" },
  D: { label: "D — Cukup", color: "#f59e0b" },
  E: { label: "E — Kurang", color: "#ef4444" },
};
const JAM_EFEKTIF = 1250;

export default function ABKPage() {
  const { jabatanId } = useParams<{ jabatanId: string }>();
  const [jabatan, setJabatan] = useState<Jabatan | null>(null);
  const [abk, setAbk] = useState<ABKData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    async function load() {
      try {
        const [jRes, aRes] = await Promise.all([fetch(`/api/jabatan/${jabatanId}`), fetch(`/api/abk?jabatanId=${jabatanId}`)]);
        const jData = await jRes.json(); setJabatan(jData.data);
        if (aRes.ok) { const aData = await aRes.json(); if (aData.data) setAbk(aData.data); }
      } catch { showToast("Gagal memuat data", "error"); }
      finally { setLoading(false); }
    }
    load();
  }, [jabatanId]);

  function updateRow(idx: number, field: keyof DetailBK, val: string | number) {
    const rows = [...(abk.detailBebanKerja || [])];
    rows[idx] = { ...rows[idx], [field]: field === "uraianTugas" || field === "satuanHasil" ? val : Number(val) };
    // Auto-hitung beban kerja
    if (field === "volumeKerja" || field === "normaWaktu") {
      const r = rows[idx];
      rows[idx].bebanKerja = parseFloat((r.volumeKerja * r.normaWaktu).toFixed(2));
    }
    const total = parseFloat(rows.reduce((s, r) => s + r.bebanKerja, 0).toFixed(2));
    const ej = parseFloat((total / JAM_EFEKTIF).toFixed(2));
    const pj = ej >= 0.91 ? "A" : ej >= 0.76 ? "B" : ej >= 0.61 ? "C" : ej >= 0.51 ? "D" : "E";
    const kp = parseFloat((total / JAM_EFEKTIF).toFixed(2));
    const kpBulat = Math.round(kp);
    setAbk((p) => ({ ...p, detailBebanKerja: rows, totalBebanKerja: total, efektivitasNilai: ej, efektivitasJabatan: pj, kebutuhanPegawai: kp, statusKebutuhan: kpBulat > 1 ? "KURANG" : kpBulat < 1 ? "LEBIH" : "SESUAI", jumlahKurangLebih: Math.abs(kpBulat - 1) }));
  }

  function addRow() {
    const rows = abk.detailBebanKerja || [];
    setAbk((p) => ({ ...p, detailBebanKerja: [...rows, { no: rows.length + 1, uraianTugas: "", satuanHasil: "", volumeKerja: 0, normaWaktu: 0, bebanKerja: 0 }] }));
  }

  function removeRow(idx: number) {
    const rows = [...(abk.detailBebanKerja || [])];
    rows.splice(idx, 1);
    const total = parseFloat(rows.reduce((s, r) => s + r.bebanKerja, 0).toFixed(2));
    setAbk((p) => ({ ...p, detailBebanKerja: rows, totalBebanKerja: total }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const anjabId = jabatan?.anjab?.id;
      if (!anjabId) { showToast("ANJAB harus diisi terlebih dahulu", "error"); return; }
      const method = abk.id ? "PUT" : "POST";
      const url = abk.id ? `/api/abk/${abk.id}` : "/api/abk";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...abk, anjabId }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      const json = await res.json();
      setAbk(json.data);
      showToast("ABK berhasil disimpan", "success");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  if (loading) return <div style={{ padding: 80, textAlign: "center", background: "#0d1117", minHeight: "100vh", color: "rgba(255,255,255,0.3)" }}>Memuat...</div>;

  const ej = abk.efektivitasJabatan;
  const ejInfo = ej ? EJ_MAP[ej] : null;
  const statusColor = abk.statusKebutuhan === "KURANG" ? "#ef4444" : abk.statusKebutuhan === "LEBIH" ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          <Link href="/jabatan" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Jabatan</Link>
          <span>/</span><span style={{ color: "rgba(255,255,255,0.6)" }}>{jabatan?.namaJabatan}</span>
          <span>/</span><span style={{ color: "#3b82f6" }}>ABK</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Analisis Beban Kerja (ABK)</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{jabatan?.kodeJabatan} · {jabatan?.namaJabatan}</p>
      </div>

      {/* Info readonly from ANJAB */}
      {jabatan?.anjab && (
        <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          <InfoItem label="Kode Jabatan" val={jabatan.kodeJabatan} />
          <InfoItem label="Nama Jabatan" val={jabatan.namaJabatan} />
          <InfoItem label="Unit Organisasi" val={jabatan.unitOrganisasi?.namaUnit || "—"} />
          <InfoItem label="Progress ANJAB" val={`${jabatan.anjab.progressPersen}%`} />
        </div>
      )}

      {/* Tabel ABK */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "auto", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "white" }}>Tabel Beban Kerja</h3>
          <button onClick={addRow} style={{ padding: "6px 14px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 6, color: "#3b82f6", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Tambah Baris</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              {["No", "Uraian Tugas", "Satuan Hasil", "Volume Kerja", "Norma Waktu (jam)", "Beban Kerja", ""].map((h) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(abk.detailBebanKerja || []).length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Belum ada baris. Klik '+ Tambah Baris'.</td></tr>
            ) : (abk.detailBebanKerja || []).map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "8px 14px", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{i + 1}</td>
                <td style={{ padding: "8px 10px" }}><input value={r.uraianTugas} onChange={(e) => updateRow(i, "uraianTugas", e.target.value)} style={IS} placeholder="Uraian tugas..." /></td>
                <td style={{ padding: "8px 10px" }}><input value={r.satuanHasil} onChange={(e) => updateRow(i, "satuanHasil", e.target.value)} style={{ ...IS, maxWidth: 120 }} placeholder="Dokumen..." /></td>
                <td style={{ padding: "8px 10px" }}><input type="number" value={r.volumeKerja || ""} onChange={(e) => updateRow(i, "volumeKerja", e.target.value)} style={{ ...IS, maxWidth: 90 }} placeholder="0" /></td>
                <td style={{ padding: "8px 10px" }}><input type="number" value={r.normaWaktu || ""} onChange={(e) => updateRow(i, "normaWaktu", e.target.value)} style={{ ...IS, maxWidth: 90 }} placeholder="0" /></td>
                <td style={{ padding: "8px 14px", color: "#f59e0b", fontWeight: 700, fontSize: 13 }}>{r.bebanKerja.toFixed(2)}</td>
                <td style={{ padding: "8px 10px" }}><button onClick={() => removeRow(i)} style={{ padding: "5px 8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 5, color: "#ef4444", fontSize: 12, cursor: "pointer" }}>✕</button></td>
              </tr>
            ))}
            {(abk.detailBebanKerja || []).length > 0 && (
              <tr style={{ background: "rgba(255,255,255,0.04)", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
                <td colSpan={5} style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Total Beban Kerja:</td>
                <td style={{ padding: "12px 14px", fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>{(abk.totalBebanKerja || 0).toFixed(2)}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Hasil perhitungan */}
      {abk.totalBebanKerja !== undefined && abk.totalBebanKerja > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
          <ResultCard label="Kebutuhan Pegawai" val={`${(abk.kebutuhanPegawai || 0).toFixed(2)}`} color="#3b82f6" sub="orang" />
          <ResultCard label="Efektivitas Jabatan (EJ)" val={(abk.efektivitasNilai || 0).toFixed(2)} color="#8b5cf6" sub="nilai" />
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ejInfo?.color || "#666"}40`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Predikat Jabatan (PJ)</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: ejInfo?.color || "white" }}>{ej || "—"}</div>
            <div style={{ fontSize: 12, color: ejInfo?.color || "rgba(255,255,255,0.4)", marginTop: 4 }}>{ejInfo?.label}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${statusColor}40`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Status Kebutuhan</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: statusColor }}>{abk.statusKebutuhan || "—"}</div>
            <div style={{ fontSize: 12, color: statusColor, marginTop: 4 }}>
              {abk.jumlahKurangLebih !== undefined && abk.jumlahKurangLebih > 0 && `${abk.statusKebutuhan === "KURANG" ? "Kekurangan" : "Kelebihan"} ${abk.jumlahKurangLebih} orang`}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/jabatan/${jabatanId}/anjab`} style={linkBtn}>← ANJAB</Link>
          <Link href={`/jabatan/${jabatanId}/bezeting`} style={{ ...linkBtn, background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.25)" }}>Bezeting →</Link>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: "9px 24px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Menyimpan..." : "Simpan ABK"}
        </button>
      </div>
      <GStyles />
    </div>
  );
}

function InfoItem({ label, val }: { label: string; val: string }) { return <div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{label}</div><div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{val}</div></div>; }
function ResultCard({ label, val, color, sub }: { label: string; val: string; color: string; sub: string }) { return <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}30`, borderRadius: 12, padding: "16px 18px" }}><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div><div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{val}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{sub}</div></div>; }
function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) { if (!toast) return null; const ok = toast.type === "success"; return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", background: ok ? "#0d2b1a" : "#2b0d0d", border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`, borderRadius: 10, color: ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>{ok ? "✓" : "✕"} {toast.msg}</div>; }
function GStyles() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder{color:rgba(255,255,255,0.2)!important}input:focus{border-color:rgba(59,130,246,0.5)!important}`}</style>; }

const IS: React.CSSProperties = { width: "100%", padding: "7px 11px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" };
const linkBtn: React.CSSProperties = { padding: "9px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block" };