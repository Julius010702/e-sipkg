// ============================================================
// Cookie sesi TERPISAH per peran, supaya Sekolah / Wilayah / Biro /
// Admin bisa login bersamaan di browser yang sama tanpa saling
// menimpa / melempar keluar satu sama lain.
// ============================================================

export type Role = 'ADMIN' | 'BIRO' | 'WILAYAH' | 'SEKOLAH'

export const ROLE_COOKIE: Record<Role, string> = {
  ADMIN:   'token_admin',
  BIRO:    'token_biro',
  WILAYAH: 'token_wilayah',
  SEKOLAH: 'token_sekolah',
}

export const ALL_SESSION_COOKIES = Object.values(ROLE_COOKIE)

// Prefix path yang jelas milik Admin / Biro / Wilayah. Selain itu
// (termasuk semua halaman Sekolah yang tidak berprefix, seperti
// /dashboard, /guru, /laporan, /profil) dianggap area Sekolah.
// Catatan: '/api/wilayah' (huruf kecil, tanpa akhiran) adalah endpoint
// MASTER DATA kabupaten/kota yang dipakai Admin & Biro — beda dengan
// '/wilayah' (halaman) dan '/api/wilayah-monitor' (API) milik role
// WILAYAH di sini, jadi tidak saling tertukar.
const ADMIN_PREFIXES   = ['/admin']
const BIRO_PREFIXES    = ['/biro', '/api/biro', '/api/analisis', '/api/validasi']
const WILAYAH_PREFIXES = ['/wilayah', '/api/wilayah-monitor']

export function cookieNameForPath(pathname: string): string {
  if (ADMIN_PREFIXES.some(p => pathname.startsWith(p)))   return ROLE_COOKIE.ADMIN
  if (BIRO_PREFIXES.some(p => pathname.startsWith(p)))     return ROLE_COOKIE.BIRO
  if (WILAYAH_PREFIXES.some(p => pathname.startsWith(p)))  return ROLE_COOKIE.WILAYAH
  return ROLE_COOKIE.SEKOLAH
}
