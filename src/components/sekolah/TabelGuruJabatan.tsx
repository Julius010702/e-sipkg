'use client'

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface GuruRow {
  id: string
  jabatan: { namaJabatan: string; isBK: boolean }
  jumlahGuruPNS: number
  jumlahGuruPPPK: number
  jamMengajarPerMinggu: number
  kebutuhanGuru: number
  tersedia: number
  selisih: number
}

interface TabelGuruJabatanProps {
  data: GuruRow[]
  onEdit?: (row: GuruRow) => void
  onDelete?: (id: string) => void
  readonly?: boolean
}

export default function TabelGuruJabatan({ data, onEdit, onDelete, readonly = false }: TabelGuruJabatanProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Belum ada data guru. Tambahkan di form atas.</p>
      </div>
    )
  }

  const totalKebutuhan = data.reduce((s, g) => s + Math.round(g.kebutuhanGuru), 0)
  const totalPNS       = data.reduce((s, g) => s + g.jumlahGuruPNS, 0)
  const totalPPPK      = data.reduce((s, g) => s + g.jumlahGuruPPPK, 0)
  const totalASN       = totalPNS + totalPPPK
  const totalSelisih   = totalASN - totalKebutuhan

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Jabatan / Mapel', 'PNS', 'PPPK', 'Total ASN', 'Kebutuhan', 'Kurang', 'Lebih', ...(readonly ? [] : ['Aksi'])].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map(g => {
            const asn     = g.jumlahGuruPNS + g.jumlahGuruPPPK
            const keb     = Math.round(g.kebutuhanGuru)
            const selisih = asn - keb
            return (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{g.jabatan.namaJabatan}</span>
                  {g.jabatan.isBK && <span className="ml-1 text-xs text-blue-500 font-medium">(BK)</span>}
                </td>
                <td className="px-4 py-3 text-center">{g.jumlahGuruPNS}</td>
                <td className="px-4 py-3 text-center">{g.jumlahGuruPPPK}</td>
                <td className="px-4 py-3 text-center font-semibold">{asn}</td>
                <td className="px-4 py-3 text-center">{keb}</td>
                <td className="px-4 py-3 text-center font-bold text-red-600">
                  {selisih < 0 ? Math.abs(selisih) : ''}
                </td>
                <td className="px-4 py-3 text-center font-bold text-green-600">
                  {selisih > 0 ? selisih : ''}
                </td>
                {!readonly && (
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => onEdit?.(g)}>Edit</Button>
                      <Button size="sm" variant="ghost"
                        onClick={() => { if (confirm(`Hapus ${g.jabatan.namaJabatan}?`)) onDelete?.(g.id) }}
                        className="text-red-500 hover:bg-red-50">
                        Hapus
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
        <tfoot className="bg-gray-50 border-t-2 border-gray-300">
          <tr className="font-bold">
            <td className="px-4 py-3 text-gray-700">TOTAL</td>
            <td className="px-4 py-3 text-center">{totalPNS}</td>
            <td className="px-4 py-3 text-center">{totalPPPK}</td>
            <td className="px-4 py-3 text-center">{totalASN}</td>
            <td className="px-4 py-3 text-center">{totalKebutuhan}</td>
            <td className="px-4 py-3 text-center text-red-600">
              {totalSelisih < 0 ? Math.abs(totalSelisih) : ''}
            </td>
            <td className="px-4 py-3 text-center text-green-600">
              {totalSelisih > 0 ? totalSelisih : ''}
            </td>
            {!readonly && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}