"use client";
// src/app/(sekolah)/jabatan/[jabatanId]/anjab/page.tsx

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Jabatan { id: string; kodeJabatan: string; namaJabatan: string; jenisJabatan: string; unitOrganisasi?: { namaUnit: string } | null; }
interface AnjabData {
  id?: string;
  ikhtisarJabatan?: string;
  uraianTugas?: string;
  bahanKerja?: { no: number; bahan: string; penggunaan: string }[];
  perangkatKerja?: { no: number; perangkat: string; penggunaan: string }[];
  hasilKerja?: { no: number; hasil: string; satuan: string; jumlah: string }[];
  tanggungjawab?: string[];
  pangkatGolonganTerendah?: string;
  pangkatGolonganTertinggi?: string;
  pendidikanTerendah?: string;
  bidangPendidikanTerendah?: string;
  pendidikanTertinggi?: string;
  bidangPendidikanTertinggi?: string;
  kursusPelatihanPemimpin?: string[];
  pengalamanKerja?: string[];
  pengetahuan?: string[];
  keterampilan?: string[];
  progressPersen?: number;
}

const GOLS = ["I/a","I/b","I/c","I/d","II/a","II/b","II/c","II/d","III/a","III/b","III/c","III/d","IV/a","IV/b","IV/c","IV/d","IV/e"];
const PENDS = ["SMP","SMA/SMK","D1","D2","D3","S1/D4","S2","S3"];

