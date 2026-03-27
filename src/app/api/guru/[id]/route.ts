// src/app/api/guru/[id]/route.ts
// GET    /api/guru/[id]  → detail guru
// PUT    /api/guru/[id]  → update guru
// DELETE /api/guru/[id]  → hapus guru

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenPayload } from "@/lib/auth";

type Params = { params: { id: string } };

// ─── Helper: cek kepemilikan ──────────────────────────────────────────────────
async function getGuruOrForbidden(id: string, payload: any) {
  const guru = await prisma.guru.findUnique({
    where: { id },
    include: { sekolah: { select: { id: true, nama: true, jenisSekolah: true } } },
  });
  if (!guru) return { error: "Guru tidak ditemukan", status: 404 };
  if (payload.role === "ADMIN_SEKOLAH" && guru.sekolahId !== payload.sekolahId) {
    return { error: "Forbidden", status: 403 };
  }
  return { guru };
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: Request, { params }: Params) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await getGuruOrForbidden(params.id, payload);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ data: result.guru });
  } catch (error) {
    console.error("[GET /api/guru/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────
export async function PUT(req: Request, { params }: Params) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const check = await getGuruOrForbidden(params.id, payload);
    if ("error" in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await req.json();
    const {
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
      aktif,
    } = body;

    const updated = await prisma.guru.update({
      where: { id: params.id },
      data: {
        ...(nip !== undefined ? { nip } : {}),
        ...(nama ? { nama } : {}),
        ...(statusPegawai ? { statusPegawai } : {}),
        ...(jenisKelamin !== undefined ? { jenisKelamin } : {}),
        ...(tempatLahir !== undefined ? { tempatLahir } : {}),
        ...(tanggalLahir !== undefined
          ? { tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null }
          : {}),
        ...(pangkatGolongan !== undefined ? { pangkatGolongan } : {}),
        ...(tmtGolongan !== undefined
          ? { tmtGolongan: tmtGolongan ? new Date(tmtGolongan) : null }
          : {}),
        ...(pendidikanTerakhir !== undefined ? { pendidikanTerakhir } : {}),
        ...(bidangStudi !== undefined ? { bidangStudi } : {}),
        ...(mataPelajaran !== undefined ? { mataPelajaran } : {}),
        ...(statusSertifikasi !== undefined ? { statusSertifikasi } : {}),
        ...(nomorSertifikasi !== undefined ? { nomorSertifikasi } : {}),
        ...(tmtMasuk !== undefined
          ? { tmtMasuk: tmtMasuk ? new Date(tmtMasuk) : null }
          : {}),
        ...(alamat !== undefined ? { alamat } : {}),
        ...(telepon !== undefined ? { telepon } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(foto !== undefined ? { foto } : {}),
        ...(aktif !== undefined ? { aktif } : {}),
      },
      include: {
        sekolah: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("[PUT /api/guru/[id]]", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "NIP sudah terdaftar" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: Request, { params }: Params) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const check = await getGuruOrForbidden(params.id, payload);
    if ("error" in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    await prisma.guru.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Data guru berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/guru/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}