"use client";
// src/app/(admin-pusat)/anjab-abk/detail/page.tsx
// Halaman detail ABK — diakses via /anjab-abk/detail?jabatanId=...

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UraianTugas {
  id: string;
  uraian: string;
  satuan: string;
  waktupPenyelesaian: number;
  jumlahBeban: number;
  totalWaktu: number;
}

interface ABKDetail {
  id: string;
  jabatan: {
    id: string;
    kodeJabatan: string;
    namaJabatan: string;
    jenisJabatan: string;
    unitOrganisasi?: { namaUnit: string };
    golonganRuang?: string;
    pendidikan?: string;
  };
  totalBebanKerja: number;
  efektivitasNilai: number;
  efektivitasJabatan: string;
  kebutuhanPegawai: number;
  statusKebutuhan: string;
  pegawaiBezeting?: number;
  selisih?: number;
  uraianTugas?: UraianTugas[];
  waktuKerjaEfektif?: number;
  tahun?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const EJ_COLOR: Record<string, string> = {
  A: "#10b981", B: "#3b82f6", C: "#06b6d4", D: "#f59e0b", E: "#ef4444",
};
const EJ_LABEL: Record<string, string> = {
  A: "Sangat Baik", B: "Baik", C: "Cukup", D: "Kurang", E: "Sangat Kurang",
};
const STATUS_COLOR: Record<string, string> = {
  KURANG: "#ef4444", LEBIH: "#f59e0b", SESUAI: "#10b981",
};
const STATUS_LABEL: Record<string, string> = {
  KURANG: "Kekurangan Pegawai", LEBIH: "Kelebihan Pegawai", SESUAI: "Kebutuhan Sesuai",
};

function useIsMobile(bp = 768) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const fn = () => setVal(window.innerWidth < bp);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return val;
}

function Skeleton({ w = "100%", h = 14 }: { w?: string | number; h?: number }) {
  return <div style={{ width: w, height: h, background: "rgba(255,255,255,0.06)", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />;
}

function EJBadge({ grade, size = 40 }: { grade: string; size?: number }) {
  const color = EJ_COLOR[grade] ?? "#888";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}18`, border: `2.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 900, color, flexShrink: 0 }}>
      {grade}
    </div>
  );
}

