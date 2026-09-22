import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { z } from 'zod'

const pengumumanSchema = z.object({
  judul:      z.string().min(3, 'Judul minimal 3 karakter'),
  isi:        z.string().min(3, 'Isi pengumuman minimal 3 karakter'),
  tanggal:    z.string().min(1, 'Tanggal wajib diisi'),
  batasWaktu: z.string().optional().nullable(),
})

// ── PUT /api/biro/pengumuman/[id] ─────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || (session.role !== 'BIRO' && session.role !== 'ADMIN')) {
    return apiError('Forbidden', 403)
  }

  const existing = await prisma.pengumuman.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Pengumuman tidak ditemukan', 404)

  const body   = await req.json()
  const parsed = pengumumanSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const data = await prisma.pengumuman.update({
    where: { id: params.id },
    data: {
      judul:      parsed.data.judul,
      isi:        parsed.data.isi,
      tanggal:    new Date(parsed.data.tanggal),
      batasWaktu: parsed.data.batasWaktu ? new Date(parsed.data.batasWaktu) : null,
    },
  })

  return apiResponse(data)
}

// ── DELETE /api/biro/pengumuman/[id] ──────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || (session.role !== 'BIRO' && session.role !== 'ADMIN')) {
    return apiError('Forbidden', 403)
  }

  const existing = await prisma.pengumuman.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Pengumuman tidak ditemukan', 404)

  await prisma.pengumuman.delete({ where: { id: params.id } })
  return apiResponse({ deleted: true })
}
