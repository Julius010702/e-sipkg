'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NotifBell from '@/components/layout/NotifBell'

interface Periode {
  id: string
  nama: string
  tahunAjaran: string
  semester: number
  isAktif: boolean
}

export default function HeaderBiro({
  periodeList,
  activePeriode,
}: {
  periodeList: Periode[]
  activePeriode: Periode | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [openPeriode, setOpenPeriode] = useState(false)
  const periodeRef = useRef<HTMLDivElement>(null)

  const selectedId = searchParams.get('periodeId') || activePeriode?.id
  const selected = periodeList.find(p => p.id === selectedId) || activePeriode

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (periodeRef.current && !periodeRef.current.contains(e.target as Node)) setOpenPeriode(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function pilihPeriode(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('periodeId', id)
    router.push(`/biro/dashboard?${params.toString()}`)
    setOpenPeriode(false)
  }

  return (
    <div className="flex items-center gap-3">
      {/* Pencarian sekolah/guru/NPSN — arahkan ke halaman Data Sekolah dengan filter */}
      <form
        onSubmit={e => {
          e.preventDefault()
          const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
          router.push(q ? `/biro/sekolah?cari=${encodeURIComponent(q)}` : '/biro/sekolah')
        }}
        className="relative hidden sm:block"
      >
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          name="q"
          type="text"
          placeholder="Cari sekolah, guru, atau NPSN..."
          className="w-64 pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
        />
      </form>
      {/* Dropdown Tahun Ajaran */}
      <div className="relative" ref={periodeRef}>
        <button
          onClick={() => setOpenPeriode(o => !o)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {selected
            ? `Tahun Ajaran ${selected.tahunAjaran} · ${selected.semester === 1 ? 'Ganjil' : 'Genap'}`
            : 'Pilih Periode'}
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${openPeriode ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openPeriode && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-20">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500">Pilih Periode Laporan</p>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {periodeList.length === 0 ? (
                <p className="px-4 py-4 text-xs text-gray-400 text-center">Belum ada periode</p>
              ) : periodeList.map(p => (
                <button
                  key={p.id}
                  onClick={() => pilihPeriode(p.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between gap-2 ${
                    selected?.id === p.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <span>
                    <span className="block text-gray-800 font-medium">{p.tahunAjaran}</span>
                    <span className="block text-xs text-gray-400">
                      {p.nama} · {p.semester === 1 ? 'Ganjil' : 'Genap'}
                    </span>
                  </span>
                  {p.isAktif && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      Aktif
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifikasi — pakai sistem notifikasi asli (permohonan jabatan, laporan dikirim, dsb) */}
      <NotifBell />
    </div>
  )
}