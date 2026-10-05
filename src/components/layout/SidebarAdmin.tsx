'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href:'/admin/dashboard', label:'Dashboard',    icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg> },
  { href:'/admin/users',     label:'Pengguna',     icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { href:'/admin/slide',     label:'Kelola Slide', icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
  { href:'/admin/kontak',    label:'Kontak',       icon:<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> },
]

export default function SidebarAdmin({ userName }: { userName?: string }) {
  const pathname = usePathname(); const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  async function handleLogout() { await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'ADMIN'})}); router.push('/login') }

  return (
    <aside className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 transition-[width] duration-300"
      style={{ width: collapsed ? '76px' : '260px' }}>

      {/* Header / Logo */}
      <div className={`flex items-center gap-3 px-5 pt-6 pb-5 relative ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image src="/logo-ntt.png" alt="NTT" fill className="object-contain" sizes="40px" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-gray-900 font-extrabold text-base leading-none">e-SIPKG</p>
            <p className="text-gray-400 text-[10.5px] mt-1.5 leading-snug">
              Sistem Informasi Perhitungan<br/>Kebutuhan Guru<br/>Provinsi Nusa Tenggara Timur
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors z-10"
        >
          <svg className={`w-3 h-3 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 pt-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group relative
                  ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
                  ${collapsed ? 'justify-center px-0' : ''}`}>
                <span className={`flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {collapsed && <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User + logout */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-1 mt-auto">
        {userName && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs text-gray-800 font-semibold truncate">{userName}</p>
              <p className="text-[10.5px] text-gray-400">Administrator</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} title={collapsed ? 'Keluar' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors group ${collapsed ? 'justify-center px-0' : ''}`}>
          <svg className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  )
}
