import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { notifSekolah } from '@/lib/notifikasi'

// ── POST /api/biro/sekolah/[id]/reset ────────────────────────
// Biro "menghapus" laporan yang sudah dikirim/disetujui sekolah —
// statusnya dikembalikan ke DRAFT (bukan DITOLAK, bukan tetap
// DISETUJUI) supaya sekolah mulai dari awal lagi. Data guru yang
// sudah diinput TIDAK dihapus, hanya status pengirimannya yang direset.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || (session.role !== 'BIRO' && session.role !== 'ADMIN')) {
    return apiError('Forbidden', 403)
  }

  const sekolah = await prisma.sekolah.findUnique({ where: { id: params.id } })
  if (!sekolah) return apiError('Sekolah tidak ditemukan', 404)
  if (sekolah.statusData === 'DRAFT') {
    return apiError('Data sekolah ini sudah berstatus Draft', 400)
  }

  let catatan: string | null = null
  try {
    const body = await req.json()
    catatan = body?.catatan ?? null
  } catch {
    catatan = null
  }

  const [updated] = await prisma.$transaction([
    prisma.sekolah.update({
      where: { id: params.id },
      data: { statusData: 'DRAFT' },
    }),
    prisma.validasiLog.create({
      data: {
        sekolahId: params.id,
        userId: session.id,
        statusBaru: 'DRAFT',
        catatan,
      },
    }),
  ])

  await notifSekolah(
    params.id,
    'Laporan Dihapus oleh Biro',
    `Laporan ANJAB & ABK ${sekolah.nama} dihapus oleh Biro dan dikembalikan ke status Draft.${catatan ? ` Catatan: ${catatan}` : ' Silakan periksa kembali data guru Anda.'}`,
    '/laporan',
  )

  return apiResponse(updated)
}