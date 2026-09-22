import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [totalSekolah, totalSMA, totalSMK, totalSLB, totalWilayah] = await Promise.all([
      prisma.sekolah.count(),
      prisma.sekolah.count({ where: { jenisSekolah: 'SMA' } }),
      prisma.sekolah.count({ where: { jenisSekolah: 'SMK' } }),
      prisma.sekolah.count({ where: { jenisSekolah: 'SLB' } }),
      prisma.wilayah.count(),
    ])
    const guruData = await prisma.guruJabatan.aggregate({
      _sum: { jumlahGuruPNS: true, jumlahGuruPPPK: true, kebutuhanGuru: true },
    })
    const totalPNS       = guruData._sum.jumlahGuruPNS  ?? 0
    const totalPPPK      = guruData._sum.jumlahGuruPPPK ?? 0
    const totalASN       = totalPNS + totalPPPK
    const totalKebutuhan = Math.round(guruData._sum.kebutuhanGuru ?? 0)
    const selisih        = totalASN - totalKebutuhan
    const wilayahList    = await prisma.wilayah.findMany({ orderBy: { nama: 'asc' }, select: { id: true, nama: true } })
    const rekapWilayah   = await Promise.all(wilayahList.map(async w => {
      const sekolah   = await prisma.sekolah.findMany({ where: { wilayahId: w.id }, include: { guruJabatan: true } })
      const kebutuhan = Math.round(sekolah.reduce((t,s) => t + s.guruJabatan.reduce((tt,g) => tt + g.kebutuhanGuru, 0), 0))
      const pns  = sekolah.reduce((t,s) => t + s.guruJabatan.reduce((tt,g) => tt + g.jumlahGuruPNS, 0), 0)
      const pppk = sekolah.reduce((t,s) => t + s.guruJabatan.reduce((tt,g) => tt + g.jumlahGuruPPPK, 0), 0)
      const asn  = pns + pppk
      return { nama: w.nama, sekolah: sekolah.length, kebutuhan, asn, selisih: asn - kebutuhan }
    }))
    return NextResponse.json({ data: {
      totalSekolah, totalSMA, totalSMK, totalSLB, totalWilayah,
      totalPNS, totalPPPK, totalASN, totalKebutuhan, selisih,
      rekapWilayah: rekapWilayah.filter(w => w.sekolah > 0),
    }})
  } catch {
    return NextResponse.json({ data: null }, { status: 500 })
  }
}
