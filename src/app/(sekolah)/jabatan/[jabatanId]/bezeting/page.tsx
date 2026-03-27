"use client";
// src/app/(sekolah)/jabatan/[jabatanId]/bezeting/page.tsx

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Jabatan { id: string; kodeJabatan: string; namaJabatan: string; jenisJabatan: string; unitOrganisasi?: { namaUnit: string } | null; anjab?: { progressPersen: number; abk?: { statusKebutuhan?: string | null; kebutuhanPegawai?: number } | null } | null; }
interface BRow { id?: string; namaJabatan: string; golonganSaranRendah: string; golonganSaranTinggi: string; jumlahPNS: number; jumlahPPPK: number; }

const GOLS = ["I/a","I/b","I/c","I/d","II/a","II/b","II/c","II/d","III/a","III/b","III/c","III/d","IV/a","IV/b","IV/c","IV/d","IV/e"];

export default function BezetingPage() {
  const { jabatanId } = useParams<{ jabatanId: string }>();
  const [jabatan, setJabatan] = useState<Jabatan | null>(null);
  const [rows, setRows] = useState<BRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    async function load() {
      try {
        const [jRes, bRes] = await Promise.all([fetch(`/api/jabatan/${jabatanId}`), fetch(`/api/bezeting?jabatanId=${jabatanId}`)]);
        const jData = await jRes.json(); setJabatan(jData.data);
        if (bRes.ok) { const bData = await bRes.json(); if (bData.data?.length) setRows(bData.data); }
        // Pre-fill dengan jabatan utama jika belum ada
        if (jData.data && !(await bRes.json())?.data?.length) {
          setRows([{ namaJabatan: jData.data.namaJabatan, golonganSaranRendah: "", golonganSaranTinggi: "", jumlahPNS: 0, jumlahPPPK: 0 }]);
        }
      } catch { showToast("Gagal memuat data", "error"); }
      finally { setLoading(false); }
    }
    load();
  }, [jabatanId]);

  function addRow() { setRows((p) => [...p, { namaJabatan: "", golonganSaranRendah: "", golonganSaranTinggi: "", jumlahPNS: 0, jumlahPPPK: 0 }]); }
  function setR(i: number, k: keyof BRow, v: string | number) { setRows((p) => { const a = [...p]; a[i] = { ...a[i], [k]: v }; return a; }); }
  function delRow(i: number) { setRows((p) => p.filter((_, idx) => idx !== i)); }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/bezeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jabatanId, rows }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menyimpan"); }
      showToast("Bezeting berhasil disimpan", "success");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  const totalPNS = rows.reduce((s, r) => s + (r.jumlahPNS || 0), 0);
  const totalPPPK = rows.reduce((s, r) => s + (r.jumlahPPPK || 0), 0);
  const totalAda = totalPNS + totalPPPK;
  const kebutuhan = jabatan?.anjab?.abk?.kebutuhanPegawai ? Math.ceil(jabatan.anjab.abk.kebutuhanPegawai) : null;

  if (loading) return <div style={{ padding: 80, textAlign: "center", background: "#0d1117", minHeight: "100vh", color: "rgba(255,255,255,0.3)" }}>Memuat...</div>;

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          <Link href="/jabatan" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Jabatan</Link>
          <span>/</span><span style={{ color: "rgba(255,255,255,0.6)" }}>{jabatan?.namaJabatan}</span>
          <span>/</span><span style={{ color: "#8b5cf6" }}>Bezeting</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Bezeting</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Data pengisian jabatan (jumlah pegawai PNS/PPPK yang memangku jabatan)</p>
      </div>

      {/* Ringkasan dari ABK */}
      {kebutuhan !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
          <SCard label="Kebutuhan (ABK)" val={String(kebutuhan)} color="#3b82f6" />
          <SCard label="Total PNS" val={String(totalPNS)} color="#8b5cf6" />
          <SCard label="Total PPPK" val={String(totalPPPK)} color="#06b6d4" />
          <SCard label="Total Ada" val={String(totalAda)} color="#10b981" />
          <SCard label="Selisih" val={(totalAda - kebutuhan > 0 ? "+" : "") + String(totalAda - kebutuhan)}
            color={totalAda >= kebutuhan ? "#22c55e" : "#ef4444"} />
        </div>
      )}

      {/* Tabel Bezeting */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "auto", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "white" }}>Tabel Bezeting</h3>
          <button onClick={addRow} style={{ padding: "6px 14px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 6, color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Tambah Baris</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              {["No", "Nama Jabatan", "Gol. Saran (Rendah)", "Gol. Saran (Tinggi)", "Jml PNS", "Jml PPPK", "Total", ""].map((h) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Tambahkan baris bezeting.</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "9px 14px", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{i + 1}</td>
                <td style={{ padding: "8px 10px" }}><input value={r.namaJabatan} onChange={(e) => setR(i, "namaJabatan", e.target.value)} style={IS} placeholder="Nama jabatan" /></td>
                <td style={{ padding: "8px 10px" }}>
                  <div style={{ position: "relative" }}>
                    <select value={r.golonganSaranRendah} onChange={(e) => setR(i, "golonganSaranRendah", e.target.value)} style={{ ...IS, maxWidth: 110, appearance: "none", cursor: "pointer" }}>
                      <option value="">—</option>
                      {GOLS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <div style={{ position: "relative" }}>
                    <select value={r.golonganSaranTinggi} onChange={(e) => setR(i, "golonganSaranTinggi", e.target.value)} style={{ ...IS, maxWidth: 110, appearance: "none", cursor: "pointer" }}>
                      <option value="">—</option>
                      {GOLS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </td>
                <td style={{ padding: "8px 10px" }}><input type="number" min={0} value={r.jumlahPNS} onChange={(e) => setR(i, "jumlahPNS", parseInt(e.target.value) || 0)} style={{ ...IS, maxWidth: 70 }} /></td>
                <td style={{ padding: "8px 10px" }}><input type="number" min={0} value={r.jumlahPPPK} onChange={(e) => setR(i, "jumlahPPPK", parseInt(e.target.value) || 0)} style={{ ...IS, maxWidth: 70 }} /></td>
                <td style={{ padding: "9px 14px", fontWeight: 700, color: "#10b981", fontSize: 14 }}>{(r.jumlahPNS || 0) + (r.jumlahPPPK || 0)}</td>
                <td style={{ padding: "8px 10px" }}><button onClick={() => delRow(i)} style={{ padding: "5px 8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 5, color: "#ef4444", fontSize: 12, cursor: "pointer" }}>✕</button></td>
              </tr>
            ))}
            {rows.length > 0 && (
              <tr style={{ background: "rgba(255,255,255,0.04)", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
                <td colSpan={4} style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Total:</td>
                <td style={{ padding: "12px 14px", fontWeight: 800, color: "#8b5cf6", fontSize: 14 }}>{totalPNS}</td>
                <td style={{ padding: "12px 14px", fontWeight: 800, color: "#06b6d4", fontSize: 14 }}>{totalPPPK}</td>
                <td style={{ padding: "12px 14px", fontWeight: 800, color: "#10b981", fontSize: 16 }}>{totalAda}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/jabatan/${jabatanId}/abk`} style={LB}>← ABK</Link>
          <Link href={`/jabatan/${jabatanId}/anjab`} style={LB}>Halaman ANJAB</Link>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: "9px 24px", background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Menyimpan..." : "Simpan Bezeting"}
        </button>
      </div>
      <GStyles />
    </div>
  );
}

function SCard({ label, val, color }: { label: string; val: string; color: string }) { return <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}25`, borderRadius: 10, padding: "14px 16px" }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div><div style={{ fontSize: 24, fontWeight: 800, color }}>{val}</div></div>; }
function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) { if (!toast) return null; const ok = toast.type === "success"; return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", background: ok ? "#0d2b1a" : "#2b0d0d", border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`, borderRadius: 10, color: ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>{ok ? "✓" : "✕"} {toast.msg}</div>; }
function GStyles() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder{color:rgba(255,255,255,0.2)!important}input:focus,select:focus{border-color:rgba(139,92,246,0.5)!important}select option{background:#1c2330}`}</style>; }

const IS: React.CSSProperties = { width: "100%", padding: "7px 11px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" };
const LB: React.CSSProperties = { padding: "9px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block" };