import { SignJWT, jwtVerify } from 'jose'
import { cookies, headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { cookieNameForPath, ALL_SESSION_COOKIES } from './session-cookie'
import { prisma } from './prisma'

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET belum diset di .env')
}
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export interface JWTPayload {
  id: string
  nip: string        // ← diganti dari email ke nip
  nama: string
  role: 'SEKOLAH' | 'BIRO' | 'ADMIN' | 'WILAYAH'
  sekolahId?: string
  wilayahId?: string
  iat?: number        // waktu token dibuat (detik epoch) — otomatis diisi jose
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// Cek tambahan: token JWT valid secara kriptografis, TAPI apakah masih
// berlaku secara bisnis? — akun masih aktif, dan yang terpenting: password
// belum diganti setelah token ini diterbitkan. Kalau password baru saja
// diganti (mis. lewat Panel Admin), token lama — termasuk yang sedang
// dipakai sesi kita sendiri di tab ini — langsung dianggap kedaluwarsa.
async function isSessionStillValid(payload: JWTPayload): Promise<boolean> {
  if (!payload.iat) return true // token lama tanpa iat, anggap valid (fallback aman)

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { isAktif: true, passwordChangedAt: true },
  })
  if (!user) return false
  if (!user.isAktif) return false

  const passwordChangedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000)
  // Beri toleransi 2 detik untuk perbedaan jam server saat token baru dibuat
  // persis di waktu yang (hampir) sama dengan passwordChangedAt awal (saat akun dibuat).
  if (passwordChangedAtSeconds > payload.iat + 2) return false

  return true
}

async function verifyAndValidateToken(token: string): Promise<JWTPayload | null> {
  const payload = await verifyToken(token)
  if (!payload) return null
  const stillValid = await isSessionStillValid(payload)
  if (!stillValid) return null
  return payload
}

export async function getSession(): Promise<JWTPayload | null> {
  // Middleware menaruh path halaman saat ini di header x-pathname, supaya
  // Server Component tahu area mana (Admin/Biro/Sekolah) yang sedang
  // diakses dan membaca cookie sesi milik area itu — bukan cookie sesi
  // peran lain yang mungkin juga sedang login di browser yang sama.
  const pathname = headers().get('x-pathname') || '/'
  const cookieName = cookieNameForPath(pathname)
  const cookieStore = cookies()
  const token = cookieStore.get(cookieName)?.value
  if (!token) return null
  return verifyAndValidateToken(token)
}

export async function getSessionFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const pathname = req.nextUrl.pathname

  let refererPath: string | null = null
  try {
    const ref = req.headers.get('referer')
    refererPath = ref ? new URL(ref).pathname : null
  } catch {
    refererPath = null
  }

  // Beberapa endpoint API dipakai lintas peran dan namanya bisa menyesatkan
  // (mis. /api/biro/permohonan-jabatan dipakai SEKOLAH untuk mengajukan,
  // bukan cuma Biro). Karena itu, cookie sesuai HALAMAN PEMANGGIL (Referer)
  // dicoba LEBIH DULU — itu petunjuk paling akurat tentang siapa yang benar-
  // benar memanggil endpoint ini. Baru kalau tidak ada Referer, coba cookie
  // sesuai path endpoint itu sendiri, lalu sebagai jaring pengaman terakhir,
  // cookie sesi manapun yang valid (otorisasi peran tetap dicek masing-
  // masing route setelah ini).
  const candidates = [
    ...(refererPath ? [cookieNameForPath(refererPath)] : []),
    cookieNameForPath(pathname),
    ...ALL_SESSION_COOKIES,
  ]

  const tried = new Set<string>()
  for (const name of candidates) {
    if (tried.has(name)) continue
    tried.add(name)
    const token = req.cookies.get(name)?.value
    if (!token) continue
    const payload = await verifyAndValidateToken(token)
    if (payload) return payload
  }
  return null
}

export function requireRole(session: JWTPayload | null, roles: string[]) {
  if (!session) return false
  return roles.includes(session.role)
}