export default function AnjabPage() {
  const { jabatanId } = useParams<{ jabatanId: string }>();
  const router = useRouter();
  const [jabatan, setJabatan] = useState<Jabatan | null>(null);
  const [anjab, setAnjab] = useState<AnjabData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    async function load() {
      try {
        const [jRes, aRes] = await Promise.all([
          fetch(`/api/jabatan/${jabatanId}`),
          fetch(`/api/anjab?jabatanId=${jabatanId}`),
        ]);
        const jData = await jRes.json();
        setJabatan(jData.data);
        if (aRes.ok) {
          const aData = await aRes.json();
          if (aData.data) setAnjab(aData.data);
        }
      } catch { showToast("Gagal memuat data", "error"); }
      finally { setLoading(false); }
    }
    load();
  }, [jabatanId]);

  function setA(key: keyof AnjabData, val: any) { setAnjab((p) => ({ ...p, [key]: val })); }

  // Array helpers
  function addRow<T>(key: keyof AnjabData, newRow: T) { setA(key, [...((anjab[key] as any[]) || []), newRow]); }
  function updateRow<T>(key: keyof AnjabData, idx: number, val: Partial<T>) {
    const arr = [...((anjab[key] as any[]) || [])];
    arr[idx] = { ...arr[idx], ...val };
    setA(key, arr);
  }
  function removeRow(key: keyof AnjabData, idx: number) {
    const arr = [...((anjab[key] as any[]) || [])];
    arr.splice(idx, 1);
    setA(key, arr);
  }
  function addStr(key: keyof AnjabData) { setA(key, [...((anjab[key] as string[]) || []), ""]); }
  function updateStr(key: keyof AnjabData, idx: number, val: string) {
    const arr = [...((anjab[key] as string[]) || [])];
    arr[idx] = val;
    setA(key, arr);
  }
  function removeStr(key: keyof AnjabData, idx: number) {
    const arr = [...((anjab[key] as string[]) || [])];
    arr.splice(idx, 1);
    setA(key, arr);
  }

  // Calculate progress
  function calcProgress(): number {
    const checks = [
      !!anjab.ikhtisarJabatan,
      !!anjab.uraianTugas,
      (anjab.bahanKerja?.length ?? 0) > 0,
      (anjab.perangkatKerja?.length ?? 0) > 0,
      (anjab.hasilKerja?.length ?? 0) > 0,
      (anjab.tanggungjawab?.length ?? 0) > 0,
      !!anjab.pangkatGolonganTerendah,
      !!anjab.pangkatGolonganTertinggi,
      !!anjab.pendidikanTerendah,
      !!anjab.pendidikanTertinggi,
      (anjab.kursusPelatihanPemimpin?.length ?? 0) > 0,
      (anjab.pengalamanKerja?.length ?? 0) > 0,
      (anjab.pengetahuan?.length ?? 0) > 0,
      (anjab.keterampilan?.length ?? 0) > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const progress = calcProgress();
      const method = anjab.id ? "PUT" : "POST";
      const body = { ...anjab, jabatanId, progressPersen: progress };
      const url = anjab.id ? `/api/anjab/${anjab.id}` : "/api/anjab";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal menyimpan"); }
      const json = await res.json();
      setAnjab(json.data);
      showToast("ANJAB berhasil disimpan", "success");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  const progress = calcProgress();
  const TABS = ["Ikhtisar & Uraian", "Bahan & Perangkat", "Hasil & Tanggung Jawab", "Syarat Jabatan", "Pengembangan Diri"];

  if (loading) return <LoadingPage />;

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#0d1117" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          <Link href="/jabatan" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Jabatan</Link>
          <span>/</span>
          <span style={{ color: "rgba(255,255,255,0.6)" }}>{jabatan?.namaJabatan}</span>
          <span>/</span>
          <span style={{ color: "#10b981" }}>ANJAB</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Analisis Jabatan (ANJAB)</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, marginBottom: 0 }}>
              {jabatan?.kodeJabatan} · {jabatan?.namaJabatan} · {jabatan?.unitOrganisasi?.namaUnit || "—"}
            </p>
          </div>
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Progress</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: progress === 100 ? "#22c55e" : progress > 50 ? "#f59e0b" : "#3b82f6" }}>{progress}%</div>
            </div>
            <div style={{ width: 52, height: 52, position: "relative" }}>
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={progress === 100 ? "#22c55e" : "#3b82f6"} strokeWidth="3"
                  strokeDasharray={`${(progress / 100) * 100} 100`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            style={{ padding: "10px 18px", background: "none", border: "none", borderBottom: `2px solid ${activeTab === i ? "#10b981" : "transparent"}`, color: activeTab === i ? "#10b981" : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: activeTab === i ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: Ikhtisar & Uraian */}
      {activeTab === 0 && (
        <Section>
          <Fld label="Ikhtisar Jabatan" req>
            <textarea value={anjab.ikhtisarJabatan || ""} onChange={(e) => setA("ikhtisarJabatan", e.target.value)}
              placeholder="Tuliskan ikhtisar singkat mengenai jabatan ini..." rows={4} style={TA} />
          </Fld>
          <Fld label="Uraian Tugas" req>
            <textarea value={anjab.uraianTugas || ""} onChange={(e) => setA("uraianTugas", e.target.value)}
              placeholder="Uraikan tugas-tugas utama jabatan ini secara lengkap..." rows={6} style={TA} />
          </Fld>
        </Section>
      )}

      {/* Tab 1: Bahan & Perangkat */}
      {activeTab === 1 && (
        <Section>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={SH}>Bahan Kerja</h3>
              <AddRowBtn onClick={() => addRow("bahanKerja", { no: (anjab.bahanKerja?.length || 0) + 1, bahan: "", penggunaan: "" })} />
            </div>
            <DynTable cols={["No", "Bahan Kerja", "Penggunaan", ""]}>
              {(anjab.bahanKerja || []).map((r, i) => (
                <tr key={i} style={TR}>
                  <td style={TDn}>{i + 1}</td>
                  <td style={TDn}><input value={r.bahan} onChange={(e) => updateRow("bahanKerja", i, { bahan: e.target.value })} style={IS} placeholder="Nama bahan kerja" /></td>
                  <td style={TDn}><input value={r.penggunaan} onChange={(e) => updateRow("bahanKerja", i, { penggunaan: e.target.value })} style={IS} placeholder="Penggunaan" /></td>
                  <td style={TDn}><DelRowBtn onClick={() => removeRow("bahanKerja", i)} /></td>
                </tr>
              ))}
            </DynTable>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={SH}>Perangkat Kerja</h3>
              <AddRowBtn onClick={() => addRow("perangkatKerja", { no: (anjab.perangkatKerja?.length || 0) + 1, perangkat: "", penggunaan: "" })} />
            </div>
            <DynTable cols={["No", "Perangkat Kerja", "Penggunaan", ""]}>
              {(anjab.perangkatKerja || []).map((r, i) => (
                <tr key={i} style={TR}>
                  <td style={TDn}>{i + 1}</td>
                  <td style={TDn}><input value={r.perangkat} onChange={(e) => updateRow("perangkatKerja", i, { perangkat: e.target.value })} style={IS} placeholder="Nama perangkat" /></td>
                  <td style={TDn}><input value={r.penggunaan} onChange={(e) => updateRow("perangkatKerja", i, { penggunaan: e.target.value })} style={IS} placeholder="Penggunaan" /></td>
                  <td style={TDn}><DelRowBtn onClick={() => removeRow("perangkatKerja", i)} /></td>
                </tr>
              ))}
            </DynTable>
          </div>
        </Section>
      )}

      {/* Tab 2: Hasil & Tanggung Jawab */}
      {activeTab === 2 && (
        <Section>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={SH}>Hasil Kerja</h3>
              <AddRowBtn onClick={() => addRow("hasilKerja", { no: (anjab.hasilKerja?.length || 0) + 1, hasil: "", satuan: "", jumlah: "" })} />
            </div>
            <DynTable cols={["No", "Hasil Kerja", "Satuan", "Jumlah", ""]}>
              {(anjab.hasilKerja || []).map((r, i) => (
                <tr key={i} style={TR}>
                  <td style={TDn}>{i + 1}</td>
                  <td style={TDn}><input value={r.hasil} onChange={(e) => updateRow("hasilKerja", i, { hasil: e.target.value })} style={IS} placeholder="Nama hasil kerja" /></td>
                  <td style={TDn}><input value={r.satuan} onChange={(e) => updateRow("hasilKerja", i, { satuan: e.target.value })} style={{ ...IS, maxWidth: 120 }} placeholder="Dokumen/Laporan..." /></td>
                  <td style={TDn}><input value={r.jumlah} onChange={(e) => updateRow("hasilKerja", i, { jumlah: e.target.value })} style={{ ...IS, maxWidth: 80 }} placeholder="0" /></td>
                  <td style={TDn}><DelRowBtn onClick={() => removeRow("hasilKerja", i)} /></td>
                </tr>
              ))}
            </DynTable>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={SH}>Tanggung Jawab</h3>
              <AddRowBtn onClick={() => addStr("tanggungjawab")} label="+ Tambah" />
            </div>
            {(anjab.tanggungjawab || []).map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={t} onChange={(e) => updateStr("tanggungjawab", i, e.target.value)} style={{ ...IS, flex: 1 }} placeholder={`Tanggung jawab ${i + 1}`} />
                <DelRowBtn onClick={() => removeStr("tanggungjawab", i)} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Tab 3: Syarat Jabatan */}
      {activeTab === 3 && (
        <Section>
          <h3 style={SH}>Pangkat / Golongan</h3>
          <Grid2>
            <Fld label="Terendah">
              <SWrap><select value={anjab.pangkatGolonganTerendah || ""} onChange={(e) => setA("pangkatGolonganTerendah", e.target.value)} style={SEL}>
                <option value="">-- Pilih --</option>
                {GOLS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select><Chev /></SWrap>
            </Fld>
            <Fld label="Tertinggi">
              <SWrap><select value={anjab.pangkatGolonganTertinggi || ""} onChange={(e) => setA("pangkatGolonganTertinggi", e.target.value)} style={SEL}>
                <option value="">-- Pilih --</option>
                {GOLS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select><Chev /></SWrap>
            </Fld>
          </Grid2>
          <h3 style={{ ...SH, marginTop: 20 }}>Pendidikan</h3>
          <Grid2>
            <Fld label="Pendidikan Terendah">
              <SWrap><select value={anjab.pendidikanTerendah || ""} onChange={(e) => setA("pendidikanTerendah", e.target.value)} style={SEL}>
                <option value="">-- Pilih --</option>
                {PENDS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select><Chev /></SWrap>
            </Fld>
            <Fld label="Bidang Pendidikan Terendah">
              <input value={anjab.bidangPendidikanTerendah || ""} onChange={(e) => setA("bidangPendidikanTerendah", e.target.value)} style={IS} placeholder="contoh: Kependidikan" />
            </Fld>
            <Fld label="Pendidikan Tertinggi">
              <SWrap><select value={anjab.pendidikanTertinggi || ""} onChange={(e) => setA("pendidikanTertinggi", e.target.value)} style={SEL}>
                <option value="">-- Pilih --</option>
                {PENDS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select><Chev /></SWrap>
            </Fld>
            <Fld label="Bidang Pendidikan Tertinggi">
              <input value={anjab.bidangPendidikanTertinggi || ""} onChange={(e) => setA("bidangPendidikanTertinggi", e.target.value)} style={IS} placeholder="contoh: Manajemen Pendidikan" />
            </Fld>
          </Grid2>
        </Section>
      )}

      {/* Tab 4: Pengembangan Diri */}
      {activeTab === 4 && (
        <Section>
          {([
            { key: "kursusPelatihanPemimpin" as const, label: "Kursus / Pelatihan Kepemimpinan" },
            { key: "pengalamanKerja" as const, label: "Pengalaman Kerja" },
            { key: "pengetahuan" as const, label: "Pengetahuan" },
            { key: "keterampilan" as const, label: "Keterampilan" },
          ]).map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={SH}>{label}</h3>
                <AddRowBtn onClick={() => addStr(key)} label="+ Tambah" />
              </div>
              {(anjab[key] as string[] || []).map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input value={v} onChange={(e) => updateStr(key, i, e.target.value)} style={{ ...IS, flex: 1 }} placeholder={`${label} ${i + 1}`} />
                  <DelRowBtn onClick={() => removeStr(key, i)} />
                </div>
              ))}
              {(anjab[key] as string[] || []).length === 0 && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Belum ada data. Klik + Tambah.</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Bottom actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/jabatan" style={{ padding: "9px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>← Kembali</Link>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "9px 22px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Menyimpan..." : "Simpan ANJAB"}
          </button>
          {progress === 100 && (
            <Link href={`/jabatan/${jabatanId}/abk`}
              style={{ padding: "9px 22px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
              Lanjut ke ABK →
            </Link>
          )}
        </div>
      </div>
      <GStyles />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) { if (!toast) return null; const ok = toast.type === "success"; return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", background: ok ? "#0d2b1a" : "#2b0d0d", border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`, borderRadius: 10, color: ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>{ok ? "✓" : "✕"} {toast.msg}</div>; }
function Section({ children }: { children: React.ReactNode }) { return <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>{children}</div>; }
function Fld({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}{req && <span style={{ color: "#ef4444" }}>*</span>}</label>{children}</div>; }
function Grid2({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>; }
function SWrap({ children }: { children: React.ReactNode }) { return <div style={{ position: "relative" }}>{children}</div>; }
function Chev() { return <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.3)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>; }
function DynTable({ cols, children }: { cols: string[]; children: React.ReactNode }) { return <div style={{ overflow: "auto", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}><thead><tr style={{ background: "rgba(255,255,255,0.03)" }}>{cols.map((c) => <th key={c} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.07em", textTransform: "uppercase" }}>{c}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
function AddRowBtn({ onClick, label = "+ Tambah Baris" }: { onClick: () => void; label?: string }) { return <button type="button" onClick={onClick} style={{ padding: "6px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, color: "#10b981", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{label}</button>; }
function DelRowBtn({ onClick }: { onClick: () => void }) { return <button type="button" onClick={onClick} style={{ padding: "6px 10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, color: "#ef4444", fontSize: 12, cursor: "pointer" }}>✕</button>; }
function LoadingPage() { return <div style={{ padding: 80, textAlign: "center", background: "#0d1117", minHeight: "100vh" }}><p style={{ color: "rgba(255,255,255,0.3)" }}>Memuat data ANJAB...</p></div>; }
function GStyles() { return <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)!important}input:focus,textarea:focus,select:focus{border-color:rgba(16,185,129,0.5)!important}select option{background:#1c2330}`}</style>; }

const SH: React.CSSProperties = { fontSize: 14, fontWeight: 800, color: "white", margin: "0 0 4px" };
const TR: React.CSSProperties = { borderTop: "1px solid rgba(255,255,255,0.05)" };
const TDn: React.CSSProperties = { padding: "8px 10px" };
const IS: React.CSSProperties = { width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" };
const TA: React.CSSProperties = { ...IS, resize: "vertical" };
const SEL: React.CSSProperties = { ...IS, appearance: "none" as const, cursor: "pointer" };