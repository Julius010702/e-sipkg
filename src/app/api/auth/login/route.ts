// ✅ WAJIB: pakai Node.js runtime (bukan Edge)
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { loginUser, createTokenCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // ✅ Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // ✅ Login user
    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "Login gagal" },
        { status: 401 }
      );
    }

    // ✅ Response sukses
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: result.user,
      redirectTo: result.redirectTo || "/dashboard",
    });

    // ✅ Set cookie JWT
    const cookie = createTokenCookie(result.token!);

    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 🔥 fix penting
      sameSite: "lax",
      maxAge: cookie.maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}