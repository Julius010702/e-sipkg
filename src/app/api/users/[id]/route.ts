// src/app/api/users/[id]/route.ts
// Admin Pusat only
// GET    → detail user
// PUT    → update user (nama, email, password, role, sekolah, status)
// DELETE → hapus user

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenPayload } from "@/lib/auth";
import bcrypt from "bcryptjs";

type Params = { params: { id: string } };

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: Request, { params }: Params) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "ADMIN_PUSAT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("[GET /api/users/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────
export async function PUT(req: Request, { params }: Params) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "ADMIN_PUSAT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { nama, email, password, role, sekolahId, status } = body;

    // Validasi email unik jika diubah
    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
      }
    }

    // Validasi sekolah jika role ADMIN_SEKOLAH
    const targetRole = role || existing.role;
    if (targetRole === "ADMIN_SEKOLAH") {
      const targetSekolahId = sekolahId !== undefined ? sekolahId : existing.sekolahId;
      if (!targetSekolahId) {
        return NextResponse.json(
          { error: "sekolahId wajib untuk ADMIN_SEKOLAH" },
          { status: 400 }
        );
      }
      const sekolah = await prisma.sekolah.findUnique({
        where: { id: targetSekolahId },
      });
      if (!sekolah) {
        return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
      }
    }

    const updateData: any = {
      ...(nama ? { nama } : {}),
      ...(email ? { email } : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    };

    // Update sekolahId: set null jika ADMIN_PUSAT, set value jika ADMIN_SEKOLAH
    if (role === "ADMIN_PUSAT") {
      updateData.sekolahId = null;
    } else if (sekolahId !== undefined) {
      updateData.sekolahId = sekolahId;
    }

    // Hash password baru jika diberikan
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        status: true,
        sekolahId: true,
        sekolah: { select: { id: true, nama: true } },
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("[PUT /api/users/[id]]", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: Request, { params }: Params) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "ADMIN_PUSAT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cegah admin pusat hapus dirinya sendiri
if (params.id === payload.userId) {      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/users/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}