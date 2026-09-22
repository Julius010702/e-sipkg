'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href:'/dashboard', label:'Dashboard', icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { href:'/guru',      label:'Data Guru', icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { href:'/laporan',   label:'Laporan',   icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { href:'/profil',    label:'Profil',    icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
]

// Logo sebagai SVG inline — tidak bergantung pada file gambar, tidak akan pernah "pecah"
function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 8l10 5 8-4.2V15h1V8L12 3z" fill="#2563eb"/>
      <path d="M6 11.5V16c0 1.657 2.686 3 6 3s6-1.343 6-3v-4.5l-6 3-6-3z" fill="#1e40af"/>
    </svg>
  )
}

export default function SidebarSekolah({ userName, role = 'Kepala Sekolah' }: { userName?: string; role?: string }) {
  const pathname = usePathname(); const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  async function handleLogout() { await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'SEKOLAH'})}); router.push('/login') }

  return (
    <>
      <aside className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-white transition-[width] duration-300"
style={{width:collapsed?'72px':'220px',borderRight:'1px solid #eef0f3'}}>
        {/* Header / Logo */}
        <div className={`flex items-center gap-3 px-5 pt-6 pb-5 ${collapsed?'justify-center px-3':''}`}>
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
            <LogoMark />
          </div>
          {!collapsed&&(
            <div className="min-w-0">
              <p className="text-slate-900 font-extrabold text-sm leading-none">e-SIPKG</p>
              <p className="text-slate-400 text-[10.5px] mt-1.5 leading-snug">
                Sistem Informasi Perhitungan<br/>Kebutuhan Guru
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle — tidak lagi kepotong */}
        <button
          onClick={()=>setCollapsed(!collapsed)}
          aria-label={collapsed?'Perluas sidebar':'Ciutkan sidebar'}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors z-10"
        >
          <svg className={`w-3 h-3 transition-transform duration-300 ${collapsed?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Menu */}
        <nav className="flex-1 px-3 pt-2 overflow-y-auto">
          {!collapsed&&<p className="px-3 pb-2 pt-1 text-[10.5px] font-bold tracking-wider text-slate-400">MENU UTAMA</p>}
          <div className="space-y-1">
            {navItems.map(item=>{
              const active=pathname===item.href||pathname.startsWith(item.href+'/')
              return(
                <Link key={item.href} href={item.href} title={collapsed?item.label:undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group relative
                    ${active?'bg-blue-50 text-blue-700':'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                    ${collapsed?'justify-center px-0':''}`}>
                  <span className={`flex-shrink-0 ${active?'text-blue-600':'text-slate-400 group-hover:text-slate-600'}`}>{item.icon}</span>
                  {!collapsed&&<span className="truncate">{item.label}</span>}
                  {collapsed&&<span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User + logout */}
        <div className="px-3 py-3 border-t border-slate-100 space-y-1 mt-auto">
          {userName&&!collapsed&&(
            <button
              onClick={()=>setProfileOpen(!profileOpen)}
              title={`${userName} — ${role}`}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div className="min-w-0 text-left flex-1">
                <p className="text-xs text-slate-800 font-semibold truncate">{userName}</p>
                <p className="text-[10.5px] text-slate-400">{role}</p>
              </div>
              <svg className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${profileOpen?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          )}
          {userName&&collapsed&&(
            <div title={`${userName} — ${role}`} className="w-8 h-8 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          )}
          <button onClick={handleLogout} title={collapsed?'Keluar':undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors group ${collapsed?'justify-center px-0':''}`}>
            <svg className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {!collapsed&&<span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <LogoMark size={18} />
          </div>
          <p className="text-slate-900 font-extrabold text-sm leading-none">e-SIPKG</p>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center bg-white border-t border-slate-100" style={{paddingBottom:'env(safe-area-inset-bottom)'}}>
        {navItems.map(item=>{
          const active=pathname===item.href||pathname.startsWith(item.href+'/')
          return(
            <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-colors ${active?'text-blue-600':'text-slate-400'}`}>
              {active&&<span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"/>}
              <span className={`transition-transform ${active?'scale-110':''}`}>{item.icon}</span>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}