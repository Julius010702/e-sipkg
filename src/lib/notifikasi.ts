import { prisma } from './prisma'
import type { RoleUser } from '@prisma/client'

// Kirim notifikasi ke satu user tertentu (dipakai id user-nya langsung).
export async function notifUser(userId: string, judul: string, pesan: string, link?: string) {
  await prisma.notifikasi.create({ data: { userId, judul, pesan, link } })
}

// Kirim notifikasi ke akun SEKOLAH tertentu (dicari dari sekolahId).
export async function notifSekolah(sekolahId: string, judul: string, pesan: string, link?: string) {
  const user = await prisma.user.findFirst({ where: { sekolahId } })
  if (!user) return
  await notifUser(user.id, judul, pesan, link)
}

// Kirim notifikasi ke SEMUA user dengan role tertentu (mis. semua akun BIRO).
export async function notifRole(role: RoleUser, judul: string, pesan: string, link?: string) {
  await prisma.notifikasi.create({ data: { role, judul, pesan, link } })
}

// Kirim notifikasi ke Biro Organisasi & Admin sekaligus — dipakai untuk
// kejadian yang perlu diketahui kedua-duanya (permohonan jabatan baru,
// laporan yang baru dikirim sekolah, dsb).
export async function notifBiroDanAdmin(judul: string, pesan: string, link?: string) {
  await Promise.all([
    notifRole('BIRO', judul, pesan, link),
    notifRole('ADMIN', judul, pesan, link),
  ])
}
