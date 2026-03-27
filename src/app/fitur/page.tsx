"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Feature Data ─── */
const FEATURES_DETAIL = [
  {
    id: "perhitungan",
    icon: "📊",
    title: "Perhitungan Otomatis",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.35)",
    description:
      "Hitung kebutuhan guru secara otomatis berdasarkan jumlah rombel, jam mengajar, dan standar nasional. Formula sesuai regulasi Kemendikbud.",
    points: [
      "Kalkulasi rasio guru per rombel",
      "Otomatisasi berdasarkan mapel & jenjang",
      "Rekapitulasi kebutuhan vs ketersediaan",
      "Update real-time saat data berubah",
    ],
    visual: "📐",
  },
  {
    id: "jenjang",
    icon: "🏫",
    title: "Multi Jenjang",
    color: "#22c55e",
    glow: "rgba(34,197,94,0.35)",
    description:
      "Mendukung tiga jenjang pendidikan: SMA, SMK, dan SLB. Setiap jenjang memiliki formula dan parameter perhitungan yang berbeda.",
    points: [
      "SMA — jurusan IPA, IPS, Bahasa",
      "SMK — berbagai program keahlian",
      "SLB — kebutuhan khusus & inklusi",
      "Filter & tampilan per jenjang",
    ],
    visual: "🎓",
  },
  {
    id: "anjab",
    icon: "📋",
    title: "ANJAB & ABK",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    description:
      "Modul Analisis Jabatan (ANJAB) dan Analisis Beban Kerja (ABK) terintegrasi penuh. Hasilkan dokumen resmi siap cetak.",
    points: [
      "Form ANJAB standar BKN",
      "Kalkulasi ABK otomatis",
      "Ekspor ke format Word/PDF resmi",
      "Riwayat revisi dokumen",
    ],
    visual: "📝",
  },
  {
    id: "manajemen",
    icon: "📁",
    title: "Manajemen Data",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.35)",
    description:
      "Kelola data sekolah, guru, dan rombongan belajar secara terpusat. Import massal via Excel, validasi otomatis, pencarian cepat.",
    points: [
      "Import data via Excel / CSV",
      "Validasi & deduplikasi otomatis",
      "Manajemen data 22 Kab/Kota",
      "Pencarian & filter lanjutan",
    ],
    visual: "🗂️",
  },
  {
    id: "laporan",
    icon: "📈",
    title: "Laporan & Ekspor",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.35)",
    description:
      "Hasilkan laporan eksekutif, rekap per wilayah, dan grafik interaktif. Ekspor ke PDF, Excel, atau cetak langsung.",
    points: [
      "Dashboard ringkasan eksekutif",
      "Grafik tren kebutuhan guru",
      "Ekspor PDF & Excel satu klik",
      "Laporan per Kab/Kota & jenjang",
    ],
    visual: "📉",
  },
  {
    id: "akses",
    icon: "🔐",
    title: "Akses Berbasis Peran",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.35)",
    description:
      "Sistem hak akses berlapis: Admin Pusat, Admin Kabupaten, Operator Sekolah. Setiap peran punya tampilan dan izin berbeda.",
    points: [
      "3 level peran pengguna",
      "Audit log aktivitas sistem",
      "Reset password & manajemen akun",
      "Keamanan session & enkripsi data",
    ],
    visual: "🛡️",
  },
];

