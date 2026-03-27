// src/app/api/sekolah/dashboard/stats/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // ── Validasi session ────────────────────────────────────
    const session = getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN_SEKOLAH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!session.sekolahId) {
      return NextResponse.json(
        { error: "Akun ini tidak terhubung ke sekolah manapun" },
        { status: 400 }
      );
    }

    const sekolahId = session.sekolahId;

    // ── Query paralel ───────────────────────────────────────
    const [
      sekolah,
      totalGuru,
      guruPNS,
      guruPPPK,
      guruBersertifikat,
      perhitunganTerbaru,
      jabatanCount,
      pemangkuCount,
    ] = await Promise.all([

      // Info sekolah dari token (sudah ada sekolahId & sekolahNama di JWT,
      // tapi kita fetch detail lengkap dari DB)
      prisma.sekolah.findUnique({
        where: { id: sekolahId },
        select: {
          nama: true,
          npsn: true,
          jenisSekolah: true,
          kabupatenKota: true,
          kecamatan: true,
          kepalaSekolah: true,
          aktif: true,
        },
      }),

      // Total guru aktif
      prisma.guru.count({
        where: { sekolahId, aktif: true },
      }),

      // Guru PNS aktif
      prisma.guru.count({
        where: { sekolahId, aktif: true, statusPegawai: "PNS" },
      }),

      // Guru PPPK aktif
      prisma.guru.count({
        where: { sekolahId, aktif: true, statusPegawai: "PPPK" },
      }),

      // Guru bersertifikat
      prisma.guru.count({
        where: { sekolahId, aktif: true, statusSertifikasi: true },
      }),

      // Perhitungan guru — tahun ajaran terbaru
      prisma.perhitunganGuru.findFirst({
        where: { sekolahId },
        orderBy: { tahunAjaran: "desc" },
        select: {
          tahunAjaran: true,
          jumlahRombel: true,
          jumlahJamPelajaran: true,
          bebanMengajar: true,
          jumlahGuruTersedia: true,
          jumlahGuruPNS: true,
          jumlahGuruPPPK: true,
          kebutuhanGuru: true,
          kekuranganGuru: true,
          kelebihanGuru: true,
          statusKebutuhan: true,
          catatan: true,
          updatedAt: true,
        },
      }),

      // Jumlah jabatan terdaftar di sekolah ini
      prisma.jabatan.count({
        where: { sekolahId },
      }),

      // Jumlah pemangku jabatan di sekolah ini
      prisma.pemangku.count({
        where: { jabatan: { sekolahId } },
      }),
    ]);

    // ── Top 5 mata pelajaran terbanyak ─────────────────────
    const guruPerMapel = await prisma.guru.groupBy({
      by: ["mataPelajaran"],
      where: { sekolahId, aktif: true, mataPelajaran: { not: null } },
      _count: { mataPelajaran: true },
      orderBy: { _count: { mataPelajaran: "desc" } },
      take: 5,
    });

    // ── Response ────────────────────────────────────────────
    return NextResponse.json({
      sekolah,
      statistik: {
        totalGuru,
        guruPNS,
        guruPPPK,
        guruBersertifikat,
        guruBelumSertifikat: totalGuru - guruBersertifikat,
      },
      perhitunganTerbaru,
      jabatanCount,
      pemangkuCount,
      guruPerMapel: guruPerMapel.map((g) => ({
        mataPelajaran: g.mataPelajaran ?? "Tidak diisi",
        jumlah: g._count.mataPelajaran,
      })),
    });

  } catch (error) {
    console.error("[GET /api/sekolah/dashboard/stats]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}