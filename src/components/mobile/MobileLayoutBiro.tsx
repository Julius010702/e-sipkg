'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/biro/dashboard',  label: 'Dashboard',  icon: (a: boolean) => <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={a?'#4F46E5':'#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { href: '/biro/sekolah',    label: 'Sekolah',    icon: (a: boolean) => <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={a?'#4F46E5':'#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
  { href: '/biro/analisis',   label: 'Analisis',   icon: (a: boolean) => <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={a?'#4F46E5':'#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  { href: '/biro/distribusi', label: 'Distribusi', icon: (a: boolean) => <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={a?'#4F46E5':'#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg> },
  { href: '/biro/laporan',    label: 'Laporan',    icon: (a: boolean) => <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={a?'#4F46E5':'#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
]

const MASTER = [
  { href: '/biro/wilayah', label: 'Master Wilayah' },
  { href: '/biro/jabatan', label: 'Master Jabatan' },
  { href: '/biro/periode', label: 'Periode Laporan' },
  { href: '/biro/pengumuman', label: 'Pengumuman' },
]

export default function MobileLayoutBiro({ children, userName }: { children: React.ReactNode; userName?: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [showMaster, setShowMaster] = useState(false)
  async function logout() { await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'BIRO' }) }); router.push('/login') }

  const activeNav = [...NAV, ...MASTER].find(n => pathname === n.href || pathname.startsWith(n.href + '/'))
  const pageTitle = activeNav?.label ?? 'Biro Organisasi'

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#EEF2FF', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Bar ─────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 56, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 30, height: 30, flexShrink: 0 }}>
            <Image src="/logo-ntt.png" alt="NTT" fill className="object-contain" sizes="30px" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 8, fontWeight: 600, color: '#A5B4FC', letterSpacing: 1.5, textTransform: 'uppercase' }}>e-SIPKG</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{pageTitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setShowMaster(v => !v)} style={{
            background: showMaster ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
            padding: '5px 10px', color: '#A5B4FC', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01"/></svg>
            Master
          </button>
          <button onClick={logout} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '5px 9px', color: '#FCA5A5', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Keluar
          </button>
        </div>
      </div>

      {/* Master dropdown */}
      {showMaster && (
        <div onClick={() => setShowMaster(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'fixed', top: 60, right: 12, zIndex: 45,
            background: 'linear-gradient(180deg,#1E1B4B,#312E81)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16, overflow: 'hidden', minWidth: 190,
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          }}>
            <p style={{ margin: 0, padding: '12px 16px 6px', fontSize: 9, fontWeight: 700, color: 'rgba(165,180,252,0.6)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Master Data</p>
            {MASTER.map((item, i) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href} onClick={() => setShowMaster(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  textDecoration: 'none',
                  borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'white' : '#A5B4FC' }}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Content ─────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', paddingBottom: 80 }}>
        {children}
      </div>

      {/* ── Bottom Navigation ────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'white',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '8px 0', textDecoration: 'none', position: 'relative',
            }}>
              {active && <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: '#4F46E5', borderRadius: '0 0 4px 4px' }} />}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? '#EEF2FF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {item.icon(active)}
              </div>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? '#4F46E5' : '#94A3B8', lineHeight: 1 }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}