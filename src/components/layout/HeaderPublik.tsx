'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const navLinks = [
  { href: '/',           label: 'Beranda'   },
  { href: '/#statistik', label: 'Statistik' },
  { href: '/#tentang',   label: 'Tentang'   },
  { href: '/#kontak',    label: 'Kontak'    },
]

// Isi berita berjalan — diduplikasi 2x di render agar loop mulus
const TICKER_ITEMS = [
  { type: 'logo-ntt',    text: 'Pemerintah Provinsi Nusa Tenggara Timur' },
  { type: 'dot',         text: 'Biro Organisasi & Tata Laksana' },
  { type: 'dot',         text: 'Bagian Kelembagaan dan Analisis Jabatan' },
  { type: 'logo-stikom', text: 'STIKOM Artha Buana Kupang' },
  { type: 'dot',         text: 'e-SIPKG · Sistem Informasi Perhitungan Kebutuhan Guru' },
  { type: 'dot',         text: 'ANJAB & ABK · SMA / SMK / SLB · Provinsi NTT' },
]

const HEADER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
*, *::before, *::after { box-sizing: border-box; }

:root {
  --ink:        #0E3A8F;
  --ink-2:      #1450A8;
  --paper:      #FFFFFF;
  --stamp:      #0B2E6B;
  --brass:      #D9A400;
  --brass-light:#F4C430;
}

.top-strip, .header-main, .mobile-drawer { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
.header-wordmark, .nav-link-pub, .masuk-btn, .mobile-masuk-full { font-family: 'Inter', system-ui, sans-serif; }
.doc-ref, .strip-code, .strip-text { font-family: 'IBM Plex Mono', ui-monospace, monospace; }

/* ══════════════════════════════════════════════════
   KOP SURAT — berita berjalan, kecepatan tenang
══════════════════════════════════════════════════ */
.top-strip {
  background: var(--ink-2);
  position: sticky;
  top: 0;
  z-index: 52;
  height: 30px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.strip-marquee {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}
.strip-marquee::before,
.strip-marquee::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 48px;
  z-index: 2;
  pointer-events: none;
}
.strip-marquee::before {
  left: 0;
  background: linear-gradient(to right, var(--ink-2) 55%, transparent);
}
.strip-marquee::after {
  right: 0;
  background: linear-gradient(to left, var(--ink-2) 55%, transparent);
}

.strip-track {
  display: flex;
  align-items: center;
  height: 100%;
  width: max-content;
  animation: strip-scroll 52s linear infinite;
}
.strip-track:hover { animation-play-state: paused; }

@keyframes strip-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.strip-set {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.strip-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 18px;
  height: 100%;
  white-space: nowrap;
  border-right: 1px solid rgba(244,196,48,0.22);
}

.strip-logo {
  width: 12px; height: 12px;
  object-fit: contain; flex-shrink: 0;
  opacity: 0.95;
}
.strip-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: rgba(244,196,48,0.85);
  flex-shrink: 0;
}
.strip-text {
  font-size: 9.5px; font-weight: 500;
  letter-spacing: 0.03em;
  color: rgba(255,255,255,0.75);
}
.strip-text.gold { color: var(--brass-light); }

.strip-code {
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: rgba(244,196,48,0.9);
  flex-shrink: 0;
  white-space: nowrap;
  padding: 0 clamp(12px, 3vw, 40px) 0 16px;
  border-left: 1px solid rgba(244,196,48,0.28);
  margin-left: 4px;
}

/* Hairline rule under kop surat — flat, no gradient shine */
.header-rule {
  height: 2px;
  background: linear-gradient(90deg, var(--brass-light), var(--brass) 60%, rgba(244,196,48,0.4));
  position: sticky;
  top: 30px;
  z-index: 52;
}

/* ══════════════════════════════════════════════════
   MAIN HEADER
══════════════════════════════════════════════════ */
.header-main {
  background: rgba(14,58,143,0.72);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  backdrop-filter: blur(12px) saturate(140%);
  position: sticky;
  top: 32px;
  z-index: 50;
  transition: box-shadow 0.25s ease;
  box-shadow: 0 1px 0 rgba(0,0,0,0.1);
}
.header-main.scrolled {
  box-shadow: 0 8px 24px rgba(9,30,74,0.3), 0 1px 0 rgba(0,0,0,0.12);
}

