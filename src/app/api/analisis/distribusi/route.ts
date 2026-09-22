import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'

// ── GET /api/analisis/distribusi ─────────────────────────────
// Menampilkan distribusi surplus/defisit guru per jabatan
// (sekolah mana kelebihan, sekolah mana kekurangan).
// Hanya bisa diakses BIRO dan ADMIN.

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['BIRO', 'ADMIN'].includes(session.role)) {
    return apiError('Forbidden', 403)
  }

  // Query langsung ke GuruJabatan — JabatanGuru master sudah tidak
  // memiliki relasi ke GuruJabatan sejak schema diubah.
  const rows = await prisma.guruJabatan.findMany({
    include: {
      sekolah: { include: { wilayah: true } },
    },
    orderBy: [{ namaJabatan: 'asc' }, { jenjangJabatan: 'asc' }],
  })

  // Kelompokkan per namaJabatan + jenjangJabatan
  type SekolahEntry = {
    sekolahId:   string
    namaSekolah: string
    wilayah:     string
    nilai:       number   // surplus = positif, defisit = negatif (abs)
  }

  const map = new Map<string, {
    namaJabatan:    string
    jenjangJabatan: string
    isBK:           boolean
    totalSurplus:   number
    totalDefisit:   number
    sekolahSurplus: SekolahEntry[]
    sekolahDefisit: SekolahEntry[]
  }>()

  for (const g of rows) {
    const key     = `${g.namaJabatan}|||${g.jenjangJabatan}`
    const selisih = Math.round(g.selisih)

    if (!map.has(key)) {
      map.set(key, {
        namaJabatan:    g.namaJabatan,
        jenjangJabatan: g.jenjangJabatan,
        isBK:           g.isBK,
        totalSurplus:   0,
        totalDefisit:   0,
        sekolahSurplus: [],
        sekolahDefisit: [],
      })
    }

    const entry = map.get(key)!
    const sekolahInfo: SekolahEntry = {
      sekolahId:   g.sekolahId,
      namaSekolah: g.sekolah.nama,
      wilayah:     g.sekolah.wilayah.nama,
      nilai:       Math.abs(selisih),
    }

    if (selisih > 0) {
      // Lebih guru dari kebutuhan → surplus
      entry.totalSurplus += selisih
      entry.sekolahSurplus.push(sekolahInfo)
    } else if (selisih < 0) {
      // Kurang guru dari kebutuhan → defisit
      entry.totalDefisit += Math.abs(selisih)
      entry.sekolahDefisit.push(sekolahInfo)
    }
  }

  const distribusi = Array.from(map.values())
    .filter(d => d.sekolahSurplus.length > 0 || d.sekolahDefisit.length > 0)
    .sort((a, b) => a.namaJabatan.localeCompare(b.namaJabatan))

  return apiResponse(distribusi)
}