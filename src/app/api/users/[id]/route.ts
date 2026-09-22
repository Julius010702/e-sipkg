import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { logActivity } from '@/lib/activity-log'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

  const body = await req.json()
  const updateData: Record<string, unknown> = {}

  if (body.nama)  updateData.nama  = body.nama
  if (body.email) updateData.email = body.email.trim().toLowerCase()
  if (body.nip)   updateData.nip   = body.nip.trim()
  if (body.password && body.password.length >= 6) {
    updateData.password = await bcrypt.hash(body.password, 10)
    // Catat waktu ganti password — dipakai untuk membatalkan token JWT lama
    // yang sudah beredar, supaya sesi manapun yang masih pakai password lama
    // langsung dianggap tidak valid di request berikutnya (auto logout).
    updateData.passwordChangedAt = new Date()
  }
  if (typeof body.isAktif === 'boolean') {
    updateData.isAktif = body.isAktif
  }

  if (Object.keys(updateData).length === 0) {
    return apiError('Tidak ada data yang diperbarui')
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await (prisma.user as any).update({
      where: { id: params.id },
      data:  updateData,
      select: {
        id:        true,
        nama:      true,
        email:     true,
        nip:       true,
        role:      true,
        isAktif:   true,
        sekolahId: true,
      },
    })
    await logActivity(session.id, session.nama, `Mengelola pengguna: ${data.nama}`)
    return apiResponse(data)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') return apiError('Email atau NIP sudah digunakan')
    if ((e as { code?: string }).code === 'P2025') return apiError('Pengguna tidak ditemukan', 404)
    console.error('[PUT /api/users/[id]]', e)
    return apiError('Gagal mengupdate pengguna', 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true, sekolahId: true, nama: true },
    })
    if (!user) return apiError('Pengguna tidak ditemukan', 404)

    // Akun SEKOLAH selalu 1:1 dengan satu data Sekolah. Hapus akunnya berarti
    // sekolah itu tidak lagi punya login — jadi data Sekolah-nya (beserta
    // seluruh data guru, riwayat validasi, dan permohonan jabatan miliknya,
    // yang semuanya sudah di-cascade di skema) ikut dihapus juga, supaya
    // tidak ada data sekolah "menggantung" tanpa pemilik akun.
    if (user.role === 'SEKOLAH' && user.sekolahId) {
      await prisma.$transaction([
        prisma.user.delete({ where: { id: params.id } }),
        prisma.sekolah.delete({ where: { id: user.sekolahId } }),
      ])
    } else {
      await prisma.user.delete({ where: { id: params.id } })
    }

    await logActivity(session.id, session.nama, `Menghapus pengguna: ${user.nama}`)

    return apiResponse({ deleted: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') return apiError('Pengguna tidak ditemukan', 404)
    console.error('[DELETE /api/users/[id]]', e)
    return apiError('Gagal menghapus pengguna', 500)
  }
}
