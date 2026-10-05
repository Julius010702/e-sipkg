import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { apiResponse } from '@/lib/utils'
import { ROLE_COOKIE, ALL_SESSION_COOKIES } from '@/lib/session-cookie'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()

  // Client mengirim peran akun yang sedang logout, supaya HANYA cookie
  // peran itu yang dihapus — sesi peran lain di browser yang sama tetap
  // aktif (tidak ikut ter-logout).
  let role: string | undefined
  try {
    const body = await req.json()
    role = body?.role
  } catch {
    role = undefined
  }

  if (role && role in ROLE_COOKIE) {
    cookieStore.delete(ROLE_COOKIE[role as keyof typeof ROLE_COOKIE])
  } else {
    // Fallback kalau role tidak dikirim (mis. pemanggilan lama) — hapus
    // semua cookie sesi seperti perilaku sebelumnya.
    for (const name of ALL_SESSION_COOKIES) cookieStore.delete(name)
  }

  return apiResponse({ message: 'Logout berhasil' })
}