.header-inner {
  margin: 0 auto;
  padding: 0 clamp(12px, 3vw, 40px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: clamp(58px, 7vw, 70px);
  gap: clamp(8px, 1.5vw, 20px);
}

/* Logo + wordmark */
.header-logo {
  display: flex; align-items: center;
  gap: clamp(9px, 1.2vw, 13px);
  text-decoration: none; flex-shrink: 0;
}
.header-logo-img {
  position: relative;
  width: clamp(38px, 4.6vw, 48px);
  height: clamp(38px, 4.6vw, 48px);
  flex-shrink: 0;
  border-radius: 9px;
  background: linear-gradient(145deg, #FBD34D 0%, var(--brass-light) 45%, var(--brass) 100%);
  border: 1px solid rgba(255,255,255,0.35);
  box-shadow: 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.45);
  padding: 5px;
}
.header-logo-img-inner {
  position: relative;
  width: 100%;
  height: 100%;
}
.header-wordmark {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(14px, 1.6vw, 18px);
  font-weight: 700;
  color: var(--brass-light);
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  display: block;
  white-space: nowrap;
}
.header-logo-sub {
  font-size: clamp(8.5px, 0.9vw, 10.5px);
  font-weight: 700;
  color: rgba(191,208,235,0.85);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-top: 5px;
  display: block;
  white-space: nowrap;
}

.header-vdivider {
  width: 1px; height: 28px;
  background: rgba(244,196,48,0.32);
  flex-shrink: 0;
}

/* Nav */
.header-nav {
  display: flex; flex: 1;
  justify-content: center; align-items: center;
  gap: clamp(4px, 2.2vw, 28px);
}
.nav-link-pub {
  position: relative;
  padding: 7px clamp(14px, 1.8vw, 24px);
  font-size: clamp(12px, 1.15vw, 13.5px);
  font-weight: 500;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  letter-spacing: 0.01em;
  white-space: nowrap;
  transition: color 0.18s;
  border-bottom: 1px solid transparent;
}
.nav-link-pub:hover {
  color: var(--paper);
  border-bottom-color: var(--brass-light);
}

/* Right section */
.header-right {
  display: flex; align-items: center;
  gap: clamp(8px, 1.1vw, 14px); flex-shrink: 0;
}
.header-sys-info { text-align: right; line-height: 1.35; }
.header-sys-info p { margin: 0; }
.sys-label {
  font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase;
  color: rgba(255,255,255,0.45);
}
.sys-title {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  color: var(--brass-light);
  letter-spacing: 0.01em;
  white-space: nowrap;
}

/* Tombol Masuk — dirender seperti cap/stempel resmi (biru, khas cap dinas) */
.masuk-btn {
  display: inline-flex; align-items: center; gap: 7px;
  position: relative;
  background: linear-gradient(135deg, var(--brass-light), var(--brass));
  border: 1.3px solid var(--brass);
  color: #1a1300;
  font-size: clamp(11.5px, 1.15vw, 13px);
  font-weight: 700;
  padding: clamp(7px,1vw,9px) clamp(14px,1.6vw,20px);
  border-radius: 4px;
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: transform 0.22s cubic-bezier(0.4,0,0.2,1), filter 0.22s;
  white-space: nowrap; flex-shrink: 0;
}
.masuk-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

/* Hamburger */
.hamburger-btn {
  display: none; width: 36px; height: 36px;
  border-radius: 4px; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.22);
  cursor: pointer; transition: background 0.18s, border-color 0.18s;
  color: rgba(255,255,255,0.9); flex-shrink: 0;
}
.hamburger-btn:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(244,196,48,0.5);
}

/* Mobile drawer */
.mobile-drawer {
  background: var(--ink-2);
  border-top: 1px solid rgba(244,196,48,0.3);
  overflow: hidden;
  transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease;
}
.mobile-drawer-inner { padding: 14px clamp(12px,3vw,20px) 22px; }
.mobile-drawer-brand {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; margin-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}
.mobile-nav-link {
  display: flex; align-items: center; padding: 12px 14px;
  font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.85);
  text-decoration: none;
  border-left: 2px solid transparent; transition: all 0.16s;
}
.mobile-nav-link:hover {
  background: rgba(255,255,255,0.06);
  border-left-color: var(--brass-light); color: var(--paper); padding-left: 18px;
}
.mobile-masuk-full {
  position: relative;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, var(--brass-light), var(--brass));
  border: 1.3px solid var(--brass);
  color: #1a1300; font-weight: 700; font-size: 14px;
  padding: 13px 0; border-radius: 4px; text-decoration: none;
  letter-spacing: 0.03em; margin-top: 16px;
}

