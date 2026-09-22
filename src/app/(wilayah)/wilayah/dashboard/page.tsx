import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

function waktuRelatif(d: Date): string {
  const detik = Math.floor((Date.now() - d.getTime()) / 1000)
  if (detik < 60) return 'Baru saja'
  const menit = Math.floor(detik / 60)
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`
  const hari = Math.floor(jam / 24)
  if (hari < 7) return `${hari} hari lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function WilayahDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'WILAYAH' || !session.wilayahId) {
    redirect('/login')
  }

  const wilayah = await prisma.wilayah.findUnique({
    where: { id: session.wilayahId! },
  })
  if (!wilayah) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Wilayah untuk akun ini tidak ditemukan. Hubungi Administrator.
      </div>
    )
  }

  const sekolahList = await prisma.sekolah.findMany({
    where: { wilayahId: session.wilayahId! },
    include: { guruJabatan: true },
  })

  const stats = {
    total:     sekolahList.length,
    sma:       sekolahList.filter(s => s.jenisSekolah === 'SMA').length,
    smk:       sekolahList.filter(s => s.jenisSekolah === 'SMK').length,
    slb:       sekolahList.filter(s => s.jenisSekolah === 'SLB').length,
    draft:     sekolahList.filter(s => s.statusData === 'DRAFT').length,
    dikirim:   sekolahList.filter(s => s.statusData === 'DIKIRIM').length,
    disetujui: sekolahList.filter(s => s.statusData === 'DISETUJUI').length,
  }

  const totalKebutuhan = sekolahList.reduce(
    (s, sek) => s + Math.round(sek.guruJabatan.reduce((sum, g) => sum + g.kebutuhanGuru, 0)), 0
  )
  const totalPNS  = sekolahList.reduce((s, sek) => s + sek.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPNS, 0), 0)
  const totalPPPK = sekolahList.reduce((s, sek) => s + sek.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPPPK, 0), 0)
  const totalASN  = totalPNS + totalPPPK
  const selisih   = totalASN - totalKebutuhan

  // Aktivitas terbaru — dibatasi hanya aktivitas milik sekolah-sekolah
  // di wilayah ini (kirim data, validasi, login sekolah), bukan aktivitas
  // seluruh sistem.
  const aktivitasTerbaru = await prisma.activityLog.findMany({
    where: { sekolah: { wilayahId: session.wilayahId! } },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Monitoring Wilayah</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Ringkasan data sekolah di <strong>{wilayah.nama}</strong> — akses pemantauan saja, verifikasi tetap dilakukan Biro Organisasi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Sekolah', value: stats.total, sub: `SMA ${stats.sma} · SMK ${stats.smk} · SLB ${stats.slb}`, color: 'text-teal-700', bg: 'bg-teal-100' },
          { label: 'Belum Kirim',   value: stats.draft,     sub: 'Status Draft',     color: 'text-blue-700',   bg: 'bg-blue-100' },
          { label: 'Menunggu Validasi', value: stats.dikirim,   sub: 'Sudah dikirim ke Biro', color: 'text-amber-700', bg: 'bg-amber-100' },
          { label: 'Sudah Disetujui',   value: stats.disetujui, sub: 'Data tervalidasi Biro', color: 'text-emerald-700', bg: 'bg-emerald-100' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${s.bg}`}>
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-teal-800">
          <h3 className="text-sm font-semibold text-white">Rekapitulasi ANJAB &amp; ABK — {wilayah.nama}</h3>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full border-collapse text-xs" style={{ minWidth: 420 }}>
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Total Sekolah</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Kebutuhan Guru</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-500">PNS</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-500">PPPK</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Total ASN</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Kurang</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Lebih</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2.5 text-center font-bold text-gray-800">{stats.total}</td>
                <td className="px-3 py-2.5 text-center font-bold text-gray-800">{totalKebutuhan}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{totalPNS}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{totalPPPK}</td>
                <td className="px-3 py-2.5 text-center font-bold text-gray-800">{totalASN}</td>
                <td className="px-3 py-2.5 text-center font-bold text-red-600">{selisih < 0 ? Math.abs(selisih) : '—'}</td>
                <td className="px-3 py-2.5 text-center font-bold text-emerald-600">{selisih > 0 ? selisih : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Aktivitas Terbaru — khusus sekolah di wilayah ini */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
          <h3 className="text-sm font-semibold text-gray-800">Aktivitas Terbaru — {wilayah.nama}</h3>
        </div>
        {aktivitasTerbaru.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">Belum ada aktivitas tercatat dari sekolah di wilayah ini</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 font-semibold text-gray-400">Waktu</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-400">Sekolah</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-400">Aktivitas</th>
                </tr>
              </thead>
              <tbody>
                {aktivitasTerbaru.map(a => (
                  <tr key={a.id} className="border-b border-gray-50">
                    <td className="px-5 py-2.5 text-gray-400 whitespace-nowrap">{waktuRelatif(a.createdAt)}</td>
                    <td className="px-3 py-2.5 text-gray-700 font-medium whitespace-nowrap">{a.namaUser}</td>
                    <td className="px-3 py-2.5 text-gray-500">{a.aksi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
