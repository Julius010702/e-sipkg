"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Data ─── */
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80",
  "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1600&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&q=80",
];

const OFFICIALS = [
  {
    role: "Gubernur",
    name: "Emanuel Melkiades\nLaka Lena, S.Si., Apt",
    grad: "linear-gradient(160deg,#1e40af,#3b82f6)",
    photo: "https://nttprov.go.id/gallery/26022025073836EmanuelMelkiLakaLena.png",
  },
  {
    role: "Wakil Gubernur",
    name: "Irjen Pol (Purn)\nJohanis Asadoma, M.Hum",
    grad: "linear-gradient(160deg,#1e3a8a,#60a5fa)",
    photo: "https://nttprov.go.id/gallery/26022025073836JohniAsadoma.png",
  },
  {
    role: "Kepala Dinas",
    name: "Dinas Pendidikan\n& Kebudayaan NTT",
    grad: "linear-gradient(160deg,#0f4c81,#3b82f6)",
    photo: null,
  },
];

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { height: 100%; scroll-behavior: smooth; }
  body { height: 100%; overflow-x: hidden; background: #030712; }

  :root {
    --blue:        #3b82f6;
    --blue-dark:   #1d4ed8;
    --blue-deep:   #1e3a8a;
    --blue-glow:   rgba(59,130,246,0.35);
    --gold:        #f59e0b;
    --text-p:      #f8fafc;
    --text-m:      rgba(248,250,252,0.58);
    --surface:     rgba(255,255,255,0.055);
    --border:      rgba(255,255,255,0.09);
    --font-body:   'DM Sans', sans-serif;
    --font-disp:   'Fraunces', serif;
  }

  @keyframes kenburns {
    from { transform: scale(1)    translate(0,0); }
    to   { transform: scale(1.10) translate(-0.8%,-0.8%); }
  }
  @keyframes fade-up {
    from { opacity:0; transform: translateY(24px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes shimmer-text {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes float-y {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-7px); }
  }
  @keyframes blink {
    0%,100% { opacity:1; } 50% { opacity:0.25; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .slide-active { animation: kenburns 10s ease-out forwards; }

  .fu-1 { animation: fade-up .7s .00s ease forwards; opacity:0; }
  .fu-2 { animation: fade-up .7s .12s ease forwards; opacity:0; }
  .fu-3 { animation: fade-up .7s .24s ease forwards; opacity:0; }
  .fu-4 { animation: fade-up .7s .36s ease forwards; opacity:0; }

  .shimmer {
    background: linear-gradient(90deg,#93c5fd 0%,#fff 30%,#60a5fa 60%,#fff 80%,#93c5fd 100%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer-text 4s linear infinite;
  }

  .pulse-dot { animation: blink 1.8s ease-in-out infinite; }
  .float-1  { animation: float-y 4.4s ease-in-out infinite; }
  .float-2  { animation: float-y 4.4s 1.4s ease-in-out infinite; }
  .float-3  { animation: float-y 4.4s 2.8s ease-in-out infinite; }

  .official-card {
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
  }
  .official-card:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 20px 50px rgba(59,130,246,.28), 0 6px 20px rgba(0,0,0,.4) !important;
  }

  .btn-login {
    transition: transform .2s ease, box-shadow .2s ease;
    position: relative; overflow: hidden;
    display: inline-flex; align-items: center; gap: 7px;
    text-decoration: none; color: white;
    font-weight: 700; letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 7px 18px; border-radius: 8px;
    font-size: 12px;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    box-shadow: 0 4px 20px rgba(37,99,235,0.45);
  }
  .btn-login::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
    transform: translateX(-100%);
    transition: transform .45s ease;
  }
  .btn-login:hover::after { transform: translateX(100%); }
  .btn-login:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(37,99,235,.58) !important; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--blue); border-radius: 4px; }

  /* ── Mobile-first responsive ── */

  .page-wrapper {
    position: relative; z-index: 3;
    min-height: 100vh;
    display: flex; flex-direction: column;
    font-family: var(--font-body);
  }

  .header-inner {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 16px;
    background: rgba(3,7,18,0.7);
    backdrop-filter: blur(28px) saturate(170%);
    -webkit-backdrop-filter: blur(28px) saturate(170%);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .logo-text-full { display: none; }
  .logo-text-short { display: block; }

  .hero-main {
    flex: 1;
    display: flex; flex-direction: column;
    padding: 24px 16px 100px;
    gap: 28px;
  }

  .hero-title {
    font-size: 56px !important;
  }

  .officials-row {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .official-card {
    min-width: 100px;
    max-width: 110px;
    padding: 14px 10px;
    border-radius: 18px;
  }

  .official-avatar {
    width: 56px !important;
    height: 56px !important;
  }

  .footer-inner {
    display: flex; flex-direction: column;
    gap: 10px;
    padding: 14px 16px;
    background: rgba(3,7,18,0.75);
    backdrop-filter: blur(24px);
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .footer-brand { text-align: left; }

  /* Tablet (≥600px) */
  @media (min-width: 600px) {
    .header-inner { padding: 12px 24px; }
    .logo-text-full { display: block; }
    .logo-text-short { display: none; }

    .hero-main { padding: 32px 28px 100px; }

    .hero-title { font-size: 72px !important; }

    .officials-row { gap: 12px; }
    .official-card { min-width: 120px; max-width: 138px; padding: 18px 12px; }
    .official-avatar { width: 64px !important; height: 64px !important; }

    .footer-inner { flex-direction: row; align-items: center; justify-content: space-between; padding: 14px 28px; }
    .footer-brand { text-align: right; }
  }

  /* Desktop (≥960px) */
  @media (min-width: 960px) {
    .header-inner { padding: 12px 36px; }

    .hero-main {
      flex-direction: row;
      align-items: center;
      padding: 48px 52px 48px;
      gap: 40px;
    }

    .hero-left { flex: 1; }
    .hero-right { flex: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 20px; }

    .hero-title { font-size: clamp(52px, 7vw, 82px) !important; }

    .officials-row { justify-content: flex-end; }
    .official-card { min-width: 126px; max-width: 140px; padding: 18px 14px; }
    .official-avatar { width: 66px !important; height: 66px !important; }

    .footer-inner { padding: 14px 36px; }
  }
`;

function Ornament() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <div style={{ width: 32, height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.7))" }} />
      <svg width="10" height="10" viewBox="0 0 10 10">
        <rect x="2" y="2" width="6" height="6" fill="none" stroke="rgba(59,130,246,0.7)" strokeWidth="1" transform="rotate(45 5 5)"/>
        <circle cx="5" cy="5" r="1.2" fill="#3b82f6"/>
      </svg>
      <div style={{ width: 32, height: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.7), transparent)" }} />
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const resetTimer = (n: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent((n + BG_IMAGES.length) % BG_IMAGES.length);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % BG_IMAGES.length), 7000);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % BG_IMAGES.length), 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{GLOBAL_CSS}</style>

      {/* ── SLIDESHOW ── */}
      {mounted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          {BG_IMAGES.map((src, i) => (
            <div
              key={i}
              className={i === current ? "slide-active" : ""}
              style={{
                position: "absolute", inset: 0,
                backgroundImage: `url('${src}')`,
                backgroundSize: "cover", backgroundPosition: "center",
                opacity: i === current ? 1 : 0,
                transition: "opacity 1.8s cubic-bezier(.4,0,.2,1)",
              }}
            />
          ))}
        </div>
      )}

      {/* ── OVERLAYS ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1,
        background: "linear-gradient(150deg, rgba(3,7,18,0.87) 0%, rgba(10,20,60,0.78) 50%, rgba(3,7,18,0.92) 100%)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 2, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px"
      }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "35vh", zIndex: 2,
        background: "linear-gradient(to top, rgba(30,58,138,0.14), transparent)" }} />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "18vh", zIndex: 2,
        background: "linear-gradient(to bottom, rgba(3,7,18,0.55), transparent)" }} />

      {/* ── SLIDE DOTS ── */}
      {mounted && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", gap: 8, alignItems: "center" }}>
          {BG_IMAGES.map((_, i) => (
            <button key={i} onClick={() => resetTimer(i)} aria-label={`Slide ${i+1}`}
              style={{
                width: i === current ? 28 : 7, height: 7, borderRadius: 4, padding: 0,
                background: i === current ? "var(--blue)" : "rgba(255,255,255,0.3)",
                border: "none", cursor: "pointer",
                transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
                boxShadow: i === current ? "0 0 14px rgba(59,130,246,.8)" : "none",
              }}
            />
          ))}
        </div>
      )}

      {/* ── PAGE WRAPPER ── */}
      <div className="page-wrapper">

        {/* ══════════════ HEADER ══════════════ */}
        <header style={{ position: "sticky", top: 0, zIndex: 50 }}>
          <div className="header-inner">
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Geometric crest */}
              <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
                  <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth="1"/>
                  <polygon points="22,4 37,12.5 37,29.5 22,38 7,29.5 7,12.5"
                    fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.55)" strokeWidth="1.2"/>
                  <polygon points="22,10 32,16 32,28 22,34 12,28 12,16"
                    fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.25)" strokeWidth="0.7"/>
                  <path d="M16 16v10l6-2 6 2V16" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M22 14v12" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                  <circle cx="22" cy="40" r="1.5" fill="#3b82f6"/>
                </svg>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(59,130,246,0.2)", animation: "spin-slow 30s linear infinite" }} />
              </div>

              {/* Full text (tablet+) */}
              <div className="logo-text-full" style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 9, letterSpacing: "2.2px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", fontWeight: 600, marginBottom: 1 }}>
                  Pemprov Nusa Tenggara Timur
                </div>
                <div style={{ fontSize: 11.5, letterSpacing: "0.5px", color: "rgba(255,255,255,0.85)", fontWeight: 700, textTransform: "uppercase" }}>
                  Dinas Pendidikan & Kebudayaan
                </div>
              </div>

              {/* Short text (mobile) */}
              <div className="logo-text-short" style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 8, letterSpacing: "1.8px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", fontWeight: 600, marginBottom: 1 }}>
                  Pemprov NTT
                </div>
                <div style={{ fontSize: 10.5, letterSpacing: "0.4px", color: "rgba(255,255,255,0.85)", fontWeight: 700, textTransform: "uppercase" }}>
                  Dikbud NTT
                </div>
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                fontFamily: "var(--font-disp)",
                fontSize: 18, fontWeight: 800,
                color: "white", letterSpacing: "1px",
                textShadow: "0 0 20px rgba(59,130,246,0.5)",
              }}>
                E‑SIPKG
              </div>
              <Link href="/login" className="btn-login">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Masuk
              </Link>
            </div>
          </div>
        </header>

        {/* ══════════════ HERO ══════════════ */}
        <main className="hero-main">

          {/* ── LEFT / TOP COLUMN ── */}
          <div className="hero-left">

            {/* Province badge */}
            <div className={mounted ? "fu-1" : ""} style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Ornament />
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.35)",
                borderRadius: 100, padding: "5px 14px 5px 8px",
                fontSize: 10, letterSpacing: "1.4px", textTransform: "uppercase",
                color: "#93c5fd", fontWeight: 700,
              }}>
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                Provinsi Nusa Tenggara Timur
              </span>
            </div>

            {/* Title block */}
            <div className={mounted ? "fu-2" : ""}>
              <div style={{
                fontFamily: "var(--font-disp)",
                fontSize: "clamp(11px,1.2vw,14px)",
                fontWeight: 300, letterSpacing: "4px",
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                marginBottom: 6,
                fontStyle: "italic",
              }}>
                Sistem Informasi
              </div>

              <h1 className="hero-title" style={{
                fontFamily: "var(--font-disp)",
                fontWeight: 800,
                color: "white",
                lineHeight: 0.92,
                letterSpacing: "-2px",
                textTransform: "uppercase",
                textShadow: "0 6px 40px rgba(0,0,0,0.55), 0 2px 0 rgba(59,130,246,0.2)",
                marginBottom: 10,
              }}>
                E‑SIPKG
              </h1>

              <div className="shimmer" style={{
                fontFamily: "var(--font-disp)",
                fontSize: "clamp(16px,2.6vw,34px)",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: 6,
              }}>
                Perhitungan Kebutuhan Guru
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 4 }}>
                <div style={{ height: 1, flex: 1, maxWidth: 280, background: "linear-gradient(90deg, rgba(59,130,246,0.6), transparent)" }} />
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <polygon points="8,1 15,4.5 15,11.5 8,15 1,11.5 1,4.5" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1"/>
                  <circle cx="8" cy="8" r="2.5" fill="rgba(59,130,246,0.5)"/>
                </svg>
              </div>

              <p style={{
                fontSize: "clamp(13px,1.2vw,14.5px)",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.85, maxWidth: 460, marginBottom: 28,
                fontWeight: 400, letterSpacing: "0.1px",
              }}>
                Platform digital terpadu untuk analisis dan perencanaan kebutuhan guru SMA, SMK, dan SLB
                di seluruh wilayah Provinsi NTT — terintegrasi dengan modul ANJAB &amp; ABK.
              </p>
            </div>

          </div>

          {/* ── RIGHT / BOTTOM COLUMN ── */}
          <div className="hero-right">
            {/* Officials */}
            <div className={`officials-row ${mounted ? "fu-1" : ""}`}>
              {OFFICIALS.map((o, idx) => (
                <div
                  key={o.role}
                  className={`official-card ${mounted ? `float-${idx + 1}` : ""}`}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
                    background: "rgba(255,255,255,0.065)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    backdropFilter: "blur(24px) saturate(160%)",
                    WebkitBackdropFilter: "blur(24px) saturate(160%)",
                    textAlign: "center",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  {/* Avatar */}
                  <div className="official-avatar" style={{
                    borderRadius: "50%",
                    overflow: "hidden", flexShrink: 0,
                    border: "2px solid rgba(59,130,246,0.55)",
                    boxShadow: "0 0 0 4px rgba(59,130,246,0.13), 0 8px 24px rgba(0,0,0,0.4)",
                  }}>
                    {o.photo ? (
                      <img src={o.photo} alt={o.role} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          const p = e.currentTarget.parentElement;
                          if (p) {
                            p.style.background = o.grad;
                            p.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: o.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Role badge */}
                  <div style={{
                    fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase",
                    color: "#93c5fd", fontWeight: 700,
                    background: "rgba(59,130,246,0.15)", borderRadius: 100, padding: "3px 9px",
                    border: "1px solid rgba(59,130,246,0.25)",
                  }}>
                    {o.role}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.88)", fontWeight: 600, lineHeight: 1.5, whiteSpace: "pre-line" }}>
                    {o.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer>
          <div className="footer-inner">
            {/* Contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, color: "rgba(255,255,255,0.48)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Jl. El Tari No. 52, Kota Kupang, NTT
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, fontSize: 11, color: "rgba(255,255,255,0.48)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  dikbud@nttprov.go.id
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .96h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.1 6.1l1.31-1.31a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.96 16z"/>
                  </svg>
                  (0380) 821111
                </span>
              </div>
            </div>

            {/* Brand */}
            <div className="footer-brand">
              <div style={{
                fontFamily: "var(--font-disp)",
                fontSize: 18, fontWeight: 800, color: "white",
                letterSpacing: "1px", marginBottom: 2,
              }}>
                E‑SIPKG
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>
                Sistem Informasi Perhitungan Kebutuhan Guru<br/>
                © {new Date().getFullYear()} Dikbud Provinsi NTT
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}