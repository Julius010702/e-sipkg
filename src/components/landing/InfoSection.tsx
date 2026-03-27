"use client";
// src/components/landing/InfoSection.tsx

import { useEffect, useState, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────
export interface FiturItem {
  icon: React.ReactNode;
  judul: string;
  deskripsi: string;
  warna: string;
}

export interface StatItem {
  angka: string;
  satuan: string;
  desc: string;
}

// ── Default data ──────────────────────────────────────────────
const DEFAULT_FITUR: FiturItem[] = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    judul: "Analisis Jabatan (ANJAB)",
    deskripsi: "Form ANJAB digital lengkap 16 komponen mencakup uraian tugas, bahan kerja, perangkat kerja, dan syarat jabatan.",
    warna: "#3b82f6",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    judul: "Analisis Beban Kerja (ABK)",
    deskripsi: "Hitung beban kerja jabatan, efektivitas jabatan (EJ), dan kebutuhan pegawai otomatis dengan rumus standar BKN.",
    warna: "#10b981",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    judul: "Perhitungan Kebutuhan Guru",
    deskripsi: "Hitung kebutuhan guru berdasarkan rombel dan jam pelajaran, lengkap dengan prediksi kebutuhan 5 tahun ke depan.",
    warna: "#f59e0b",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    judul: "Manajemen Data Guru",
    deskripsi: "Kelola data guru PNS dan PPPK secara lengkap: data personal, kepangkatan, sertifikasi, dan mata pelajaran.",
    warna: "#8b5cf6",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    judul: "Rekap & Pemerataan",
    deskripsi: "Admin Pusat melihat rekap seluruh sekolah dan membuat rekomendasi distribusi guru merata se-Provinsi NTT.",
    warna: "#ef4444",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    judul: "Cetak Word & PDF",
    deskripsi: "Export laporan ANJAB, ABK, Bezeting, dan rekap kebutuhan guru dalam format Word (.docx) dan PDF.",
    warna: "#06b6d4",
  },
];

const DEFAULT_STATS: StatItem[] = [
  { angka: "22", satuan: "Kab/Kota", desc: "se-Provinsi NTT" },
  { angka: "3",  satuan: "Jenis Sekolah", desc: "SMA · SMK · SLB" },
  { angka: "2",  satuan: "Role Akses", desc: "Pusat & Sekolah" },
  { angka: "100%", satuan: "Digital", desc: "Web & Mobile" },
];

// ── Hook intersection observer ────────────────────────────────
function useVisible(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return visible;
}

// ── Stat Section ──────────────────────────────────────────────
function StatSection({ stats }: { stats: StatItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useVisible(ref);

  return (
    <section id="statistik" style={{ padding: "72px 28px", background: "rgba(255,255,255,0.018)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div
        ref={ref}
        style={{
          maxWidth: 960, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 20,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {stats.map((stat, i) => (
          <div key={i} style={{
            textAlign: "center",
            padding: "28px 16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            transition: "transform 0.2s, border-color 0.2s",
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 38, fontWeight: 700,
              color: "white", lineHeight: 1,
            }}>
              {stat.angka}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.15em", textTransform: "uppercase", margin: "7px 0 4px" }}>
              {stat.satuan}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>
              {stat.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Fitur Section ─────────────────────────────────────────────
function FiturSection({ fitur }: { fitur: FiturItem[] }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerVisible = useVisible(headerRef);
  const gridVisible = useVisible(gridRef);

  return (
    <section id="fitur" style={{ padding: "96px 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div
          ref={headerRef}
          style={{
            textAlign: "center", marginBottom: 60,
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#3b82f6", marginBottom: 12 }}>
            Fitur Unggulan
          </div>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700, color: "white", marginBottom: 14,
          }}>
            Semua yang Kamu Butuhkan
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", fontWeight: 300, maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
            Platform lengkap untuk mengelola analisis jabatan, beban kerja, dan kebutuhan guru secara terintegrasi.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 18,
            opacity: gridVisible ? 1 : 0,
            transform: gridVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s 0.1s ease, transform 0.7s 0.1s ease",
          }}
        >
          {fitur.map((item, i) => (
            <div key={i} style={{
              padding: "26px 22px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              transition: "all 0.25s ease",
              cursor: "default",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 13,
                background: `${item.warna}18`,
                border: `1px solid ${item.warna}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: item.warna, marginBottom: 16,
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 8 }}>
                {item.judul}
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.75, fontWeight: 300 }}>
                {item.deskripsi}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────
function CTABanner() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useVisible(ref);

  return (
    <section style={{ padding: "0 28px 96px" }}>
      <div
        ref={ref}
        style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "52px 48px",
          background: "linear-gradient(135deg, rgba(13,110,253,0.14), rgba(10,88,202,0.07))",
          border: "1px solid rgba(13,110,253,0.18)",
          borderRadius: 20,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: 28,
          position: "relative", overflow: "hidden",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Glow */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,110,253,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#60a5fa", marginBottom: 10 }}>
            Siap Memulai?
          </div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 700, color: "white", marginBottom: 8 }}>
            Masuk ke Portal E-SIPKG
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 300, maxWidth: 400, lineHeight: 1.75 }}>
            Gunakan akun yang diberikan oleh Admin Pusat Dinas Pendidikan Provinsi NTT untuk mengakses sistem.
          </p>
        </div>

        <a href="/login" style={{
          position: "relative", zIndex: 1,
          padding: "13px 28px",
          background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
          color: "white", borderRadius: 10,
          textDecoration: "none", fontSize: 13, fontWeight: 700,
          boxShadow: "0 6px 24px rgba(13,110,253,0.4)",
          display: "flex", alignItems: "center", gap: 8,
          letterSpacing: "0.03em",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(13,110,253,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(13,110,253,0.4)";
          }}
        >
          Masuk Sekarang
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    </section>
  );
}

// ── Main InfoSection Export ───────────────────────────────────
interface InfoSectionProps {
  fitur?: FiturItem[];
  stats?: StatItem[];
  showCTA?: boolean;
}

export function InfoSection({
  fitur = DEFAULT_FITUR,
  stats = DEFAULT_STATS,
  showCTA = true,
}: InfoSectionProps) {
  return (
    <>
      <StatSection stats={stats} />
      <FiturSection fitur={fitur} />
      {showCTA && <CTABanner />}
    </>
  );
}