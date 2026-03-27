"use client";
// src/app/(sekolah)/sekolah/dashboard/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Sekolah {
  nama: string; npsn: string | null; jenisSekolah: string;
  kabupatenKota: string | null; kecamatan: string | null;
  kepalaSekolah: string | null; aktif: boolean;
}
interface Statistik {
  totalGuru: number; guruPNS: number; guruPPPK: number;
  guruBersertifikat: number; guruBelumSertifikat: number;
}
interface PerhitunganTerbaru {
  tahunAjaran: string; jumlahRombel: number | null;
  jumlahJamPelajaran: number | null; bebanMengajar: number | null;
  jumlahGuruTersedia: number | null; jumlahGuruPNS: number | null;
  jumlahGuruPPPK: number | null; kebutuhanGuru: number | null;
  kekuranganGuru: number | null; kelebihanGuru: number | null;
  statusKebutuhan: "KURANG" | "LEBIH" | "SESUAI" | null;
  catatan: string | null; updatedAt: string;
}
interface DashboardData {
  sekolah: Sekolah | null; statistik: Statistik;
  perhitunganTerbaru: PerhitunganTerbaru | null;
  jabatanCount: number; pemangkuCount: number;
  guruPerMapel: { mataPelajaran: string; jumlah: number }[];
}

const MENU = [
  { label: "Jabatan",          href: "/jabatan",          icon: "📋", color: "#3b82f6" },
  { label: "Pemangku Jabatan", href: "/pemangku",         icon: "👤", color: "#8b5cf6" },
  { label: "Perhitungan Guru", href: "/perhitungan-guru", icon: "📊", color: "#f59e0b" },
  { label: "Data Guru",        href: "/data-guru",        icon: "👨‍🏫", color: "#06b6d4" },
  { label: "Profil Sekolah",   href: "/sekolah/profil",   icon: "🏫", color: "#ef4444" },
];
const STATUS_MAP = {
  KURANG: { label: "Kekurangan Guru",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)"  },
  LEBIH:  { label: "Kelebihan Guru",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  SESUAI: { label: "Sesuai Kebutuhan", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
};
const PIE_COLORS_STATUS = ["#3b82f6", "#8b5cf6", "#6b7280"];
const PIE_COLORS_SERTIF = ["#f59e0b", "#374151"];

// ── Sub-components ────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 20, radius = 6 }: { w?: string | number; h?: number; radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: "rgba(255,255,255,0.07)", animation: "skPulse 1.4s ease-in-out infinite" }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ width: 16, height: 2, borderRadius: 999, background: "#10b981" }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{children}</span>
    </div>
  );
}