function StatCard({ label, value, sub, color = "white", accent = "#3b82f6" }: { label: string; value: React.ReactNode; sub?: string; color?: string; accent?: string }) {
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${accent}`, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 100, transition: "width 0.6s ease" }} />
    </div>
  );
}

function getRekomendasi(data: ABKDetail) {
  const reks = [];
  if (data.statusKebutuhan === "KURANG") {
    reks.push({ icon: "👥", judul: "Penambahan Pegawai", deskripsi: `Jabatan ini membutuhkan penambahan sekitar ${Math.ceil(data.kebutuhanPegawai - (data.pegawaiBezeting ?? 0))} pegawai untuk memenuhi beban kerja yang ada.`, color: "#ef4444" });
  } else if (data.statusKebutuhan === "LEBIH") {
    reks.push({ icon: "🔄", judul: "Redistribusi Pegawai", deskripsi: `Terdapat kelebihan pegawai. Pertimbangkan redistribusi atau mutasi ke unit yang membutuhkan.`, color: "#f59e0b" });
  } else {
    reks.push({ icon: "✅", judul: "Kebutuhan Terpenuhi", deskripsi: `Jumlah pegawai saat ini sesuai dengan kebutuhan berdasarkan analisis beban kerja.`, color: "#10b981" });
  }
  if (data.efektivitasJabatan === "E" || data.efektivitasJabatan === "D") {
    reks.push({ icon: "📋", judul: "Evaluasi Beban Tugas", deskripsi: `Efektivitas jabatan tergolong rendah (Grade ${data.efektivitasJabatan}). Perlu evaluasi ulang uraian tugas atau penambahan beban kerja.`, color: "#f59e0b" });
  }
  if (data.efektivitasJabatan === "A") {
    reks.push({ icon: "⚡", judul: "Beban Kerja Tinggi", deskripsi: `Efektivitas jabatan Grade A (> 100%). Beban kerja melebihi kapasitas. Pertimbangkan penambahan pegawai atau pembagian tugas.`, color: "#10b981" });
  }
  reks.push({ icon: "📊", judul: "Monitoring Berkala", deskripsi: `Lakukan evaluasi beban kerja secara periodik (minimal setahun sekali) untuk memastikan data ABK tetap akurat.`, color: "#3b82f6" });
  return reks;
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function ABKDetailContent() {
  const searchParams = useSearchParams();
  const jabatanId = searchParams.get("jabatanId");
  const isMobile = useIsMobile();

  const [data, setData] = useState<ABKDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ringkasan" | "uraian" | "analisis">("ringkasan");

  useEffect(() => {
    if (!jabatanId) { setLoading(false); return; }
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/abk?jabatanId=${jabatanId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json.data ?? json ?? null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jabatanId]);

  // ── No jabatanId ──
  if (!loading && !jabatanId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center", background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, gap: 12 }}>
        <div style={{ fontSize: 40 }}>🔍</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Pilih Jabatan</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 380 }}>Pilih jabatan dari daftar ABK untuk melihat detail analisis beban kerja.</div>
        <Link href="/anjab-abk/abk" style={btnPrimary}>← Ke Daftar ABK</Link>
      </div>
    );
  }

  if (!loading && error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center", background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, gap: 12 }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Gagal Memuat Data</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{error}</div>
        <Link href="/anjab-abk/abk" style={btnPrimary}>← Kembali ke Daftar ABK</Link>
      </div>
    );
  }

  if (!loading && !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center", background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, gap: 12 }}>
        <div style={{ fontSize: 40 }}>📭</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Data Tidak Ditemukan</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Tidak ada data ABK untuk jabatan ini.</div>
        <Link href="/anjab-abk/abk" style={btnPrimary}>← Kembali ke Daftar ABK</Link>
      </div>
    );
  }

  const ejColor = data ? (EJ_COLOR[data.efektivitasJabatan] ?? "#888") : "#888";
  const stColor = data ? (STATUS_COLOR[data.statusKebutuhan] ?? "#888") : "#888";
  const wke = data?.waktuKerjaEfektif ?? 1250;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>ANJAB & ABK / Detail</div>
          {loading ? (
            <><Skeleton w={260} h={20} /><div style={{ marginTop: 6 }}><Skeleton w={180} h={12} /></div></>
          ) : (
            <>
              <h1 style={{ fontSize: isMobile ? 17 : 21, fontWeight: 800, color: "white", margin: 0 }}>{data!.jabatan.namaJabatan}</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, marginBottom: 0 }}>
                {data!.jabatan.unitOrganisasi?.namaUnit ? `${data!.jabatan.unitOrganisasi.namaUnit} · ` : ""}
                {data!.jabatan.jenisJabatan}
                {data!.tahun ? ` · Tahun ${data!.tahun}` : ""}
              </p>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          {/* ← TOMBOL KEMBALI KE DAFTAR ABK */}
          <Link href="/anjab-abk/abk" style={navLink("rgba(255,255,255,0.06)", "rgba(255,255,255,0.12)", "rgba(255,255,255,0.7)", isMobile)}>← Daftar ABK</Link>
          <Link href="/anjab-abk/anjab" style={navLink("rgba(59,130,246,0.12)", "rgba(59,130,246,0.25)", "#3b82f6", isMobile)}>📋 ANJAB</Link>
          <Link href="/anjab-abk/bezeting" style={navLink("rgba(245,158,11,0.12)", "rgba(245,158,11,0.25)", "#f59e0b", isMobile)}>📁 Bezeting</Link>
        </div>
      </div>

      {/* ── Info Jabatan Card ── */}
      <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {loading ? <Skeleton h={44} /> : (
          <>
            <EJBadge grade={data!.efektivitasJabatan} size={isMobile ? 40 : 48} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#60a5fa", background: "rgba(96,165,250,0.1)", padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(96,165,250,0.2)" }}>{data!.jabatan.kodeJabatan}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>{data!.jabatan.jenisJabatan}</span>
                {data!.jabatan.golonganRuang && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>Gol. {data!.jabatan.golonganRuang}</span>}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{data!.jabatan.unitOrganisasi?.namaUnit || "—"}</div>
            </div>
            <div style={{ padding: "10px 16px", borderRadius: 10, background: `${ejColor}10`, border: `1px solid ${ejColor}30`, textAlign: "center", minWidth: 120 }}>
              <div style={{ fontSize: 10, color: ejColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>Efektivitas Jabatan</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: ejColor, marginTop: 2 }}>{data!.efektivitasNilai.toFixed(3)}</div>
              <div style={{ fontSize: 11, color: ejColor, opacity: 0.8 }}>Grade {data!.efektivitasJabatan} — {EJ_LABEL[data!.efektivitasJabatan] ?? ""}</div>
              <div style={{ marginTop: 6 }}>
                <ProgressBar value={data!.efektivitasNilai} max={1} color={ejColor} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 10 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", height: 80 }}>
              <Skeleton w="60%" h={10} /><div style={{ marginTop: 8 }}><Skeleton w="40%" h={20} /></div>
            </div>
          ))
        ) : (
          <>
            <StatCard label="Total Beban Kerja" value={<span style={{ fontFamily: "monospace" }}>{data!.totalBebanKerja.toLocaleString("id")}</span>} sub="jam/tahun" accent="#3b82f6" color="#3b82f6" />
            <StatCard label="Waktu Kerja Efektif" value={<span style={{ fontFamily: "monospace" }}>{wke.toLocaleString("id")}</span>} sub="jam/tahun" accent="#06b6d4" color="#06b6d4" />
            <StatCard label="Kebutuhan Pegawai" value={data!.kebutuhanPegawai.toFixed(2)} sub="orang" accent="#10b981" color="#10b981" />
            <StatCard
              label="Bezeting / Selisih"
              value={<span>{data!.pegawaiBezeting ?? "—"}{data!.selisih !== undefined && <span style={{ fontSize: 14, marginLeft: 6, color: stColor }}>({data!.selisih > 0 ? "+" : ""}{data!.selisih})</span>}</span>}
              sub={STATUS_LABEL[data!.statusKebutuhan] ?? "—"}
              accent={stColor}
              color={stColor}
            />
          </>
        )}
      </div>

      {/* ── Tabs ── */}
      {!loading && data && (
        <>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 10, width: "fit-content" }}>
            {([{ key: "ringkasan", label: "📊 Ringkasan" }, { key: "uraian", label: "📋 Uraian Tugas" }, { key: "analisis", label: "📈 Analisis" }] as const).map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: activeTab === tab.key ? "rgba(59,130,246,0.2)" : "transparent", color: activeTab === tab.key ? "#3b82f6" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: activeTab === tab.key ? 700 : 500, cursor: "pointer", transition: "all 0.15s", outline: "none" }}
              >{tab.label}</button>
            ))}
          </div>

          {/* Tab: Ringkasan */}
          {activeTab === "ringkasan" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Formula Kalkulasi ABK</div>
                <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, padding: "14px 18px", fontFamily: "monospace", fontSize: isMobile ? 12 : 14, color: "rgba(255,255,255,0.8)", lineHeight: 2, marginBottom: 16 }}>
                  <div><span style={{ color: "#60a5fa" }}>Kebutuhan Pegawai</span> = <span style={{ color: "#34d399" }}>Total Beban Kerja</span> / <span style={{ color: "#f59e0b" }}>Waktu Kerja Efektif</span></div>
                  <div style={{ marginTop: 4, fontSize: isMobile ? 13 : 15 }}>
                    <span style={{ color: "#3b82f6", fontWeight: 700 }}>{data.kebutuhanPegawai.toFixed(4)}</span> = <span style={{ color: "#10b981" }}>{data.totalBebanKerja.toLocaleString("id")}</span> / <span style={{ color: "#f59e0b" }}>{wke.toLocaleString("id")}</span>
                  </div>
                  <div style={{ marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
                    <span style={{ color: "#06b6d4" }}>Efektivitas Jabatan</span> = <span style={{ color: "#34d399" }}>Total Beban Kerja</span> / <span style={{ color: "#f59e0b" }}>Waktu Kerja Efektif</span> × 100%
                  </div>
                  <div style={{ marginTop: 4, fontSize: isMobile ? 13 : 15 }}>
                    <span style={{ color: ejColor, fontWeight: 700 }}>{(data.efektivitasNilai * 100).toFixed(2)}%</span> → Grade <span style={{ color: ejColor, fontWeight: 900 }}>{data.efektivitasJabatan}</span> ({EJ_LABEL[data.efektivitasJabatan]})
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Skala Efektivitas Jabatan</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[{ grade: "A", range: "> 100%", label: "Sangat Baik" }, { grade: "B", range: "90–100%", label: "Baik" }, { grade: "C", range: "70–89%", label: "Cukup" }, { grade: "D", range: "50–69%", label: "Kurang" }, { grade: "E", range: "< 50%", label: "Sangat Kurang" }].map(({ grade, range, label }) => (
                    <div key={grade} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: data.efektivitasJabatan === grade ? `${EJ_COLOR[grade]}18` : "rgba(255,255,255,0.03)", border: `1px solid ${data.efektivitasJabatan === grade ? `${EJ_COLOR[grade]}40` : "rgba(255,255,255,0.06)"}` }}>
                      <EJBadge grade={grade} size={22} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: data.efektivitasJabatan === grade ? EJ_COLOR[grade] : "rgba(255,255,255,0.5)" }}>{range}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#0d1117", border: `1px solid ${stColor}30`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stColor}15`, border: `2px solid ${stColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {data.statusKebutuhan === "KURANG" ? "📉" : data.statusKebutuhan === "LEBIH" ? "📈" : "✅"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: stColor }}>{STATUS_LABEL[data.statusKebutuhan] ?? data.statusKebutuhan}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                    {data.statusKebutuhan === "KURANG" ? `Dibutuhkan penambahan ${Math.abs(data.selisih ?? 0)} pegawai` : data.statusKebutuhan === "LEBIH" ? `Terdapat kelebihan ${Math.abs(data.selisih ?? 0)} pegawai` : "Jumlah pegawai sesuai dengan beban kerja yang ada"}
                  </div>
                </div>
                <span style={{ padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: `${stColor}15`, color: stColor, border: `1px solid ${stColor}30` }}>{data.statusKebutuhan}</span>
              </div>
            </div>
          )}

          {/* Tab: Uraian Tugas */}
          {activeTab === "uraian" && (
            <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
              {!data.uraianTugas || data.uraianTugas.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Belum ada data uraian tugas untuk jabatan ini.</div>
              ) : isMobile ? (
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.uraianTugas.map((ut, i) => (
                    <div key={ut.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#3b82f6", flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{ut.uraian}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Satuan: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{ut.satuan}</strong></div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Beban: <strong style={{ color: "#3b82f6" }}>{ut.jumlahBeban.toLocaleString("id")}</strong></div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Waktu/Sat: <strong style={{ color: "#10b981" }}>{ut.waktupPenyelesaian} jam</strong></div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Total: <strong style={{ color: "#f59e0b" }}>{ut.totalWaktu.toLocaleString("id")} jam</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        {["No", "Uraian Tugas", "Satuan", "Jml Beban", "Waktu/Sat (jam)", "Total Waktu (jam)"].map((h) => (
                          <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.uraianTugas.map((ut, i) => (
                        <tr key={ut.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={td}><span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(59,130,246,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#60a5fa" }}>{i + 1}</span></td>
                          <td style={{ ...td, maxWidth: 340 }}><span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{ut.uraian}</span></td>
                          <td style={{ ...td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{ut.satuan}</td>
                          <td style={td}><span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#3b82f6" }}>{ut.jumlahBeban.toLocaleString("id")}</span></td>
                          <td style={td}><span style={{ fontFamily: "monospace", fontSize: 13, color: "#10b981" }}>{ut.waktupPenyelesaian}</span></td>
                          <td style={td}><span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{ut.totalWaktu.toLocaleString("id")}</span></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "rgba(255,255,255,0.03)", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
                        <td colSpan={5} style={{ ...td, fontWeight: 700, color: "rgba(255,255,255,0.6)", textAlign: "right" }}>Total Beban Kerja</td>
                        <td style={td}><span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 900, color: ejColor }}>{data.totalBebanKerja.toLocaleString("id")}</span><span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>jam</span></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Analisis */}
          {activeTab === "analisis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Perbandingan Beban vs Kapasitas</div>
                {[
                  { label: "Total Beban Kerja", value: data.totalBebanKerja, max: Math.max(data.totalBebanKerja, wke) * 1.1, color: "#3b82f6", suffix: "jam" },
                  { label: "Waktu Kerja Efektif", value: wke, max: Math.max(data.totalBebanKerja, wke) * 1.1, color: "#f59e0b", suffix: "jam" },
                ].map(({ label, value, max, color, suffix }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{value.toLocaleString("id")} {suffix}</span>
                    </div>
                    <ProgressBar value={value} max={max} color={color} />
                  </div>
                ))}
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Meter Efektivitas Jabatan</div>
                  <div style={{ position: "relative", height: 28, borderRadius: 100, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                    {[{ from: 0, to: 50, color: "#ef444420" }, { from: 50, to: 70, color: "#f59e0b15" }, { from: 70, to: 90, color: "#06b6d415" }, { from: 90, to: 100, color: "#3b82f615" }].map(({ from, to, color }) => (
                      <div key={from} style={{ position: "absolute", left: `${from}%`, width: `${to - from}%`, top: 0, bottom: 0, background: color }} />
                    ))}
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(100, (data.efektivitasNilai / 1) * 100)}%`, background: `linear-gradient(90deg, ${ejColor}80, ${ejColor})`, borderRadius: 100, transition: "width 0.8s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{(data.efektivitasNilai * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
                    <span>0%</span><span>50%</span><span>70%</span><span>90%</span><span>100%+</span>
                  </div>
                </div>
              </div>
              <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Rekomendasi</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {getRekomendasi(data).map((rek, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: `${rek.color}08`, border: `1px solid ${rek.color}20`, borderRadius: 10 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{rek.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: rek.color, marginBottom: 2 }}>{rek.judul}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{rek.deskripsi}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

const td: React.CSSProperties = { padding: "12px 14px", color: "rgba(255,255,255,0.7)", fontSize: 13, verticalAlign: "middle" };
const btnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.15)", color: "#3b82f6" };
const navLink = (bg: string, border: string, color: string, isMobile: boolean): React.CSSProperties => ({
  padding: isMobile ? "7px 10px" : "9px 16px", background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: isMobile ? 12 : 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
});

export default function ABKDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Memuat detail ABK...</div>}>
      <ABKDetailContent />
    </Suspense>
  );
}