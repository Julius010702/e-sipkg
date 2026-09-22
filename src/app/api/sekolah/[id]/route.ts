import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { sekolahSchema } from '@/lib/validasi'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const data = await prisma.sekolah.findUnique({
    where: { id: params.id },
    include: { wilayah: true, guruJabatan: true },
  })
  if (!data) return apiError('Sekolah tidak ditemukan', 404)
  return apiResponse(data)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  // Sekolah hanya bisa edit miliknya sendiri
  if (session.role === 'SEKOLAH' && session.sekolahId !== params.id) {
    return apiError('Forbidden', 403)
  }

  const body = await req.json()
  const parsed = sekolahSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const data = await prisma.sekolah.update({
    where: { id: params.id },
    data: parsed.data,
    include: { wilayah: true },
  })
  return apiResponse(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

  await prisma.sekolah.delete({ where: { id: params.id } })
  return apiResponse({ deleted: true })
}
