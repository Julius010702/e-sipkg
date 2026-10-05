'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormValidasiProps {
  sekolahId: string
  statusSaat: string
}

export default function FormValidasi({ sekolahId, statusSaat }: FormValidasiProps) {
  const router = useRouter()
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  if (statusSaat !== 'DIKIRIM') {
    return (
      <div className="text-sm text-gray-500 italic">
        Validasi hanya tersedia untuk data berstatus <strong>Dikirim</strong>.
      </div>
    )
  }

  async function handleValidasi(status: 'DISETUJUI' | 'DITOLAK') {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/validasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sekolahId, status, catatan }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error); return }
      setMsg(`Data berhasil ${status === 'DISETUJUI' ? 'disetujui' : 'ditolak'}!`)
      router.refresh()
    } catch {
      setMsg('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {msg && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {msg}
        </div>
      )}
      <div>
        <label className="label">Catatan (opsional)</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Catatan untuk sekolah..."
          value={catatan}
          onChange={e => setCatatan(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleValidasi('DISETUJUI')}
          disabled={loading}
          className="btn-primary flex-1"
        >
          ✓ Setujui Data
        </button>
        <button
          onClick={() => handleValidasi('DITOLAK')}
          disabled={loading}
          className="btn-danger flex-1"
        >
          ✕ Tolak Data
        </button>
      </div>
    </div>
  )
}
