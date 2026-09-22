import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { z } from 'zod'

// Schema lokal — jabatanGuruSchema sudah dihapus dari validasi.ts
const jabatanMasterSchema = z.object({
  namaJabatan: z.string().min(2, 'Nama jabatan minimal 2 karakter').transform(v => v.trim()),
  kode:        z.string().optional().nullable(),
  jamStandar:  z.number().int().min(1).max(40).default(24),
  isBK:        z.boolean().default(false),
  deskripsi:   z.string().optional().nullable(),
})

// ── GET /api/jabatan/[id] ────────────────────────────────────
// Mengambil satu master jabatan berdasarkan ID.

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const data = await prisma.jabatanGuru.findUnique({
    where: { id: params.id },
  })
  if (!data) return apiError('Jabatan tidak ditemukan', 404)

  return apiResponse(data)
}

// ── PUT /api/jabatan/[id] ────────────────────────────────────
// Memperbarui master jabatan.
// Bisa diakses ADMIN dan BIRO.

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || (session.role !== 'ADMIN' && session.role !== 'BIRO')) return apiError('Forbidden', 403)

  const existing = await prisma.jabatanGuru.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Jabatan tidak ditemukan', 404)

  const body   = await req.json()
  const parsed = jabatanMasterSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  // Cek duplikat nama (kecuali record ini sendiri)
  const duplikat = await prisma.jabatanGuru.findFirst({
    where: {
      namaJabatan: parsed.data.namaJabatan,
      NOT: { id: params.id },
    },
  })
  if (duplikat) return apiError('Nama jabatan sudah digunakan', 409)

  const data = await prisma.jabatanGuru.update({
    where: { id: params.id },
    data: {
      namaJabatan: parsed.data.namaJabatan,
      kode:        parsed.data.kode      ?? undefined,
      jamStandar:  parsed.data.jamStandar,
      isBK:        parsed.data.isBK,
      deskripsi:   parsed.data.deskripsi ?? undefined,
    },
  })

  return apiResponse(data)
}

// ── DELETE /api/jabatan/[id] ─────────────────────────────────
// Menghapus master jabatan.
// Bisa diakses ADMIN dan BIRO.

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || (session.role !== 'ADMIN' && session.role !== 'BIRO')) return apiError('Forbidden', 403)

  const existing = await prisma.jabatanGuru.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Jabatan tidak ditemukan', 404)

  await prisma.jabatanGuru.delete({ where: { id: params.id } })

  return apiResponse({ deleted: true })
}