function StatCard({ label, value, sub, color, loading }: { label: string; value: number; sub?: string; color: string; loading: boolean }) {
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${color}`, borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
      {loading ? <Skeleton h={32} /> : <div style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{value.toLocaleString("id-ID")}</div>}
      {sub && !loading && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 999, transition: "width 0.7s ease" }} />
    </div>
  );
}

function DarkCard({ title, children, headerRight }: { title: string; children: React.ReactNode; headerRight?: React.ReactNode }) {
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>{title}</span>
        {headerRight}
      </div>
      <div style={{ padding: "18px 18px" }}>{children}</div>
    </div>
  );
}

const renderPieLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  if (percent < 0.05) return null;
  const R = Math.PI / 180, r = outerRadius + 26;
  const x = cx + r * Math.cos(-midAngle * R), y = cy + r * Math.sin(-midAngle * R);
  return <text x={x} y={y} fill="rgba(255,255,255,0.4)" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={10}>{`${name} ${(percent * 100).toFixed(0)}%`}</text>;
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SekolahDashboard() {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true); setError(null);
    fetch("/api/sekolah/dashboard/stats")
      .then(r => { if (!r.ok) return r.json().then(j => { throw new Error(j.error ?? `HTTP ${r.status}`); }); return r.json(); })
      .then(json => setData(json))
      .catch(err => setError(err.message ?? "Gagal memuat data"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const s   = data?.statistik;
  const pk  = data?.perhitunganTerbaru;
  const sk  = pk?.statusKebutuhan ? STATUS_MAP[pk.statusKebutuhan] : null;

  const pctPNS    = s && s.totalGuru > 0 ? Math.round((s.guruPNS           / s.totalGuru) * 100) : 0;
  const pctPPPK   = s && s.totalGuru > 0 ? Math.round((s.guruPPPK          / s.totalGuru) * 100) : 0;
  const pctSertif = s && s.totalGuru > 0 ? Math.round((s.guruBersertifikat / s.totalGuru) * 100) : 0;
  const maxMapel  = data?.guruPerMapel[0]?.jumlah ?? 1;
  const updatedAt = pk?.updatedAt ? new Date(pk.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : null;

  const guruStatusData = s ? [
    { name: "PNS",     value: s.guruPNS  },
    { name: "PPPK",    value: s.guruPPPK },
    { name: "Lainnya", value: Math.max(0, s.totalGuru - s.guruPNS - s.guruPPPK) },
  ].filter(d => d.value > 0) : [];

  const sertifData = s ? [
    { name: "Sertifikasi",  value: s.guruBersertifikat    },
    { name: "Belum",        value: s.guruBelumSertifikat  },
  ].filter(d => d.value > 0) : [];

  return (
    <>
      <style>{`
        @keyframes skPulse{0%,100%{opacity:.35}50%{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .sec{animation:fadeUp 0.4s ease both}
        .menu-card{display:flex;flex-direction:column;gap:10px;padding:20px 18px;background:#0d1117;text-decoration:none;transition:background 0.15s}
        .menu-card:hover{background:rgba(255,255,255,0.03)}
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
            <span>⚠</span><span style={{ flex: 1 }}>{error}</span>
            <button onClick={fetchData} style={{ fontSize: 11, color: "#f87171", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>Coba lagi</button>
          </div>
        )}

        {/* Header */}
        <div className="sec" style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14, padding: "24px 28px" }}>
          <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Dashboard Admin Sekolah</div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><Skeleton h={26} w="55%" /><Skeleton h={14} w="35%" /></div>
          ) : (
            <>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 8 }}>{data?.sekolah?.nama ?? "Selamat datang!"} 👋</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data?.sekolah?.jenisSekolah && <span style={{ fontSize: 11, color: "#34d399", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 999, padding: "2px 10px", fontWeight: 600 }}>{data.sekolah.jenisSekolah}</span>}
                {data?.sekolah?.npsn && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "2px 10px" }}>NPSN {data.sekolah.npsn}</span>}
                {data?.sekolah?.kabupatenKota && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>📍 {data.sekolah.kabupatenKota}</span>}
                {data?.sekolah?.kepalaSekolah && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>👤 Kepsek: {data.sekolah.kepalaSekolah}</span>}
              </div>
            </>
          )}
        </div>

        {/* Stat Guru */}
        <div className="sec" style={{ animationDelay: "0.05s" }}>
          <SectionLabel>Data Guru</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
            <StatCard label="Total Guru"     value={s?.totalGuru         ?? 0} color="#10b981" loading={loading} />
            <StatCard label="Guru PNS"       value={s?.guruPNS           ?? 0} color="#3b82f6" loading={loading} sub={loading ? undefined : `${pctPNS}% dari total`} />
            <StatCard label="Guru PPPK"      value={s?.guruPPPK          ?? 0} color="#8b5cf6" loading={loading} sub={loading ? undefined : `${pctPPPK}% dari total`} />
            <StatCard label="Bersertifikasi" value={s?.guruBersertifikat ?? 0} color="#f59e0b" loading={loading} sub={loading ? undefined : `${pctSertif}% dari total`} />
          </div>
        </div>

        {/* Stat Jabatan */}
        <div className="sec" style={{ animationDelay: "0.09s" }}>
          <SectionLabel>Data Jabatan</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
            <StatCard label="Total Jabatan"  value={data?.jabatanCount  ?? 0} color="#06b6d4" loading={loading} />
            <StatCard label="Total Pemangku" value={data?.pemangkuCount ?? 0} color="#ec4899" loading={loading} />
          </div>
        </div>

        {/* Pie Charts */}
        <div className="sec" style={{ animationDelay: "0.11s" }}>
          <SectionLabel>Visualisasi Distribusi Guru</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>

            <DarkCard title="📊 Status Kepegawaian">
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}><Skeleton h={160} w={160} radius={80} /></div>
              ) : s && s.totalGuru > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={guruStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        outerRadius={80} paddingAngle={3} label={renderPieLabel} labelLine={false}>
                        {guruStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS_STATUS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1c2330", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "white" }}
                        formatter={(v: number) => [`${v} guru (${s.totalGuru > 0 ? ((v / s.totalGuru) * 100).toFixed(1) : 0}%)`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 14px", marginTop: 4 }}>
                    {guruStatusData.map((d, i) => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                        <span style={{ width: 9, height: 9, borderRadius: 2, background: PIE_COLORS_STATUS[i], flexShrink: 0 }} />
                        {d.name}: {d.value}
                      </div>
                    ))}
                  </div>
                </>
              ) : <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Belum ada data guru</div>}
            </DarkCard>

            <DarkCard title="🎓 Status Sertifikasi">
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}><Skeleton h={160} w={160} radius={80} /></div>
              ) : s && s.totalGuru > 0 ? (
                <>
                  <div style={{ position: "relative" }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={sertifData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                          innerRadius={48} outerRadius={80} paddingAngle={3} label={renderPieLabel} labelLine={false}>
                          {sertifData.map((_, i) => <Cell key={i} fill={PIE_COLORS_SERTIF[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#1c2330", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "white" }}
                          formatter={(v: number) => [`${v} guru (${s.totalGuru > 0 ? ((v / s.totalGuru) * 100).toFixed(1) : 0}%)`]} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center donut label */}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>TOTAL</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "white", lineHeight: 1.1 }}>{s.totalGuru}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 14px", marginTop: 4 }}>
                    {sertifData.map((d, i) => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                        <span style={{ width: 9, height: 9, borderRadius: 2, background: PIE_COLORS_SERTIF[i], flexShrink: 0 }} />
                        {d.name}: {d.value}
                      </div>
                    ))}
                  </div>
                </>
              ) : <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Belum ada data guru</div>}
            </DarkCard>

          </div>
        </div>

        {/* Perhitungan + Distribusi */}
        <div className="sec" style={{ animationDelay: "0.13s", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>

          <DarkCard title="Perhitungan Guru" headerRight={pk && !loading ? (
            <span style={{ fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 999, padding: "2px 8px", fontWeight: 600 }}>TA {pk.tahunAjaran}</span>
          ) : undefined}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={18} />)}</div>
            ) : !pk ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>Belum ada data perhitungan</div>
                <Link href="/perhitungan-guru" style={{ fontSize: 11, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "5px 14px", textDecoration: "none" }}>Buat Perhitungan →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sk && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: sk.bg, border: `1px solid ${sk.border}`, borderRadius: 8, padding: "6px 12px", marginBottom: 4, alignSelf: "flex-start" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: sk.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: sk.color, fontWeight: 700 }}>{sk.label}</span>
                  </div>
                )}
                {[
                  { label: "Jumlah Rombel",   value: pk.jumlahRombel       != null ? `${pk.jumlahRombel} rombel`             : "—" },
                  { label: "Guru Tersedia",    value: pk.jumlahGuruTersedia != null ? `${pk.jumlahGuruTersedia} orang`        : "—" },
                  { label: "Kebutuhan Guru",   value: pk.kebutuhanGuru      != null ? `${Math.round(pk.kebutuhanGuru)} orang` : "—" },
                  { label: "Kekurangan/Lebih", value: (pk.kekuranganGuru ?? 0) > 0 ? `Kurang ${pk.kekuranganGuru} orang` : (pk.kelebihanGuru ?? 0) > 0 ? `Lebih ${pk.kelebihanGuru} orang` : "Sesuai" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{row.label}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
                {updatedAt && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>Diperbarui: {updatedAt}</div>}
              </div>
            )}
          </DarkCard>

          <DarkCard title="Distribusi Guru">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Array.from({ length: 3 }).map((_, i) => (<div key={i}><Skeleton h={13} w="55%" /><div style={{ marginTop: 6 }}><Skeleton h={4} /></div></div>))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "PNS",           value: s?.guruPNS           ?? 0, pct: pctPNS,    color: "#3b82f6" },
                  { label: "PPPK",          value: s?.guruPPPK          ?? 0, pct: pctPPPK,   color: "#8b5cf6" },
                  { label: "Bersertifikasi",value: s?.guruBersertifikat ?? 0, pct: pctSertif, color: "#f59e0b" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: 12, color: item.color, fontWeight: 700 }}>
                        {item.value.toLocaleString("id-ID")}
                        <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}> ({item.pct}%)</span>
                      </span>
                    </div>
                    <ProgressBar pct={item.pct} color={item.color} />
                  </div>
                ))}
              </div>
            )}
          </DarkCard>
        </div>

        {/* Top Mata Pelajaran */}
        {(loading || (data?.guruPerMapel?.length ?? 0) > 0) && (
          <div className="sec" style={{ animationDelay: "0.17s" }}>
            <DarkCard title="Top Mata Pelajaran">
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Array.from({ length: 4 }).map((_, i) => (<div key={i}><Skeleton h={13} w="45%" /><div style={{ marginTop: 5 }}><Skeleton h={4} /></div></div>))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data!.guruPerMapel.map(item => (
                    <div key={item.mataPelajaran}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{item.mataPelajaran}</span>
                        <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>{item.jumlah} guru</span>
                      </div>
                      <ProgressBar pct={Math.round((item.jumlah / maxMapel) * 100)} color="#10b981" />
                    </div>
                  ))}
                </div>
              )}
            </DarkCard>
          </div>
        )}

        {/* Menu Cepat */}
        <div className="sec" style={{ animationDelay: "0.21s", background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <SectionLabel>Menu Cepat</SectionLabel>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 1, background: "rgba(255,255,255,0.04)" }}>
            {MENU.map(item => (
              <Link key={item.href} href={item.href} className="menu-card">
                <div style={{ fontSize: 26 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{item.label}</div>
                <div style={{ fontSize: 11, color: item.color }}>Buka →</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}