import { prisma } from '@/lib/prisma'
import { jenisSekolahColor, statusDataColor, statusDataLabel } from '@/lib/utils'
import FilterSekolahClient from './FilterSekolahClient'
import AksiSekolahClient from './AksiSekolahClient'

interface Props {
  searchParams: { jenis?: string; wilayahId?: string; status?: string; cari?: string }
}

export default async function BiroSekolahPage({ searchParams }: Props) {
  const where: Record<string, unknown> = {}
  if (searchParams.jenis)     where.jenisSekolah = searchParams.jenis
  if (searchParams.wilayahId) where.wilayahId    = searchParams.wilayahId
  if (searchParams.status)    where.statusData   = searchParams.status
  if (searchParams.cari) {
    where.OR = [
      { nama: { contains: searchParams.cari, mode: 'insensitive' } },
      { npsn: { contains: searchParams.cari, mode: 'insensitive' } },
    ]
  }

  const [rawList, wilayahList] = await Promise.all([
    prisma.sekolah.findMany({
      where,
      include: { wilayah: true, guruJabatan: true },
      orderBy: { nama: 'asc' },
    }),
    prisma.wilayah.findMany({ orderBy: { nama: 'asc' } }),
  ])

  // Hitung kalkulasi di luar JSX agar tidak ada desimal
  const sekolahList = rawList.map(s => {
    const totalKebutuhan = Math.round(s.guruJabatan.reduce((sum, g) => sum + g.kebutuhanGuru, 0))
    const totalPNS       = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPNS, 0)
    const totalPPPK      = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPPPK, 0)
    const totalASN       = totalPNS + totalPPPK
    const selisih        = totalASN - totalKebutuhan
    return {
      id:           s.id,
      nama:         s.nama,
      npsn:         s.npsn,
      jenisSekolah: s.jenisSekolah,
      statusData:   s.statusData,
      jumlahSiswa:  s.jumlahSiswa,
      jumlahRombel: s.jumlahRombel,
      wilayah:      { nama: s.wilayah.nama },
      totalKebutuhan,
      totalPNS,
      totalPPPK,
      totalASN,
      selisih,
    }
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Data Sekolah</h2>
          <p className="text-sm text-gray-500">{sekolahList.length} sekolah ditemukan</p>
        </div>
      </div>

      <FilterSekolahClient
        jenis={searchParams.jenis || ''}
        status={searchParams.status || ''}
        wilayahId={searchParams.wilayahId || ''}
        wilayahList={wilayahList}
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">No</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-left font-bold">Nama Sekolah</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Jenis Sekolah</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Kabupaten/Kota</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Kebutuhan Guru</th>
                <th colSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Bezeting ASN</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Total ASN</th>
                <th colSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Kebutuhan</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Status</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Aksi</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-1.5 text-center font-bold">PNS</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-bold">PPPK</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-bold">Kurang</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-bold">Lebih</th>
              </tr>
            </thead>
            <tbody>
              {sekolahList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-gray-400">Tidak ada data</td>
                </tr>
              ) : sekolahList.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                  <td className="border border-gray-300 px-3 py-2.5 text-center text-xs">{i + 1}</td>
                  <td className="border border-gray-300 px-3 py-2.5">
                    <p className="font-medium text-gray-900">{s.nama}</p>
                    {s.npsn && <p className="text-xs text-gray-400">NPSN: {s.npsn}</p>}
                  </td>
                  <td className="border border-gray-300 px-3 py-2.5 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${jenisSekolahColor(s.jenisSekolah)}`}>
                      {s.jenisSekolah}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2.5 text-sm">{s.wilayah.nama}</td>
                  <td className="border border-gray-300 px-3 py-2.5 text-center font-semibold">{s.totalKebutuhan}</td>
                  <td className="border border-gray-300 px-3 py-2.5 text-center">{s.totalPNS}</td>
                  <td className="border border-gray-300 px-3 py-2.5 text-center">{s.totalPPPK}</td>
                  <td className="border border-gray-300 px-3 py-2.5 text-center font-semibold">{s.totalASN}</td>
                  <td className="border border-gray-300 px-3 py-2.5 text-center font-bold text-red-600">
                    {s.selisih < 0 ? Math.abs(s.selisih) : ''}
                  </td>
                  <td className="border border-gray-300 px-3 py-2.5 text-center font-bold text-green-600">
                    {s.selisih > 0 ? s.selisih : ''}
                  </td>
                  <td className="border border-gray-300 px-3 py-2.5 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusDataColor(s.statusData)}`}>
                      {statusDataLabel(s.statusData)}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2.5 text-center">
                    <AksiSekolahClient sekolahId={s.id} nama={s.nama} statusData={s.statusData} />
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

