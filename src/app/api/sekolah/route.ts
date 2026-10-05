import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { sekolahSchema } from '@/lib/validasi'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(req.url)
  const jenis = searchParams.get('jenis')
  const wilayahId = searchParams.get('wilayahId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (jenis) where.jenisSekolah = jenis
  if (wilayahId) where.wilayahId = wilayahId
  if (status) where.statusData = status

  // Batasi sesuai peran. Dilakukan SETELAH filter dari query supaya tidak bisa ditimpa.
  // Sekolah hanya melihat dirinya sendiri; Wilayah hanya sekolah di wilayahnya.
  if (session.role === 'SEKOLAH') {
    if (!session.sekolahId) return apiResponse([])
    where.id = session.sekolahId
  } else if (session.role === 'WILAYAH') {
    if (!session.wilayahId) return apiResponse([])
    where.wilayahId = session.wilayahId
  }

  const data = await prisma.sekolah.findMany({
    where,
    include: { wilayah: true },
    orderBy: { nama: 'asc' },
  })
  return apiResponse(data)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = sekolahSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  try {
    const data = await prisma.sekolah.create({ data: parsed.data, include: { wilayah: true } })
    return apiResponse(data, 201)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') return apiError('NPSN sudah terdaftar')
    return apiError('Gagal membuat sekolah', 500)
  }
}
