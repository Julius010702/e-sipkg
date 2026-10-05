import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import FormValidasi from '@/components/biro/FormValidasi'
import Link from 'next/link'

const JENJANG_JABATAN = [
  { value: 'AHLI_PERTAMA', label: 'Ahli Pertama', color: 'bg-sky-50 text-sky-700' },
  { value: 'AHLI_MUDA',    label: 'Ahli Muda',    color: 'bg-indigo-50 text-indigo-700' },
  { value: 'AHLI_MADYA',   label: 'Ahli Madya',   color: 'bg-violet-50 text-violet-700' },
  { value: 'AHLI_UTAMA',   label: 'Ahli Utama',   color: 'bg-purple-50 text-purple-700' },
] as const

const labelJenjang = (val: string) =>
  JENJANG_JABATAN.find(j => j.value === val)?.label ?? val
const colorJenjang = (val: string) =>
  JENJANG_JABATAN.find(j => j.value === val)?.color ?? 'bg-gray-100 text-gray-600'

export default async function BiroSekolahDetailPage({ params }: { params: { id: string } }) {
  const sekolah = await prisma.sekolah.findUnique({
    where: { id: params.id },
    include: {
      wilayah: true,
      guruJabatan: {
        // ✅ FIX: hapus include jabatan & orderBy jabatan
        orderBy: { namaJabatan: 'asc' },
      },
      validasiLogs: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
  if (!sekolah) notFound()

  const totalKebutuhan = Math.round(sekolah.guruJabatan.reduce((s, g) => s + g.kebutuhanGuru, 0))
  const totalPNS       = sekolah.guruJabatan.reduce((s, g) => s + g.jumlahGuruPNS, 0)
  const totalPPPK      = sekolah.guruJabatan.reduce((s, g) => s + g.jumlahGuruPPPK, 0)
  const totalASN       = totalPNS + totalPPPK
  const selisih        = totalASN - totalKebutuhan

  const statusColor: Record<string, string> = {
    DRAFT:     'bg-gray-100 text-gray-700',
    DIKIRIM:   'bg-blue-100 text-blue-700',
    DISETUJUI: 'bg-green-100 text-green-700',
    DITOLAK:   'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/biro/sekolah" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        ← Kembali ke Daftar Sekolah
      </Link>

      {/* Info Sekolah */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{sekolah.nama}</h2>
            <p className="text-gray-500 text-sm mt-1">{sekolah.jenisSekolah} · {sekolah.wilayah.nama}</p>
            {sekolah.alamat && <p className="text-gray-400 text-xs mt-0.5">{sekolah.alamat}</p>}
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[sekolah.statusData]}`}>
            {sekolah.statusData}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-gray-100 text-sm">
          <div><p className="text-xs text-gray-400">NPSN</p><p className="font-medium">{sekolah.npsn || '-'}</p></div>
          <div><p className="text-xs text-gray-400">Jumlah Siswa</p><p className="font-medium">{sekolah.jumlahSiswa}</p></div>
          <div><p className="text-xs text-gray-400">Jumlah Rombel</p><p className="font-medium">{sekolah.jumlahRombel}</p></div>
          <div><p className="text-xs text-gray-400">Jabatan Diinput</p><p className="font-medium">{sekolah.guruJabatan.length}</p></div>
        </div>
      </div>

      {/* TABEL ANJAB Format Resmi */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-blue-50">
          <h3 className="font-semibold text-blue-900">Data ANJAB & ABK — {sekolah.nama}</h3>
          <p className="text-xs text-blue-600 mt-0.5">Format sesuai tabel ANJAB & ABK resmi</p>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">No</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">NAMA SEKOLAH</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Kebutuhan GURU</th>
                <th colSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Bezeting ASN</th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Total ASN</th>
                <th colSpan={2} className="border border-gray-400 px-3 py-2 text-center font-bold">Kebutuhan</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-1.5 text-center font-bold">PNS</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-bold">PPPK</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-bold">Kurang</th>
                <th className="border border-gray-400 px-3 py-1.5 text-center font-bold">Lebih</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white font-semibold">
                <td className="border border-gray-300 px-3 py-3 text-center">1</td>
                <td className="border border-gray-300 px-3 py-3">{sekolah.nama}</td>
                <td className="border border-gray-300 px-3 py-3 text-center">{totalKebutuhan}</td>
                <td className="border border-gray-300 px-3 py-3 text-center">{totalPNS}</td>
                <td className="border border-gray-300 px-3 py-3 text-center">{totalPPPK}</td>
                <td className="border border-gray-300 px-3 py-3 text-center">{totalASN}</td>
                <td className="border border-gray-300 px-3 py-3 text-center font-bold text-red-600">
                  {selisih < 0 ? Math.abs(selisih) : ''}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-center font-bold text-green-600">
                  {selisih > 0 ? selisih : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail per Jabatan */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Detail per Jabatan / Mata Pelajaran</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">No</th>
                <th className="border border-gray-400 px-3 py-2 text-left font-bold">Nama Jabatan Guru</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Jenjang Jabatan</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Kebutuhan</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">PNS</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">PPPK</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Total ASN</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Kurang</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">Lebih</th>
              </tr>
            </thead>
            <tbody>
              {sekolah.guruJabatan.map((g, i) => {
                const asn          = g.jumlahGuruPNS + g.jumlahGuruPPPK
                const keb          = Math.round(g.kebutuhanGuru)
                const selisihBaris = asn - keb
                return (
                  <tr key={g.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2 text-center text-xs">{i + 1}</td>
                    <td className="border border-gray-300 px-3 py-2 font-medium">
                      {/* ✅ FIX: g.namaJabatan & g.isBK langsung */}
                      {g.namaJabatan}
                      {g.isBK && <span className="ml-1 text-xs text-blue-500">(BK)</span>}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorJenjang(g.jenjangJabatan as string)}`}>
                        {labelJenjang(g.jenjangJabatan as string)}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold">{keb}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{g.jumlahGuruPNS}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{g.jumlahGuruPPPK}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold">{asn}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-bold text-red-600">
                      {selisihBaris < 0 ? Math.abs(selisihBaris) : ''}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-bold text-green-600">
                      {selisihBaris > 0 ? selisihBaris : ''}
                    </td>
                  </tr>
                )
              })}
              {/* Baris Total — colSpan +1 karena ada kolom Jenjang */}
              <tr className="bg-gray-200 font-bold border-t-2 border-gray-400">
                <td className="border border-gray-400 px-3 py-2.5 text-center" colSpan={3}>TOTAL</td>
                <td className="border border-gray-400 px-3 py-2.5 text-center">{totalKebutuhan}</td>
                <td className="border border-gray-400 px-3 py-2.5 text-center">{totalPNS}</td>
                <td className="border border-gray-400 px-3 py-2.5 text-center">{totalPPPK}</td>
                <td className="border border-gray-400 px-3 py-2.5 text-center">{totalASN}</td>
                <td className="border border-gray-400 px-3 py-2.5 text-center text-red-700">
                  {selisih < 0 ? Math.abs(selisih) : ''}
                </td>
                <td className="border border-gray-400 px-3 py-2.5 text-center text-green-700">
                  {selisih > 0 ? selisih : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Validasi + Riwayat */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Validasi Data</h3>
          <FormValidasi sekolahId={sekolah.id} statusSaat={sekolah.statusData} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Riwayat Validasi</h3>
          {sekolah.validasiLogs.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada riwayat validasi.</p>
          ) : (
            <div className="space-y-3">
              {sekolah.validasiLogs.map(log => (
                <div key={log.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      log.statusBaru === 'DISETUJUI' ? 'bg-green-100 text-green-700' :
                      log.statusBaru === 'DITOLAK'   ? 'bg-red-100 text-red-700'     :
                      'bg-blue-100 text-blue-700'
                    }`}>{log.statusBaru}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">oleh {log.user.nama}</p>
                  {log.catatan && (
                    <p className="text-xs text-gray-600 mt-1 italic">"{log.catatan}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

