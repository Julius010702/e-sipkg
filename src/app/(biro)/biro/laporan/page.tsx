import { prisma } from '@/lib/prisma'
import LaporanClient from './LaporanClient'
import ExportButtons from './ExportButtons'

export default async function BiroLaporanPage() {
  const [rawList, wilayahList] = await Promise.all([
    prisma.sekolah.findMany({
      include: { wilayah: true, guruJabatan: true },
      orderBy: [{ wilayah: { nama: 'asc' } }, { nama: 'asc' }],
    }),
    prisma.wilayah.findMany({ orderBy: { nama: 'asc' } }),
  ])

  const sekolahList = rawList.map(s => {
    const kebutuhan = Math.round(s.guruJabatan.reduce((sum, g) => sum + g.kebutuhanGuru, 0))
    const pns       = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPNS, 0)
    const pppk      = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPPPK, 0)
    const totalASN  = pns + pppk
    const selisih   = totalASN - kebutuhan
    return {
      id:           s.id,
      nama:         s.nama,
      jenisSekolah: s.jenisSekolah as string,
      jumlahSiswa:  s.jumlahSiswa,
      jumlahRombel: s.jumlahRombel,
      kepalaSekolah: s.kepalaSekolah,
      nipKepala:    s.nipKepala,
      wilayah:      { id: s.wilayah.id, nama: s.wilayah.nama },
      guruJabatan:  s.guruJabatan.map(g => ({
        jumlahGuruPNS:        g.jumlahGuruPNS,
        jumlahGuruPPPK:       g.jumlahGuruPPPK,
        kebutuhanGuru:        g.kebutuhanGuru,
        namaJabatan:          g.namaJabatan,
        isBK:                 g.isBK,
        jenjangJabatan:       g.jenjangJabatan as string,
      })),
      kebutuhan,
      pns,
      pppk,
      totalASN,
      selisih,
    }
  })

  const anjabData = sekolahList.map(s => ({
    id:           s.id,
    nama:         s.nama,
    jenisSekolah: s.jenisSekolah,
    wilayah:      s.wilayah.nama,
    kebutuhanGuru: s.kebutuhan,
    pns:          s.pns,
    pppk:         s.pppk,
    totalASN:     s.totalASN,
    kurang:       s.selisih < 0 ? Math.abs(s.selisih) : null,
    lebih:        s.selisih > 0 ? s.selisih : null,
  }))

  const totalPNS       = sekolahList.reduce((t, s) => t + s.pns, 0)
  const totalPPPK      = sekolahList.reduce((t, s) => t + s.pppk, 0)
  const totalKebutuhan = sekolahList.reduce((t, s) => t + s.kebutuhan, 0)

  const now     = new Date()
  const tanggal = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Toolbar export — no-print */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Laporan ANJAB &amp; ABK</h2>
          <p className="text-sm text-gray-500">Pilih jenis laporan, lalu cetak atau export</p>
        </div>
        <ExportButtons
          data={anjabData}
          totalKebutuhan={totalKebutuhan}
          totalPNS={totalPNS}
          totalPPPK={totalPPPK}
          tanggal={tanggal}
        />
      </div>

      {/* Client — 3 mode cetak */}
      <LaporanClient
        sekolahList={sekolahList}
        wilayahList={wilayahList}
        tanggal={tanggal}
      />
    </div>
  )
}