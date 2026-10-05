import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { z } from 'zod'
import { apiResponse, apiError } from '@/lib/utils'
import { notifSekolah } from '@/lib/notifikasi'
import { logActivity } from '@/lib/activity-log'

const validasiSchema = z.object({
  sekolahId: z.string(),
  status: z.enum(['DISETUJUI', 'DITOLAK']),
  catatan: z.string().optional().nullable()
})

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['BIRO', 'ADMIN'].includes(session.role)) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = validasiSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { sekolahId, status, catatan } = parsed.data

  const sekolah = await prisma.sekolah.findUnique({ where: { id: sekolahId } })
  if (!sekolah) return apiError('Sekolah tidak ditemukan', 404)
  if (sekolah.statusData !== 'DIKIRIM') return apiError('Data harus berstatus DIKIRIM untuk divalidasi', 400)

  // Kalau ditolak, kirimannya "dibatalkan" dan status otomatis kembali ke
  // DRAFT — supaya sekolah bisa langsung memperbaiki & mengirim ulang tanpa
  // macet permanen di status Ditolak. Riwayat penolakan tetap tercatat di
  // ValidasiLog (statusBaru: DITOLAK) untuk jejak audit.
  const statusBaruSekolah = status === 'DITOLAK' ? 'DRAFT' : status

  const [updatedSekolah] = await prisma.$transaction([
    prisma.sekolah.update({
      where: { id: sekolahId },
      data: { statusData: statusBaruSekolah },
    }),
    prisma.validasiLog.create({
      data: {
        sekolahId,
        userId: session.id,
        statusBaru: status,
        catatan,
      },
    }),
  ])

  await notifSekolah(
    sekolahId,
    status === 'DISETUJUI' ? 'Data Guru Disetujui' : 'Data Guru Ditolak — Perlu Diperbaiki',
    status === 'DISETUJUI'
      ? `Data ANJAB & ABK sekolah Anda sudah disetujui oleh Biro Organisasi.${catatan ? ` Catatan: ${catatan}` : ''}`
      : `Data ANJAB & ABK sekolah Anda ditolak dan dikembalikan ke Draft untuk diperbaiki.${catatan ? ` Catatan: ${catatan}` : ''}`,
    '/laporan',
  )

  await logActivity(
    session.id, session.nama,
    `${status === 'DISETUJUI' ? 'Menyetujui' : 'Menolak'} data guru: ${sekolah.nama}`,
    sekolah.id,
  )

  return apiResponse(updatedSekolah)
}
