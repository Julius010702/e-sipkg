import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { z } from 'zod'

// Schema lokal — jabatanGuruSchema dihapus dari validasi.ts karena
// jabatan sekarang diinput langsung (free-text) oleh sekolah.
// Endpoint ini hanya dipakai untuk READ master jabatan (referensi lama).
// Jika masih diperlukan POST untuk ADMIN, schema ini digunakan.
const jabatanMasterSchema = z.object({
  namaJabatan: z.string().min(2, 'Nama jabatan minimal 2 karakter').transform(v => v.trim()),
  kode:        z.string().optional().nullable(),
  jamStandar:  z.number().int().min(1).max(40).default(24),
  isBK:        z.boolean().default(false),
  deskripsi:   z.string().optional().nullable(),
})

// ── GET /api/jabatan ─────────────────────────────────────────
// Mengembalikan daftar master jabatan guru.
// Dapat diakses semua role yang sudah login.

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const data = await prisma.jabatanGuru.findMany({
    orderBy: { namaJabatan: 'asc' },
  })

  return apiResponse(data)
}

// ── POST /api/jabatan ────────────────────────────────────────
// Membuat master jabatan baru.
// Bisa diakses ADMIN dan BIRO (menu "Master Jabatan" ada di portal Biro).

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || (session.role !== 'ADMIN' && session.role !== 'BIRO')) return apiError('Forbidden', 403)

  const body   = await req.json()
  const parsed = jabatanMasterSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  // Cek duplikat nama
  const existing = await prisma.jabatanGuru.findFirst({
    where: { namaJabatan: parsed.data.namaJabatan },
  })
  if (existing) return apiError('Nama jabatan sudah ada', 409)

  const data = await prisma.jabatanGuru.create({
    data: {
      namaJabatan: parsed.data.namaJabatan,
      kode:        parsed.data.kode      ?? undefined,
      jamStandar:  parsed.data.jamStandar,
      isBK:        parsed.data.isBK,
      deskripsi:   parsed.data.deskripsi ?? undefined,
    },
  })

  return apiResponse(data, 201)
}