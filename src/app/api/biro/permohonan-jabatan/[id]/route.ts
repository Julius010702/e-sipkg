import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { z } from 'zod'
import { notifSekolah } from '@/lib/notifikasi'

// Taruh file ini di: src/app/api/biro/permohonan-jabatan/[id]/route.ts

const putSchema = z.object({
  status:       z.enum(['DISETUJUI', 'DITOLAK']),
  catatanAdmin: z.string().optional().nullable(),
  // Admin bisa override jam standar & status BK saat menyetujui
  jamStandar:   z.number().int().min(1).max(40).optional(),
  isBK:         z.boolean().optional(),
})

// ── PUT /api/permohonan-jabatan/[id] ─────────────────────────
// ADMIN menyetujui atau menolak permohonan.
// Kalau DISETUJUI → otomatis membuat entry baru di master JabatanGuru
// (kalau belum ada) supaya langsung muncul di dropdown sekolah.

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  // Log sesi masuk untuk debugging approval/forbidden cases
  console.log('[api] PUT /api/biro/permohonan-jabatan/:id - session:', session)
  if (!session || (session.role !== 'ADMIN' && session.role !== 'BIRO')) return apiError('Forbidden', 403)

  const adminId = (session as any).userId ?? (session as any).id // sesuaikan

  const existing = await prisma.permohonanJabatan.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Permohonan tidak ditemukan', 404)
  if (existing.status !== 'PENDING') return apiError('Permohonan ini sudah diproses sebelumnya', 400)

  const body   = await req.json()
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const updated = await prisma.permohonanJabatan.update({
    where: { id: params.id },
    data: {
      status:         parsed.data.status,
      catatanAdmin:   parsed.data.catatanAdmin ?? undefined,
      diprosesOlehId: adminId ?? undefined,
      diprosesPada:   new Date(),
    },
  })

  if (parsed.data.status === 'DISETUJUI') {
    const sudahAda = await prisma.jabatanGuru.findFirst({
      where: { namaJabatan: { equals: existing.namaJabatan, mode: 'insensitive' } },
    })
    if (!sudahAda) {
      await prisma.jabatanGuru.create({
        data: {
          namaJabatan: existing.namaJabatan,
          jamStandar:  parsed.data.jamStandar ?? 24,
          isBK:        parsed.data.isBK ?? false,
        },
      })
    }
  }

  await notifSekolah(
    existing.sekolahId,
    parsed.data.status === 'DISETUJUI' ? 'Permohonan Jabatan Disetujui' : 'Permohonan Jabatan Ditolak',
    parsed.data.status === 'DISETUJUI'
      ? `Jabatan "${existing.namaJabatan}" yang Anda ajukan sudah disetujui dan sekarang bisa dipilih di Data Guru.`
      : `Jabatan "${existing.namaJabatan}" yang Anda ajukan ditolak.${parsed.data.catatanAdmin ? ` Catatan: ${parsed.data.catatanAdmin}` : ''}`,
    '/guru',
  )

  return apiResponse(updated)
}

// ── DELETE /api/permohonan-jabatan/[id] ──────────────────────
// ADMIN menghapus riwayat permohonan (opsional, untuk beres-beres data).

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || (session.role !== 'ADMIN' && session.role !== 'BIRO')) return apiError('Forbidden', 403)

  const existing = await prisma.permohonanJabatan.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Permohonan tidak ditemukan', 404)

  await prisma.permohonanJabatan.delete({ where: { id: params.id } })
  return apiResponse({ deleted: true })
}