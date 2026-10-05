'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'

interface AnalisisRow {
  id: string
  nama: string
  jenisSekolah: string
  wilayah: { nama: string }
  statusData: string
  totalKekurangan: number
  jabatanKurang: { namaJabatan: string; selisih: number }[]
}

interface TabelAnalisisProps {
  data: AnalisisRow[]
  title?: string
}

export default function TabelAnalisis({ data, title = '🔴 Ranking Sekolah Kekurangan Guru' }: TabelAnalisisProps) {
  if (data.length === 0) {
    return (
      <div className="card p-8 text-center text-gray-400 text-sm">
        Tidak ada sekolah dengan kekurangan guru.
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['#', 'Sekolah', 'Kabupaten/Kota', 'Jabatan Kurang', 'Total Kekurangan'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((s, i) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                    i === 0 ? 'bg-red-100 text-red-700'
                      : i < 3 ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600',
                  ].join(' ')}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/biro/sekolah/${s.id}`} className="font-medium text-blue-700 hover:underline">
                    {s.nama}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant={s.jenisSekolah === 'SMA' ? 'indigo' : s.jenisSekolah === 'SMK' ? 'orange' : 'teal'} size="sm">
                      {s.jenisSekolah}
                    </Badge>
                    <Badge variant={s.statusData === 'DISETUJUI' ? 'green' : s.statusData === 'DIKIRIM' ? 'blue' : 'gray'} size="sm">
                      {s.statusData}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{s.wilayah.nama}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.jabatanKurang.slice(0, 3).map((j, ji) => (
                      <span key={ji} className="text-xs bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                        {j.namaJabatan} <span className="font-semibold">(+{j.selisih.toFixed(0)})</span>
                      </span>
                    ))}
                    {s.jabatanKurang.length > 3 && (
                      <span className="text-xs text-gray-400">+{s.jabatanKurang.length - 3} lagi</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xl font-bold text-red-600">+{s.totalKekurangan.toFixed(1)}</span>
                  <span className="text-xs text-gray-400 ml-1">guru</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
