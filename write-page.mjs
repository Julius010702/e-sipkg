const fs = require('fs');

const content = `'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

function useReveal() {
  const ref = useRef(null)
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

function Reveal({ children, delay = 0, direction = 'up', className = '', style = {} }) {
  const { ref, visible } = useReveal()
  const map = { up:'translateY(40px)', down:'translateY(-40px)', left:'translateX(-40px)', right:'translateX(40px)' }
  return (
    <div ref={ref} className={className} style={{ opacity:visible?1:0, transform:visible?'translate(0,0)':map[direction], transition:\`opacity 0.7s ease \${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) \${delay}s\`, ...style }}>{children}</div>
  )
}

function CurtainReveal({ children, delay = 0, className = '' }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className={\`relative overflow-hidden \${className}\`}>
      {children}
      <div style={{ position:'absolute', inset:0, background:'#1e40af', transformOrigin:'left', transform:visible?'scaleX(0)':'scaleX(1)', transition:\`transform 0.8s cubic-bezier(0.77,0,0.18,1) \${delay}s\`, zIndex:10 }} />
      <div style={{ position:'absolute', inset:0, background:'#1e3a8a', transformOrigin:'right', transform:visible?'scaleX(0)':'scaleX(1)', transition:\`transform 0.8s cubic-bezier(0.77,0,0.18,1) \${delay+0.07}s\`, zIndex:9 }} />
    </div>
  )
}

function AnimatedCounter({ target }) {
  const { ref, visible } = useReveal()
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const started = useRef(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted || !visible || started.current || target === 0) return
    started.current = true
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / 1200, 1)
      setCount(Math.round((1 - Math.pow(1-p,3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [mounted, visible, target])
  return <span ref={ref} suppressHydrationWarning>{mounted ? count : 0}</span>
}

const EMPTY = { totalSekolah:0, totalSMA:0, totalSMK:0, totalSLB:0, totalWilayah:22, totalPNS:0, totalPPPK:0, totalASN:0, totalKebutuhan:0, selisih:0, rekapWilayah:[] }

export default function HomePage() {
  const [stats, setStats] = useState(EMPTY)
  const [heroVisible, setHeroVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/public/stats').then(r=>r.json()).then(d=>{ if(d.data) setStats(d.data) }).catch(()=>{})
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const anim = (delay) => ({
    opacity: heroVisible ? 1 : 0,
    transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: \`opacity 0.6s ease \${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) \${delay}s\`,
  })

  const statCards = [
    { label:'Total Sekolah', value:stats.totalSekolah, sub:\`SMA: \${stats.totalSMA} SMK: \${stats.totalSMK} SLB: \${stats.totalSLB}\`, icon:'🏫', color:'rgba(59,130,246,0.15)' },
    { label:'Kabupaten/Kota', value:stats.totalWilayah, sub:'se-Provinsi NTT', icon:'🗺️', color:'rgba(99,102,241,0.15)' },
    { label:'Total ASN', value:stats.totalASN, sub:\`PNS: \${stats.totalPNS} PPPK: \${stats.totalPPPK}\`, icon:'👨\u200d🏫', color:'rgba(139,92,246,0.15)' },
    { label:'Kebutuhan Guru', value:stats.totalKebutuhan, sub:stats.selisih<0?\`Kurang \${Math.abs(stats.selisih)} guru\`:stats.selisih>0?\`Lebih \${stats.selisih} guru\`:'Belum ada data', icon:'📊', color:'rgba(6,182,212,0.15)' },
  ]

  const S = { section_hero:{ width:'100%', minHeight:'calc(100dvh - 64px)', display:'flex', alignItems:'center', background:'linear-gradient(135deg,#061633 0%,#0c2461 40%,#1a3a8f 70%,#1e40af 100%)', color:'#fff', position:'relative', overflow:'hidden' }, container:{ position:'relative', width:'100%', maxWidth:1280, margin:'0 auto', padding:'clamp(24px,5vw,64px) clamp(16px,4vw,64px)', zIndex:1 }, row:{ display:'flex', flexDirection:'row', alignItems:'center', gap:'clamp(20px,4vw,64px)', flexWrap:'wrap' }, col_left:{ flex:'1 1 300px', minWidth:0 }, col_right:{ flex:'1 1 260px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(8px,1.5vw,16px)', minWidth:0 }, section:{ width:'100%', padding:'clamp(48px,8vw,80px) 0' }, inner:{ maxWidth:1280, margin:'0 auto', padding:'0 clamp(16px,4vw,48px)' }, heading:{ textAlign:'center', marginBottom:'clamp(32px,5vw,48px)' }, grid3:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'clamp(12px,2vw,24px)' }, grid4:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'clamp(8px,1.5vw,16px)', marginBottom:'clamp(24px,3vw,40px)' }, grid2:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'clamp(16px,2.5vw,32px)', maxWidth:900, margin:'0 auto' } }

  return (
    <>
      <style>{\`
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes bounceY{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(7px);opacity:.5}}
        *{box-sizing:border-box} html{scroll-behavior:smooth}
        .hero-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.25)!important}
        .hero-btn-secondary:hover{background:rgba(255,255,255,0.12)!important}
        .card-hover:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.1)}
      \`}</style>

      <div style={{width:'100%',overflowX:'hidden'}}>

        <section style={S.section_hero}>
          <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'32px 32px'}}/>
          <div style={{position:'absolute',top:'-20%',left:'-10%',width:'50vw',height:'50vw',maxWidth:600,maxHeight:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(96,165,250,0.25),transparent 70%)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:'-20%',right:'-10%',width:'40vw',height:'40vw',maxWidth:500,maxHeight:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(129,140,248,0.2),transparent 70%)',pointerEvents:'none'}}/>

          <div style={S.container}>
            <div style={S.row}>
              <div style={S.col_left}>
                <div style={anim(0.05)}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
                    <div style={{width:'clamp(44px,6vw,60px)',height:'clamp(44px,6vw,60px)',flexShrink:0,position:'relative',animation:'float 4s ease-in-out infinite'}}>
                      <Image src="/logo-ntt.png" alt="Logo NTT" fill style={{objectFit:'contain'}} sizes="60px" priority/>
                    </div>
                    <div>
                      <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:99,padding:'4px 12px',fontSize:10,fontWeight:700,color:'#bfdbfe',textTransform:'uppercase',letterSpacing:2,marginBottom:4}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>
                        Setda Provinsi NTT
                      </div>
                      <p style={{fontSize:'clamp(10px,1.2vw,12px)',color:'#93c5fd',margin:0}}>Biro Organisasi — Bag. Kelembagaan & Analisis Jabatan</p>
                    </div>
                  </div>
                </div>
                <div style={anim(0.15)}>
                  <p style={{fontSize:'clamp(9px,1vw,11px)',letterSpacing:4,textTransform:'uppercase',color:'rgba(147,197,253,0.7)',fontStyle:'italic',margin:'0 0 4px'}}>Sistem Informasi</p>
                  <h1 style={{fontSize:'clamp(36px,7vw,80px)',fontWeight:900,textTransform:'uppercase',letterSpacing:-2,lineHeight:0.9,margin:'0 0 8px'}}>E&#8209;SIPKG</h1>
                  <p style={{fontSize:'clamp(13px,2vw,22px)',fontWeight:700,margin:'0 0 16px',background:'linear-gradient(90deg,#93c5fd,#e0e7ff,#93c5fd)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 4s linear infinite'}}>Pemerataan & Kebutuhan Guru</p>
                </div>
                <div style={anim(0.3)}>
                  <p style={{fontSize:'clamp(11px,1.3vw,15px)',color:'rgba(219,234,254,0.85)',lineHeight:1.8,margin:'0 0 24px',maxWidth:520}}>
                    Sistem Informasi Pemerataan dan Kebutuhan Guru dikelola oleh <strong style={{color:'#fff'}}>Biro Organisasi Bagian Kelembagaan dan Analisis Jabatan</strong> Setda Provinsi NTT untuk perencanaan guru SMA, SMK, dan SLB berbasis ANJAB & ABK.
                  </p>
                </div>
                <div style={{...anim(0.42),display:'flex',gap:12,flexWrap:'wrap'}}>
                  <Link href="/login" className="hero-btn-primary" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#fff',color:'#1e3a8a',fontWeight:700,padding:'clamp(10px,1.5vw,14px) clamp(20px,2.5vw,28px)',borderRadius:12,fontSize:'clamp(12px,1.2vw,14px)',textDecoration:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.2)',transition:'transform 0.2s,box-shadow 0.2s'}}>
                    <svg style={{width:16,height:16,flexShrink:0}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                    Masuk Portal
                  </Link>
                  <a href="#statistik" className="hero-btn-secondary" style={{display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(255,255,255,0.3)',color:'#fff',fontWeight:600,padding:'clamp(10px,1.5vw,14px) clamp(20px,2.5vw,28px)',borderRadius:12,fontSize:'clamp(12px,1.2vw,14px)',textDecoration:'none',background:'rgba(255,255,255,0.05)',transition:'background 0.2s'}}>
                    Lihat Statistik
                    <svg style={{width:15,height:15,animation:'bounceY 1.5s ease-in-out infinite'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </a>
                </div>
              </div>

              <div style={S.col_right}>
                {statCards.map((card,i) => (
                  <div key={i} style={{background:card.color,border:'1px solid rgba(255,255,255,0.12)',borderRadius:'clamp(12px,1.5vw,20px)',padding:'clamp(12px,2vw,24px)',backdropFilter:'blur(8px)',opacity:heroVisible?1:0,transform:heroVisible?'translateY(0)':'translateY(28px)',transition:\`opacity 0.6s ease \${0.3+i*0.1}s,transform 0.6s cubic-bezier(0.22,1,0.36,1) \${0.3+i*0.1}s\`}}>
                    <div style={{fontSize:'clamp(20px,2.5vw,30px)',marginBottom:8}}>{card.icon}</div>
                    <p style={{fontSize:'clamp(22px,3.5vw,40px)',fontWeight:900,color:'#fff',lineHeight:1,margin:'0 0 4px'}}><AnimatedCounter target={card.value}/></p>
                    <p style={{fontSize:'clamp(9px,1vw,12px)',fontWeight:600,color:'#bfdbfe',margin:'0 0 2px'}}>{card.label}</p>
                    <p style={{fontSize:'clamp(8px,0.9vw,11px)',color:'#93c5fd',margin:0,lineHeight:1.4}}>{card.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{position:'absolute',bottom:0,left:0,right:0,lineHeight:0,pointerEvents:'none'}}>
            <svg viewBox="0 0 1440 48" style={{width:'100%',display:'block'}} preserveAspectRatio="none">
              <path d="M0,48 C480,0 960,40 1440,16 L1440,48 Z" fill="#f9fafb"/>
            </svg>
          </div>
        </section>

        <section id="statistik" style={{...S.section,background:'#f9fafb'}}>
          <div style={S.inner}>
            <Reveal style={S.heading}>
              <p style={{fontSize:11,fontWeight:700,color:'#2563eb',textTransform:'uppercase',letterSpacing:3,marginBottom:8}}>Data Publik</p>
              <h2 style={{fontSize:'clamp(20px,3.5vw,36px)',fontWeight:800,color:'#0f172a',margin:'0 0 8px'}}>Rekap Kebutuhan Guru per Wilayah</h2>
              <p style={{fontSize:'clamp(12px,1.3vw,14px)',color:'#64748b',margin:0}}>Data hasil analisis jabatan guru SMA/SMK/SLB se-Provinsi NTT</p>
            </Reveal>
            <div style={S.grid4}>
              {[
                {label:'Total Kebutuhan',value:stats.totalKebutuhan,border:'#bfdbfe',bg:'#eff6ff',text:'#1e40af'},
                {label:'Total ASN (PNS+PPPK)',value:stats.totalASN,border:'#c7d2fe',bg:'#eef2ff',text:'#3730a3'},
                {label:'Kekurangan Guru',value:stats.selisih<0?Math.abs(stats.selisih):0,border:'#fecaca',bg:'#fef2f2',text:'#dc2626'},
                {label:'Kelebihan Guru',value:stats.selisih>0?stats.selisih:0,border:'#bbf7d0',bg:'#f0fdf4',text:'#16a34a'},
              ].map((c,i) => (
                <CurtainReveal key={i} delay={i*0.1}>
                  <div style={{border:\`2px solid \${c.border}\`,background:c.bg,borderRadius:16,padding:'clamp(12px,2vw,20px)',textAlign:'center'}}>
                    <p style={{fontSize:'clamp(24px,3.5vw,36px)',fontWeight:900,color:c.text,margin:'0 0 4px'}}><AnimatedCounter target={c.value}/></p>
                    <p style={{fontSize:'clamp(10px,1vw,12px)',color:'#6b7280',margin:0,fontWeight:500}}>{c.label}</p>
                  </div>
                </CurtainReveal>
              ))}
            </div>
            <CurtainReveal>
              <div style={{background:'#fff',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
                <div style={{padding:'clamp(12px,2vw,20px) clamp(16px,2.5vw,24px)',borderBottom:'1px solid #f3f4f6',background:'#f9fafb',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{position:'relative',width:28,height:28,flexShrink:0}}><Image src="/logo-ntt.png" alt="NTT" fill style={{objectFit:'contain'}} sizes="28px"/></div>
                    <h3 style={{fontSize:'clamp(12px,1.3vw,15px)',fontWeight:600,color:'#1f2937',margin:0}}>Rekap per Kabupaten/Kota — Provinsi NTT</h3>
                  </div>
                  <span style={{fontSize:11,color:'#9ca3af'}}>{stats.rekapWilayah.length} kab/kota</span>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',minWidth:480}}>
                    <thead>
                      <tr style={{background:'#1f2937',color:'#fff'}}>
                        {['Kabupaten/Kota','Sekolah','Kebutuhan','ASN','Kurang','Lebih'].map((h,i) => (
                          <th key={i} style={{padding:'clamp(8px,1.2vw,12px) clamp(8px,1.5vw,16px)',textAlign:i===0?'left':'center',fontSize:'clamp(10px,1vw,12px)',fontWeight:600}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.rekapWilayah.length===0?(
                        <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'#9ca3af',fontSize:13}}>Belum ada data</td></tr>
                      ):stats.rekapWilayah.map((w,i) => (
                        <tr key={i} style={{background:i%2===0?'#fff':'#f9fafb'}}>
                          <td style={{padding:'clamp(6px,1vw,10px) clamp(8px,1.5vw,16px)',fontWeight:500,color:'#1f2937',fontSize:'clamp(11px,1vw,13px)'}}>{w.nama}</td>
                          <td style={{textAlign:'center',fontSize:'clamp(11px,1vw,13px)',padding:'clamp(6px,1vw,10px) 8px'}}>{w.sekolah}</td>
                          <td style={{textAlign:'center',fontWeight:600,fontSize:'clamp(11px,1vw,13px)',padding:'clamp(6px,1vw,10px) 8px'}}>{w.kebutuhan}</td>
                          <td style={{textAlign:'center',fontSize:'clamp(11px,1vw,13px)',padding:'clamp(6px,1vw,10px) 8px'}}>{w.asn}</td>
                          <td style={{textAlign:'center',fontWeight:700,color:'#dc2626',fontSize:'clamp(11px,1vw,13px)',padding:'clamp(6px,1vw,10px) 8px'}}>{w.selisih<0?Math.abs(w.selisih):''}</td>
                          <td style={{textAlign:'center',fontWeight:700,color:'#059669',fontSize:'clamp(11px,1vw,13px)',padding:'clamp(6px,1vw,10px) 8px'}}>{w.selisih>0?w.selisih:''}</td>
                        </tr>
                      ))}
                      <tr style={{background:'#1e3a8a',color:'#fff',fontWeight:700}}>
                        <td style={{padding:'clamp(8px,1.2vw,12px) clamp(8px,1.5vw,16px)',fontSize:'clamp(11px,1vw,13px)'}}>TOTAL KESELURUHAN</td>
                        <td style={{textAlign:'center',fontSize:'clamp(11px,1vw,13px)'}}>{stats.totalSekolah}</td>
                        <td style={{textAlign:'center',fontSize:'clamp(11px,1vw,13px)'}}>{stats.totalKebutuhan}</td>
                        <td style={{textAlign:'center',fontSize:'clamp(11px,1vw,13px)'}}>{stats.totalASN}</td>
                        <td style={{textAlign:'center',color:'#fca5a5',fontSize:'clamp(11px,1vw,13px)'}}>{stats.selisih<0?Math.abs(stats.selisih):''}</td>
                        <td style={{textAlign:'center',color:'#6ee7b7',fontSize:'clamp(11px,1vw,13px)'}}>{stats.selisih>0?stats.selisih:''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{padding:'clamp(8px,1vw,12px) clamp(16px,2.5vw,24px)',background:'#f9fafb',borderTop:'1px solid #f3f4f6'}}>
                  <p style={{fontSize:'clamp(9px,0.9vw,11px)',color:'#9ca3af',margin:0}}>* Guru Mapel=(Jam x Rombel)/24 · Guru BK=Siswa/150 · Sumber: Biro Organisasi Setda Prov. NTT</p>
                </div>
              </div>
            </CurtainReveal>
          </div>
        </section>

        <section id="tentang" style={{...S.section,background:'#fff'}}>
          <div style={S.inner}>
            <Reveal style={S.heading}>
              <p style={{fontSize:11,fontWeight:700,color:'#2563eb',textTransform:'uppercase',letterSpacing:3,marginBottom:8}}>Tentang Sistem</p>
              <h2 style={{fontSize:'clamp(20px,3.5vw,36px)',fontWeight:800,color:'#0f172a',margin:'0 0 8px'}}>Apa itu e-SIPKG?</h2>
              <p style={{fontSize:'clamp(12px,1.3vw,14px)',color:'#64748b',margin:0}}>Dikembangkan oleh Biro Organisasi Bagian Kelembagaan dan Analisis Jabatan, Setda Prov. NTT</p>
            </Reveal>
            <div style={{...S.grid3,marginBottom:'clamp(24px,3vw,40px)'}}>
              {[
                {icon:'📐',title:'Berbasis ANJAB & ABK',desc:'Perhitungan kebutuhan guru menggunakan metodologi Analisis Jabatan dan Analisis Beban Kerja sesuai regulasi yang berlaku.'},
                {icon:'🔄',title:'Real-time & Terintegrasi',desc:'Data dari seluruh sekolah SMA/SMK/SLB terhubung ke sistem untuk dianalisis dan divalidasi oleh Biro Organisasi.'},
                {icon:'📊',title:'Laporan & Distribusi',desc:'Menghasilkan rekomendasi distribusi guru dan laporan ANJAB & ABK yang dapat dicetak dan diexport ke berbagai format.'},
              ].map((f,i) => (
                <Reveal key={i} delay={i*0.12} direction={i===0?'left':i===2?'right':'up'}>
                  <div className="card-hover" style={{background:'#f8fafc',borderRadius:16,padding:'clamp(20px,2.5vw,32px)',border:'1px solid #e2e8f0',height:'100%',boxSizing:'border-box',transition:'transform 0.25s,box-shadow 0.25s'}}>
                    <div style={{fontSize:'clamp(32px,4vw,48px)',marginBottom:12}}>{f.icon}</div>
                    <h3 style={{fontSize:'clamp(13px,1.3vw,16px)',fontWeight:700,color:'#0f172a',margin:'0 0 8px'}}>{f.title}</h3>
                    <p style={{fontSize:'clamp(11px,1.1vw,13px)',color:'#64748b',lineHeight:1.7,margin:0}}>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <div style={{background:'linear-gradient(to right,#1e3a8a,#312e81)',color:'#fff',borderRadius:20,padding:'clamp(20px,3vw,40px)',display:'flex',alignItems:'center',gap:'clamp(16px,3vw,32px)',flexWrap:'wrap'}}>
                <div style={{position:'relative',width:'clamp(56px,7vw,80px)',height:'clamp(56px,7vw,80px)',flexShrink:0}}>
                  <Image src="/logo-ntt.png" alt="Logo NTT" fill style={{objectFit:'contain'}} sizes="80px"/>
                </div>
                <div style={{flex:1,minWidth:180}}>
                  <p style={{fontSize:10,color:'#93c5fd',textTransform:'uppercase',letterSpacing:2,margin:'0 0 4px'}}>Pengelola Sistem</p>
                  <h3 style={{fontSize:'clamp(14px,1.8vw,20px)',fontWeight:700,margin:'0 0 4px'}}>Biro Organisasi Setda Provinsi NTT</h3>
                  <p style={{fontSize:'clamp(11px,1.1vw,13px)',color:'#bfdbfe',margin:0}}>Bagian Kelembagaan dan Analisis Jabatan</p>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {[{label:'SMA',count:stats.totalSMA,color:'rgba(59,130,246,0.3)'},{label:'SMK',count:stats.totalSMK,color:'rgba(99,102,241,0.3)'},{label:'SLB',count:stats.totalSLB,color:'rgba(139,92,246,0.3)'}].map((s,i) => (
                    <div key={i} style={{background:s.color,borderRadius:10,padding:'8px 16px',display:'flex',alignItems:'center',gap:10,minWidth:90}}>
                      <span style={{fontSize:11,color:'#bfdbfe',fontWeight:600}}>{s.label}</span>
                      <span style={{fontSize:'clamp(16px,2vw,22px)',fontWeight:900,color:'#fff'}}><AnimatedCounter target={s.count}/></span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section style={{...S.section,background:'linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)',color:'#fff',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-20%',left:'-10%',width:'40vw',height:'40vw',borderRadius:'50%',background:'radial-gradient(circle,rgba(96,165,250,0.12),transparent 70%)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:'-20%',right:'-10%',width:'40vw',height:'40vw',borderRadius:'50%',background:'radial-gradient(circle,rgba(129,140,248,0.12),transparent 70%)',pointerEvents:'none'}}/>
          <div style={{...S.inner,textAlign:'center'}}>
            <Reveal>
              <p style={{fontSize:11,fontWeight:700,color:'#60a5fa',textTransform:'uppercase',letterSpacing:3,marginBottom:8}}>Akses Portal</p>
              <h2 style={{fontSize:'clamp(20px,3.5vw,36px)',fontWeight:800,margin:'0 0 8px'}}>Portal untuk Setiap Peran</h2>
              <p style={{fontSize:'clamp(12px,1.3vw,14px)',color:'#bfdbfe',margin:'0 0 clamp(32px,5vw,48px)',maxWidth:480,marginLeft:'auto',marginRight:'auto'}}>Masuk dengan akun yang telah diberikan oleh Administrator Biro Organisasi</p>
            </Reveal>
            <div style={{...S.grid3,maxWidth:900,margin:'0 auto clamp(32px,4vw,48px)'}}>
              {[
                {role:'🏫',title:'Portal Sekolah',desc:'Input data guru, laporan ANJAB & ABK, kirim ke Biro Organisasi',badge:'Kepala Sekolah / Operator'},
                {role:'📋',title:'Portal Biro',desc:'Validasi laporan, analisis kebutuhan, rekomendasi distribusi guru',badge:'Staf Biro Organisasi'},
                {role:'⚙️',title:'Panel Admin',desc:'Kelola pengguna, wilayah, jabatan, dan periode laporan',badge:'Administrator Sistem'},
              ].map((p,i) => (
                <Reveal key={i} delay={i*0.12} direction={i===0?'left':i===2?'right':'up'}>
                  <div style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:16,padding:'clamp(20px,2.5vw,28px)',textAlign:'left',height:'100%',boxSizing:'border-box'}}>
                    <div style={{fontSize:'clamp(28px,3.5vw,40px)',marginBottom:12}}>{p.role}</div>
                    <h3 style={{fontSize:'clamp(13px,1.3vw,16px)',fontWeight:700,margin:'0 0 8px'}}>{p.title}</h3>
                    <p style={{fontSize:'clamp(10px,1vw,12px)',color:'#bfdbfe',lineHeight:1.7,margin:'0 0 16px'}}>{p.desc}</p>
                    <span style={{fontSize:10,background:'rgba(255,255,255,0.12)',color:'#bfdbfe',padding:'4px 12px',borderRadius:99,border:'1px solid rgba(255,255,255,0.18)'}}>{p.badge}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.25}>
              <Link href="/login" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#fff',color:'#1e3a8a',fontWeight:700,padding:'clamp(12px,1.5vw,16px) clamp(28px,3vw,40px)',borderRadius:14,fontSize:'clamp(12px,1.2vw,14px)',textDecoration:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
                <svg style={{width:16,height:16}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                Masuk ke Portal Sekarang
              </Link>
            </Reveal>
          </div>
        </section>

        <section id="kontak" style={{...S.section,background:'#f9fafb'}}>
          <div style={S.inner}>
            <Reveal style={S.heading}>
              <p style={{fontSize:11,fontWeight:700,color:'#2563eb',textTransform:'uppercase',letterSpacing:3,marginBottom:8}}>Hubungi Kami</p>
              <h2 style={{fontSize:'clamp(20px,3.5vw,36px)',fontWeight:800,color:'#0f172a',margin:0}}>Kontak & Informasi</h2>
            </Reveal>
            <div style={S.grid2}>
              <Reveal direction="left">
                <div style={{background:'#fff',borderRadius:16,border:'1px solid #e5e7eb',padding:'clamp(20px,2.5vw,32px)',boxShadow:'0 1px 8px rgba(0,0,0,0.06)',height:'100%',boxSizing:'border-box'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                    <div style={{position:'relative',width:40,height:40,flexShrink:0}}><Image src="/logo-ntt.png" alt="Logo NTT" fill style={{objectFit:'contain'}} sizes="40px"/></div>
                    <div>
                      <h3 style={{fontSize:'clamp(13px,1.3vw,15px)',fontWeight:700,color:'#0f172a',margin:'0 0 2px'}}>Biro Organisasi Setda</h3>
                      <p style={{fontSize:11,color:'#6b7280',margin:0}}>Provinsi Nusa Tenggara Timur</p>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {[
                      {label:'Unit',value:'Bagian Kelembagaan dan Analisis Jabatan'},
                      {label:'Alamat',value:'Jl. El Tari No. 52, Kota Kupang, NTT'},
                      {label:'Telepon',value:'(0380) 821710'},
                      {label:'Email',value:'biroorganisasi@nttprov.go.id'},
                      {label:'Jam Kerja',value:'Senin-Jumat, 07.30-16.00 WITA'},
                    ].map((item,i) => (
                      <div key={i} style={{display:'flex',gap:12}}>
                        <span style={{fontSize:'clamp(10px,1vw,12px)',color:'#9ca3af',width:72,flexShrink:0}}>{item.label}</span>
                        <span style={{fontSize:'clamp(10px,1vw,12px)',color:'#374151',fontWeight:500}}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal direction="right">
                <div style={{background:'linear-gradient(135deg,#1e3a8a,#312e81)',color:'#fff',borderRadius:16,padding:'clamp(20px,2.5vw,32px)',boxShadow:'0 4px 20px rgba(0,0,0,0.15)',height:'100%',boxSizing:'border-box'}}>
                  <h3 style={{fontSize:'clamp(14px,1.5vw,18px)',fontWeight:700,margin:'0 0 12px'}}>Butuh Akses Portal?</h3>
                  <p style={{fontSize:'clamp(11px,1.1vw,13px)',color:'#bfdbfe',lineHeight:1.7,margin:'0 0 20px'}}>Akun portal e-SIPKG diberikan oleh Administrator kepada sekolah-sekolah yang terdaftar. Hubungi Biro Organisasi untuk mendapatkan akses.</p>
                  <div style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:12,padding:16}}>
                    <p style={{fontSize:'clamp(12px,1.2vw,14px)',fontWeight:600,margin:'0 0 4px'}}>Biro Organisasi Setda Prov. NTT</p>
                    <p style={{fontSize:'clamp(10px,1vw,12px)',color:'#bfdbfe',margin:'0 0 8px'}}>Bagian Kelembagaan dan Analisis Jabatan</p>
                    <p style={{fontSize:'clamp(10px,1vw,12px)',color:'#93c5fd',margin:0}}>biroorganisasi@nttprov.go.id</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
`;

fs.writeFileSync('src/app/(public)/page.tsx', content, 'utf8');
console.log('Done! Written', content.split('\n').length, 'lines');
