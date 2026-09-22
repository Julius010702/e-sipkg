import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'

// ── GET /api/notifications ───────────────────────────────────
// Notifikasi milik user ini: yang ditujukan langsung ke dia, ATAU
// yang ditujukan ke role-nya (broadcast, mis. semua BIRO).
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const data = await prisma.notifikasi.findMany({
    where: {
      OR: [
        { userId: session.id },
        { role: session.role, userId: null },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  return apiResponse(data)
}

// ── PATCH /api/notifications ─────────────────────────────────
// Tandai SEMUA notifikasi milik konteks user ini sebagai sudah dibaca.
export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  await prisma.notifikasi.updateMany({
    where: {
      OR: [
        { userId: session.id },
        { role: session.role, userId: null },
      ],
      isRead: false,
    },
    data: { isRead: true },
  })

  return apiResponse({ ok: true })
}
