'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
 
const navItems = [
  { href:'/biro/dashboard',  label:'Dashboard',  icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { href:'/biro/sekolah',    label:'Sekolah',    icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
  { href:'/biro/analisis',   label:'Analisis',   icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  { href:'/biro/distribusi', label:'Distribusi', icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg> },
  { href:'/biro/laporan',    label:'Laporan',    icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
]
 
const masterItems = [
  { href:'/biro/wilayah', label:'Wilayah', icon:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"/></svg> },
  { href:'/biro/jabatan', label:'Jabatan', icon:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z"/></svg> },
    { href:'/biro/pemohon-jabatan', label:'Pemohon Jabatan', icon:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h6m6-4l2 2 4-4"/></svg> },
  { href:'/biro/periode', label:'Periode', icon:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
  { href:'/biro/pengumuman', label:'Pengumuman', icon:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg> },
]
 
export default function SidebarBiro({ userName }: { userName?: string }) {
  const pathname = usePathname(); const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [showMore, setShowMore]   = useState(false)
  async function handleLogout() { await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'BIRO'})}); router.push('/login') }
 
  const allDesktopItems = [
    ...navItems,
    { href:'', label:'---', icon:null },
    ...masterItems,
  ]
 
  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────── */}
      <aside className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-hidden transition-all duration-300"
        style={{width:collapsed?'64px':'220px',background:'linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)',borderRight:'1px solid rgba(255,255,255,0.08)'}}>
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed?'justify-center px-2':''}`}>
          <div className="relative w-9 h-9 flex-shrink-0"><Image src="/logo-ntt.png" alt="NTT" fill className="object-contain" sizes="36px"/></div>
          {!collapsed&&<div className="min-w-0"><p className="text-white font-black text-sm leading-none">e-SIPKG</p><p className="text-indigo-300 text-[10px] mt-0.5">Biro Organisasi</p></div>}
          {!collapsed&&<button onClick={()=>setCollapsed(true)} className="ml-auto text-indigo-400 hover:text-white p-1 rounded hover:bg-white/10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg></button>}
          {collapsed&&<button onClick={()=>setCollapsed(false)} className="text-indigo-400 hover:text-white p-1 rounded hover:bg-white/10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg></button>}
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {allDesktopItems.map((item,idx)=>{
            if(item.label==='---') return collapsed?null:(
              <div key={idx} className="pt-2 pb-1 px-3"><p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400/60">Master Data</p></div>
            )
            const active=pathname===item.href||pathname.startsWith(item.href+'/')
            return(<Link key={item.href} href={item.href} title={collapsed?item.label:undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${active?'text-white':'text-indigo-300 hover:text-white hover:bg-white/8'} ${collapsed?'justify-center px-2':''}`}
              style={{background:active?'rgba(255,255,255,0.15)':undefined}}>
              {active&&<span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-300 rounded-r-full"/>}
              <span className="flex-shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
              {!collapsed&&<span className="truncate">{item.label}</span>}
              {collapsed&&<span className="absolute left-full ml-3 px-2.5 py-1 bg-indigo-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg border border-white/10">{item.label}</span>}
            </Link>)
          })}
        </nav>
        <div className="px-2 py-3 border-t border-white/10 space-y-1">
          {userName&&!collapsed&&<div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5"><div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div><div className="min-w-0"><p className="text-xs text-white font-medium truncate">{userName}</p><p className="text-[10px] text-indigo-400">Biro Organisasi</p></div></div>}
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-300 hover:text-red-400 hover:bg-red-500/10 transition-all group ${collapsed?'justify-center':''}`}>
            <svg className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            {!collapsed&&<span>Keluar</span>}
          </button>
        </div>
      </aside>
 
      {/* ── Mobile: Top Bar ───────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{background:'linear-gradient(135deg,#1e1b4b,#312e81)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7"><Image src="/logo-ntt.png" alt="NTT" fill className="object-contain" sizes="28px"/></div>
          <div><p className="text-white font-black text-sm leading-none">e-SIPKG</p><p className="text-indigo-300 text-[10px]">Biro Organisasi</p></div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={()=>setShowMore(v=>!v)} className="text-indigo-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01"/></svg>
          </button>
          <button onClick={handleLogout} className="text-indigo-300 hover:text-red-400 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </div>
 
      {showMore&&(
        <div className="md:hidden fixed inset-0 z-40" onClick={()=>setShowMore(false)}>
          <div className="absolute top-14 right-0 w-48 m-2 rounded-xl shadow-2xl overflow-hidden"
            style={{background:'linear-gradient(180deg,#1e1b4b,#312e81)',border:'1px solid rgba(255,255,255,0.1)'}}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400/70 px-4 pt-3 pb-1">Master Data</p>
            {masterItems.map(item=>{
              const active=pathname===item.href||pathname.startsWith(item.href+'/')
              return(<Link key={item.href} href={item.href} onClick={()=>setShowMore(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active?'text-white bg-white/15':'text-indigo-200 hover:bg-white/10'}`}>
                {item.icon}<span>{item.label}</span>
              </Link>)
            })}
          </div>
        </div>
      )}
 
      {/* ── Mobile: Bottom Navigation (5 menu utama) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
        style={{background:'linear-gradient(180deg,#1e1b4b,#0f0c29)',borderTop:'1px solid rgba(255,255,255,0.1)',paddingBottom:'env(safe-area-inset-bottom)'}}>
        {navItems.map(item=>{
          const active=pathname===item.href||pathname.startsWith(item.href+'/')
          return(
            <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-all ${active?'text-white':'text-indigo-400'}`}>
              {active&&<span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-300 rounded-full"/>}
              <span className={`transition-transform ${active?'scale-110':''}`}>{item.icon}</span>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
