'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AksiSekolahClient({
  sekolahId,
  nama,
  statusData,
}: {
  sekolahId: string
  nama: string
  statusData: string
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hapus cuma relevan kalau sekolah sudah pernah mengirim sesuatu
  // (Dikirim / Disetujui). Kalau masih Draft, tidak ada yang perlu direset.
  const bisaDihapus = statusData === 'DIKIRIM' || statusData === 'DISETUJUI'

  async function hapusLaporan() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/biro/sekolah/${sekolahId}/reset`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catatan: catatan.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal menghapus laporan.'); return }
      setConfirmOpen(false)
      setCatatan('')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-3">
        <Link href={`/biro/sekolah/${sekolahId}`} className="text-xs text-blue-600 hover:underline">
          Detail →
        </Link>
        {bisaDihapus && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-xs text-red-600 hover:underline"
          >
            Hapus
          </button>
        )}
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !loading && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900">Hapus Laporan &ldquo;{nama}&rdquo;?</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Laporan yang sudah dikirim/disetujui akan dihapus dan status sekolah ini
              dikembalikan ke <strong>Draft</strong> — sekolah harus mengirim ulang datanya.
              Data guru yang sudah diinput tidak ikut terhapus.
            </p>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-600">Catatan untuk sekolah (opsional)</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[70px] resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                placeholder="Contoh: Data rombel tidak sesuai, mohon diperbaiki..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
              />
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={hapusLaporan}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Menghapus…' : 'Ya, Hapus & Kembalikan ke Draft'}
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}