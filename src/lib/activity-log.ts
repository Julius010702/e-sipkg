import { prisma } from './prisma'

// Catat satu baris aktivitas untuk panel "Aktivitas Terbaru" di Dashboard
// Admin/Wilayah. Sengaja dibungkus try/catch — gagal mencatat log TIDAK
// BOLEH menggagalkan aksi utama pengguna (login, validasi, dsb).
// `sekolahId` opsional — diisi kalau aktivitas ini terkait satu sekolah
// tertentu (kirim data, validasi), dipakai untuk memfilter aktivitas per
// wilayah di Dashboard akun WILAYAH.
export async function logActivity(userId: string, namaUser: string, aksi: string, sekolahId?: string) {
  try {
    await prisma.activityLog.create({ data: { userId, namaUser, aksi, sekolahId } })
  } catch (e) {
    console.error('[logActivity] gagal mencatat aktivitas:', e)
  }
}
