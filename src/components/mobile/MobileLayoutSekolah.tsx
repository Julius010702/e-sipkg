'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: (a: boolean) => <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={a?'#1D4ED8':'#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { href: '/guru',      label: 'Data Guru', icon: (a: boolean) => <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={a?'#1D4ED8':'#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { href: '/laporan',   label: 'Laporan',   icon: (a: boolean) => <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={a?'#1D4ED8':'#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { href: '/profil',    label: 'Profil',    icon: (a: boolean) => <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={a?'#1D4ED8':'#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
]

export default function MobileLayoutSekolah({ children, userName }: { children: React.ReactNode; userName?: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  async function logout() { await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'SEKOLAH' }) }); router.push('/login') }

  const activeNav = NAV.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))
  const pageTitle = activeNav?.label ?? 'Portal Sekolah'

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#F0F4FF', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Bar ─────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 56, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 30, height: 30, flexShrink: 0 }}>
            <Image src="/logo-ntt.png" alt="NTT" fill className="object-contain" sizes="30px" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 8, fontWeight: 600, color: '#93C5FD', letterSpacing: 1.5, textTransform: 'uppercase' }}>e-SIPKG</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{pageTitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {userName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <span style={{ fontSize: 11, color: '#BFDBFE', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
            </div>
          )}
          <button onClick={logout} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '5px 9px', color: '#FCA5A5', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Keluar
          </button>
        </div>
      </div>

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
              {active && <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: '#1D4ED8', borderRadius: '0 0 4px 4px' }} />}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? '#EFF6FF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {item.icon(active)}
              </div>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? '#1D4ED8' : '#94A3B8', lineHeight: 1 }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}