'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'

interface SekolahRow {
  id: string; nama: string; npsn?: string
  jenisSekolah: string; statusData: string
  wilayah: { nama: string }
  jumlahSiswa: number; jumlahRombel: number
  guruJabatan: { tersedia: number; kebutuhanGuru: number; selisih: number }[]
}

interface TabelSekolahProps {
  data: SekolahRow[]
  loading?: boolean
}

const statusVariant: Record<string, 'gray' | 'blue' | 'green' | 'red'> = {
  DRAFT: 'gray', DIKIRIM: 'blue', DISETUJUI: 'green', DITOLAK: 'red',
}
const statusLabel: Record<string, string> = {
  DRAFT: 'Draft', DIKIRIM: 'Dikirim', DISETUJUI: 'Disetujui', DITOLAK: 'Ditolak',
}
const jenisVariant: Record<string, 'indigo' | 'orange' | 'teal'> = {
  SMA: 'indigo', SMK: 'orange', SLB: 'teal',
}

export default function TabelSekolah({ data, loading = false }: TabelSekolahProps) {
  if (loading) {
    return (
      <div className="card p-10 text-center text-gray-400">
        <p>Memuat data...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card p-10 text-center text-gray-400">
        <p>Tidak ada data sekolah yang ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Sekolah', 'Jenis', 'Kabupaten/Kota', 'Siswa', 'Rombel',
                'Guru Ada', 'Kebutuhan', 'Selisih', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map(s => {
              const totalTersedia = s.guruJabatan.reduce((sum, g) => sum + g.tersedia, 0)
              const totalKebutuhan = s.guruJabatan.reduce((sum, g) => sum + g.kebutuhanGuru, 0)
              const totalSelisih = s.guruJabatan.reduce((sum, g) => sum + g.selisih, 0)

              return (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 leading-tight">{s.nama}</p>
                    {s.npsn && <p className="text-xs text-gray-400 mt-0.5">NPSN: {s.npsn}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={jenisVariant[s.jenisSekolah] || 'gray'}>{s.jenisSekolah}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{s.wilayah.nama}</td>
                  <td className="px-4 py-3 text-center">{s.jumlahSiswa.toLocaleString('id')}</td>
                  <td className="px-4 py-3 text-center">{s.jumlahRombel}</td>
                  <td className="px-4 py-3 text-center font-medium">{totalTersedia}</td>
                  <td className="px-4 py-3 text-center">{totalKebutuhan.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${totalSelisih > 0 ? 'text-red-600' : totalSelisih < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {totalSelisih > 0 ? `+${totalSelisih.toFixed(1)}` : totalSelisih.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[s.statusData] || 'gray'} dot>
                      {statusLabel[s.statusData] || s.statusData}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/biro/sekolah/${s.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400">{data.length} sekolah ditampilkan</p>
      </div>
    </div>
  )
}
