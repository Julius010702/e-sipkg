// src/app/api/master/pemangku/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenPayload } from "@/lib/auth";

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jabatanId = searchParams.get("jabatanId");

    const where: any = {};

    if (payload.role === "ADMIN_SEKOLAH") {
      where.jabatan = { sekolahId: payload.sekolahId };
    }

    if (jabatanId) {
      where.jabatanId = jabatanId;
    }

    const pemangku = await prisma.pemangku.findMany({
      where,
      include: {
        jabatan: {
          select: { id: true, namaJabatan: true, kodeJabatan: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: pemangku });
  } catch (error) {
    console.error("[GET /api/master/pemangku]", error);
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

    const body = await req.json();
    const {
      jabatanId, namaPemangku, nip, statusPegawai,
      pangkatGolongan, pendidikan, bidangPendidikan,
      pengalamanKerja, keterampilan, kondisiFisik,
    } = body;

    if (!jabatanId || !namaPemangku || !statusPegawai) {
      return NextResponse.json(
        { error: "jabatanId, namaPemangku, dan statusPegawai wajib diisi" },
        { status: 400 }
      );
    }

    const jabatan = await prisma.jabatan.findUnique({ where: { id: jabatanId } });
    if (!jabatan) {
      return NextResponse.json({ error: "Jabatan tidak ditemukan" }, { status: 404 });
    }

    if (payload.role === "ADMIN_SEKOLAH" && jabatan.sekolahId !== payload.sekolahId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pemangku = await prisma.pemangku.create({
      data: {
        jabatanId,
        namaPemangku,
        nip: nip || null,
        statusPegawai,
        pangkatGolongan: pangkatGolongan || null,
        pendidikan: pendidikan || null,
        bidangPendidikan: bidangPendidikan || null,
        pengalamanKerja: pengalamanKerja || null,
        keterampilan: keterampilan || null,
        kondisiFisik: kondisiFisik || "BAIK",
      },
      include: {
        jabatan: { select: { id: true, namaJabatan: true, kodeJabatan: true } },
      },
    });

    return NextResponse.json({ data: pemangku }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/master/pemangku]", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "NIP sudah terdaftar" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────
export async function PUT(req: Request) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "id pemangku wajib disertakan" }, { status: 400 });
    }

    const existing = await prisma.pemangku.findUnique({
      where: { id },
      include: { jabatan: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Pemangku tidak ditemukan" }, { status: 404 });
    }

    if (payload.role === "ADMIN_SEKOLAH" && existing.jabatan.sekolahId !== payload.sekolahId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.pemangku.update({
      where: { id },
      data: updateData,
      include: {
        jabatan: { select: { id: true, namaJabatan: true, kodeJabatan: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("[PUT /api/master/pemangku]", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "NIP sudah terdaftar" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id pemangku wajib disertakan" }, { status: 400 });
    }

    const existing = await prisma.pemangku.findUnique({
      where: { id },
      include: { jabatan: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Pemangku tidak ditemukan" }, { status: 404 });
    }

    if (payload.role === "ADMIN_SEKOLAH" && existing.jabatan.sekolahId !== payload.sekolahId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.pemangku.delete({ where: { id } });

    return NextResponse.json({ message: "Pemangku berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/master/pemangku]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}