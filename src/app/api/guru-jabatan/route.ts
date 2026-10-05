import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { guruJabatanSchema } from '@/lib/validasi'
import { hitungKebutuhan } from '@/lib/kalkulasi'
import { apiResponse, apiError } from '@/lib/utils'

// ── GET /api/guru-jabatan ────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.sekolahId) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(req.url)
  const periodeId = searchParams.get('periodeId')

  const where: Record<string, unknown> = { sekolahId: session.sekolahId }
  if (periodeId) where.periodeId = periodeId

  const data = await prisma.guruJabatan.findMany({
    where,
    orderBy: { namaJabatan: 'asc' },
  })

  // ✅ FIX: langsung pass array, bukan { data }
  return apiResponse(data)
}

// ── POST /api/guru-jabatan ───────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.sekolahId) return apiError('Unauthorized', 401)

  const body = await req.json()
  const parsed = guruJabatanSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.errors[0].message)
  }

  const sekolah = await prisma.sekolah.findUnique({
    where: { id: session.sekolahId },
  })
  if (!sekolah) return apiError('Sekolah tidak ditemukan', 404)

  const periodeId = (body.periodeId as string) || null
  const duplikat = await prisma.guruJabatan.findFirst({
    where: {
      sekolahId:      session.sekolahId,
      namaJabatan:    parsed.data.namaJabatan,
      jenjangJabatan: parsed.data.jenjangJabatan,
      periodeId,
    },
  })
  if (duplikat) {
    return apiError(
      `Jabatan "${parsed.data.namaJabatan}" dengan jenjang tersebut sudah ada.`
    )
  }

  const kalkulasi = hitungKebutuhan({
    isBK:                 parsed.data.isBK,
    jamMengajarPerMinggu: parsed.data.isBK ? 24 : parsed.data.jamMengajarPerMinggu,
    jumlahRombel:         parsed.data.jumlahRombel,
    jumlahSiswa:          sekolah.jumlahSiswa,
    jumlahGuruPNS:        parsed.data.jumlahGuruPNS,
    jumlahGuruPPPK:       parsed.data.jumlahGuruPPPK,
  })

  const data = await prisma.guruJabatan.create({
    data: {
      sekolahId:            session.sekolahId,
      namaJabatan:          parsed.data.namaJabatan,
      jenjangJabatan:       parsed.data.jenjangJabatan,
      isBK:                 parsed.data.isBK,
      jumlahGuruPNS:        parsed.data.jumlahGuruPNS,
      jumlahGuruPPPK:       parsed.data.jumlahGuruPPPK,
      jamMengajarPerMinggu: parsed.data.isBK ? 24 : parsed.data.jamMengajarPerMinggu,
      jumlahRombel:         parsed.data.jumlahRombel,
      periodeId:            periodeId ?? undefined,
      ...kalkulasi,
    },
  })

  return apiResponse(data, 201)
}