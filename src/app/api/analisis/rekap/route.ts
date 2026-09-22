import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'

// ── GET /api/analisis/rekap ───────────────────────────────────
// Rekap kebutuhan guru per jabatan (namaJabatan + jenjangJabatan),
// difilter opsional per wilayah dan periode.
// Hanya bisa diakses BIRO dan ADMIN.

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['BIRO', 'ADMIN'].includes(session.role)) {
    return apiError('Forbidden', 403)
  }

  const { searchParams } = new URL(req.url)
  const wilayahId = searchParams.get('wilayahId')
  const periodeId = searchParams.get('periodeId')

  // Query langsung ke GuruJabatan dengan include sekolah+wilayah
  // Menghindari konflik type dari nested include di Sekolah.findMany
  const rows = await prisma.guruJabatan.findMany({
    where: {
      ...(periodeId ? { periodeId } : {}),
      ...(wilayahId ? { sekolah: { wilayahId } } : {}),
    },
    include: {
      sekolah: {
        include: { wilayah: true },
      },
    },
    orderBy: [{ namaJabatan: 'asc' }, { jenjangJabatan: 'asc' }],
  })

  // ── Rekap per jabatan (namaJabatan + jenjangJabatan) ────────
  const jabatanMap = new Map<string, {
    namaJabatan:    string
    jenjangJabatan: string
    isBK:           boolean
    jumlahSekolah:  number
    totalKebutuhan: number
    totalTersedia:  number
    totalPNS:       number
    totalPPPK:      number
    totalASN:       number
    totalSelisih:   number
  }>()

  for (const g of rows) {
    const key = `${g.namaJabatan}|||${g.jenjangJabatan}`
    const asn = g.jumlahGuruPNS + g.jumlahGuruPPPK
    const keb = Math.round(g.kebutuhanGuru)

    if (jabatanMap.has(key)) {
      const e = jabatanMap.get(key)!
      e.jumlahSekolah  += 1
      e.totalKebutuhan += keb
      e.totalTersedia  += g.tersedia
      e.totalPNS       += g.jumlahGuruPNS
      e.totalPPPK      += g.jumlahGuruPPPK
      e.totalASN       += asn
      e.totalSelisih   += asn - keb
    } else {
      jabatanMap.set(key, {
        namaJabatan:    g.namaJabatan,
        jenjangJabatan: g.jenjangJabatan,
        isBK:           g.isBK,
        jumlahSekolah:  1,
        totalKebutuhan: keb,
        totalTersedia:  g.tersedia,
        totalPNS:       g.jumlahGuruPNS,
        totalPPPK:      g.jumlahGuruPPPK,
        totalASN:       asn,
        totalSelisih:   asn - keb,
      })
    }
  }

  const rekap = Array.from(jabatanMap.values())
    .filter(r => r.jumlahSekolah > 0)
    .sort((a, b) => a.namaJabatan.localeCompare(b.namaJabatan))

  return apiResponse(rekap)
}