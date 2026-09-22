import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { jenisSekolahColor, statusDataColor, statusDataLabel } from '@/lib/utils'

export default async function WilayahSekolahPage() {
  const session = await getSession()
  if (!session || session.role !== 'WILAYAH' || !session.wilayahId) {
    redirect('/login')
  }

  const [rawList, wilayah] = await Promise.all([
    prisma.sekolah.findMany({
      where: { wilayahId: session.wilayahId! },
      include: { wilayah: true, guruJabatan: true },
      orderBy: { nama: 'asc' },
    }),
    prisma.wilayah.findUnique({ where: { id: session.wilayahId! } }),
  ])

  const sekolahList = rawList.map(s => {
    const totalKebutuhan = Math.round(s.guruJabatan.reduce((sum, g) => sum + g.kebutuhanGuru, 0))
    const totalPNS       = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPNS, 0)
    const totalPPPK      = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPPPK, 0)
    const totalASN       = totalPNS + totalPPPK
    const selisih        = totalASN - totalKebutuhan
    return {
      id: s.id, nama: s.nama, npsn: s.npsn, jenisSekolah: s.jenisSekolah,
      statusData: s.statusData, totalKebutuhan, totalPNS, totalPPPK, totalASN, selisih,
    }
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Data Sekolah</h2>
          <p className="text-sm text-gray-500">
            {sekolahList.length} sekolah di <strong>{wilayah?.nama}</strong> — tampilan pemantauan saja (read-only).
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a
            href="/api/biro/laporan/export/excel"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H8a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v11a2 2 0 01-2 2z" />
            </svg>
            Unduh Excel
          </a>
          <a
            href="/api/biro/laporan/export/word"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H8a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v11a2 2 0 01-2 2z" />
            </svg>
            Unduh Word
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-center font-bold">No</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-bold">Nama Sekolah</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-bold">Jenis</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-bold">Kebutuhan Guru</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-bold">PNS</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-bold">PPPK</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-bold">Total ASN</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-bold">Kurang</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-bold">Lebih</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {sekolahList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400">Belum ada data sekolah di wilayah ini</td>
                </tr>
              ) : sekolahList.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                  <td className="border border-gray-200 px-3 py-2.5 text-center text-xs">{i + 1}</td>
                  <td className="border border-gray-200 px-3 py-2.5">
                    <p className="font-medium text-gray-900">{s.nama}</p>
                    {s.npsn && <p className="text-xs text-gray-400">NPSN: {s.npsn}</p>}
                  </td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${jenisSekolahColor(s.jenisSekolah)}`}>
                      {s.jenisSekolah}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center font-semibold">{s.totalKebutuhan}</td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center">{s.totalPNS}</td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center">{s.totalPPPK}</td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center font-semibold">{s.totalASN}</td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center font-bold text-red-600">
                    {s.selisih < 0 ? Math.abs(s.selisih) : ''}
                  </td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center font-bold text-emerald-600">
                    {s.selisih > 0 ? s.selisih : ''}
                  </td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusDataColor(s.statusData)}`}>
                      {statusDataLabel(s.statusData)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
