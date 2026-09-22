'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  {
    href: '/admin/dashboard', label: 'Dashboard',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  },
  {
    href: '/admin/users', label: 'Kelola Pengguna',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
  
]

export default function SidebarAdmin({ userName }: { userName?: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'ADMIN' }) })
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="relative w-9 h-9 flex-shrink-0">
          <Image src="/logo-ntt.png" alt="Logo NTT" fill className="object-contain drop-shadow" sizes="36px"/>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-black text-sm leading-none">e-SIPKG</p>
            <p className="text-gray-400 text-[10px] mt-0.5 leading-tight">Administrator</p>
          </div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)}
            className="ml-auto text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-white/8 hover:text-white'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              style={{ background: active ? 'rgba(255,255,255,0.12)' : undefined }}
            >
              {/* Active indicator */}
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/70 rounded-r-full" />}
              <span className={`flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-white' : ''}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Tooltip saat collapsed */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg border border-white/10">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User & Logout */}
      <div className="px-2 py-3 border-t border-white/10 space-y-1">
        {userName && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
            <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white font-medium truncate">{userName}</p>
              <p className="text-[10px] text-gray-500">Administrator</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all group ${collapsed ? 'justify-center' : ''}`}>
          <svg className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-hidden transition-all duration-300"
        style={{
          width: collapsed ? '64px' : '220px',
          background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile: Hamburger button ─────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-lg transition-all"
        style={{ background: 'linear-gradient(135deg,#111827,#1f2937)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      {/* ── Mobile Overlay ───────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 h-full flex flex-col"
            style={{ background: 'linear-gradient(180deg,#111827 0%,#1f2937 100%)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}