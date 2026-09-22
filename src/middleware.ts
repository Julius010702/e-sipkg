import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookieNameForPath } from '@/lib/session-cookie'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Blokir path traversal (../../etc/passwd) ──────────
  if (pathname.includes('..') || pathname.includes('%2e%2e') || pathname.includes('%252e')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ── 2. Blokir akses file system Windows/Linux sensitif ───
  const blocked = [
    'system.ini', 'win.ini', '/etc/passwd', '/etc/shadow',
    'web.xml', 'WEB-INF', '.env', '.git', 'package.json',
    'node_modules',
  ]
  const lowerPath = pathname.toLowerCase()
  for (const b of blocked) {
    if (lowerPath.includes(b.toLowerCase())) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // ── 3. Blokir SSI injection (<!--#EXEC cmd) ───────────────
  const url = request.url
  if (url.includes('#EXEC') || url.includes('%23EXEC') || url.includes('cmd=')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ── 4. Validasi parameter w= di _next/image ───────────────
  // w harus angka, bukan string URL atau path aneh
  if (pathname === '/_next/image') {
    const w = request.nextUrl.searchParams.get('w')
    const validWidths = ['16','32','48','64','96','128','256','384','640','750','828','1080','1200','1920','2048','3840']
    if (w && !validWidths.includes(w)) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    // url parameter hanya boleh path lokal (mulai /)
    const imgUrl = request.nextUrl.searchParams.get('url')
    if (imgUrl && (
      imgUrl.startsWith('http') ||
      imgUrl.startsWith('//') ||
      imgUrl.includes('..') ||
      imgUrl.includes('owasp') ||
      !imgUrl.startsWith('/')
    )) {
      return new NextResponse('Bad Request', { status: 400 })
    }
  }

  // ── 5. Rate limit sederhana: blokir header mencurigakan ──
  const ua = request.headers.get('user-agent') || ''
  const suspiciousUA = ['ZAP', 'sqlmap', 'nikto', 'masscan', 'nmap', 'burp']
  // Uncomment di production jika mau blokir scanner:
  // if (suspiciousUA.some(s => ua.toLowerCase().includes(s.toLowerCase()))) {
  //   return new NextResponse('Forbidden', { status: 403 })
  // }

  // ── 6. Auth guard — proteksi route dashboard ─────────────
  const protectedPaths = ['/admin', '/biro', '/wilayah', '/dashboard', '/guru', '/laporan', '/profil']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPage  = pathname.startsWith('/login')
  const isPublic    = pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api/public') || pathname.startsWith('/logo') || /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(pathname)

  if (isProtected && !isPublic) {
    const cookieName = cookieNameForPath(pathname)
    const token = request.cookies.get(cookieName)?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Teruskan path saat ini via header, supaya Server Component (getSession)
  // tahu area (Admin/Biro/Sekolah) mana yang sedang diakses dan membaca
  // cookie sesi yang tepat — bukan cookie sesi peran lain yang mungkin
  // juga sedang login di browser yang sama.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // ── 7. Tambah security headers di setiap response ────────
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    // Match semua kecuali file statis Next.js internal
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/_next/image',
  ],
}
