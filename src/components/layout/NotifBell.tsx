'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface NotifItem {
  id: string
  judul: string
  pesan: string
  link: string | null
  isRead: boolean
  createdAt: string
}

function waktuRelatif(iso: string): string {
  const detik = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (detik < 60) return 'Baru saja'
  const menit = Math.floor(detik / 60)
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`
  const hari = Math.floor(jam / 24)
  if (hari < 7) return `${hari} hari lalu`
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Bell notifikasi yang bisa dipakai di sidebar/header peran manapun
// (Sekolah, Biro, Admin) — otomatis hanya menampilkan notifikasi milik
// user yang sedang login (lihat /api/notifications). `extraItems` untuk
// menambahkan pengingat lokal (mis. "data belum lengkap") yang dihitung
// langsung dari kondisi saat ini, bukan dari tabel notifikasi — akan
// digabung tampil bersama notifikasi asli, ditaruh paling atas.
export default function NotifBell({
  dark = false,
  extraItems = [],
}: {
  dark?: boolean
  extraItems?: { id: string; judul: string; pesan: string; link?: string }[]
}) {
  const [items, setItems] = useState<NotifItem[]>([])
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<NotifItem | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(() => {
    fetch('/api/notifications', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d.data) ? d.data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 15000)
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(id); window.removeEventListener('focus', onFocus) }
  }, [load])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Pengingat lokal (mis. "data belum lengkap") ditaruh paling atas, tidak
  // ikut ditandai "dibaca" ke server karena bukan baris di tabel notifikasi.
  const localItems: NotifItem[] = extraItems.map(e => ({
    id: `local-${e.id}`,
    judul: e.judul,
    pesan: e.pesan,
    link: e.link ?? null,
    isRead: false,
    createdAt: new Date().toISOString(),
  }))
  const allItems = [...localItems, ...items]

  const unreadCount = allItems.filter(n => !n.isRead).length

  async function tandaiSemuaDibaca() {
    setItems(prev => prev.map(n => ({ ...n, isRead: true })))
    await fetch('/api/notifications', { method: 'PATCH', credentials: 'same-origin' }).catch(() => {})
  }

  async function klikNotif(n: NotifItem) {
    const isLocal = n.id.startsWith('local-')
    if (!isLocal) {
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
      fetch(`/api/notifications/${n.id}`, { method: 'PATCH', credentials: 'same-origin' }).catch(() => {})
    }
    setOpen(false)
    // Tampilkan pop-up berisi isi lengkap dulu — tidak langsung pindah
    // halaman, supaya isi pesan yang panjang (mis. pengumuman) bisa
    // dibaca utuh sebelum (opsional) diarahkan ke halaman terkait.
    setDetail(n)
  }

  const iconColor  = dark ? 'text-indigo-200' : 'text-gray-500'
  const btnBorder  = dark ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-white hover:bg-gray-50'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative w-9 h-9 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${btnBorder}`}
        aria-label="Notifikasi"
      >
        <svg className={`w-4 h-4 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50 text-left">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Notifikasi</p>
            {unreadCount > 0 && (
              <button onClick={tandaiSemuaDibaca} className="text-[11px] font-medium text-blue-600 hover:underline">
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {allItems.length === 0 ? (
              <p className="px-4 py-6 text-xs text-gray-400 text-center">Belum ada notifikasi</p>
            ) : allItems.map(n => (
              <button
                key={n.id}
                onClick={() => klikNotif(n)}
                className={`w-full text-left px-4 py-3 text-xs hover:bg-gray-50 transition-colors flex gap-2.5 ${!n.isRead ? 'bg-blue-50/40' : ''}`}
              >
                {!n.isRead && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
                <span className={!n.isRead ? '' : 'pl-[14px]'}>
                  <span className="block font-semibold text-gray-800">{n.judul}</span>
                  <span className="block text-gray-500 mt-0.5">{n.pesan}</span>
                  <span className="block text-[10.5px] mt-1 text-gray-400">{waktuRelatif(n.createdAt)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pop-up isi lengkap notifikasi */}
      {detail && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="text-[11px] text-gray-400 mb-1">{waktuRelatif(detail.createdAt)}</p>
              <h3 className="text-base font-bold text-gray-900 leading-snug">{detail.judul}</h3>
            </div>
            <div className="px-5 py-4 max-h-[50vh] overflow-y-auto">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{detail.pesan}</p>
            </div>
            <div className="px-5 pb-5 pt-1 flex gap-2.5">
              <button
                onClick={() => setDetail(null)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}