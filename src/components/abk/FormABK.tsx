"use client";
// src/components/abk/FormABK.tsx
// Analisis Beban Kerja — Tabel uraian tugas + kalkulasi otomatis

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

interface BebanRow {
  no: number;
  uraianTugas: string;
  satuanHasil: string;
  volumeKerja: number;
  normaWaktu: number;
  bebanKerja: number; // auto = volume × normaWaktu
}

interface ABKResult {
  totalBebanKerja: number;
  kebutuhanPegawai: number;
  efektivitasNilai: number;
  efektivitasJabatan: "A" | "B" | "C" | "D" | "E";
}

interface FormABKProps {
  jabatanId: string;
  abkId?: string;
  onSuccess?: () => void;
}

const JAM_EFEKTIF = 72000; // 1250 jam × 60 menit

const EJ_LABEL: Record<string, string> = {
  A: "Sangat Baik",
  B: "Baik",
  C: "Cukup Baik",
  D: "Cukup",
  E: "Kurang",
};
const EJ_COLOR: Record<string, string> = {
  A: "#10b981", B: "#3b82f6", C: "#06b6d4", D: "#f59e0b", E: "#ef4444",
};

function calcEJ(total: number): { nilai: number; kategori: "A"|"B"|"C"|"D"|"E" } {
  const ej = parseFloat((total / JAM_EFEKTIF).toFixed(2));
  let k: "A"|"B"|"C"|"D"|"E" = "E";
  if (ej >= 0.91) k = "A";
  else if (ej >= 0.76) k = "B";
  else if (ej >= 0.61) k = "C";
  else if (ej >= 0.51) k = "D";
  return { nilai: ej, kategori: k };
}

