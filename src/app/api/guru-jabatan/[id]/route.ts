import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { guruJabatanSchema } from '@/lib/validasi'
import { hitungKebutuhan } from '@/lib/kalkulasi'
import { apiResponse, apiError } from '@/lib/utils'

// ── PUT /api/guru-jabatan/[id] ───────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.sekolahId) return apiError('Unauthorized', 401)

  const existing = await prisma.guruJabatan.findUnique({
    where: { id: params.id },
  })
  if (!existing) return apiError('Data tidak ditemukan', 404)
  if (existing.sekolahId !== session.sekolahId) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = guruJabatanSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.errors[0].message)
  }

  const sekolah = await prisma.sekolah.findUnique({
    where: { id: session.sekolahId },
  })
  if (!sekolah) return apiError('Sekolah tidak ditemukan', 404)

  const duplikat = await prisma.guruJabatan.findFirst({
    where: {
      sekolahId:      session.sekolahId,
      namaJabatan:    parsed.data.namaJabatan,
      jenjangJabatan: parsed.data.jenjangJabatan,
      periodeId:      existing.periodeId,
      NOT: { id: params.id },
    },
  })
  if (duplikat) {
    return apiError(
      `Jabatan "${parsed.data.namaJabatan}" dengan jenjang tersebut sudah ada.`
    )
  }

  const jamMengajar = parsed.data.isBK ? 24 : parsed.data.jamMengajarPerMinggu

  const kalkulasi = hitungKebutuhan({
    isBK:                 parsed.data.isBK,
    jamMengajarPerMinggu: jamMengajar,
    jumlahRombel:         parsed.data.jumlahRombel,
    jumlahSiswa:          sekolah.jumlahSiswa,
    jumlahGuruPNS:        parsed.data.jumlahGuruPNS,
    jumlahGuruPPPK:       parsed.data.jumlahGuruPPPK,
  })

  const data = await prisma.guruJabatan.update({
    where: { id: params.id },
    data: {
      namaJabatan:          parsed.data.namaJabatan,
      jenjangJabatan:       parsed.data.jenjangJabatan,
      isBK:                 parsed.data.isBK,
      jumlahGuruPNS:        parsed.data.jumlahGuruPNS,
      jumlahGuruPPPK:       parsed.data.jumlahGuruPPPK,
      jamMengajarPerMinggu: jamMengajar,
      jumlahRombel:         parsed.data.jumlahRombel,
      ...kalkulasi,
    },
  })

  return apiResponse(data)
}

// ── DELETE /api/guru-jabatan/[id] ────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.sekolahId) return apiError('Unauthorized', 401)

  const existing = await prisma.guruJabatan.findUnique({
    where: { id: params.id },
  })
  if (!existing) return apiError('Data tidak ditemukan', 404)
  if (existing.sekolahId !== session.sekolahId) return apiError('Forbidden', 403)

  await prisma.guruJabatan.delete({ where: { id: params.id } })

  return apiResponse({ deleted: true })
}