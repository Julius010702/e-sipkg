import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !['ADMIN', 'BIRO'].includes(session.role)) return apiError('Forbidden', 403)

  try {
    const body = await req.json()
    if (body.isAktif) {
      await prisma.periodeLaporan.updateMany({ data: { isAktif: false } })
    }
    const data = await prisma.periodeLaporan.update({
      where: { id: params.id },
      data: body,
    })
    return apiResponse(data)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') return apiError('Periode tidak ditemukan', 404)
    console.error('[PUT /api/periode/[id]]', e)
    return apiError('Gagal menyimpan perubahan', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !['ADMIN', 'BIRO'].includes(session.role)) return apiError('Forbidden', 403)

  try {
    await prisma.periodeLaporan.delete({ where: { id: params.id } })
    return apiResponse({ deleted: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') return apiError('Periode tidak ditemukan', 404)
    if ((e as { code?: string }).code === 'P2003' || (e as { code?: string }).code === 'P2014') {
      return apiError('Periode ini masih terkait data sekolah/guru yang sudah ada, tidak bisa dihapus.')
    }
    console.error('[DELETE /api/periode/[id]]', e)
    return apiError('Gagal menghapus periode', 500)
  }
}