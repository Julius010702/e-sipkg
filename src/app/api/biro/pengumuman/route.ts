import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { z } from 'zod'
import { notifRole } from '@/lib/notifikasi'

const pengumumanSchema = z.object({
  judul:      z.string().min(3, 'Judul minimal 3 karakter'),
  isi:        z.string().min(3, 'Isi pengumuman minimal 3 karakter'),
  tanggal:    z.string().min(1, 'Tanggal wajib diisi'),
  batasWaktu: z.string().optional().nullable(),
})

// ── GET /api/biro/pengumuman ──────────────────────────────────
// Daftar pengumuman — bisa diakses semua yang sudah login (tampil di
// dashboard Biro/Admin).
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const data = await prisma.pengumuman.findMany({
    orderBy: { tanggal: 'desc' },
  })
  return apiResponse(data)
}

// ── POST /api/biro/pengumuman ─────────────────────────────────
// Membuat pengumuman baru — hanya BIRO & ADMIN yang mengelola.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || (session.role !== 'BIRO' && session.role !== 'ADMIN')) {
    return apiError('Forbidden', 403)
  }

  const body   = await req.json()
  const parsed = pengumumanSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const data = await prisma.pengumuman.create({
    data: {
      judul:      parsed.data.judul,
      isi:        parsed.data.isi,
      tanggal:    new Date(parsed.data.tanggal),
      batasWaktu: parsed.data.batasWaktu ? new Date(parsed.data.batasWaktu) : null,
      pengirim:   session.nama,
    },
  })

  // Beri tahu semua akun Sekolah supaya mereka langsung tahu isi
  // pengumumannya (bukan cuma tahu ada sesuatu yang baru), lengkap dengan
  // keterangan siapa pengirimnya dan batas waktunya kalau ada.
  const bagianBatasWaktu = data.batasWaktu
    ? `\n\n📅 Batas waktu: ${data.batasWaktu.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : ''
  const pesanNotif = `${data.isi}${bagianBatasWaktu}\n\n📢 Dari: ${data.pengirim}`

  await notifRole('SEKOLAH', `Pengumuman: ${data.judul}`, pesanNotif, '/dashboard')

  return apiResponse(data, 201)
}
