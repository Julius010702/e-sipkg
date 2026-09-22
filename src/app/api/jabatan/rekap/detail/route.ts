import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'

// ── GET /api/jabatan/rekap/detail ────────────────────────────
// Mengembalikan daftar sekolah yang melaporkan jabatan tertentu,
// beserta data kebutuhan, PNS, PPPK, dan selisih per sekolah.
// Hanya bisa diakses BIRO dan ADMIN.
//
// Query params wajib:
//   ?namaJabatan=Matematika
//
// Query params opsional:
//   ?jenjangJabatan=AHLI_MUDA
//   ?wilayahId=xxx
//   ?periodeId=xxx

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['BIRO', 'ADMIN'].includes(session.role)) {
    return apiError('Forbidden', 403)
  }

  const { searchParams } = new URL(req.url)
  const namaJabatan    = searchParams.get('namaJabatan')
  const jenjangJabatan = searchParams.get('jenjangJabatan')
  const wilayahId      = searchParams.get('wilayahId')
  const periodeId      = searchParams.get('periodeId')

  if (!namaJabatan) {
    return apiError('Parameter namaJabatan diperlukan', 400)
  }

  const where: Record<string, unknown> = { namaJabatan }
  if (jenjangJabatan) where.jenjangJabatan = jenjangJabatan
  if (periodeId)      where.periodeId      = periodeId
  if (wilayahId)      where.sekolah        = { wilayahId }

  const rows = await prisma.guruJabatan.findMany({
    where,
    include: {
      sekolah: {
        include: { wilayah: true },
      },
    },
    orderBy: { sekolah: { nama: 'asc' } },
  })

  const data = rows.map(g => ({
    guruJabatanId:  g.id,
    sekolahId:      g.sekolahId,
    namaSekolah:    g.sekolah.nama,
    jenisSekolah:   g.sekolah.jenisSekolah,
    wilayah:        g.sekolah.wilayah.nama,
    jenjangJabatan: g.jenjangJabatan,
    isBK:           g.isBK,
    jumlahGuruPNS:        g.jumlahGuruPNS,
    jumlahGuruPPPK:       g.jumlahGuruPPPK,
    jamMengajarPerMinggu: g.jamMengajarPerMinggu,
    kebutuhanGuru:  Math.round(g.kebutuhanGuru),
    tersedia:       g.tersedia,
    selisih:        Math.round(g.selisih),
    statusData:     g.sekolah.statusData,
  }))

  // Hitung summary total untuk jabatan ini
  const summary = {
    jumlahSekolah:  data.length,
    totalKebutuhan: data.reduce((s, d) => s + d.kebutuhanGuru, 0),
    totalPNS:       data.reduce((s, d) => s + d.jumlahGuruPNS, 0),
    totalPPPK:      data.reduce((s, d) => s + d.jumlahGuruPPPK, 0),
    totalASN:       data.reduce((s, d) => s + d.jumlahGuruPNS + d.jumlahGuruPPPK, 0),
    totalSelisih:   data.reduce((s, d) => s + d.selisih, 0),
    sekolahKurang:  data.filter(d => d.selisih < 0).length,
    sekolahLebih:   data.filter(d => d.selisih > 0).length,
    sekolahCukup:   data.filter(d => d.selisih === 0).length,
  }

  return apiResponse({ data, summary })
}