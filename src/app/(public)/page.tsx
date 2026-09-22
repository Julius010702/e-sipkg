'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'

const PAGE_CSS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
@keyframes heroFade{from{opacity:0}to{opacity:1}}
html,body{scroll-behavior:smooth;font-family:'Inter',system-ui,-apple-system,sans-serif}
h1,h2,h3,.heading-font{font-family:'Fraunces',Georgia,serif;font-weight:700;line-height:1.1;letter-spacing:-0.01em}
.figure-mono{font-family:'IBM Plex Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}

:root{
  --ink:#0E3A8F;
  --ink-2:#1450A8;
  --ink-3:#2E6FC4;
  --paper:#FFFFFF;
  --brass:#D9A400;
  --brass-light:#F4C430;
  --stamp:#0B2E6B;
  --sage:#2E7D5B;
}

/* ── HERO (full-bleed foto + overlay) ───────────────────────────── */
.hero-full{position:relative;width:100%;overflow:hidden;background:var(--ink);min-height:clamp(480px,58vw,640px)}
.hero-bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;animation:heroFade .6s ease}
.hero-bg-fallback{position:absolute;inset:0;background:linear-gradient(150deg,var(--ink) 0%,var(--ink-2) 55%,var(--ink) 100%)}
.hero-bg-fallback::after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px);background-size:44px 44px}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(14,58,143,0.90) 0%,rgba(14,58,143,0.74) 30%,rgba(14,58,143,0.34) 58%,rgba(14,58,143,0.08) 100%),linear-gradient(0deg,rgba(14,58,143,0.42) 0%,transparent 42%)}
.hero-top-accent{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--brass-light),var(--brass) 55%,transparent 100%);z-index:2}
.hero-content{position:relative;z-index:2;max-width:1280px;margin:0 auto;padding:clamp(64px,9vw,110px) clamp(16px,4vw,40px) clamp(56px,7vw,84px);display:flex;flex-direction:column;justify-content:flex-end;min-height:clamp(480px,58vw,640px)}
.hero-text-panel{max-width:600px;padding:clamp(22px,3vw,34px) clamp(22px,3.2vw,36px)}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:var(--brass-light);background:rgba(244,196,48,0.12);border:1px solid rgba(244,196,48,0.4);padding:6px 15px;margin-bottom:20px;width:fit-content}
.hero-eyebrow-dot{width:5px;height:5px;border-radius:50%;background:var(--brass-light);flex-shrink:0}
.hero-title{color:var(--paper);font-weight:700;font-size:clamp(28px,4.6vw,48px);line-height:1.1;letter-spacing:-0.015em;margin:0 0 12px;max-width:620px;text-shadow:0 2px 12px rgba(0,0,0,.5)}
.hero-subtitle{color:var(--brass-light);font-weight:600;font-size:clamp(12px,1.25vw,14px);letter-spacing:0.04em;text-transform:uppercase;margin:0 0 18px;max-width:600px;line-height:1.5;text-shadow:0 1px 8px rgba(0,0,0,.55)}
.hero-divider{width:44px;height:2px;background:var(--brass-light);margin-bottom:16px}
.hero-desc{color:rgba(255,255,255,.9);font-size:clamp(13px,1.25vw,15px);margin:0 0 30px;max-width:460px;line-height:1.65;text-shadow:0 1px 8px rgba(0,0,0,.6)}
.hero-cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:38px}
.hero-controls{display:flex;align-items:center;gap:14px}
.hero-arrow{width:34px;height:34px;border-radius:50%;border:1.3px solid rgba(244,196,48,.4);background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;color:var(--paper);cursor:pointer;transition:all .18s;flex-shrink:0;padding:0}
.hero-arrow:hover{background:var(--brass-light);border-color:var(--brass-light);color:var(--ink)}
.hero-progress-track{width:52px;height:2px;background:rgba(255,255,255,.24);overflow:hidden;position:relative}
.hero-progress-fill{height:100%;background:var(--brass-light);transition:width .3s}
.hero-counter{font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:rgba(255,255,255,.65);font-weight:500;letter-spacing:.03em}

