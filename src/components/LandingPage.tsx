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
    name: "Irjen Pol (Purn)\nDr. Drs. Johni Asadoma, M.Hum",
    grad: "linear-gradient(160deg,#1e3a8a,#60a5fa)",
    photo: "https://nttprov.go.id/gallery/26022025073836JohniAsadoma.png",
  },
  
];

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { height: 100%; scroll-behavior: smooth; }
  body { height: 100%; overflow-x: hidden; background: #030712; }

  :root {
    --blue:       #3b82f6;
    --blue-dark:  #1d4ed8;
    --blue-deep:  #1e3a8a;
    --blue-glow:  rgba(59,130,246,0.35);
    --gold:       #f59e0b;
    --text-p:     #f8fafc;
    --text-m:     rgba(248,250,252,0.58);
    --surface:    rgba(255,255,255,0.055);
    --border:     rgba(255,255,255,0.09);
    --font-body:  'DM Sans', sans-serif;
    --font-disp:  'Fraunces', serif;
  }

  /* ── Animations ── */
  @keyframes kenburns {
    from { transform: scale(1) translate(0,0); }
    to   { transform: scale(1.10) translate(-0.8%,-0.8%); }
  }
  @keyframes fade-up {
    from { opacity:0; transform: translateY(20px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes shimmer-text {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes float-y {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-6px); }
  }
  @keyframes blink {
    0%,100% { opacity:1; } 50% { opacity:0.25; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .slide-active { animation: kenburns 10s ease-out forwards; }
  .fu-1 { animation: fade-up .6s .00s ease forwards; opacity:0; }
  .fu-2 { animation: fade-up .6s .10s ease forwards; opacity:0; }
  .fu-3 { animation: fade-up .6s .20s ease forwards; opacity:0; }
  .fu-4 { animation: fade-up .6s .30s ease forwards; opacity:0; }

  .shimmer {
    background: linear-gradient(90deg,#93c5fd 0%,#fff 30%,#60a5fa 60%,#fff 80%,#93c5fd 100%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer-text 4s linear infinite;
  }

  .pulse-dot { animation: blink 1.8s ease-in-out infinite; }
  .float-1   { animation: float-y 4.4s ease-in-out infinite; }
  .float-2   { animation: float-y 4.4s 1.4s ease-in-out infinite; }
  .float-3   { animation: float-y 4.4s 2.8s ease-in-out infinite; }

  .official-card {
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
  }
  @media (hover: hover) {
    .official-card:hover {
      transform: translateY(-6px) scale(1.03);
      box-shadow: 0 20px 50px rgba(59,130,246,.28), 0 6px 20px rgba(0,0,0,.4) !important;
    }
  }

  .btn-login {
    transition: transform .2s ease, box-shadow .2s ease;
    position: relative; overflow: hidden;
    display: inline-flex; align-items: center; gap: 5px;
    text-decoration: none; color: white;
    font-weight: 700; letter-spacing: 0.5px;
    text-transform: uppercase; white-space: nowrap;
    border-radius: 8px;
    background: linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);
    box-shadow: 0 4px 20px rgba(37,99,235,0.45);
  }
  .btn-login::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent);
    transform: translateX(-100%); transition: transform .45s ease;
  }
  @media (hover: hover) {
    .btn-login:hover::after { transform: translateX(100%); }
    .btn-login:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(37,99,235,.58) !important; }
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--blue); border-radius: 4px; }

  /* ════════════════════════════════
     PAGE WRAPPER
  ════════════════════════════════ */
  .page-wrapper {
    position: relative; z-index: 3;
    min-height: 100dvh;
    display: flex; flex-direction: column;
    font-family: var(--font-body);
  }

  /* ════════════════════════════════
     HEADER — mobile base
  ════════════════════════════════ */
  .header-inner {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px; gap: 8px;
    background: rgba(3,7,18,0.76);
    backdrop-filter: blur(28px) saturate(170%);
    -webkit-backdrop-filter: blur(28px) saturate(170%);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .logo-wrap {
    display: flex; align-items: center; gap: 8px;
    flex: 1; min-width: 0;
  }
  .logo-ntt-circle {
    position: relative; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    width: 34px; height: 34px;
  }
  .logo-ntt-bg {
    position: absolute; inset: 0; border-radius: 50%;
    background: rgba(255,255,255,0.09);
    border: 1px solid rgba(255,255,255,0.18);
    box-shadow: 0 0 12px rgba(59,130,246,0.2);
  }
  .logo-ntt-ring {
    position: absolute; inset: -4px; border-radius: 50%;
    border: 1px dashed rgba(59,130,246,0.28);
    animation: spin-slow 30s linear infinite;
    pointer-events: none;
  }
  .logo-ntt-img { position: relative; z-index: 1; display: block; object-fit: contain; }
  .logo-text { min-width: 0; overflow: hidden; }
  .logo-sub  {
    font-size: 7.5px; letter-spacing: 1.6px;
    color: rgba(255,255,255,0.4); text-transform: uppercase;
    font-weight: 600; margin-bottom: 1px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .logo-main {
    font-size: 10px; letter-spacing: 0.3px;
    color: rgba(255,255,255,0.88); font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .header-right {
    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  }
  .header-brand {
    font-family: var(--font-disp);
    font-weight: 800; color: white; letter-spacing: 0.8px;
    text-shadow: 0 0 18px rgba(59,130,246,0.5);
    font-size: 14px;
  }
  .btn-login { font-size: 10px; padding: 6px 11px; }

  /* ════════════════════════════════
     HERO — mobile base (stacked)
  ════════════════════════════════ */
  .hero-main {
    flex: 1;
    display: flex; flex-direction: column;
    padding: 20px 14px 76px; gap: 22px;
  }
  .hero-left { width: 100%; }

  .province-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.32);
    border-radius: 100px; padding: 4px 11px 4px 6px;
    font-size: 9px; letter-spacing: 1.1px; text-transform: uppercase;
    color: #93c5fd; font-weight: 700; margin-bottom: 13px;
  }
  .hero-sys-label {
    font-family: var(--font-disp);
    font-size: 10.5px; font-weight: 300; letter-spacing: 3.5px;
    color: rgba(255,255,255,0.4); text-transform: uppercase;
    margin-bottom: 3px; font-style: italic;
  }
  .hero-title {
    font-family: var(--font-disp);
    font-weight: 800; color: white;
    line-height: 0.9; letter-spacing: -1.5px;
    text-transform: uppercase;
    text-shadow: 0 6px 40px rgba(0,0,0,0.55),0 2px 0 rgba(59,130,246,0.2);
    margin-bottom: 7px;
    font-size: clamp(46px, 15vw, 62px);
  }
  .hero-sub {
    font-family: var(--font-disp);
    font-weight: 700; letter-spacing: 0.3px;
    text-transform: uppercase; display: inline-block; margin-bottom: 4px;
    font-size: clamp(13px, 4.2vw, 20px);
  }
  .hero-divider {
    display: flex; align-items: center; gap: 9px;
    margin: 6px 0 12px;
  }
  .hero-desc {
    font-size: clamp(12px, 3.2vw, 14px);
    color: rgba(255,255,255,0.60);
    line-height: 1.8; font-weight: 400;
  }

  /* ── Officials ── */
  .hero-right { width: 100%; }
  .officials-label {
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,0.32); font-weight: 600;
    margin-bottom: 9px; text-align: center;
  }
  .officials-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px; width: 100%;
  }
  .official-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 6px; padding: 11px 7px; border-radius: 15px;
    background: rgba(255,255,255,0.065);
    border: 1px solid rgba(255,255,255,0.11);
    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);
    text-align: center;
    box-shadow: 0 6px 28px rgba(0,0,0,0.28),inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .official-avatar {
    border-radius: 50%; overflow: hidden; flex-shrink: 0;
    border: 2px solid rgba(59,130,246,0.48);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.11),0 5px 16px rgba(0,0,0,0.32);
    width: 46px; height: 46px;
  }
  .official-role {
    font-size: 7.5px; letter-spacing: 1px; text-transform: uppercase;
    color: #93c5fd; font-weight: 700;
    background: rgba(59,130,246,0.13); border-radius: 100px;
    padding: 2px 6px; border: 1px solid rgba(59,130,246,0.2);
    line-height: 1.4;
  }
  .official-name {
    font-size: 9px; color: rgba(255,255,255,0.85);
    font-weight: 600; line-height: 1.45; white-space: pre-line;
  }

  /* ════════════════════════════════
     FOOTER — mobile
  ════════════════════════════════ */
  .footer-inner {
    display: flex; flex-direction: column; gap: 12px;
    padding: 13px 14px;
    background: rgba(3,7,18,0.78);
    backdrop-filter: blur(24px);
    border-top: 1px solid rgba(255,255,255,0.07);
  }
  .footer-brand { text-align: left; }
  .footer-contact { display: flex; flex-direction: column; gap: 5px; }
  .footer-contact-item {
    display: flex; align-items: flex-start; gap: 6px;
    font-size: 10.5px; color: rgba(255,255,255,0.42); line-height: 1.5;
  }
  .footer-contact-row { display: flex; flex-wrap: wrap; gap: 10px; }

  /* ── SLIDE DOTS ── */
  .slide-dots {
    position: fixed; bottom: 14px;
    left: 50%; transform: translateX(-50%);
    z-index: 20; display: flex; gap: 7px; align-items: center;
  }
  .slide-dot {
    height: 6px; border-radius: 3px; padding: 0;
    border: none; cursor: pointer;
    transition: all .4s cubic-bezier(.34,1.56,.64,1);
  }
  .dot-active   { width: 22px; background: var(--blue); box-shadow: 0 0 12px rgba(59,130,246,.8); }
  .dot-inactive { width: 6px;  background: rgba(255,255,255,0.28); }

  /* ════════════════════════════════
     TABLET ≥ 480px
  ════════════════════════════════ */
  @media (min-width: 480px) {
    .header-inner { padding: 9px 18px; }
    .logo-ntt-circle { width: 38px; height: 38px; }
    .logo-sub  { font-size: 8px; letter-spacing: 1.8px; }
    .logo-main { font-size: 10.5px; }
    .header-brand { font-size: 16px; }
    .btn-login { font-size: 10.5px; padding: 6px 13px; }

    .hero-main { padding: 24px 20px 84px; gap: 26px; }
    .hero-title { font-size: clamp(52px, 14vw, 72px); }

    .official-avatar { width: 52px; height: 52px; }
    .official-card { padding: 13px 9px; border-radius: 16px; gap: 7px; }
    .official-role { font-size: 8px; }
    .official-name { font-size: 9.5px; }
  }

  /* ════════════════════════════════
     TABLET ≥ 640px
  ════════════════════════════════ */
  @media (min-width: 640px) {
    .header-inner { padding: 10px 24px; }
    .logo-ntt-circle { width: 42px; height: 42px; }
    .logo-sub  { font-size: 8.5px; letter-spacing: 2px; }
    .logo-main { font-size: 11px; }
    .header-brand { font-size: 17px; }
    .btn-login { font-size: 11px; padding: 7px 15px; }

    .hero-main { padding: 30px 28px 94px; gap: 28px; }
    .hero-title { font-size: clamp(60px, 13vw, 84px); }
    .hero-sub { font-size: clamp(15px, 3.8vw, 24px); }

    .officials-row { gap: 10px; }
    .official-avatar { width: 58px; height: 58px; }
    .official-card { padding: 15px 11px; gap: 8px; }
    .official-role { font-size: 8.5px; padding: 2px 7px; }
    .official-name { font-size: 10px; }

    .footer-inner { flex-direction: row; align-items: center; justify-content: space-between; padding: 13px 28px; }
    .footer-brand { text-align: right; }
  }

  /* ════════════════════════════════
     TABLET ≥ 768px
  ════════════════════════════════ */
  @media (min-width: 768px) {
    .header-inner { padding: 11px 32px; }
    .logo-ntt-circle { width: 44px; height: 44px; }
    .logo-sub  { font-size: 9px; letter-spacing: 2.2px; }
    .logo-main { font-size: 11.5px; }
    .header-brand { font-size: 18px; }
    .btn-login { font-size: 11.5px; padding: 7px 16px; }

    .hero-main { padding: 36px 36px 100px; gap: 32px; }
    .hero-title { font-size: clamp(68px, 12vw, 92px); }

    .official-avatar { width: 62px; height: 62px; }
    .official-card { padding: 16px 12px; border-radius: 18px; }
    .official-role { font-size: 9px; }
    .official-name { font-size: 10.5px; }

    .footer-inner { padding: 14px 36px; }
  }

  /* ════════════════════════════════
     DESKTOP ≥ 960px — side by side
  ════════════════════════════════ */
  @media (min-width: 960px) {
    .header-inner { padding: 12px 40px; }

    .hero-main {
      flex-direction: row; align-items: center;
      padding: 52px 56px; gap: 48px;
    }
    .hero-left { flex: 1; }
    .hero-right {
      flex: 1;
      display: flex; flex-direction: column;
      align-items: flex-end; gap: 14px;
    }

    .hero-title { font-size: clamp(62px, 7.5vw, 88px); }
    .hero-sub { font-size: clamp(18px, 2.4vw, 30px); }

    .officials-label { text-align: right; }
    .officials-row { max-width: 430px; gap: 12px; }
    .official-avatar { width: 66px; height: 66px; }
    .official-card { padding: 18px 13px; gap: 9px; }
    .official-name { font-size: 11px; }

    .footer-inner { padding: 14px 40px; }
  }

  /* ════════════════════════════════
     DESKTOP WIDE ≥ 1280px
  ════════════════════════════════ */
  @media (min-width: 1280px) {
    .hero-main { padding: 60px 64px; gap: 56px; }
    .hero-title { font-size: clamp(72px, 7vw, 96px); }
    .officials-row { max-width: 470px; gap: 14px; }
    .official-avatar { width: 70px; height: 70px; }
  }

  /* ════════════════════════════════
     EXTRA SMALL ≤ 360px
  ════════════════════════════════ */
  @media (max-width: 360px) {
    .header-inner { padding: 7px 10px; gap: 6px; }
    .logo-ntt-circle { width: 30px; height: 30px; }
    .logo-sub  { font-size: 6.5px; letter-spacing: 1px; }
    .logo-main { font-size: 9px; }
    .header-brand { font-size: 12px; }
    .btn-login { font-size: 9px; padding: 5px 8px; gap: 4px; }

    .hero-main { padding: 14px 11px 68px; gap: 16px; }
    .hero-title { font-size: clamp(38px, 14vw, 50px); }
    .province-badge { font-size: 7.5px; padding: 3px 9px 3px 5px; margin-bottom: 10px; }

    .officials-row { gap: 5px; }
    .official-avatar { width: 38px; height: 38px; }
    .official-card { padding: 9px 5px; border-radius: 11px; gap: 4px; }
    .official-role { font-size: 6.5px; padding: 1px 4px; }
    .official-name { font-size: 8px; }
  }
