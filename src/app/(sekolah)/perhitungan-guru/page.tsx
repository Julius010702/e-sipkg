"use client";
// src/app/(sekolah)/perhitungan-guru/page.tsx

import { useState, useEffect, useCallback } from "react";

interface PerhitunganData {
  id?: string; sekolahId?: string; tahunAjaran: string;
  jumlahRombel?: number; jumlahJamPelajaran?: number; bebanMengajar?: number;
  jumlahGuruTersedia?: number; jumlahGuruPNS?: number; jumlahGuruPPPK?: number;
  kebutuhanGuru?: number; kekuranganGuru?: number; kelebihanGuru?: number;
  statusKebutuhan?: string; prediksiData?: { tahun: string; prediksi: number }[];
  catatan?: string;
}

const TAHUN_LIST = Array.from({ length: 8 }, (_, i) => {
  const y = new Date().getFullYear() - 2 + i;
  return `${y}/${y + 1}`;
});

const STATUS_COLOR: Record<string, string> = { KURANG: "#ef4444", LEBIH: "#f59e0b", SESUAI: "#22c55e" };

export default function PerhitunganGuruPage() {
  const [history, setHistory] = useState<PerhitunganData[]>([]);
  const [current, setCurrent] = useState<PerhitunganData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [form, setForm] = useState({ tahunAjaran: TAHUN_LIST[2], jumlahRombel: "", jumlahJamPelajaran: "", bebanMengajar: "24", catatan: "" });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/perhitungan/kebutuhan");
      const json = await res.json();
      setHistory(json.data || []);
      if (json.data?.length > 0) setCurrent(json.data[0]);
    } catch { showToast("Gagal memuat data", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  function setF(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleHitung(e: React.FormEvent) {
    e.preventDefault();
    if (!form.jumlahRombel || !form.jumlahJamPelajaran) { showToast("Isi jumlah rombel dan jam pelajaran", "error"); return; }
    setCalculating(true);
    try {
      const res = await fetch("/api/perhitungan/kebutuhan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tahunAjaran: form.tahunAjaran, jumlahRombel: parseInt(form.jumlahRombel), jumlahJamPelajaran: parseInt(form.jumlahJamPelajaran), bebanMengajar: parseInt(form.bebanMengajar) || 24, catatan: form.catatan }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showToast("Perhitungan berhasil disimpan", "success");
      fetchHistory();
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setCalculating(false); }
  }

  const statusColor = current?.statusKebutuhan ? STATUS_COLOR[current.statusKebutuhan] || "#666" : "#666";

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      <div style={{ marginBottom: 24 }}>
        <div style={BC}>Perhitungan</div>
        <h1 style={H1}>Kebutuhan Guru</h1>
        <p style={SUB}>Hitung kebutuhan guru berdasarkan jumlah rombel dan jam pelajaran</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
        {/* Form perhitungan */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 22 }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 800, color: "white" }}>Input Perhitungan</h3>
          <form onSubmit={handleHitung}>
            <Fld label="Tahun Ajaran" req>
              <SW><select value={form.tahunAjaran} onChange={(e) => setF("tahunAjaran", e.target.value)} style={SEL} required>
                {TAHUN_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
              </select><Cv /></SW>
            </Fld>
            <Fld label="Jumlah Rombel (Kelas)" req>
              <input type="number" min={1} value={form.jumlahRombel} onChange={(e) => setF("jumlahRombel", e.target.value)} placeholder="contoh: 24" style={IS} required />
            </Fld>
            <Fld label="Jam Pelajaran / Minggu per Rombel" req>
              <input type="number" min={1} value={form.jumlahJamPelajaran} onChange={(e) => setF("jumlahJamPelajaran", e.target.value)} placeholder="contoh: 36" style={IS} required />
            </Fld>
            <Fld label="Beban Mengajar Guru (jam/minggu)">
              <input type="number" min={1} value={form.bebanMengajar} onChange={(e) => setF("bebanMengajar", e.target.value)} style={IS} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Default: 24 jam/minggu sesuai standar</p>
            </Fld>

            {/* Preview rumus */}
            {form.jumlahRombel && form.jumlahJamPelajaran && (
              <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, marginBottom: 6 }}>PREVIEW HASIL</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                  ({form.jumlahRombel} × {form.jumlahJamPelajaran}) ÷ {form.bebanMengajar || 24}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#10b981" }}>
                  ≈ {(parseInt(form.jumlahRombel) * parseInt(form.jumlahJamPelajaran) / (parseInt(form.bebanMengajar) || 24)).toFixed(2)} guru
                </div>
              </div>
            )}

            <Fld label="Catatan">
              <textarea value={form.catatan} onChange={(e) => setF("catatan", e.target.value)} rows={2} style={{ ...IS, resize: "vertical" }} placeholder="Opsional..." />
            </Fld>

            <button type="submit" disabled={calculating}
              style={{ width: "100%", padding: "11px 0", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: calculating ? "not-allowed" : "pointer", opacity: calculating ? 0.7 : 1 }}>
              {calculating ? "Menghitung..." : "Hitung & Simpan"}
            </button>
          </form>
        </div>

        {/* Hasil & Chart */}
        <div>
          {/* Hasil terbaru */}
          {current && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 20 }}>
                <SC label="Tahun Ajaran" val={current.tahunAjaran} color="#10b981" big={false} />
                <SC label="Guru Tersedia" val={String(current.jumlahGuruTersedia ?? 0)} color="#3b82f6" />
                <SC label="Kebutuhan Guru" val={String(Math.ceil(current.kebutuhanGuru ?? 0))} color="#f59e0b" />
                <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${statusColor}30`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Status</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: statusColor }}>{current.statusKebutuhan || "—"}</div>
                  {current.kekuranganGuru ? <div style={{ fontSize: 11, color: statusColor, marginTop: 2 }}>Kekurangan {current.kekuranganGuru} guru</div> : null}
                  {current.kelebihanGuru ? <div style={{ fontSize: 11, color: statusColor, marginTop: 2 }}>Kelebihan {current.kelebihanGuru} guru</div> : null}
                </div>
              </div>

              {/* Prediksi Chart */}
              {current.prediksiData && current.prediksiData.length > 0 && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: "white" }}>📈 Prediksi Kebutuhan Guru (5 Tahun)</h3>
                  <PrediksiChart data={current.prediksiData} currentKebutuhan={current.kebutuhanGuru || 0} />
                </div>
              )}
            </>
          )}

          {/* Riwayat */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "white" }}>Riwayat Perhitungan</h3>
            </div>
            {loading ? (
              <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Memuat...</div>
            ) : history.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Belum ada perhitungan.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Tahun Ajaran", "Rombel", "Jam/Minggu", "Tersedia", "Kebutuhan", "Status"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.07em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} onClick={() => setCurrent(h)}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: current?.id === h.id ? "rgba(16,185,129,0.06)" : "transparent", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { if (current?.id !== h.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = current?.id === h.id ? "rgba(16,185,129,0.06)" : "transparent"; }}
                    >
                      <td style={{ padding: "12px 14px", color: "white", fontWeight: 600, fontSize: 13 }}>{h.tahunAjaran}</td>
                      <td style={{ padding: "12px 14px", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{h.jumlahRombel}</td>
                      <td style={{ padding: "12px 14px", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{h.jumlahJamPelajaran}</td>
                      <td style={{ padding: "12px 14px", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{h.jumlahGuruTersedia}</td>
                      <td style={{ padding: "12px 14px", color: "#f59e0b", fontWeight: 700, fontSize: 13 }}>{Math.ceil(h.kebutuhanGuru ?? 0)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", background: `${STATUS_COLOR[h.statusKebutuhan || ""] || "#666"}18`, color: STATUS_COLOR[h.statusKebutuhan || ""] || "#666", borderRadius: 100 }}>{h.statusKebutuhan || "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <GStyles />
    </div>
  );
}

// ── Prediksi Chart (SVG inline) ───────────────────────────────────────────────
function PrediksiChart({ data, currentKebutuhan }: { data: { tahun: string; prediksi: number }[]; currentKebutuhan: number }) {
  const W = 500, H = 140, PAD = { t: 20, r: 20, b: 30, l: 40 };
  const allVals = [currentKebutuhan, ...data.map((d) => d.prediksi)];
  const minV = Math.max(0, Math.min(...allVals) * 0.85);
  const maxV = Math.max(...allVals) * 1.15;
  const allLabels = [`Saat Ini`, ...data.map((d) => d.tahun)];
  const allPts = [currentKebutuhan, ...data.map((d) => d.prediksi)];
  const n = allPts.length;

  function xp(i: number) { return PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r); }
  function yp(v: number) { return PAD.t + (1 - (v - minV) / (maxV - minV)) * (H - PAD.t - PAD.b); }

  const linePath = allPts.map((v, i) => `${i === 0 ? "M" : "L"}${xp(i).toFixed(1)},${yp(v).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${xp(n - 1).toFixed(1)},${(H - PAD.b).toFixed(1)} L${xp(0).toFixed(1)},${(H - PAD.b).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.t + t * (H - PAD.t - PAD.b);
        const val = maxV - t * (maxV - minV);
        return <g key={t}><line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" /><text x={PAD.l - 5} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">{Math.round(val)}</text></g>;
      })}
      {/* Area */}
      <path d={areaPath} fill="url(#pg)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {allPts.map((v, i) => (
        <g key={i}>
          <circle cx={xp(i)} cy={yp(v)} r="4" fill={i === 0 ? "#f59e0b" : "#10b981"} stroke="#0d1117" strokeWidth="2" />
          <text x={xp(i)} y={yp(v) - 10} textAnchor="middle" fontSize="9" fill={i === 0 ? "#f59e0b" : "#10b981"} fontWeight="700">{v.toFixed(1)}</text>
          <text x={xp(i)} y={H - PAD.b + 14} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">{allLabels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) { if (!toast) return null; const ok = toast.type === "success"; return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", background: ok ? "#0d2b1a" : "#2b0d0d", border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`, borderRadius: 10, color: ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>{ok ? "✓" : "✕"} {toast.msg}</div>; }
function SC({ label, val, color, big = true }: { label: string; val: string; color: string; big?: boolean }) { return <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}25`, borderRadius: 10, padding: "14px 16px" }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div><div style={{ fontSize: big ? 26 : 16, fontWeight: 800, color }}>{val}</div></div>; }
function Fld({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 7, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}{req && <span style={{ color: "#ef4444" }}>*</span>}</label>{children}</div>; }
function SW({ children }: { children: React.ReactNode }) { return <div style={{ position: "relative" }}>{children}</div>; }
function Cv() { return <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>; }
function GStyles() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)!important}input:focus,textarea:focus,select:focus{border-color:rgba(16,185,129,0.5)!important}select option{background:#1c2330}`}</style>; }

const BC: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 };
const H1: React.CSSProperties = { fontSize: 24, fontWeight: 800, color: "white", margin: 0 };
const SUB: React.CSSProperties = { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, marginBottom: 0 };
const IS: React.CSSProperties = { width: "100%", padding: "10px 13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" };
const SEL: React.CSSProperties = { ...IS, appearance: "none" as const, cursor: "pointer" };