.hero-stats-panel{position:absolute;right:clamp(16px,4vw,48px);bottom:clamp(26px,4vw,56px);z-index:2;display:flex;gap:clamp(18px,2.4vw,34px);max-width:520px}
.hero-stat-mini{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px}
.hero-stat-mini-icon{width:34px;height:34px;border-radius:8px;background:rgba(244,196,48,.22);border:1px solid rgba(244,196,48,.55);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 10px rgba(0,0,0,.25)}
.hero-stat-mini p{margin:0}
.hero-stat-mini-value{display:block;font-family:'IBM Plex Mono',monospace;font-size:22px;font-weight:700;color:var(--paper);line-height:1;text-shadow:0 2px 8px rgba(0,0,0,.55)}
.hero-stat-mini-label{display:block;font-size:10px;color:rgba(255,255,255,.85);font-weight:600;margin-top:4px;line-height:1.3;text-shadow:0 1px 4px rgba(0,0,0,.6);white-space:nowrap}
@media (max-width:900px){.hero-stats-panel{display:none}}
@media (max-width:640px){.hero-content{padding-top:88px}.hero-cta-row{width:100%}.hero-cta-row a{flex:1;justify-content:center}}

.btn-gold{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--brass-light),var(--brass));color:#1a1300;font-weight:700;font-size:clamp(13px,1.4vw,15px);padding:clamp(13px,2vw,16px) clamp(28px,4vw,40px);border-radius:4px;text-decoration:none;box-shadow:0 4px 16px rgba(217,164,0,0.28);letter-spacing:0.02em;transition:all 0.2s ease}
.btn-gold:hover{filter:brightness(1.06);transform:translateY(-1px)}
.btn-outline-white{display:inline-flex;align-items:center;gap:8px;background:transparent;border:1.3px solid rgba(255,255,255,0.4);color:var(--paper);font-weight:600;font-size:clamp(13px,1.4vw,15px);padding:clamp(11.5px,1.8vw,14.5px) clamp(26px,4vw,38px);border-radius:4px;text-decoration:none;letter-spacing:0.02em;transition:all 0.18s}
.btn-outline-white:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.65)}
.section-navy{background:var(--ink-2)}
.section-dark{background:linear-gradient(160deg,var(--ink) 0%,var(--ink-2) 100%)}
.section-white{background:#fff}
.section-light{background:#F5F8FC}
.section-label{font-size:11px;font-weight:600;letter-spacing:0.12em;color:#3B5A8A;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.section-label::before,.section-label::after{content:'';flex:1;max-width:32px;height:1px;background:rgba(20,80,168,0.35)}
.contact-row{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #eef3fb;align-items:flex-start}
.contact-row:last-child{border-bottom:none}
.contact-label{width:80px;flex-shrink:0;font-size:12px;color:#9ca3af;font-weight:500;padding-top:1px}
.contact-value{font-size:13px;color:#0E3A8F;font-weight:600;line-height:1.45}
.quick-stat-card{background:#fff;border-radius:6px;border-top:3px solid var(--brass);padding:18px 16px;box-shadow:0 2px 12px rgba(14,58,143,0.08);border-left:1px solid #eaf0f9;border-right:1px solid #eaf0f9;border-bottom:1px solid #eaf0f9;display:flex;align-items:center;gap:12px;transition:transform 0.22s,box-shadow 0.22s}
.quick-stat-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(14,58,143,0.14)}
.gov-badge{display:inline-flex;align-items:center;gap:7px;font-size:9.5px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:var(--brass-light);background:rgba(244,196,48,0.1);border:1px solid rgba(244,196,48,0.3);padding:4px 13px}
.gov-badge-dot{width:4px;height:4px;border-radius:50%;background:var(--brass-light)}
`

type SlideData = { id: string; src: string; alt: string; urutan: number; aktif: boolean }

/* ─── Types (dipindah ke atas agar bisa dipakai HeroSlider) ─────────── */
type Stats = {
  totalSekolah: number; totalSMA: number; totalSMK: number; totalSLB: number
  totalWilayah: number; totalPNS: number; totalPPPK: number
  totalASN: number; totalKebutuhan: number; selisih: number
  rekapWilayah: { nama: string; sekolah: number; kebutuhan: number; asn: number; selisih: number }[]
}

/* ─── Ikon garis sederhana — pengganti emoji ─────────────────────────── */
const IconRuler = (p: { color: string }) => (
  <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke={p.color} strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5l5.5-5.5m2 2l2-2m2 2l2-2M19 3L3 19l2 2L21 5l-2-2z"/>
  </svg>
)
const IconSync = (p: { color: string }) => (
  <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke={p.color} strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115-4.5M20 15a9 9 0 01-15 4.5"/>
  </svg>
)
const IconChart = (p: { color: string }) => (
  <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke={p.color} strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V9m6 8V5m-11 12v-4m16 4V3M4 21h16"/>
  </svg>
)
const IconSchool = (p: { color: string }) => (
  <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke={p.color} strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
  </svg>
)
const IconEmpty = (p: { color: string }) => (
  <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke={p.color} strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l2-3h14l2 3M3 7v12a1 1 0 001 1h16a1 1 0 001-1V7M3 7h18M9 12h6"/>
  </svg>
)

function HeroSlider({ stats }: { stats: Stats }) {
  const [slides, setSlides] = useState<SlideData[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    fetch('/api/admin/slide')
      .then(r => r.json())
      .then(d => {
        const list: SlideData[] = Array.isArray(d.data) ? d.data : []
        const aktifSaja = list.filter(s => s.aktif).sort((a, b) => a.urutan - b.urutan)
        if (aktifSaja.length > 0) setSlides(aktifSaja)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setActive(a => (a + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [slides.length])

  useEffect(() => { if (active >= slides.length) setActive(0) }, [slides, active])

  const current = slides[active]

  const goPrev = () => setActive(a => (a - 1 + slides.length) % slides.length)
  const goNext = () => setActive(a => (a + 1) % slides.length)

  return (
    <div className="hero-full">
      <div className="hero-top-accent" />
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={current.id} className="hero-bg-img" src={current.src} alt={current.alt} />
      ) : (
        <div className="hero-bg-fallback" />
      )}


      <div className="hero-content">
        <div className="hero-text-panel">
          <span className="hero-eyebrow"><span className="hero-eyebrow-dot" />Biro Organisasi · Setda NTT</span>

          <h1 className="heading-font hero-title">e-SIPKG Nusa Tenggara Timur</h1>
          <p className="hero-subtitle">Sistem Informasi Perhitungan Kebutuhan Guru SMA / SMK / SLB</p>

          <div className="hero-divider" />
          <p className="hero-desc">Melayani dengan sepenuh hati — data guru yang akurat, adil, dan transparan untuk pemerataan pendidikan di seluruh Provinsi NTT.</p>

          <div className="hero-cta-row">
            <Link href="#tentang" className="btn-gold">
              Profil Kami
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            <Link href="#statistik" className="btn-outline-white">Lihat Statistik</Link>
          </div>

          {slides.length > 1 && (
            <div className="hero-controls">
              <button className="hero-arrow" onClick={goPrev} aria-label="Slide sebelumnya">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button className="hero-arrow" onClick={goNext} aria-label="Slide berikutnya">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
              <div className="hero-progress-track">
                <div className="hero-progress-fill" style={{ width: `${((active + 1) / slides.length) * 100}%` }} />
              </div>
              <span className="hero-counter">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
            </div>
          )}
        </div>
      </div>


      {/* Panel statistik mengambang */}
      <div className="hero-stats-panel">
        <div className="hero-stat-mini">
          <div className="hero-stat-mini-icon">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#F4C430" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>
          </div>
          <p>
            <span className="hero-stat-mini-value">{stats.totalSekolah}</span>
            <span className="hero-stat-mini-label">Sekolah SMA/SMK/SLB</span>
          </p>
        </div>
        <div className="hero-stat-mini">
          <div className="hero-stat-mini-icon">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#F4C430" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <p>
            <span className="hero-stat-mini-value">{stats.totalWilayah}</span>
            <span className="hero-stat-mini-label">Kabupaten/Kota</span>
          </p>
        </div>
        <div className="hero-stat-mini">
          <div className="hero-stat-mini-icon">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#F4C430" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <p>
            <span className="hero-stat-mini-value">{stats.totalASN.toLocaleString('id-ID')}</span>
            <span className="hero-stat-mini-label">Guru ASN Terdata</span>
          </p>
        </div>
        <div className="hero-stat-mini">
          <div className="hero-stat-mini-icon">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#F4C430" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          </div>
          <p>
            <span className="hero-stat-mini-value">100%</span>
            <span className="hero-stat-mini-label">Layanan PPID</span>
          </p>
        </div>
      </div>
    </div>
  )
}

type KontakInfo = {
  unit: string; alamat: string; telepon: string; email: string
  jamKerja: string; namaInstansi: string; namaProvinsi: string; emailAkses: string
}

const EMPTY: Stats = {
  totalSekolah: 0, totalSMA: 0, totalSMK: 0, totalSLB: 0,
  totalWilayah: 22, totalPNS: 0, totalPPPK: 0,
  totalASN: 0, totalKebutuhan: 0, selisih: 0, rekapWilayah: [],
}

const DEFAULT_KONTAK: KontakInfo = {
  unit:         'Bagian Kelembagaan dan Analisis Jabatan',
  alamat:       'Jl. El Tari No. 52, Kota Kupang, NTT',
  telepon:      '(0380) 821710',
  email:        'biroorganisasi@nttprov.go.id',
  jamKerja:     'Senin–Jumat, 07.30–16.00 WITA',
  namaInstansi: 'Biro Organisasi Setda',
  namaProvinsi: 'Provinsi Nusa Tenggara Timur',
  emailAkses:   'biroorganisasi@nttprov.go.id',
}

/* ─── Hooks ──────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.08 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, direction = 'up', className = '', style = {} }: {
  children: React.ReactNode; delay?: number
  direction?: 'up' | 'left' | 'right' | 'down'; className?: string
  style?: React.CSSProperties
}) {
  const { ref, visible } = useReveal()
  const map = { up: 'translateY(30px)', down: 'translateY(-30px)', left: 'translateX(-30px)', right: 'translateX(30px)' }
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0,0)' : map[direction],
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      ...style,
    }}>{children}</div>
  )
}

/* ─── AnimatedCounter ────────────────────────────────────────────────── */
function AnimatedCounter({ target }: { target: number }) {
  const { ref, visible } = useReveal()
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const started = useRef(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted || !visible || started.current || target === 0) return
    started.current = true
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1200, 1)
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [mounted, visible, target])
  return <span ref={ref} className="figure-mono" suppressHydrationWarning>{mounted ? count.toLocaleString('id-ID') : 0}</span>
}

/* ─── Sub-components ─────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay = 0 }: { icon: React.ReactNode; title: string; desc: string; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderTop: '3px solid rgba(244,196,48,0.7)', borderRadius: 6, padding: '26px 24px', height: '100%', transition: 'transform 0.25s, border-color 0.25s', cursor: 'default' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.borderColor = 'rgba(244,196,48,0.5)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.borderColor = 'rgba(255,255,255,0.16)' }}
      >
        <div style={{ marginBottom: 16 }}>{icon}</div>
        <h3 style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{desc}</p>
      </div>
    </Reveal>
  )
}

function StatCard({ label, value, accent, icon, delay = 0 }: { label: string; value: number; accent: string; icon: React.ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div
        style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${accent}55`, borderTop: `3px solid ${accent}`, borderRadius: 6, padding: '22px 18px 18px', textAlign: 'center', transition: 'transform 0.25s, background 0.25s' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.background = `${accent}1f` }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.background = 'rgba(255,255,255,0.07)' }}
      >
        <div style={{ width: 42, height: 42, borderRadius: 6, background: `${accent}22`, border: `1px solid ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{icon}</div>
        <p className="figure-mono" style={{ fontSize: 30, fontWeight: 600, color: 'var(--paper)', margin: 0, lineHeight: 1 }}><AnimatedCounter target={value} /></p>
        <div style={{ width: 22, height: 2, background: accent, margin: '10px auto 8px' }} />
        <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{label}</p>
      </div>
    </Reveal>
  )
}

function QuickStatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <Reveal>
      <div className="quick-stat-card">
        <div style={{ width: 42, height: 42, borderRadius: 6, background: '#F5F8FC', border: '1px solid #e2e9f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
        <div>
          <p className="figure-mono" style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#0E3A8F', lineHeight: 1.1 }}><AnimatedCounter target={value} /></p>
          <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#6b7280', fontWeight: 500 }}>{label}</p>
        </div>
      </div>
    </Reveal>
  )
}

function StatsTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0]
  return (
    <div style={{ background: 'rgba(10,30,74,0.96)', border: `1px solid ${p.payload.color}88`, borderRadius: 6, padding: '8px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{p.payload.name}</p>
      <p className="figure-mono" style={{ margin: '2px 0 0', fontSize: 16, color: p.payload.color, fontWeight: 700 }}>{p.value.toLocaleString('id-ID')}</p>
    </div>
  )
}

function StatsBarChart({ stats }: { stats: Stats }) {
  const chartData = [
    { name: 'Kebutuhan Guru', value: stats.totalKebutuhan, color: '#F4C430' },
    { name: 'Total ASN',      value: stats.totalASN,       color: '#6EA8E8' },
    { name: 'Kekurangan',     value: stats.selisih < 0 ? Math.abs(stats.selisih) : 0, color: '#E0776F' },
    { name: 'Kelebihan',      value: stats.selisih > 0 ? stats.selisih : 0,           color: '#4FB87F' },
    { name: 'PNS Aktif',      value: stats.totalPNS,       color: '#6EA8E8' },
    { name: 'PPPK Aktif',     value: stats.totalPPPK,      color: '#4FB87F' },
    { name: 'Sekolah',        value: stats.totalSekolah,   color: '#F4C430' },
    { name: 'Kab/Kota',       value: stats.totalWilayah,   color: '#FFFFFF' },
  ]
  return (
    <Reveal>
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 6, padding: 'clamp(16px,3vw,28px)', marginBottom: 28 }}>
        <p style={{ margin: '0 0 18px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
          Ringkasan Angka Kunci
        </p>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.62)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.16)' }}
                tickLine={false}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={54}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.06)' }} content={<StatsTooltip />} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={46}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v: number) => v.toLocaleString('id-ID')}
                  style={{ fill: 'rgba(255,255,255,0.85)', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── Main ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [stats, setStats]   = useState<Stats>(EMPTY)
  const [kontak, setKontak] = useState<KontakInfo>(DEFAULT_KONTAK)

  useEffect(() => {
    // Inject CSS
    const styleId = 'home-page-css'
    if (!document.getElementById(styleId)) {
      const el = document.createElement('style')
      el.id = styleId
      el.textContent = PAGE_CSS
      document.head.appendChild(el)
    }
    // Fetch stats publik
    fetch('/api/public/stats')
      .then(r => r.json())
      .then(d => { if (d.data) setStats(d.data) })
      .catch(() => {})
    // Fetch kontak dari DB (dikelola superadmin)
    fetch('/api/admin/kontak')
      .then(r => r.json())
      .then(d => { if (d.data) setKontak(d.data) })
      .catch(() => {})
  }, [])

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>

      {/* ── HERO BANNER (full-bleed foto + overlay) ───────────────────── */}
      <section style={{ position: 'relative' }}>
        <HeroSlider stats={stats} />
      </section>

      {/* ── QUICK STATS STRIP ───────────────────────────────────────── */}
      <section className="section-light" style={{ padding: 'clamp(20px,3vw,32px) 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
            <QuickStatCard
              value={stats.totalSekolah} label="Total Sekolah SMA/SMK/SLB"
              icon={<IconSchool color="#0E3A8F" />}
            />
            <QuickStatCard
              value={stats.totalASN} label="Total Guru ASN (PNS+PPPK)"
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2E7D5B" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
            />
            <QuickStatCard
              value={stats.totalWilayah} label="Kabupaten/Kota di NTT"
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#D9A400" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
            />
            <QuickStatCard
              value={stats.rekapWilayah.length} label="Wilayah Sudah Lapor / Tervalidasi"
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0E3A8F" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
          </div>
        </div>
      </section>

      {/* ── STATISTIK ───────────────────────────────────────────────── */}
      <section id="statistik" style={{ padding: 'clamp(56px,8vw,96px) 0', background: 'linear-gradient(160deg, var(--ink-2) 0%, var(--ink-3) 45%, var(--ink) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)', position: 'relative' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="gov-badge" style={{ marginBottom: 18 }}><span className="gov-badge-dot" />Data Publik<span className="gov-badge-dot" /></span>
            <h2 style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 'clamp(24px,4vw,40px)', margin: 0, lineHeight: 1.1 }}>
              Rekap Kebutuhan Guru<br />
              <span style={{ color: 'var(--brass-light)' }}>per Wilayah</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 14, fontSize: 14, maxWidth: 460, margin: '14px auto 0', lineHeight: 1.7 }}>
              Data hasil analisis jabatan guru SMA/SMK/SLB se-Provinsi Nusa Tenggara Timur
            </p>
          </Reveal>

          {/* Diagram ringkasan angka kunci */}
          <StatsBarChart stats={stats} />

          {/* Tabel rekap wilayah */}
          <Reveal>
            <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 20px 50px rgba(9,30,74,0.35)' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(46,111,196,0.45), rgba(14,58,143,0.95))', borderBottom: '1px solid rgba(244,196,48,0.28)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-ntt.png" alt="NTT" style={{ width: 34, height: 34, objectFit: 'contain' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--paper)', fontSize: 15 }}>Rekap per Kabupaten/Kota</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Provinsi Nusa Tenggara Timur · Tahun Berjalan</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4FB87F' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{stats.rekapWilayah.length} kab/kota terdaftar</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto', background: 'rgba(10,30,74,0.92)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 540 }}>
                  <thead>
                    <tr style={{ background: 'var(--ink-2)', borderBottom: '1px solid rgba(244,196,48,0.28)' }}>
                      {[
                        { label: 'Kabupaten / Kota', align: 'left'   as const },
                        { label: 'Sekolah',          align: 'center' as const },
                        { label: 'Kebutuhan',        align: 'center' as const },
                        { label: 'ASN',              align: 'center' as const },
                        { label: '▼ Kurang',         align: 'center' as const, color: '#F3B3AD' },
                        { label: '▲ Lebih',          align: 'center' as const, color: '#A8E3C1' },
                      ].map((h, i) => (
                        <th key={i} className="figure-mono" style={{ padding: '12px 16px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: h.color ?? 'rgba(255,255,255,0.7)', textAlign: h.align, whiteSpace: 'nowrap' }}>{h.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.rekapWilayah.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '52px 0', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
                          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}><IconEmpty color="rgba(255,255,255,0.35)" /></div>
                          Belum ada data tersedia
                        </td>
                      </tr>
                    ) : stats.rekapWilayah.map((w, i) => {
                      const kurang = w.selisih < 0 ? Math.abs(w.selisih) : 0
                      const lebih  = w.selisih > 0 ? w.selisih : 0
                      return (
                        <tr key={i}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', transition: 'background 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,196,48,0.08)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                        >
                          <td style={{ padding: '12px 16px', color: '#EAF0FB', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 3, height: 16, background: 'rgba(244,196,48,0.6)', flexShrink: 0 }} />{w.nama}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.65)' }}>{w.sekolah}</td>
                          <td className="figure-mono" style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--brass-light)' }}>{w.kebutuhan.toLocaleString('id-ID')}</td>
                          <td className="figure-mono" style={{ padding: '12px 16px', textAlign: 'center', color: '#BBDBFF' }}>{w.asn.toLocaleString('id-ID')}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {kurang > 0 && <span className="figure-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(224,119,111,0.2)', color: '#F3B3AD', fontWeight: 600, fontSize: 12.5, padding: '3px 10px', border: '1px solid rgba(224,119,111,0.4)' }}><span style={{ fontSize: 9 }}>▼</span>{kurang.toLocaleString('id-ID')}</span>}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {lebih > 0 && <span className="figure-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(79,184,127,0.2)', color: '#A8E3C1', fontWeight: 600, fontSize: 12.5, padding: '3px 10px', border: '1px solid rgba(79,184,127,0.4)' }}><span style={{ fontSize: 9 }}>▲</span>{lebih.toLocaleString('id-ID')}</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'linear-gradient(135deg, rgba(46,111,196,0.4), rgba(14,58,143,0.98))', borderTop: '2px solid rgba(244,196,48,0.32)' }}>
                      <td style={{ padding: '14px 16px', color: 'var(--brass-light)', fontWeight: 700, fontSize: 12.5, letterSpacing: '0.03em' }}>∑ &nbsp;TOTAL KESELURUHAN</td>
                      <td className="figure-mono" style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--paper)', fontWeight: 600 }}>{stats.totalSekolah}</td>
                      <td className="figure-mono" style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--brass-light)', fontWeight: 700, fontSize: 14 }}>{stats.totalKebutuhan.toLocaleString('id-ID')}</td>
                      <td className="figure-mono" style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--paper)', fontWeight: 600 }}>{stats.totalASN.toLocaleString('id-ID')}</td>
                      <td className="figure-mono" style={{ padding: '14px 16px', textAlign: 'center', color: '#F3B3AD', fontWeight: 700 }}>{stats.selisih < 0 ? Math.abs(stats.selisih).toLocaleString('id-ID') : '—'}</td>
                      <td className="figure-mono" style={{ padding: '14px 16px', textAlign: 'center', color: '#A8E3C1', fontWeight: 700 }}>{stats.selisih > 0 ? stats.selisih.toLocaleString('id-ID') : '—'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div style={{ background: 'rgba(10,30,74,0.96)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>* Guru Mapel = (Jam × Rombel) / 24 &nbsp;·&nbsp; Guru BK = Siswa / 150</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Sumber: Biro Organisasi Setda Prov. NTT</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TENTANG ─────────────────────────────────────────────────── */}
      <section id="tentang" className="section-dark" style={{ padding: 'clamp(48px,7vw,80px) 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 48 } as React.CSSProperties}>
            <p className="section-label" style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.55)' }}>Tentang Sistem</p>
            <h2 style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 'clamp(22px,3.5vw,34px)', margin: 0 }}>Apa itu <span style={{ color: 'var(--brass-light)' }}>e-SIPKG</span>?</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: 10, fontSize: 14, maxWidth: 520, margin: '10px auto 0' }}>
              Dikembangkan oleh Biro Organisasi Bagian Kelembagaan dan Analisis Jabatan, Setda Prov. NTT
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginBottom: 32 }}>
            <FeatureCard icon={<IconRuler color="#F4C430" />} title="Berbasis ANJAB & ABK" desc="Perhitungan kebutuhan guru menggunakan metodologi Analisis Jabatan dan Analisis Beban Kerja sesuai regulasi yang berlaku." delay={0} />
            <FeatureCard icon={<IconSync color="#F4C430" />} title="Real-time & Terintegrasi" desc="Data dari seluruh sekolah SMA/SMK/SLB terhubung ke sistem untuk dianalisis dan divalidasi oleh Biro Organisasi." delay={0.1} />
            <FeatureCard icon={<IconChart color="#F4C430" />} title="Laporan & Distribusi" desc="Menghasilkan rekomendasi distribusi guru dan laporan ANJAB & ABK yang dapat dicetak dan diexport ke berbagai format." delay={0.2} />
          </div>
          <Reveal>
            <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 6, padding: 'clamp(20px,3vw,32px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 64, height: 64, flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-ntt.png" alt="Logo NTT" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 11, color: 'var(--brass-light)', fontWeight: 700, letterSpacing: '0.07em', margin: 0, marginBottom: 4 }}>PENGELOLA SISTEM</p>
                <h3 style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 17, margin: 0 }}>Biro Organisasi Setda Provinsi NTT</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '4px 0 0' }}>Bagian Kelembagaan dan Analisis Jabatan</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'SMA', count: stats.totalSMA, bg: 'rgba(110,168,232,0.2)', border: 'rgba(110,168,232,0.4)' },
                  { label: 'SMK', count: stats.totalSMK, bg: 'rgba(79,184,127,0.18)',   border: 'rgba(79,184,127,0.36)' },
                  { label: 'SLB', count: stats.totalSLB, bg: 'rgba(244,196,48,0.18)',   border: 'rgba(244,196,48,0.4)' },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: '10px 18px', textAlign: 'center', minWidth: 68 }}>
                    <p className="figure-mono" style={{ color: 'var(--paper)', fontWeight: 600, fontSize: 20, margin: 0 }}><AnimatedCounter target={s.count} /></p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500, margin: '2px 0 0' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── KONTAK ──────────────────────────────────────────────────── */}
      <section id="kontak" className="section-light" style={{ padding: 'clamp(48px,7vw,80px) 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 44 } as React.CSSProperties}>
            <p className="section-label" style={{ justifyContent: 'center' }}>Hubungi Kami</p>
            <h2 style={{ color: '#0E3A8F', fontWeight: 700, fontSize: 'clamp(22px,3.5vw,34px)', margin: 0 }}>
              Kontak &amp; <span style={{ color: '#D9A400' }}>Informasi</span>
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>

            {/* Kartu kiri */}
            <Reveal direction="left">
              <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #e2e9f4', boxShadow: '0 2px 14px rgba(14,58,143,0.07)', padding: 'clamp(20px,3vw,32px)', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #eef3fb' }}>
                  <div style={{ width: 46, height: 46, flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-ntt.png" alt="Logo NTT" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#0E3A8F', fontSize: 15 }}>{kontak.namaInstansi}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{kontak.namaProvinsi}</p>
                  </div>
                </div>
                <div>
                  {[
                    { label: 'Unit',      value: kontak.unit },
                    { label: 'Alamat',    value: kontak.alamat },
                    { label: 'Telepon',   value: kontak.telepon },
                    { label: 'Email',     value: kontak.email },
                    { label: 'Jam Kerja', value: kontak.jamKerja },
                  ].map((item, i) => (
                    <div key={i} className="contact-row">
                      <span className="contact-label">{item.label}</span>
                      <span className="contact-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Kartu kanan */}
            <Reveal direction="right">
              <div style={{ background: 'var(--ink)', border: '1px solid rgba(244,196,48,0.28)', borderRadius: 6, padding: 'clamp(20px,3vw,32px)', height: '100%' }}>
                <div style={{ width: 42, height: 42, borderRadius: 6, background: 'rgba(244,196,48,0.16)', border: '1.3px solid rgba(244,196,48,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="#F4C430" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                </div>
                <h3 style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 16, margin: '0 0 10px' }}>Butuh Akses Portal?</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.7, margin: '0 0 20px' }}>
                  Akun portal e-SIPKG diberikan oleh Administrator kepada sekolah-sekolah yang terdaftar. Hubungi Biro Organisasi untuk mendapatkan akses.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 6, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brass-light)', flexShrink: 0 }} />
                    <p style={{ color: 'var(--paper)', fontWeight: 600, fontSize: 13, margin: 0 }}>{kontak.namaInstansi} Prov. NTT</p>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '0 0 4px', paddingLeft: 15 }}>{kontak.unit}</p>
                  <p style={{ color: 'var(--brass-light)', fontSize: 13, margin: 0, paddingLeft: 15, fontWeight: 600 }}>{kontak.emailAkses}</p>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

    </div>
  )
}
