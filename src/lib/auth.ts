// src/lib/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "e-sipkg-secret";
const COOKIE_NAME = "esipkg_token";
const MAX_AGE = 60 * 60 * 8; // 8 jam

// ── Types ──────────────────────────────────────────────
export interface JWTPayload {
  userId: string;
  email: string;
  nama: string;
  role: "ADMIN_PUSAT" | "ADMIN_SEKOLAH";
  sekolahId: string | null;
  sekolahNama: string | null;
  iat?: number;
  exp?: number;
}

// ── Token ──────────────────────────────────────────────
export function signToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// ── Password ───────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Session (Server Component) ─────────────────────────
export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

// ── Session dari NextRequest (Middleware & API) ────────
export function getSessionFromRequest(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ── Session dari plain Request (API Route handler) ─────
export async function getTokenPayload(req: Request): Promise<JWTPayload | null> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`)
    );
    if (!match) return null;
    return verifyToken(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

// ── Cookie helpers ─────────────────────────────────────
export function createTokenCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MAX_AGE,
    path: "/",
  };
}

export function clearTokenCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  };
}

// ── Login Service ──────────────────────────────────────
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { sekolah: { select: { id: true, nama: true } } },
  });

  if (!user) {
    return { success: false, message: "Email tidak ditemukan" };
  }

  if (user.status === "NONAKTIF") {
    return {
      success: false,
      message: "Akun Anda dinonaktifkan. Hubungi Admin Pusat.",
    };
  }

  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    return { success: false, message: "Password salah" };
  }

  const payload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: user.id,
    email: user.email,
    nama: user.nama,
    role: user.role,
    sekolahId: user.sekolahId,
    sekolahNama: user.sekolah?.nama ?? null,
  };

  const token = signToken(payload);

  return {
    success: true,
    token,
    user: payload,
    redirectTo:
      user.role === "ADMIN_PUSAT" ? "/dashboard" : "/sekolah/dashboard",
  };
}