/* ══ RESPONSIVE ══════════════════════════════════ */
@media (max-width: 767px) {
  .header-vdivider   { display: none; }
  .header-sys-info   { display: none; }
  .masuk-btn         { display: none; }
  .hamburger-btn     { display: flex; }
  .header-nav        { display: none; }
  .strip-code        { display: none; }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .header-vdivider   { display: none; }
  .header-sys-info   { display: none; }
  .hamburger-btn     { display: none; }
  .header-nav        { display: flex; }
  .masuk-btn         { display: inline-flex; }
}
@media (min-width: 1024px) {
  .header-vdivider   { display: block; }
  .header-sys-info   { display: block; }
  .hamburger-btn     { display: none; }
  .header-nav        { display: flex; }
  .masuk-btn         { display: inline-flex; }
}
@media (min-width: 1280px) {
  .header-inner { padding: 0 clamp(24px, 3vw, 48px); }
}

@media (prefers-reduced-motion: reduce) {
  .strip-track { animation: none; }
}
`

function TickerSet() {
  return (
    <div className="strip-set">
      {TICKER_ITEMS.map((item, i) => {
        if (item.type === 'logo-ntt') {
          return (
            <span key={i} className="strip-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-ntt.png" alt="Logo NTT" className="strip-logo" />
              <span className="strip-text gold">{item.text}</span>
            </span>
          )
        }
        if (item.type === 'logo-stikom') {
          return (
            <span key={i} className="strip-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/stikom.png" alt="Logo STIKOM" className="strip-logo" />
              <span className="strip-text">{item.text}</span>
            </span>
          )
        }
        return (
          <span key={i} className="strip-item">
            <span className="strip-dot" />
            <span className="strip-text">{item.text}</span>
          </span>
        )
      })}
    </div>
  )
}

export default function HeaderPublik() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => {
    const styleId = 'header-publik-css'
    if (!document.getElementById(styleId)) {
      const el = document.createElement('style')
      el.id = styleId
      el.textContent = HEADER_CSS
      document.head.appendChild(el)
    }
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* ══ KOP SURAT — berita berjalan + kode referensi statis ══ */}
      <div className="top-strip" role="marquee" aria-label="Informasi instansi">
        <div className="strip-marquee">
          <div className="strip-track">
            <TickerSet />
            <TickerSet />
          </div>
        </div>
        <span className="strip-code">ANJAB–ABK / SMA·SMK·SLB / PROV.NTT</span>
      </div>
      <div className="header-rule" />

      {/* ══ MAIN HEADER ══ */}
      <header
        className={`header-main${mounted && scrolled ? ' scrolled' : ''}`}
        suppressHydrationWarning
      >
        <div className="header-inner">

          {/* Logo + wordmark */}
          <Link href="/" className="header-logo">
            <div className="header-logo-img">
              <div className="header-logo-img-inner">
                <Image
                  src="/logo-ntt.png"
                  alt="Logo Provinsi NTT"
                  fill
                  className="object-contain"
                  sizes="(max-width:640px) 28px, (max-width:1024px) 32px, 38px"
                  priority
                />
              </div>
            </div>
            <div>
              <span className="header-wordmark">Biro Organisasi</span>
              <span className="header-logo-sub">Prov. Nusa Tenggara Timur</span>
            </div>
          </Link>

          <div className="header-vdivider" />

          {/* Nav desktop */}
          <nav className="header-nav">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="nav-link-pub">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Kanan */}
          <div className="header-right">
            <div className="header-sys-info">
              <p className="sys-label">Sistem Informasi</p>
              <p className="sys-title">PERHITUNGAN-KEBUTUHAN-GURU</p>
            </div>

            {/* Tombol Masuk — desktop ≥768px, gaya cap/stempel resmi */}
            <Link href="/login" className="masuk-btn">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              MASUK PORTAL
            </Link>

            {/* Hamburger — mobile <768px */}
            <button
              onClick={() => setOpen(o => !o)}
              className="hamburger-btn"
              suppressHydrationWarning
              aria-label="Toggle menu"
            >
              {mounted && open
                ? <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div
          className="mobile-drawer"
          suppressHydrationWarning
          style={{ maxHeight: mounted && open ? '480px' : '0', opacity: mounted && open ? 1 : 0 }}
        >
          <div className="mobile-drawer-inner">
            <div className="mobile-drawer-brand">
              <div style={{ position:'relative', width:38, height:38, flexShrink:0 }}>
                <Image src="/logo-ntt.png" alt="Logo NTT" fill className="object-contain" sizes="38px" />
              </div>
              <div>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize:15, fontWeight:600, color:'#FFFFFF', margin:0 }}>e-SIPKG</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', margin:'2px 0 0' }}>Biro Organisasi Setda Prov. NTT</p>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="mobile-nav-link">
                  {link.label}
                </Link>
              ))}
            </div>
            <Link href="/login" onClick={() => setOpen(false)} className="mobile-masuk-full">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              Masuk Portal
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
