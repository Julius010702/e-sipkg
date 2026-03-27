// src/app/api/guru/route.ts
// GET  ?sekolahId=xxx&search=xxx&status=PNS|PPPK  → list guru
// POST                                            → tambah guru

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
    const search = searchParams.get("search") || "";
    const statusPegawai = searchParams.get("status") as "PNS" | "PPPK" | null;
    const aktif = searchParams.get("aktif");

    // ADMIN_SEKOLAH hanya bisa lihat guru sekolahnya sendiri
    const sekolahId =
      payload.role === "ADMIN_SEKOLAH"
        ? payload.sekolahId!
        : searchParams.get("sekolahId") || undefined;

    const guru = await prisma.guru.findMany({
      where: {
        ...(sekolahId ? { sekolahId } : {}),
        ...(statusPegawai ? { statusPegawai } : {}),
        ...(aktif !== null ? { aktif: aktif === "true" } : {}),
        ...(search
          ? {
              OR: [
                { nama: { contains: search, mode: "insensitive" } },
                { nip: { contains: search, mode: "insensitive" } },
                { mataPelajaran: { contains: search, mode: "insensitive" } },
                { bidangStudi: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        sekolah: { select: { id: true, nama: true, jenisSekolah: true } },
      },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json({ data: guru, total: guru.length });
  } catch (error) {
    console.error("[GET /api/guru]", error);
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
      sekolahId,
      nip,
      nama,
      statusPegawai,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      pangkatGolongan,
      tmtGolongan,
      pendidikanTerakhir,
      bidangStudi,
      mataPelajaran,
      statusSertifikasi,
      nomorSertifikasi,
      tmtMasuk,
      alamat,
      telepon,
      email,
      foto,
    } = body;

    if (!nama || !statusPegawai) {
      return NextResponse.json(
        { error: "nama dan statusPegawai wajib diisi" },
        { status: 400 }
      );
    }

    // Tentukan sekolahId berdasarkan role
    const targetSekolahId =
      payload.role === "ADMIN_SEKOLAH" ? payload.sekolahId! : sekolahId;

    if (!targetSekolahId) {
      return NextResponse.json(
        { error: "sekolahId wajib diisi" },
        { status: 400 }
      );
    }

    const guru = await prisma.guru.create({
      data: {
        sekolahId: targetSekolahId,
        nip: nip || null,
        nama,
        statusPegawai,
        jenisKelamin: jenisKelamin || null,
        tempatLahir: tempatLahir || null,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        pangkatGolongan: pangkatGolongan || null,
        tmtGolongan: tmtGolongan ? new Date(tmtGolongan) : null,
        pendidikanTerakhir: pendidikanTerakhir || null,
        bidangStudi: bidangStudi || null,
        mataPelajaran: mataPelajaran || null,
        statusSertifikasi: statusSertifikasi ?? false,
        nomorSertifikasi: nomorSertifikasi || null,
        tmtMasuk: tmtMasuk ? new Date(tmtMasuk) : null,
        alamat: alamat || null,
        telepon: telepon || null,
        email: email || null,
        foto: foto || null,
      },
      include: {
        sekolah: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json({ data: guru }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/guru]", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "NIP sudah terdaftar" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}