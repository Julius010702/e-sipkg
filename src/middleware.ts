// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "esipkg_token";
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "e-sipkg-secret");
const PUBLIC_PATHS = ["/login", "/", "/home"];

async function getSession(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; role: string; nama: string; sekolahId?: string };
  } catch { return null; }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/uploads/") ||
    /\.[a-z]{2,4}$/i.test(pathname)
  ) return NextResponse.next();

  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const session = await getSession(req);

  if (!session) {
    if (pathname.startsWith("/api/"))
      return NextResponse.json({ success: false, message: "Tidak terautentikasi" }, { status: 401 });
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const ADMIN_PUSAT_ROUTES = ["/dashboard", "/admin", "/master-data", "/anjab-abk", "/perhitungan-final", "/pengaturan", "/profil"];
  const isAdminRoute   = ADMIN_PUSAT_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isSekolahRoute = pathname.startsWith("/sekolah");

  if (isAdminRoute && session.role !== "ADMIN_PUSAT")
    return NextResponse.redirect(new URL("/sekolah/dashboard", req.url));
  if (isSekolahRoute && session.role !== "ADMIN_SEKOLAH")
    return NextResponse.redirect(new URL("/dashboard", req.url));

  const headers = new Headers(req.headers);
  headers.set("x-user-id",   session.userId);
  headers.set("x-user-role", session.role);
  headers.set("x-user-nama", encodeURIComponent(session.nama));
  if (session.sekolahId) headers.set("x-sekolah-id", session.sekolahId);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)"],
};