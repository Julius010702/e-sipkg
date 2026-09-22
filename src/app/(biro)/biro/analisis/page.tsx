import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const JENJANG_LABEL: Record<string, string> = {
  AHLI_PERTAMA: 'Ahli Pertama',
  AHLI_MUDA:    'Ahli Muda',
  AHLI_MADYA:   'Ahli Madya',
  AHLI_UTAMA:   'Ahli Utama',
}

export default async function AnalisisPage() {
  const sekolahList = await prisma.sekolah.findMany({
    include: {
      wilayah: true,
      guruJabatan: true,
    },
    orderBy: [{ wilayah: { nama: 'asc' } }, { nama: 'asc' }],
  })

  const anjabList = sekolahList.map(s => {
    const kebutuhan = Math.round(s.guruJabatan.reduce((sum, g) => sum + g.kebutuhanGuru, 0))
    const pns      = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPNS, 0)
    const pppk     = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPPPK, 0)
    const totalASN = pns + pppk
    const selisih  = totalASN - kebutuhan
    return { ...s, kebutuhan, pns, pppk, totalASN, selisih }
  })

  const jabatanMap = new Map<string, {
    namaJabatan:    string
    jenjangJabatan: string
    isBK:           boolean
    totalKebutuhan: number
    totalPNS:       number
    totalPPPK:      number
    totalASN:       number
    totalSelisih:   number
    jumlahSekolah:  number
  }>()

  sekolahList.forEach(s => {
    s.guruJabatan.forEach(g => {
      const key      = `${g.namaJabatan}|||${g.jenjangJabatan}`
      const asn      = g.jumlahGuruPNS + g.jumlahGuruPPPK
      const keb      = Math.round(g.kebutuhanGuru)
      const existing = jabatanMap.get(key)
      if (existing) {
        existing.totalKebutuhan += keb
        existing.totalPNS       += g.jumlahGuruPNS
        existing.totalPPPK      += g.jumlahGuruPPPK
        existing.totalASN       += asn
        existing.totalSelisih   += asn - keb
        existing.jumlahSekolah  += 1
      } else {
        jabatanMap.set(key, {
          namaJabatan:    g.namaJabatan,
          jenjangJabatan: g.jenjangJabatan,
          isBK:           g.isBK,
          totalKebutuhan: keb,
          totalPNS:       g.jumlahGuruPNS,
          totalPPPK:      g.jumlahGuruPPPK,
          totalASN:       asn,
          totalSelisih:   asn - keb,
          jumlahSekolah:  1,
        })
      }
    })
  })

  const jabatanList = Array.from(jabatanMap.values()).sort(
    (a, b) => a.totalSelisih - b.totalSelisih
  )

  const kekurangan = anjabList.filter(s => s.selisih < 0).sort((a, b) => a.selisih - b.selisih)
  const kelebihan  = anjabList.filter(s => s.selisih > 0).sort((a, b) => b.selisih - a.selisih)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Analisis Kebutuhan Guru (ANJAB &amp; ABK)
        </h2>
        <p className="text-sm text-gray-500">
          Rekap kebutuhan guru berdasarkan format ANJAB &amp; ABK resmi
        </p>
      </div>

      {/* Tabel ANJAB Semua Sekolah */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-blue-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">
              Tabel ANJAB &amp; ABK — Semua Sekolah
            </h3>
            <p className="text-xs text-blue-600 mt-0.5">
              {sekolahList.length} sekolah · Format resmi Biro Kepegawaian
            </p>
          </div>
          <Link href="/biro/laporan"
            className="text-xs text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200">
            🖨️ Cetak Laporan
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">No</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">NAMA SEKOLAH</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Jenis Sekolah</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Kabupaten/Kota</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Kebutuhan</th>
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
              {anjabList.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                  <td className="border border-gray-300 px-3 py-2 text-center text-xs">{i + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 font-medium text-sm">{s.nama}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-xs">{s.jenisSekolah}</td>
                  <td className="border border-gray-300 px-3 py-2 text-xs">{s.wilayah.nama}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-semibold">{s.kebutuhan}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{s.pns}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{s.pppk}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-semibold">{s.totalASN}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold text-red-600">
                    {s.selisih < 0 ? Math.abs(s.selisih) : ''}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold text-green-600">
                    {s.selisih > 0 ? s.selisih : ''}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      s.statusData === 'DISETUJUI' ? 'bg-green-100 text-green-700' :
                      s.statusData === 'DIKIRIM'   ? 'bg-blue-100 text-blue-700'   :
                      s.statusData === 'DITOLAK'   ? 'bg-red-100 text-red-700'     :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {s.statusData}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <Link href={`/biro/sekolah/${s.id}`} className="text-xs text-blue-600 hover:underline">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
              {anjabList.length > 0 && (
                <tr className="bg-gray-200 font-bold">
                  <td className="border border-gray-500 px-3 py-2 text-center" colSpan={4}>TOTAL</td>
                  <td className="border border-gray-500 px-3 py-2 text-center">
                    {anjabList.reduce((s, x) => s + x.kebutuhan, 0)}
                  </td>
                  <td className="border border-gray-500 px-3 py-2 text-center">
                    {anjabList.reduce((s, x) => s + x.pns, 0)}
                  </td>
                  <td className="border border-gray-500 px-3 py-2 text-center">
                    {anjabList.reduce((s, x) => s + x.pppk, 0)}
                  </td>
                  <td className="border border-gray-500 px-3 py-2 text-center">
                    {anjabList.reduce((s, x) => s + x.totalASN, 0)}
                  </td>
                  <td className="border border-gray-500 px-3 py-2 text-center text-red-700">
                    {(() => { const t = anjabList.reduce((s, x) => s + (x.selisih < 0 ? Math.abs(x.selisih) : 0), 0); return t > 0 ? t : '' })()}
                  </td>
                  <td className="border border-gray-500 px-3 py-2 text-center text-green-700">
                    {(() => { const t = anjabList.reduce((s, x) => s + (x.selisih > 0 ? x.selisih : 0), 0); return t > 0 ? t : '' })()}
                  </td>
                  <td className="border border-gray-500 px-3 py-2" colSpan={2}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekap per Jabatan */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Rekap Kebutuhan per Mata Pelajaran / Jabatan</h3>
          <p className="text-xs text-gray-400 mt-0.5">Dikelompokkan berdasarkan nama jabatan dan jenjang fungsional</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">No</th>
                <th className="border border-gray-400 px-3 py-2 text-left font-bold">Nama Jabatan Guru</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Jenjang Jabatan</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Sekolah</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Kebutuhan</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">PNS</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">PPPK</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Total ASN</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Kurang</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Lebih</th>
              </tr>
            </thead>
            <tbody>
              {jabatanList.map((j, i) => (
                <tr key={`${j.namaJabatan}-${j.jenjangJabatan}-${i}`}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-center text-xs">{i + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 font-medium">
                    {j.namaJabatan}
                    {j.isBK && <span className="ml-1 text-xs text-blue-500">(BK)</span>}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {JENJANG_LABEL[j.jenjangJabatan] ?? j.jenjangJabatan}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{j.jumlahSekolah}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-semibold">{j.totalKebutuhan}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{j.totalPNS}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{j.totalPPPK}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-semibold">{j.totalASN}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold text-red-600">
                    {j.totalSelisih < 0 ? Math.abs(j.totalSelisih) : ''}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold text-green-600">
                    {j.totalSelisih > 0 ? j.totalSelisih : ''}
                  </td>
                </tr>
              ))}
              {jabatanList.length > 0 && (
                <tr className="bg-gray-200 font-bold border-t-2 border-gray-400">
                  <td className="border border-gray-400 px-3 py-2 text-center" colSpan={4}>TOTAL</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">
                    {jabatanList.reduce((s, j) => s + j.totalKebutuhan, 0)}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-center">
                    {jabatanList.reduce((s, j) => s + j.totalPNS, 0)}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-center">
                    {jabatanList.reduce((s, j) => s + j.totalPPPK, 0)}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-center">
                    {jabatanList.reduce((s, j) => s + j.totalASN, 0)}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-center text-red-700">
                    {(() => { const t = jabatanList.reduce((s, j) => s + (j.totalSelisih < 0 ? Math.abs(j.totalSelisih) : 0), 0); return t > 0 ? t : '' })()}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-center text-green-700">
                    {(() => { const t = jabatanList.reduce((s, j) => s + (j.totalSelisih > 0 ? j.totalSelisih : 0), 0); return t > 0 ? t : '' })()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Kekurangan & Kelebihan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* ✅ FIX: hapus class konflik border-gray-200 bg-white */}
        <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm p-5">
          <p className="font-semibold text-red-800 mb-3">
            🔴 {kekurangan.length} Sekolah Kekurangan Guru
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {kekurangan.length === 0 ? (
              <p className="text-sm text-red-400">Tidak ada sekolah kekurangan guru</p>
            ) : kekurangan.map((s, i) => (
              <div key={s.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 truncate flex-1">{i + 1}. {s.nama}</span>
                <span className="font-bold text-red-600 ml-2 flex-shrink-0">{Math.abs(s.selisih)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ FIX: hapus class konflik border-gray-200 bg-white */}
        <div className="rounded-xl border border-green-200 bg-green-50 shadow-sm p-5">
          <p className="font-semibold text-green-800 mb-3">
            🟢 {kelebihan.length} Sekolah Kelebihan Guru
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {kelebihan.length === 0 ? (
              <p className="text-sm text-green-400">Tidak ada sekolah kelebihan guru</p>
            ) : kelebihan.map((s, i) => (
              <div key={s.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 truncate flex-1">{i + 1}. {s.nama}</span>
                <span className="font-bold text-green-600 ml-2 flex-shrink-0">{s.selisih}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}