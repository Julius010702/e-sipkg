"use client";

// src/app/(landing)/page.tsx

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Data slides ──────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    judul: "Selamat Datang di E-SIPKG",
    deskripsi:
      "Sistem Informasi Perhitungan Kebutuhan Guru SMA, SMK, dan SLB Provinsi Nusa Tenggara Timur secara digital, transparan, dan akuntabel.",
    bg: "from-[#0a0f1e] via-[#0d1f3c] to-[#0a1628]",
    accent: "#3b82f6",
  },
  {
    id: 2,
    judul: "Analisis Jabatan Digital",
    deskripsi:
      "Kelola ANJAB dan ABK dengan mudah. Hitung beban kerja, efektivitas jabatan, dan kebutuhan pegawai secara otomatis dan akurat.",
    bg: "from-[#0a1628] via-[#0f2a1e] to-[#0a1e14]",
    accent: "#10b981",
  },
  {
    id: 3,
    judul: "Pemerataan Guru NTT",
    deskripsi:
      "Mendukung distribusi dan pemerataan guru yang adil di seluruh 22 Kabupaten/Kota se-Provinsi Nusa Tenggara Timur.",
    bg: "from-[#1a0a28] via-[#1e0f3c] to-[#0f0a28]",
    accent: "#8b5cf6",
  },
];

const FITUR = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    judul: "Analisis Jabatan (ANJAB)",
    deskripsi:
      "Form ANJAB digital lengkap 16 komponen: uraian tugas, bahan kerja, perangkat kerja, syarat jabatan, dan lainnya.",
    warna: "#3b82f6",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    judul: "Analisis Beban Kerja (ABK)",
    deskripsi:
      "Hitung beban kerja jabatan, efektivitas jabatan (EJ), dan kebutuhan pegawai secara otomatis dengan rumus standar BKN.",
    warna: "#10b981",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    judul: "Perhitungan Kebutuhan Guru",
    deskripsi:
      "Hitung kebutuhan guru per sekolah berdasarkan jumlah rombel, jam pelajaran, dan beban mengajar dengan prediksi 5 tahun.",
    warna: "#f59e0b",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    judul: "Manajemen Data Guru",
    deskripsi:
      "Kelola data guru PNS dan PPPK secara lengkap: data personal, kepangkatan, sertifikasi, hingga mata pelajaran yang diajarkan.",
    warna: "#8b5cf6",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    judul: "Rekap & Pemerataan",
    deskripsi:
      "Admin Pusat dapat melihat rekap seluruh sekolah dan membuat rekomendasi distribusi guru yang merata se-Provinsi NTT.",
    warna: "#ef4444",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    judul: "Cetak Laporan",
    deskripsi:
      "Export laporan ANJAB, ABK, Bezeting, dan rekap kebutuhan guru dalam format Word (.docx) dan PDF langsung dari sistem.",
    warna: "#06b6d4",
  },
];

const STATS = [
  { angka: "22", satuan: "Kab/Kota", desc: "Kabupaten & Kota se-NTT" },
  { angka: "3", satuan: "Jenis", desc: "SMA · SMK · SLB" },
  { angka: "2", satuan: "Role", desc: "Admin Pusat & Sekolah" },
  { angka: "100%", satuan: "Digital", desc: "Berbasis Web & Mobile" },
];

