// src/app/api/perhitungan/final/route.ts
// Admin Pusat only
// GET  ?tahun=2024  → rekap semua sekolah + rekomendasi pemerataan
// POST ?tahun=2024  → generate & simpan rekap final ke DB

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
    if (payload.role !== "ADMIN_PUSAT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tahun = searchParams.get("tahun");

    if (!tahun) {
      // Kembalikan semua rekap final yang sudah tersimpan
      const all = await prisma.rekapFinal.findMany({
        orderBy: { tahun: "desc" },
      });
      return NextResponse.json({ data: all });
    }

    // Cek apakah rekap sudah ada di DB
    const existing = await prisma.rekapFinal.findUnique({ where: { tahun } });

    // Ambil data live dari perhitunganGuru
    const tahunAjaranPattern = `${tahun}/`;
    const perhitunganList = await prisma.perhitunganGuru.findMany({
      where: {
        tahunAjaran: { startsWith: tahunAjaranPattern },
      },
      include: {
        sekolah: {
          select: {
            id: true,
            nama: true,
            jenisSekolah: true,
            kecamatan: true,
            kabupatenKota: true,
          },
        },
      },
    });

    // Aggregasi
    const totalSekolah = perhitunganList.length;
    const totalGuruPNS = perhitunganList.reduce(
      (s, p) => s + (p.jumlahGuruPNS ?? 0),
      0
    );
    const totalGuruPPPK = perhitunganList.reduce(
      (s, p) => s + (p.jumlahGuruPPPK ?? 0),
      0
    );
    const totalKebutuhan = perhitunganList.reduce(
      (s, p) => s + Math.ceil(p.kebutuhanGuru ?? 0),
      0
    );
    const totalKekurangan = perhitunganList.reduce(
      (s, p) => s + (p.kekuranganGuru ?? 0),
      0
    );
    const totalKelebihan = perhitunganList.reduce(
      (s, p) => s + (p.kelebihanGuru ?? 0),
      0
    );

    // Data distribusi per sekolah
    const distribusiData = perhitunganList.map((p) => ({
      sekolahId: p.sekolahId,
      namaSekolah: p.sekolah.nama,
      jenisSekolah: p.sekolah.jenisSekolah,
      kecamatan: p.sekolah.kecamatan,
      kabupatenKota: p.sekolah.kabupatenKota,
      tahunAjaran: p.tahunAjaran,
      jumlahGuruPNS: p.jumlahGuruPNS ?? 0,
      jumlahGuruPPPK: p.jumlahGuruPPPK ?? 0,
      jumlahGuruTersedia: p.jumlahGuruTersedia ?? 0,
      kebutuhanGuru: p.kebutuhanGuru ?? 0,
      kekuranganGuru: p.kekuranganGuru ?? 0,
      kelebihanGuru: p.kelebihanGuru ?? 0,
      statusKebutuhan: p.statusKebutuhan,
    }));

    // Rekomendasi pemerataan: sekolah kelebihan → kirim ke sekolah kekurangan
    const sekolahKelebihan = distribusiData
      .filter((d) => d.kelebihanGuru > 0)
      .sort((a, b) => b.kelebihanGuru - a.kelebihanGuru);

    const sekolahKekurangan = distribusiData
      .filter((d) => d.kekuranganGuru > 0)
      .sort((a, b) => b.kekuranganGuru - a.kekuranganGuru);

    const rekomendasiData = sekolahKekurangan.map((butuh) => {
      const sumber = sekolahKelebihan.find((lebih) => lebih.kelebihanGuru > 0);
      if (!sumber) return { ...butuh, rekomendasi: "Perlu rekrutmen baru" };
      const transfer = Math.min(butuh.kekuranganGuru, sumber.kelebihanGuru);
      sumber.kelebihanGuru -= transfer;
      return {
        sekolahTujuan: butuh.namaSekolah,
        kecamatanTujuan: butuh.kecamatan,
        sekolahSumber: sumber.namaSekolah,
        kecamatanSumber: sumber.kecamatan,
        jumlahTransfer: transfer,
        sisaKekurangan: butuh.kekuranganGuru - transfer,
      };
    });

    return NextResponse.json({
      data: {
        tahun,
        totalSekolah,
        totalGuruPNS,
        totalGuruPPPK,
        totalKebutuhan,
        totalKekurangan,
        totalKelebihan,
        distribusiData,
        rekomendasiData,
        sudahDisimpan: !!existing,
      },
    });
  } catch (error) {
    console.error("[GET /api/perhitungan/final]", error);
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
    const { tahun } = body;

    if (!tahun) {
      return NextResponse.json({ error: "tahun wajib diisi" }, { status: 400 });
    }

    // Ambil data perhitungan semua sekolah untuk tahun ini
    const tahunAjaranPattern = `${tahun}/`;
    const perhitunganList = await prisma.perhitunganGuru.findMany({
      where: { tahunAjaran: { startsWith: tahunAjaranPattern } },
      include: {
        sekolah: {
          select: {
            id: true,
            nama: true,
            jenisSekolah: true,
            kecamatan: true,
            kabupatenKota: true,
          },
        },
      },
    });

    if (perhitunganList.length === 0) {
      return NextResponse.json(
        { error: `Belum ada data perhitungan untuk tahun ${tahun}` },
        { status: 400 }
      );
    }

    // Hitung aggregasi
    const totalSekolah = perhitunganList.length;
    const totalGuruPNS = perhitunganList.reduce((s, p) => s + (p.jumlahGuruPNS ?? 0), 0);
    const totalGuruPPPK = perhitunganList.reduce((s, p) => s + (p.jumlahGuruPPPK ?? 0), 0);
    const totalKebutuhan = perhitunganList.reduce((s, p) => s + Math.ceil(p.kebutuhanGuru ?? 0), 0);
    const totalKekurangan = perhitunganList.reduce((s, p) => s + (p.kekuranganGuru ?? 0), 0);
    const totalKelebihan = perhitunganList.reduce((s, p) => s + (p.kelebihanGuru ?? 0), 0);

    const distribusiData = perhitunganList.map((p) => ({
      sekolahId: p.sekolahId,
      namaSekolah: p.sekolah.nama,
      jenisSekolah: p.sekolah.jenisSekolah,
      kecamatan: p.sekolah.kecamatan,
      kabupatenKota: p.sekolah.kabupatenKota,
      tahunAjaran: p.tahunAjaran,
      jumlahGuruPNS: p.jumlahGuruPNS ?? 0,
      jumlahGuruPPPK: p.jumlahGuruPPPK ?? 0,
      jumlahGuruTersedia: p.jumlahGuruTersedia ?? 0,
      kebutuhanGuru: p.kebutuhanGuru ?? 0,
      kekuranganGuru: p.kekuranganGuru ?? 0,
      kelebihanGuru: p.kelebihanGuru ?? 0,
      statusKebutuhan: p.statusKebutuhan,
    }));

    // Rekomendasi pemerataan
    const kelebihan = distribusiData
      .filter((d) => d.kelebihanGuru > 0)
      .map((d) => ({ ...d }))
      .sort((a, b) => b.kelebihanGuru - a.kelebihanGuru);

    const rekomendasiData = distribusiData
      .filter((d) => d.kekuranganGuru > 0)
      .sort((a, b) => b.kekuranganGuru - a.kekuranganGuru)
      .map((butuh) => {
        const sumber = kelebihan.find((l) => l.kelebihanGuru > 0);
        if (!sumber) {
          return {
            sekolahTujuan: butuh.namaSekolah,
            kecamatanTujuan: butuh.kecamatan,
            jumlahDibutuhkan: butuh.kekuranganGuru,
            sekolahSumber: null,
            jumlahTransfer: 0,
            sisaKekurangan: butuh.kekuranganGuru,
            rekomendasi: "Perlu rekrutmen baru",
          };
        }
        const transfer = Math.min(butuh.kekuranganGuru, sumber.kelebihanGuru);
        sumber.kelebihanGuru -= transfer;
        return {
          sekolahTujuan: butuh.namaSekolah,
          kecamatanTujuan: butuh.kecamatan,
          sekolahSumber: sumber.namaSekolah,
          kecamatanSumber: sumber.kecamatan,
          jumlahDibutuhkan: butuh.kekuranganGuru,
          jumlahTransfer: transfer,
          sisaKekurangan: butuh.kekuranganGuru - transfer,
          rekomendasi:
            transfer > 0
              ? `Mutasi ${transfer} guru dari ${sumber.namaSekolah}`
              : "Perlu rekrutmen baru",
        };
      });

    // Upsert rekap final
    const rekap = await prisma.rekapFinal.upsert({
      where: { tahun },
      update: {
        totalSekolah,
        totalGuruPNS,
        totalGuruPPPK,
        totalKebutuhan,
        totalKekurangan,
        totalKelebihan,
        distribusiData,
        rekomendasiData,
      },
      create: {
        tahun,
        totalSekolah,
        totalGuruPNS,
        totalGuruPPPK,
        totalKebutuhan,
        totalKekurangan,
        totalKelebihan,
        distribusiData,
        rekomendasiData,
      },
    });

    return NextResponse.json({ data: rekap }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/perhitungan/final]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}