const STATS = [
  { icon: "🏫", val: "3",    label: "Jenjang",  color: "#3b82f6" },
  { icon: "🗺️", val: "22",   label: "Kab/Kota", color: "#22c55e" },
  { icon: "👩‍🏫", val: "8.420", label: "Data Guru", color: "#f59e0b" },
  { icon: "📋", val: "100%", label: "Digital",   color: "#8b5cf6" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Input Data Sekolah", desc: "Masukkan data sekolah, jumlah rombel, dan jam mengajar dari panel manajemen data." },
  { step: "02", title: "Proses Kalkulasi", desc: "Sistem menghitung kebutuhan guru secara otomatis berdasarkan formula standar nasional." },
  { step: "03", title: "Review & Validasi", desc: "Petugas memverifikasi hasil perhitungan dan melakukan koreksi jika diperlukan." },
  { step: "04", title: "Ekspor Laporan", desc: "Unduh laporan resmi dalam format PDF atau Excel untuk diserahkan ke Kemendikbud." },
];

export default function FiturPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const featRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = FEATURES_DETAIL[activeFeature];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #03070f; color: white; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #03070f; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.0); }
          50%      { box-shadow: 0 0 32px 6px rgba(59,130,246,0.25); }
        }
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .blink-anim { animation: blink 1.5s infinite; }

        /* Grid lines background */
        .grid-bg {
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* Feature pill */
        .feat-pill {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 18px; border-radius: 10px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.65);
          text-align: left; width: 100%;
        }
        .feat-pill:hover { background: rgba(255,255,255,0.07); color: white; border-color: rgba(255,255,255,0.18); }
        .feat-pill.active { background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.45); color: white; }

        /* Card hover */
        .step-card:hover { transform: translateY(-4px); transition: transform 0.25s ease; }
        .stat-chip:hover { transform: scale(1.05); transition: transform 0.2s ease; }

        /* Neon line */
        .neon-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 64,
        background: scrolled ? "rgba(3,7,15,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(59,130,246,0.15)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Mini logo mark */}
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, fontFamily: "'Syne', sans-serif",
          }}>E</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>
            E-SIPKG
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/" style={{
            color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none",
            padding: "7px 18px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.12)",
            fontWeight: 500, transition: "all 0.2s",
          }}>← Beranda</Link>
          <Link href="/login" style={{
            color: "white", fontSize: 13, textDecoration: "none",
            padding: "7px 18px", borderRadius: 7,
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            border: "1px solid #3b82f6", fontWeight: 600,
          }}>Masuk</Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="grid-bg" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "120px 40px 80px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient blobs */}
        <div style={{ position: "absolute", top: "15%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Badge */}
        <div className="fade-up" style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
          padding: "6px 16px", borderRadius: 20,
          background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.35)",
          fontSize: 11, letterSpacing: "1.6px", textTransform: "uppercase",
          color: "#93c5fd", fontWeight: 600,
        }}>
          <span className="blink-anim" style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} />
          Fitur Lengkap Platform
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 6vw, 76px)",
          fontWeight: 800, lineHeight: 1.05, marginBottom: 24,
          background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: -1,
        }}>
          Semua yang Anda<br />
          <span style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Butuhkan
          </span>{" "}
          ada di sini
        </h1>

        <p style={{
          fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 540, lineHeight: 1.75, marginBottom: 48,
        }}>
          E-SIPKG dirancang untuk menyederhanakan seluruh proses perencanaan kebutuhan guru
          di Provinsi NTT — dari input data hingga laporan resmi.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 56 }}>
          {STATS.map((s) => (
            <div key={s.label} className="stat-chip" style={{
              padding: "14px 28px", borderRadius: 12, textAlign: "center",
              background: "rgba(255,255,255,0.04)", border: `1px solid ${s.color}33`,
              backdropFilter: "blur(8px)", cursor: "default",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="neon-line" style={{ width: "80%", maxWidth: 600, margin: "0 auto" }} />
      </section>

      {/* ── FEATURE EXPLORER ── */}
      <section id="fitur" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 56, textAlign: "center" }}>
          <p style={{ fontSize: 11, letterSpacing: "2px", color: "#60a5fa", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Eksplorasi Fitur</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: -0.5 }}>
            6 Modul Utama
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32, alignItems: "start" }}>
          {/* Left: pill list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "sticky", top: 88 }}>
            {FEATURES_DETAIL.map((f, i) => (
              <button
                key={f.id}
                className={`feat-pill${activeFeature === i ? " active" : ""}`}
                onClick={() => setActiveFeature(i)}
                style={{ borderLeftColor: activeFeature === i ? f.color : undefined, borderLeftWidth: activeFeature === i ? 3 : 1 }}
              >
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span>{f.title}</span>
                {activeFeature === i && (
                  <span style={{ marginLeft: "auto", color: f.color, fontSize: 16 }}>→</span>
                )}
              </button>
            ))}
          </div>

          {/* Right: feature detail panel */}
          <div
            ref={featRef}
            key={active.id}
            style={{
              borderRadius: 20, overflow: "hidden",
              border: `1px solid ${active.color}33`,
              background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
              animation: "fadeUp 0.35s ease",
            }}
          >
            {/* Panel top accent bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${active.color}, transparent)` }} />

            <div style={{ padding: "40px 44px" }}>
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18, flexShrink: 0,
                  background: `radial-gradient(circle at 30% 30%, ${active.color}50, ${active.color}18)`,
                  border: `1px solid ${active.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32,
                }} className="float-anim">
                  {active.icon}
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800,
                    marginBottom: 8, color: "white",
                  }}>{active.title}</h3>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 520 }}>
                    {active.description}
                  </p>
                </div>
              </div>

              {/* Points */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 36 }}>
                {active.points.map((pt, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 18px", borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: active.color,
                      boxShadow: `0 0 8px ${active.color}`,
                    }} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{pt}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Link href="/login" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 24px", borderRadius: 10,
                  background: active.color, color: "white",
                  fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700,
                  letterSpacing: 0.5, textDecoration: "none",
                  boxShadow: `0 4px 20px ${active.glow}`,
                }}>
                  Mulai Gunakan →
                </Link>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  Login diperlukan untuk akses penuh
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 40px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, letterSpacing: "2px", color: "#60a5fa", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Alur Kerja</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, letterSpacing: -0.5 }}>
              Cara Kerja Sistem
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {HOW_IT_WORKS.map((hw, i) => (
              <div key={i} className="step-card" style={{
                padding: "28px 24px", borderRadius: 16,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                position: "relative", overflow: "hidden", cursor: "default",
              }}>
                {/* Big step number background */}
                <div style={{
                  position: "absolute", top: -8, right: 12,
                  fontFamily: "'Syne', sans-serif", fontSize: 80, fontWeight: 800,
                  color: "rgba(255,255,255,0.035)", lineHeight: 1, userSelect: "none",
                }}>{hw.step}</div>

                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 38, height: 38, borderRadius: 10, marginBottom: 16,
                  background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)",
                  fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: "#60a5fa",
                }}>{hw.step}</div>

                <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{hw.title}</h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{hw.desc}</p>

                {/* Connector line (not on last) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{
                    position: "absolute", top: "50%", right: -13, zIndex: 2,
                    width: 26, display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.2)", fontSize: 18,
                  }}>›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL FEATURES GRID ── */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontSize: 11, letterSpacing: "2px", color: "#60a5fa", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Ringkasan</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, letterSpacing: -0.5 }}>
            Seluruh Kemampuan Platform
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {FEATURES_DETAIL.map((f, i) => (
            <div
              key={f.id}
              style={{
                padding: "28px", borderRadius: 16, cursor: "pointer",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${f.color}22`,
                transition: "all 0.25s ease",
                animationDelay: `${i * 0.08}s`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = `rgba(${f.color.slice(1).match(/.{2}/g)!.map(x=>parseInt(x,16)).join(",")},0.08)`;
                (e.currentTarget as HTMLDivElement).style.borderColor = f.color + "55";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLDivElement).style.borderColor = f.color + "22";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
              onClick={() => {
                setActiveFeature(i);
                document.getElementById("fitur")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 10, color: "white" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 16 }}>{f.description}</p>
              <span style={{ fontSize: 12, color: f.color, fontWeight: 600 }}>Pelajari lebih lanjut →</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        margin: "0 40px 80px", borderRadius: 24, overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #0f1f4a 0%, #1e3a8a 50%, #1e1b4b 100%)",
        border: "1px solid rgba(59,130,246,0.3)",
      }}>
        {/* Decorative orb */}
        <div style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: -40, bottom: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ padding: "60px 56px", position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 28 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "2px", color: "#93c5fd", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Siap Memulai?</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 14 }}>
              Digitalisasi Perencanaan<br />Guru NTT Dimulai Hari Ini
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 480, lineHeight: 1.7 }}>
              Bergabunglah bersama operator dari 22 Kabupaten/Kota di seluruh NTT
              yang telah menggunakan E-SIPKG untuk perencanaan guru yang lebih akurat.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 12,
              background: "#2563eb", color: "white",
              fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700,
              letterSpacing: 0.5, textDecoration: "none",
              boxShadow: "0 6px 30px rgba(37,99,235,0.5)",
              whiteSpace: "nowrap",
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Masuk ke Sistem
            </Link>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 12,
              background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)",
              fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600,
              letterSpacing: 0.5, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.15)",
              whiteSpace: "nowrap",
            }}>
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "20px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
        background: "rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          📍 Jl. El Tari No. 52, Kota Kupang &nbsp;|&nbsp; ✉ dikbud@nttprov.go.id
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 1 }}>E-SIPKG</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>© 2025 Dinas Pendidikan & Kebudayaan Provinsi NTT</div>
        </div>
      </footer>
    </>
  );
}