import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { notifBiroDanAdmin } from '@/lib/notifikasi'
import { logActivity } from '@/lib/activity-log'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !session.sekolahId) return apiError('Unauthorized', 401)

  const sekolah = await prisma.sekolah.findUnique({
    where: { id: session.sekolahId },
    include: { guruJabatan: true },
  })
  if (!sekolah) return apiError('Sekolah tidak ditemukan', 404)
  if (sekolah.guruJabatan.length === 0) return apiError('Belum ada data guru yang diinput', 400)
  if (sekolah.statusData === 'DIKIRIM') return apiError('Data sudah dikirim', 400)

  const data = await prisma.sekolah.update({
    where: { id: session.sekolahId },
    data: { statusData: 'DIKIRIM' },
  })

  await notifBiroDanAdmin(
    'Laporan Data Guru Dikirim',
    `${sekolah.nama} mengirim data ANJAB & ABK dan menunggu validasi.`,
    `/biro/sekolah/${sekolah.id}`,
  )

  await logActivity(session.id, sekolah.nama, `Mengirim data ke Biro`, sekolah.id)

  return apiResponse(data)
}
