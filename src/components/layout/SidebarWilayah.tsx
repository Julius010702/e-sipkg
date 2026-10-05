'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href:'/wilayah/dashboard', label:'Dashboard', icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { href:'/wilayah/sekolah',   label:'Data Sekolah', icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
]

export default function SidebarWilayah({ userName, wilayahNama }: { userName?: string; wilayahNama?: string }) {
  const pathname = usePathname(); const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  async function handleLogout() { await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'WILAYAH'})}); router.push('/login') }

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────── */}
      <aside className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-hidden transition-all duration-300"
        style={{width:collapsed?'64px':'220px',background:'linear-gradient(180deg,#134e4a 0%,#0f766e 100%)',borderRight:'1px solid rgba(255,255,255,0.08)'}}>
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed?'justify-center px-2':''}`}>
          <div className="relative w-9 h-9 flex-shrink-0"><Image src="/logo-ntt.png" alt="NTT" fill className="object-contain" sizes="36px"/></div>
          {!collapsed&&<div className="min-w-0"><p className="text-white font-black text-sm leading-none">e-SIPKG</p><p className="text-teal-200 text-[10px] mt-0.5 truncate">{wilayahNama || 'Monitoring Wilayah'}</p></div>}
          {!collapsed&&<button onClick={()=>setCollapsed(true)} className="ml-auto text-teal-300 hover:text-white p-1 rounded hover:bg-white/10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg></button>}
          {collapsed&&<button onClick={()=>setCollapsed(false)} className="text-teal-300 hover:text-white p-1 rounded hover:bg-white/10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg></button>}
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item=>{
            const active=pathname===item.href||pathname.startsWith(item.href+'/')
            return(<Link key={item.href} href={item.href} title={collapsed?item.label:undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${active?'text-white':'text-teal-200 hover:text-white hover:bg-white/8'} ${collapsed?'justify-center px-2':''}`}
              style={{background:active?'rgba(255,255,255,0.15)':undefined}}>
              {active&&<span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-200 rounded-r-full"/>}
              <span className="flex-shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
              {!collapsed&&<span className="truncate">{item.label}</span>}
              {collapsed&&<span className="absolute left-full ml-3 px-2.5 py-1 bg-teal-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg border border-white/10">{item.label}</span>}
            </Link>)
          })}
        </nav>
        <div className="px-2 py-3 border-t border-white/10 space-y-1">
          {userName&&!collapsed&&<div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5"><div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div><div className="min-w-0"><p className="text-xs text-white font-medium truncate">{userName}</p><p className="text-[10px] text-teal-300">Wilayah</p></div></div>}
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-teal-200 hover:text-red-300 hover:bg-red-500/10 transition-all group ${collapsed?'justify-center':''}`}>
            <svg className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            {!collapsed&&<span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile: Top Bar ───────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{background:'linear-gradient(135deg,#134e4a,#0f766e)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7"><Image src="/logo-ntt.png" alt="NTT" fill className="object-contain" sizes="28px"/></div>
          <div><p className="text-white font-black text-sm leading-none">e-SIPKG</p><p className="text-teal-200 text-[10px]">{wilayahNama || 'Wilayah'}</p></div>
        </div>
        <button onClick={handleLogout} className="text-teal-200 hover:text-red-300 p-2 rounded-lg hover:bg-white/10 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </div>

      {/* ── Mobile: Bottom Navigation ─────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
        style={{background:'linear-gradient(180deg,#134e4a,#042f2e)',borderTop:'1px solid rgba(255,255,255,0.1)',paddingBottom:'env(safe-area-inset-bottom)'}}>
        {navItems.map(item=>{
          const active=pathname===item.href||pathname.startsWith(item.href+'/')
          return(
            <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-all ${active?'text-white':'text-teal-300'}`}>
              {active&&<span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-200 rounded-full"/>}
              <span className={`transition-transform ${active?'scale-110':''}`}>{item.icon}</span>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
