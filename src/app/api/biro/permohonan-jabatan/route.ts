import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { notifBiroDanAdmin } from '@/lib/notifikasi'

// Taruh file ini di: src/app/api/biro/permohonan-jabatan/route.ts

const permohonanSchema = z.object({
  namaJabatan: z.string().min(2, 'Nama jabatan minimal 2 karakter').transform(v => v.trim()),
  alasan:      z.string().optional().nullable(),
})

// ── GET /api/permohonan-jabatan ──────────────────────────────
// ADMIN   → melihat semua permohonan (opsional ?status=PENDING)
// SEKOLAH → hanya melihat permohonan milik sekolahnya sendiri

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const status       = req.nextUrl.searchParams.get('status') ?? undefined
  const isSekolah    = session.role === 'SEKOLAH'
  const isReviewer   = session.role === 'ADMIN' || session.role === 'BIRO'

  if (!isSekolah && !isReviewer) {
    return apiError('Akun ini tidak memiliki akses ke permohonan jabatan', 403)
  }

  const data = await prisma.permohonanJabatan.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(isSekolah ? { sekolahId: session.sekolahId } : {}),
    },
    include: {
      sekolah:      { select: { nama: true } },
      diajukanOleh: { select: { nama: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Ratakan hasil supaya frontend cukup pakai p.sekolahNama / p.diajukanOlehNama
  const flat = data.map((p: Prisma.PermohonanJabatanGetPayload<{ include: { sekolah: { select: { nama: true } }, diajukanOleh: { select: { nama: true } } } }>) => ({
    id:               p.id,
    namaJabatan:      p.namaJabatan,
    alasan:           p.alasan,
    status:           p.status,
    catatanAdmin:     p.catatanAdmin,
    sekolahNama:      p.sekolah?.nama ?? null,
    diajukanOlehNama: p.diajukanOleh?.nama ?? null,
    createdAt:        p.createdAt,
  }))

  return apiResponse(flat )
}

// ── POST /api/permohonan-jabatan ─────────────────────────────
// SEKOLAH mengajukan permohonan jabatan baru.

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return apiError('Unauthorized: tidak ada sesi aktif. Pastikan Anda sudah login.', 401)

    // Log ringkas tentang sesi yang masuk untuk debugging (AMAN: tidak menampilkan token)
    console.log('[api] POST /api/biro/permohonan-jabatan - incoming session:', { id: session.id, role: session.role, sekolahId: session.sekolahId })

    if (session.role !== 'SEKOLAH') return apiError(`Hanya akun SEKOLAH yang dapat mengajukan permohonan. Role Anda: ${session.role}`, 403)

    const sekolahId = session.sekolahId
    const userId    = session.id
    if (!sekolahId) return apiError('Akun ini tidak terhubung ke data sekolah, silakan hubungi admin untuk mengaitkan akun Anda ke data sekolah.', 403)

    const body = await req.json()
    // Log body singkat untuk membantu debugging (jangan log sensitive data)
    console.log('[api] POST /api/biro/permohonan-jabatan - body:', { namaJabatan: body?.namaJabatan, alasan: body?.alasan })

    const parsed = permohonanSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message)

    // Cek sudah ada di master jabatan?
    const sudahAda = await prisma.jabatanGuru.findFirst({
      where: { namaJabatan: { equals: parsed.data.namaJabatan, mode: 'insensitive' } },
    })
    if (sudahAda) return apiError('Jabatan ini sudah tersedia di daftar, silakan pilih langsung dari dropdown', 409)

    // Cek sudah ada permohonan pending dengan nama sama dari sekolah ini?
    const pendingSama = await prisma.permohonanJabatan.findFirst({
      where: {
        namaJabatan: { equals: parsed.data.namaJabatan, mode: 'insensitive' },
        status: 'PENDING',
        sekolahId,
      },
    })
    if (pendingSama) return apiError('Permohonan untuk jabatan ini sudah pernah diajukan dan masih menunggu persetujuan', 409)

    const data = await prisma.permohonanJabatan.create({
      data: {
        namaJabatan:    parsed.data.namaJabatan,
        alasan:         parsed.data.alasan ?? undefined,
        status:         'PENDING',
        sekolahId,
        diajukanOlehId: userId,
      },
    })

    const sekolahInfo = await prisma.sekolah.findUnique({
      where: { id: sekolahId },
      select: { nama: true },
    })
    await notifBiroDanAdmin(
      'Permohonan Jabatan Baru',
      `${sekolahInfo?.nama ?? 'Sebuah sekolah'} mengajukan jabatan "${parsed.data.namaJabatan}".`,
      '/biro/pemohon-jabatan',
    )

    console.log('[api] POST /api/biro/permohonan-jabatan - created id:', data.id)
    return apiResponse(data, 201)
  } catch (err) {
    // Log server-side untuk debugging — tidak mengembalikan stack ke klien
    console.error('POST /api/biro/permohonan-jabatan error:', err)
    return apiError('Server error saat mengajukan permohonan. Periksa konsol server untuk detail.', 500)
  }
}