// ── Komponen Navbar ──────────────────────────────────────────
function Navbar({ scrolled }: { scrolled: boolean }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        background: scrolled
          ? "rgba(10,15,30,0.95)"
          : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36,
          background: "linear-gradient(135deg, #1a4fa0, #0d6efd)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(13,110,253,0.4)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white", fontFamily: "'Cinzel', serif", letterSpacing: "0.05em" }}>E-SIPKG</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: -2 }}>Prov. NTT</div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {["Beranda", "Fitur", "Statistik", "Kontak"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            style={{
              fontSize: 13, color: "rgba(255,255,255,0.6)",
              textDecoration: "none", fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            {item}
          </a>
        ))}
        <Link
          href="/login"
          style={{
            padding: "8px 20px",
            background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
            color: "white", borderRadius: 8,
            textDecoration: "none", fontSize: 13, fontWeight: 700,
            boxShadow: "0 4px 14px rgba(13,110,253,0.4)",
            transition: "all 0.2s",
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(13,110,253,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(13,110,253,0.4)";
          }}
        >
          Masuk
        </Link>
      </div>
    </nav>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto slide setiap 5 detik
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Scroll navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection observer untuk animasi section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Lato:wght@300;400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Lato', sans-serif; background: #0a0f1e; color: white; overflow-x: hidden; }
        .section-fade { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .section-fade.visible { opacity: 1; transform: translateY(0); }
        .fitur-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.12) !important; }
        .fitur-card { transition: all 0.3s ease; }
        .stat-card:hover { transform: scale(1.04); }
        .stat-card { transition: transform 0.2s ease; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #1e3a6e; border-radius: 3px; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hero-title { font-size: 32px !important; }
          .fitur-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <Navbar scrolled={scrolled} />

      {/* ── HERO / SLIDER ── */}
      <section id="beranda" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

        {/* Background gradient animasi */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${slide.bg.replace("from-[", "").replace("] via-[", ", ").replace("] to-[", ", ").replace("]", "")})`,
          transition: "background 1s ease",
        }} />

        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />

        {/* Glow radial */}
        <div style={{
          position: "absolute",
          width: 600, height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${slide.accent}22 0%, transparent 70%)`,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          transition: "background 1s ease",
          pointerEvents: "none",
        }} />

        {/* Lingkaran dekoratif */}
        {[500, 700, 900].map((size, i) => (
          <div key={i} style={{
            position: "absolute",
            width: size, height: size,
            borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${0.03 - i * 0.005})`,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />
        ))}

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px", textAlign: "center" }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100,
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: slide.accent, boxShadow: `0 0 8px ${slide.accent}` }} />
            Dinas Pendidikan dan Kebudayaan Provinsi NTT
          </div>

          {/* Judul */}
          <h1 className="hero-title" style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 20,
            color: "white",
            transition: "opacity 0.5s ease",
          }}>
            {slide.judul}
          </h1>

          {/* Deskripsi */}
          <p style={{
            fontSize: 17,
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.55)",
            fontWeight: 300,
            maxWidth: 580,
            margin: "0 auto 40px",
            transition: "opacity 0.5s ease",
          }}>
            {slide.deskripsi}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{
              padding: "14px 32px",
              background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
              color: "white", borderRadius: 10,
              textDecoration: "none", fontSize: 14, fontWeight: 700,
              letterSpacing: "0.05em", textTransform: "uppercase",
              boxShadow: `0 8px 28px ${slide.accent}44`,
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s",
            }}>
              Masuk ke Sistem
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a href="#fitur" style={{
              padding: "14px 32px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.8)", borderRadius: 10,
              textDecoration: "none", fontSize: 14, fontWeight: 700,
              letterSpacing: "0.05em", textTransform: "uppercase",
              transition: "all 0.2s",
            }}>
              Pelajari Fitur
            </a>
          </div>

          {/* Slide indicators */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 52 }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentSlide(i);
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  intervalRef.current = setInterval(() => setCurrentSlide((p) => (p + 1) % SLIDES.length), 5000);
                }}
                style={{
                  width: i === currentSlide ? 28 : 8,
                  height: 8, borderRadius: 4,
                  background: i === currentSlide ? slide.accent : "rgba(255,255,255,0.2)",
                  border: "none", cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          animation: "bounce 2s infinite",
        }}>
          <style>{`@keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }`}</style>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ── STATISTIK ── */}
      <section id="statistik" style={{ padding: "72px 24px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div
          id="stats-section"
          data-animate
          className={`section-fade stats-grid ${visibleSections.has("stats-section") ? "visible" : ""}`}
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          {STATS.map((stat, i) => (
            <div key={i} className="stat-card" style={{
              textAlign: "center",
              padding: "28px 16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 40, fontWeight: 700,
                color: "white",
                lineHeight: 1,
              }}>
                {stat.angka}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.15em", textTransform: "uppercase", margin: "6px 0 4px" }}>
                {stat.satuan}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FITUR ── */}
      <section id="fitur" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div
            id="fitur-header"
            data-animate
            className={`section-fade ${visibleSections.has("fitur-header") ? "visible" : ""}`}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#3b82f6", marginBottom: 12 }}>
              Fitur Unggulan
            </div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 36, fontWeight: 700, color: "white", marginBottom: 14 }}>
              Semua yang Kamu Butuhkan
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontWeight: 300, maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
              Platform lengkap untuk mengelola analisis jabatan, beban kerja, dan kebutuhan guru secara terintegrasi.
            </p>
          </div>

          {/* Grid fitur */}
          <div
            id="fitur-grid"
            data-animate
            className={`section-fade fitur-grid ${visibleSections.has("fitur-grid") ? "visible" : ""}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {FITUR.map((fitur, i) => (
              <div key={i} className="fitur-card" style={{
                padding: "28px 24px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                cursor: "default",
              }}>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: `${fitur.warna}18`,
                  border: `1px solid ${fitur.warna}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: fitur.warna,
                  marginBottom: 18,
                }}>
                  {fitur.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 8 }}>
                  {fitur.judul}
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300 }}>
                  {fitur.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "0 24px 96px" }}>
        <div
          id="cta-banner"
          data-animate
          className={`section-fade ${visibleSections.has("cta-banner") ? "visible" : ""}`}
          style={{
            maxWidth: 1100, margin: "0 auto",
            padding: "60px 48px",
            background: "linear-gradient(135deg, rgba(13,110,253,0.15), rgba(10,88,202,0.08))",
            border: "1px solid rgba(13,110,253,0.2)",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 28,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow */}
          <div style={{
            position: "absolute", top: -80, right: -80,
            width: 300, height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(13,110,253,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#60a5fa", marginBottom: 10 }}>
              Siap Memulai?
            </div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 28, fontWeight: 700, color: "white", marginBottom: 8 }}>
              Masuk ke Portal E-SIPKG
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: 300, maxWidth: 420, lineHeight: 1.7 }}>
              Gunakan akun yang diberikan oleh Admin Pusat Dinas Pendidikan Provinsi NTT untuk mengakses sistem.
            </p>
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 12 }}>
            <Link href="/login" style={{
              padding: "13px 28px",
              background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
              color: "white", borderRadius: 10,
              textDecoration: "none", fontSize: 14, fontWeight: 700,
              boxShadow: "0 6px 24px rgba(13,110,253,0.4)",
              display: "flex", alignItems: "center", gap: 8,
              letterSpacing: "0.03em",
            }}>
              Masuk Sekarang
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── KONTAK ── */}
      <section id="kontak" style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            id="kontak-header"
            data-animate
            className={`section-fade ${visibleSections.has("kontak-header") ? "visible" : ""}`}
            style={{ textAlign: "center", marginBottom: 52 }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#3b82f6", marginBottom: 12 }}>
              Hubungi Kami
            </div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 700, color: "white", marginBottom: 12 }}>
              Informasi Kontak
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
              Dinas Pendidikan dan Kebudayaan Provinsi Nusa Tenggara Timur
            </p>
          </div>

          <div
            id="kontak-grid"
            data-animate
            className={`section-fade contact-grid ${visibleSections.has("kontak-grid") ? "visible" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}
          >
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                label: "Alamat",
                value: "Jl. Frans Seda No. 2, Kupang\nNusa Tenggara Timur 85111",
                warna: "#3b82f6",
                href: "https://maps.google.com",
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.6 4.93 2 2 0 0 1 3.58 3H6.59a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.55a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.46 18l.46-1.08z"/></svg>,
                label: "Telepon",
                value: "(0380) 823456",
                warna: "#10b981",
                href: "tel:0380823456",
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                label: "Email",
                value: "disdikbudntt@gmail.com",
                warna: "#f59e0b",
                href: "mailto:disdikbudntt@gmail.com",
              },
            ].map((item, i) => (
              <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" style={{
                padding: "28px 24px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                display: "flex", flexDirection: "column", gap: 12,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${item.warna}40`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 12,
                  background: `${item.warna}18`,
                  border: `1px solid ${item.warna}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: item.warna,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: item.warna, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{item.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "rgba(0,0,0,0.4)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "40px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40, marginBottom: 36 }}>

            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 34, height: 34,
                  background: "linear-gradient(135deg, #1a4fa0, #0d6efd)",
                  borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: "white" }}>E-SIPKG</div>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, fontWeight: 300 }}>
                Sistem Informasi Perhitungan Kebutuhan Guru SMA, SMK, dan SLB Provinsi Nusa Tenggara Timur.
              </p>
            </div>

            {/* Links */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>Menu</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Beranda", "Fitur", "Statistik", "Kontak"].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* HAKI */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>Informasi</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, fontWeight: 300 }}>
                © 2024 Dinas Pendidikan dan Kebudayaan Provinsi NTT.<br />
                Hak Cipta Dilindungi Undang-Undang.<br />
                Dibangun untuk pelayanan publik yang lebih baik.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 12,
          }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              © 2024 E-SIPKG — Disdikbud Prov. NTT
            </span>
            <Link href="/login" style={{
              fontSize: 12, color: "#3b82f6",
              textDecoration: "none", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              Portal Login
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}