import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'

// ── PATCH /api/notifications/[id] ────────────────────────────
// Tandai satu notifikasi sebagai sudah dibaca (dipanggil saat diklik).
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const existing = await prisma.notifikasi.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Notifikasi tidak ditemukan', 404)

  const milikSaya = existing.userId === session.id || (existing.userId === null && existing.role === session.role)
  if (!milikSaya) return apiError('Forbidden', 403)

  const updated = await prisma.notifikasi.update({
    where: { id: params.id },
    data: { isRead: true },
  })

  return apiResponse(updated)
}