`;

/* ── Ornament ── */
function Ornament() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
      <div style={{ width: 26, height: 1, background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.7))" }} />
      <svg width="10" height="10" viewBox="0 0 10 10">
        <rect x="2" y="2" width="6" height="6" fill="none" stroke="rgba(59,130,246,0.7)" strokeWidth="1" transform="rotate(45 5 5)"/>
        <circle cx="5" cy="5" r="1.2" fill="#3b82f6"/>
      </svg>
      <div style={{ width: 26, height: 1, background: "linear-gradient(90deg,rgba(59,130,246,0.7),transparent)" }} />
    </div>
  );
}

/* ── Logo NTT dengan fallback ── */
function LogoNTT({ size }: { size: number }) {
  const [src, setSrc] = useState("/logo-ntt.png");
  return (
    <img
      className="logo-ntt-img"
      src={src}
      alt="Logo Provinsi NTT"
      width={size}
      height={size}
      onError={() => {
        if (src === "/logo-ntt.png") setSrc("/logo-ntt.ico");
        else if (src === "/logo-ntt.ico") setSrc("/logo.svg");
      }}
    />
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
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
            <div key={i} className={i === current ? "slide-active" : ""}
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
      <div style={{ position: "fixed", inset: 0, zIndex: 1, background: "linear-gradient(150deg,rgba(3,7,18,0.88) 0%,rgba(10,20,60,0.80) 50%,rgba(3,7,18,0.93) 100%)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 2, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px"
      }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "30vh", zIndex: 2, background: "linear-gradient(to top,rgba(30,58,138,0.13),transparent)" }} />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "16vh", zIndex: 2, background: "linear-gradient(to bottom,rgba(3,7,18,0.5),transparent)" }} />

      {/* ── SLIDE DOTS ── */}
      {mounted && (
        <div className="slide-dots">
          {BG_IMAGES.map((_, i) => (
            <button key={i} onClick={() => resetTimer(i)} aria-label={`Slide ${i + 1}`}
              className={`slide-dot ${i === current ? "dot-active" : "dot-inactive"}`}
            />
          ))}
        </div>
      )}

      {/* ── PAGE WRAPPER ── */}
      <div className="page-wrapper">

        {/* ══════════════ HEADER ══════════════ */}
        <header style={{ position: "sticky", top: 0, zIndex: 50 }}>
          <div className="header-inner">
            {/* Logo kiri */}
            <div className="logo-wrap">
              <div className="logo-ntt-circle">
                <div className="logo-ntt-bg" />
                <LogoNTT size={26} />
                <div className="logo-ntt-ring" />
              </div>
              <div className="logo-text">
                <div className="logo-sub">Pemprov Nusa Tenggara Timur</div>
                <div className="logo-main">Biro Organisasi Setda Prov NTT</div>
              </div>
            </div>

            {/* Kanan */}
            <div className="header-right">
              <div className="header-brand">E‑SIPKG</div>
              <Link href="/login" className="btn-login">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
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

          {/* ── KIRI / ATAS: teks ── */}
          <div className="hero-left">
            <div className={mounted ? "fu-1" : ""}>
              <Ornament />
              <div className="province-badge">
                <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                Provinsi Nusa Tenggara Timur
              </div>
            </div>

            <div className={mounted ? "fu-2" : ""}>
              <div className="hero-sys-label">Sistem Informasi</div>
              <h1 className="hero-title">E‑SIPKG</h1>
              <div className="shimmer hero-sub">Perhitungan Kebutuhan Guru</div>

              <div className="hero-divider">
                <div style={{ height: 1, flex: 1, maxWidth: 240, background: "linear-gradient(90deg,rgba(59,130,246,0.6),transparent)" }} />
                <svg width="14" height="14" viewBox="0 0 16 16">
                  <polygon points="8,1 15,4.5 15,11.5 8,15 1,11.5 1,4.5" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1"/>
                  <circle cx="8" cy="8" r="2.5" fill="rgba(59,130,246,0.5)"/>
                </svg>
              </div>

              <p className="hero-desc">
                Platform digital terpadu untuk analisis dan perencanaan kebutuhan guru SMA, SMK, dan SLB
                di seluruh wilayah Provinsi NTT — terintegrasi dengan modul ANJAB &amp; ABK.
              </p>
            </div>
          </div>

          {/* ── KANAN / BAWAH: pejabat ── */}
          <div className="hero-right">
            <div className={mounted ? "fu-3" : ""} style={{ width: "100%" }}>
              <div className="officials-label">Pimpinan</div>
              <div className="officials-row">
                {OFFICIALS.map((o, idx) => (
                  <div key={o.role} className={`official-card ${mounted ? `float-${idx + 1}` : ""}`}>
                    <div className="official-avatar">
                      {o.photo ? (
                        <img src={o.photo} alt={o.role}
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            const p = e.currentTarget.parentElement;
                            if (p) {
                              p.style.background = o.grad;
                              p.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;
                            }
                          }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: o.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="official-role">{o.role}</div>
                    <div className="official-name">{o.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer>
          <div className="footer-inner">
            <div className="footer-contact">
              <div className="footer-contact-item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Jl. El Tari No. 52, Kota Kupang, NTT
              </div>
              <div className="footer-contact-row">
                <span className="footer-contact-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  biroorganisasisetda@nttprov.go.id
                </span>
                <span className="footer-contact-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .96h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.1 6.1l1.31-1.31a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.96 16z"/>
                  </svg>
                  (0380) 821111
                </span>
              </div>
            </div>
            <div className="footer-brand">
              <div style={{ fontFamily: "var(--font-disp)", fontSize: 16, fontWeight: 800, color: "white", letterSpacing: "1px", marginBottom: 3 }}>
                E‑SIPKG
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", lineHeight: 1.55 }}>
                Sistem Informasi Perhitungan Kebutuhan Guru<br/>
                © {new Date().getFullYear()} Biro Organisasi Setda Provinsi NTT
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}