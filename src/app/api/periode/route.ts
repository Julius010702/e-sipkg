import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { periodeLaporanSchema } from '@/lib/validasi'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const data = await prisma.periodeLaporan.findMany({ orderBy: { createdAt: 'desc' } })
  return apiResponse(data)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['ADMIN', 'BIRO'].includes(session.role)) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = periodeLaporanSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const data = await prisma.periodeLaporan.create({
    data: {
      ...parsed.data,
      tanggalMulai: new Date(parsed.data.tanggalMulai),
      tanggalAkhir: new Date(parsed.data.tanggalAkhir),
    },
  })
  return apiResponse(data, 201)
}