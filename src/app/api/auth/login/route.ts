// src/app/api/auth/login/route.ts — REPLACE SELURUH ISI
import { NextRequest, NextResponse } from "next/server";
import { loginUser, createTokenCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const result = await loginUser(email.trim().toLowerCase(), password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: result.user,
      redirectTo: result.redirectTo,
    });

    // Set cookie dengan semua atribut yang benar
    const cookie = createTokenCookie(result.token!);
    response.cookies.set({
      name:     cookie.name,
      value:    cookie.value,
      httpOnly: cookie.httpOnly,
      secure:   cookie.secure,
      sameSite: cookie.sameSite,
      maxAge:   cookie.maxAge,
      path:     cookie.path,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}