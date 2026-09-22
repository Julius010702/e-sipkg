'use client'

import { useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import TabelGuruJabatan from './TabelGuruJabatan'

interface SekolahData {
  nama: string; jenisSekolah: string; npsn?: string;
  jumlahSiswa: number; jumlahRombel: number; statusData: string
  wilayah: { nama: string }
  guruJabatan: {
    id: string; jabatan: { namaJabatan: string; isBK: boolean }
    jumlahGuruPNS: number; jumlahGuruPPPK: number
    jamMengajarPerMinggu: number; kebutuhanGuru: number; tersedia: number; selisih: number
  }[]
}

interface PreviewLaporanProps {
  onKirim?: () => void
}

const statusVariant: Record<string, 'gray' | 'blue' | 'green' | 'red'> = {
  DRAFT: 'gray', DIKIRIM: 'blue', DISETUJUI: 'green', DITOLAK: 'red',
}
const statusLabel: Record<string, string> = {
  DRAFT: 'Draft', DIKIRIM: 'Dikirim', DISETUJUI: 'Disetujui', DITOLAK: 'Ditolak',
}

export default function PreviewLaporan({ onKirim }: PreviewLaporanProps) {
  const [data, setData] = useState<SekolahData | null>(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ variant: 'success' | 'error' | 'warning'; msg: string } | null>(null)

  function loadData() {
    fetch('/api/sekolah/me?include=guruJabatan').then(r => r.json()).then(d => setData(d.data))
  }
  useEffect(() => { loadData() }, [])

  async function handleKirim() {
    if (!confirm('Kirim data ke Biro? Pastikan semua data sudah benar.')) return
    setLoading(true); setAlert(null)
    try {
      const res = await fetch('/api/sekolah/me/kirim', { method: 'POST' })
      const d = await res.json()
      if (!res.ok) { setAlert({ variant: 'error', msg: d.error }); return }
      setAlert({ variant: 'success', msg: '✅ Data berhasil dikirim ke Biro Kepegawaian!' })
      loadData(); onKirim?.()
    } catch {
      setAlert({ variant: 'error', msg: 'Terjadi kesalahan saat mengirim data.' })
    } finally {
      setLoading(false)
    }
  }

  if (!data) return <div className="text-center py-8 text-gray-400 text-sm">Memuat preview...</div>

  const totalKebutuhan = data.guruJabatan.reduce((s, g) => s + g.kebutuhanGuru, 0)
  const totalTersedia = data.guruJabatan.reduce((s, g) => s + g.tersedia, 0)
  const totalSelisih = data.guruJabatan.reduce((s, g) => s + g.selisih, 0)

  return (
    <div className="space-y-5">
      {alert && <Alert variant={alert.variant} onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      {/* Info sekolah */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg">{data.nama}</h3>
            <p className="text-blue-200 text-sm">{data.jenisSekolah} · {data.wilayah?.nama}</p>
            {data.npsn && <p className="text-blue-300 text-xs mt-0.5">NPSN: {data.npsn}</p>}
          </div>
          <Badge variant={statusVariant[data.statusData] || 'gray'}>
            {statusLabel[data.statusData] || data.statusData}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-blue-600">
          <div><p className="text-blue-200 text-xs">Siswa</p><p className="font-bold text-lg">{data.jumlahSiswa}</p></div>
          <div><p className="text-blue-200 text-xs">Rombel</p><p className="font-bold text-lg">{data.jumlahRombel}</p></div>
          <div><p className="text-blue-200 text-xs">Jabatan Diinput</p><p className="font-bold text-lg">{data.guruJabatan.length}</p></div>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500">Kebutuhan</p>
          <p className="text-2xl font-bold text-gray-900">{totalKebutuhan.toFixed(1)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-xs text-green-600">Tersedia</p>
          <p className="text-2xl font-bold text-green-700">{totalTersedia}</p>
        </div>
        <div className={`border rounded-xl p-4 text-center ${totalSelisih > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-xs ${totalSelisih > 0 ? 'text-red-600' : 'text-green-600'}`}>Selisih</p>
          <p className={`text-2xl font-bold ${totalSelisih > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {totalSelisih > 0 ? `+${totalSelisih.toFixed(1)}` : totalSelisih.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Tabel */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800 text-sm">Detail per Jabatan</h4>
        </div>
        <TabelGuruJabatan data={data.guruJabatan} readonly />
      </div>

      {/* Action */}
      {data.statusData === 'DRAFT' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-orange-700 font-medium mb-1">⚠️ Data belum dikirim</p>
          <p className="text-xs text-orange-600 mb-3">Setelah dikirim, data tidak dapat diubah tanpa persetujuan Biro.</p>
          <Button onClick={handleKirim} loading={loading} disabled={data.guruJabatan.length === 0}>
            📤 Kirim Data ke Biro
          </Button>
          {data.guruJabatan.length === 0 && (
            <p className="text-xs text-red-500 mt-2">Isi data guru terlebih dahulu.</p>
          )}
        </div>
      )}
      {data.statusData === 'DIKIRIM' && (
        <Alert variant="info">Data telah dikirim dan menunggu validasi dari Biro Kepegawaian.</Alert>
      )}
      {data.statusData === 'DISETUJUI' && (
        <Alert variant="success">Data telah disetujui oleh Biro Kepegawaian.</Alert>
      )}
      {data.statusData === 'DITOLAK' && (
        <div className="space-y-2">
          <Alert variant="error">Data ditolak. Silakan perbaiki dan kirim ulang.</Alert>
          <Button variant="danger" onClick={handleKirim} loading={loading}>Kirim Ulang</Button>
        </div>
      )}
    </div>
  )
}
