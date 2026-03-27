// src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN_PUSAT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Total sekolah per jenis ─────────────────────────────
    const [totalSMA, totalSMK, totalSLB] = await Promise.all([
      prisma.sekolah.count({ where: { jenisSekolah: "SMA", aktif: true } }),
      prisma.sekolah.count({ where: { jenisSekolah: "SMK", aktif: true } }),
      prisma.sekolah.count({ where: { jenisSekolah: "SLB", aktif: true } }),
    ]);

    // ── Total guru per status pegawai ───────────────────────
    const [guruPNS, guruPPPK] = await Promise.all([
      prisma.guru.count({ where: { statusPegawai: "PNS", aktif: true } }),
      prisma.guru.count({ where: { statusPegawai: "PPPK", aktif: true } }),
    ]);

    // ── Agregasi perhitungan guru ───────────────────────────
    const agregasi = await prisma.perhitunganGuru.aggregate({
      _sum: {
        jumlahGuruTersedia: true,
        kebutuhanGuru: true,
        kekuranganGuru: true,
        kelebihanGuru: true,
      },
    });

    // ── Rekap per kabupaten/kota ────────────────────────────
    const sekolahList = await prisma.sekolah.findMany({
      where: { aktif: true },
      select: {
        kabupatenKota: true,
        perhitunganGuru: {
          select: {
            jumlahGuruTersedia: true,
            kebutuhanGuru: true,
            kekuranganGuru: true,
            kelebihanGuru: true,
            statusKebutuhan: true,
          },
        },
      },
    });

    // Kelompokkan per kabupaten/kota
    type KabupatenEntry = { tersedia: number; kebutuhan: number; selisih: number };
    const kabupatenMap = new Map<string, KabupatenEntry>();

    for (const sekolah of sekolahList) {
      const nama = sekolah.kabupatenKota || "Tidak Diketahui";
      if (!kabupatenMap.has(nama)) {
        kabupatenMap.set(nama, { tersedia: 0, kebutuhan: 0, selisih: 0 });
      }
      const entry = kabupatenMap.get(nama)!;

      for (const p of sekolah.perhitunganGuru) {
        entry.tersedia += p.jumlahGuruTersedia ?? 0;
        entry.kebutuhan += Math.round(p.kebutuhanGuru ?? 0);
        entry.selisih = entry.tersedia - entry.kebutuhan;
      }
    }

    const rekapPerKabupaten = Array.from(kabupatenMap.entries())
      .map(([nama, val]) => ({ nama, ...val }))
      .sort((a, b) => a.nama.localeCompare(b.nama));

    // ── Hitung total ────────────────────────────────────────
    const kebutuhanTotal = Math.round(agregasi._sum.kebutuhanGuru ?? 0);
    const kekuranganTotal = agregasi._sum.kekuranganGuru ?? 0;
    const kelebihanTotal = agregasi._sum.kelebihanGuru ?? 0;
    const totalGuru = agregasi._sum.jumlahGuruTersedia ?? 0;

    return NextResponse.json({
      totalGuru,
      guruPNS,
      guruPPPK,
      kebutuhanTotal,
      kekuranganTotal,
      kelebihanTotal,
      totalSekolah: totalSMA + totalSMK + totalSLB,
      totalSMA,
      totalSMK,
      totalSLB,
      rekapPerKabupaten,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}