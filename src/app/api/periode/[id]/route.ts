import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !['ADMIN', 'BIRO'].includes(session.role)) return apiError('Forbidden', 403)

  const body = await req.json()
  if (body.isAktif) {
    await prisma.periodeLaporan.updateMany({ data: { isAktif: false } })
  }
  const data = await prisma.periodeLaporan.update({
    where: { id: params.id },
    data: body,
  })
  return apiResponse(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || !['ADMIN', 'BIRO'].includes(session.role)) return apiError('Forbidden', 403)

  await prisma.periodeLaporan.delete({ where: { id: params.id } })
  return apiResponse({ deleted: true })
}