// src/app/api/users/route.ts
// Admin Pusat only
// GET   → list semua user
// POST  → tambah user baru

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenPayload } from "@/lib/auth";
import bcrypt from "bcryptjs";

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "ADMIN_PUSAT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as "ADMIN_PUSAT" | "ADMIN_SEKOLAH" | null;
    const status = searchParams.get("status") as "AKTIF" | "NONAKTIF" | null;

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { nama: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        status: true,
        sekolahId: true,
        sekolah: { select: { id: true, nama: true, jenisSekolah: true } },
        createdAt: true,
        updatedAt: true,
        // password TIDAK dikembalikan
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: users, total: users.length });
  } catch (error) {
    console.error("[GET /api/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "ADMIN_PUSAT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { nama, email, password, role, sekolahId, status } = body;

    if (!nama || !email || !password || !role) {
      return NextResponse.json(
        { error: "nama, email, password, dan role wajib diisi" },
        { status: 400 }
      );
    }

    if (!["ADMIN_PUSAT", "ADMIN_SEKOLAH"].includes(role)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    if (role === "ADMIN_SEKOLAH" && !sekolahId) {
      return NextResponse.json(
        { error: "sekolahId wajib diisi untuk ADMIN_SEKOLAH" },
        { status: 400 }
      );
    }

    // Validasi email unik
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    // Validasi sekolah jika ADMIN_SEKOLAH
    if (sekolahId) {
      const sekolah = await prisma.sekolah.findUnique({ where: { id: sekolahId } });
      if (!sekolah) {
        return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role,
        sekolahId: role === "ADMIN_SEKOLAH" ? sekolahId : null,
        status: status || "AKTIF",
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        status: true,
        sekolahId: true,
        sekolah: { select: { id: true, nama: true } },
        createdAt: true,
      },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/users]", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}