export function FormABK({ jabatanId, abkId, onSuccess }: FormABKProps) {
  const router = useRouter();
  const [jabatan, setJabatan] = useState<{ kodeJabatan: string; namaJabatan: string; unitOrganisasi?: { namaUnit: string }; anjab?: { ikhtisarJabatan: string; id: string } } | null>(null);
  const [rows, setRows]       = useState<BebanRow[]>([{ no: 1, uraianTugas: "", satuanHasil: "", volumeKerja: 0, normaWaktu: 0, bebanKerja: 0 }]);
  const [result, setResult]   = useState<ABKResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);

  // Auto kalkulasi setiap kali rows berubah
  useEffect(() => {
    const total = rows.reduce((s, r) => s + r.bebanKerja, 0);
    if (total > 0) {
      const { nilai, kategori } = calcEJ(total);
      const kebutuhan = parseFloat((total / JAM_EFEKTIF).toFixed(2));
      setResult({ totalBebanKerja: total, kebutuhanPegawai: kebutuhan, efektivitasNilai: nilai, efektivitasJabatan: kategori });
    } else {
      setResult(null);
    }
  }, [rows]);

  // Load data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const jabRes  = await fetch(`/api/jabatan/${jabatanId}`);
        const jabData = await jabRes.json();
        if (jabData.data) setJabatan(jabData.data);

        if (abkId || jabData.data?.anjab?.abk) {
          const id  = abkId || jabData.data.anjab.abk.id;
          const res = await fetch(`/api/abk/${id}`);
          const d   = await res.json();
          if (d.data?.detailBebanKerja) {
            setRows(d.data.detailBebanKerja);
          }
        } else if (jabData.data?.anjab?.uraianTugas) {
          // Pre-populate dari uraian tugas ANJAB
          const uraian = jabData.data.anjab.uraianTugas as string;
          const lines  = uraian.split("\n").filter((l: string) => l.trim());
          if (lines.length > 0) {
            setRows(lines.map((line: string, i: number) => ({
              no: i + 1, uraianTugas: line.trim(),
              satuanHasil: "", volumeKerja: 0, normaWaktu: 0, bebanKerja: 0,
            })));
          }
        }
      } catch {
        toast.error("Gagal memuat data ABK");
      } finally {
        setLoading(false);
      }
    }
    if (jabatanId) load();
  }, [jabatanId, abkId]);

  function updateRow(i: number, field: keyof BebanRow, raw: string | number) {
    const updated = [...rows];
    const r = { ...updated[i], [field]: raw };
    // Auto hitung beban kerja
    if (field === "volumeKerja" || field === "normaWaktu") {
      r.bebanKerja = r.volumeKerja * r.normaWaktu;
    }
    updated[i] = r;
    setRows(updated);
  }

  function addRow() {
    setRows([...rows, { no: rows.length + 1, uraianTugas: "", satuanHasil: "", volumeKerja: 0, normaWaktu: 0, bebanKerja: 0 }]);
  }

  function removeRow(i: number) {
    if (rows.length === 1) return;
    setRows(rows.filter((_, j) => j !== i).map((r, j) => ({ ...r, no: j + 1 })));
  }

  async function handleSave(andContinue = false) {
    const filled = rows.filter(r => r.uraianTugas.trim());
    if (!filled.length) { toast.error("Isi minimal satu uraian tugas"); return; }
    setSaving(true);
    try {
      const anjabId = jabatan?.anjab?.id;
      if (!anjabId) throw new Error("ANJAB belum diisi. Lengkapi ANJAB terlebih dahulu.");
      const res = await fetch("/api/abk", {
        method: abkId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anjabId,
          detailBebanKerja: rows,
          totalBebanKerja:    result?.totalBebanKerja,
          efektivitasNilai:   result?.efektivitasNilai,
          efektivitasJabatan: result?.efektivitasJabatan,
          kebutuhanPegawai:   result?.kebutuhanPegawai,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("ABK berhasil disimpan");
      if (andContinue) router.push(`/sekolah/jabatan/${jabatanId}/bezeting`);
      else onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan ABK");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 34, padding: "0 8px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6, color: "white", fontSize: 12,
    fontFamily: "'Lato', sans-serif", outline: "none",
  };
  const numStyle: React.CSSProperties = { ...inputStyle, textAlign: "right" };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.05)", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Info jabatan */}
      {jabatan && (
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
          {[
            { label: "Kode Jabatan",    value: jabatan.kodeJabatan },
            { label: "Nama Jabatan",    value: jabatan.namaJabatan },
            { label: "Unit Organisasi", value: jabatan.unitOrganisasi?.namaUnit || "—" },
            { label: "Ikhtisar",        value: jabatan.anjab?.ikhtisarJabatan?.substring(0, 60) + "..." || "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabel beban kerja */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 10 }}>
          Tabel Analisis Beban Kerja
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 400, marginLeft: 8 }}>
            (Beban Kerja = Volume × Norma Waktu secara otomatis)
          </span>
        </div>

        <div style={{ overflowX: "auto", background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                {["No", "Uraian Tugas", "Satuan Hasil", "Volume Kerja", "Norma Waktu (mnt)", "Beban Kerja (mnt)", ""].map((h, i) => (
                  <th key={i} style={{ padding: "10px 10px", textAlign: i > 2 ? "center" : "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)", width: 40 }}>{row.no}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <input value={row.uraianTugas} onChange={(e) => updateRow(i, "uraianTugas", e.target.value)} placeholder="Tuliskan uraian tugas..." style={{ ...inputStyle }}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = "#10b981"}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </td>
                  <td style={{ padding: "8px 10px", width: 110 }}>
                    <input value={row.satuanHasil} onChange={(e) => updateRow(i, "satuanHasil", e.target.value)} placeholder="cth: Dokumen" style={inputStyle}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = "#10b981"}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </td>
                  <td style={{ padding: "8px 10px", width: 110 }}>
                    <input type="number" value={row.volumeKerja || ""} onChange={(e) => updateRow(i, "volumeKerja", Number(e.target.value))} placeholder="0" style={numStyle}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = "#10b981"}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </td>
                  <td style={{ padding: "8px 10px", width: 130 }}>
                    <input type="number" value={row.normaWaktu || ""} onChange={(e) => updateRow(i, "normaWaktu", Number(e.target.value))} placeholder="0" style={numStyle}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = "#10b981"}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </td>
                  <td style={{ padding: "8px 10px", width: 140, textAlign: "right" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: row.bebanKerja > 0 ? "#10b981" : "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                      {row.bebanKerja.toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: "8px 6px", width: 36, textAlign: "center" }}>
                    <button type="button" onClick={() => removeRow(i)} disabled={rows.length === 1} style={{ background: "none", border: "none", cursor: rows.length === 1 ? "not-allowed" : "pointer", color: "rgba(255,255,255,0.2)", padding: 4, transition: "color 0.15s" }}
                      onMouseEnter={(e) => { if (rows.length > 1) (e.currentTarget.style.color = "#ef4444"); }}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </td>
                </tr>
              ))}

              {/* Total row */}
              <tr style={{ background: "rgba(255,255,255,0.03)", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
                <td colSpan={5} style={{ padding: "10px 10px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                  Total Beban Kerja
                </td>
                <td style={{ padding: "10px 10px", textAlign: "right" }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#10b981", fontFamily: "monospace" }}>
                    {rows.reduce((s, r) => s + r.bebanKerja, 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>mnt</span>
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tambah baris */}
        <button type="button" onClick={addRow} style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(16,185,129,0.1)", border: "1px dashed rgba(16,185,129,0.3)", borderRadius: 7, color: "#10b981", fontSize: 12, cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.18)"}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.1)"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Baris
        </button>
      </div>

      {/* Hasil Kalkulasi */}
      {result && (
        <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Hasil Analisis Beban Kerja
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { label: "Total Beban Kerja",  value: `${result.totalBebanKerja.toLocaleString()} mnt`, sub: `${(result.totalBebanKerja / 60).toFixed(0)} jam` },
              { label: "Kebutuhan Pegawai",  value: result.kebutuhanPegawai.toFixed(2), sub: "orang" },
              { label: "Efektivitas Jabatan (EJ)", value: result.efektivitasNilai.toFixed(2), sub: "nilai desimal" },
              { label: "Penilaian Jabatan (PJ)",   value: result.efektivitasJabatan, sub: EJ_LABEL[result.efektivitasJabatan] },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: result.efektivitasJabatan ? EJ_COLOR[result.efektivitasJabatan] : "#10b981" }}>
                  {value}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Rumus info */}
          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 6, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            Rumus: EJ = Total Beban Kerja ÷ {JAM_EFEKTIF.toLocaleString()} menit (1.250 jam × 60 mnt) &nbsp;|&nbsp;
            PJ: A ≥0.91 | B ≥0.76 | C ≥0.61 | D ≥0.51 | E &lt;0.51
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
        <Button variant="secondary" onClick={() => router.push(`/sekolah/jabatan/${jabatanId}/anjab`)} disabled={saving}>
          ← Halaman ANJAB
        </Button>
        <Button variant="ghost" onClick={() => window.print()} disabled={saving}
          leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>}
        >
          Cetak
        </Button>
        <Button variant="secondary" onClick={() => router.push(`/sekolah/jabatan/${jabatanId}/bezeting`)} disabled={saving}>
          Bezeting
        </Button>
        <Button variant="primary" onClick={() => handleSave(false)} loading={saving}>
          Simpan ABK
        </Button>
        <Button variant="success" onClick={() => handleSave(true)} loading={saving}
          rightIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
        >
          Simpan & Bezeting
        </Button>
      </div>
    </div>
  );
}