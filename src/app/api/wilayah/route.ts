import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  // BIRO dan ADMIN boleh akses, SEKOLAH untuk dropdown pilih wilayah
  if (!session) return apiError('Unauthorized', 401)

  const data = await prisma.wilayah.findMany({
    select: { id: true, nama: true },
    orderBy: { nama: 'asc' },
  })
  return apiResponse(data)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['ADMIN', 'BIRO'].includes(session.role)) return apiError('Forbidden', 403)

  const body = await req.json()
  if (!body.nama?.trim()) return apiError('Nama wilayah wajib diisi')

  const existing = await prisma.wilayah.findFirst({ where: { nama: body.nama.trim() } })
  if (existing) return apiError('Wilayah sudah ada')

  const data = await prisma.wilayah.create({
    data: { nama: body.nama.trim(), provinsi: 'Nusa Tenggara Timur' },
  })
  return apiResponse(data, 201)
}