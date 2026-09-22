import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { apiError, apiResponse } from '@/lib/utils'
import { cookies } from 'next/headers'
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '@/lib/rateLimit'
import { ROLE_COOKIE } from '@/lib/session-cookie'
import { logActivity } from '@/lib/activity-log'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nip, password } = body as { nip?: string; password?: string }

    if (!nip?.trim())      return apiError('NIP wajib diisi')
    if (!password?.trim()) return apiError('Password wajib diisi')

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rateLimitKey = `${nip.trim()}:${ip}`

    const limit = checkRateLimit(rateLimitKey)
    if (!limit.allowed) {
      return apiError(`Terlalu banyak percobaan gagal. Coba lagi dalam ${Math.ceil((limit.retryAfterSeconds ?? 0) / 60)} menit.`, 429)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (prisma.user as any).findUnique({
      where: { nip: nip.trim() },
      include: { sekolah: true },
    })
    if (!user) {
      recordFailedAttempt(rateLimitKey)
      return apiError('NIP atau password salah', 401)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      recordFailedAttempt(rateLimitKey)
      return apiError('NIP atau password salah', 401)
    }

    if (user.isAktif === false) {
      return apiError('Akun Anda dinonaktifkan. Hubungi Administrator.', 403)
    }

    clearAttempts(rateLimitKey)
    await logActivity(user.id, user.nama, 'Login ke sistem', user.sekolahId || undefined)

    const token = await signToken({
      id:        user.id,
      nip:       user.nip,
      nama:      user.nama,
      role:      user.role,
      sekolahId: user.sekolahId || undefined,
      wilayahId: user.wilayahId || undefined,
    })

    const cookieStore = cookies()
    // Cookie per peran (token_admin / token_biro / token_wilayah / token_sekolah)
    // — supaya login sebagai peran ini TIDAK menimpa sesi peran lain yang
    // mungkin sedang aktif di browser yang sama.
    cookieStore.set(ROLE_COOKIE[user.role as keyof typeof ROLE_COOKIE], token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    })

    return apiResponse({
      id:        user.id,
      nip:       user.nip,
      nama:      user.nama,
      role:      user.role,
      sekolahId: user.sekolahId,
      wilayahId: user.wilayahId,
    })
  } catch (e) {
    console.error(e)
    return apiError('Server error', 500)
  }
}