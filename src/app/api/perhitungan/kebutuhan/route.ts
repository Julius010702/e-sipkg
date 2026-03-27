// src/app/api/perhitungan/kebutuhan/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenPayload } from "@/lib/auth";

// ─── Rumus Perhitungan ────────────────────────────────────────────────────────
function hitungKebutuhan(
  jumlahRombel: number,
  jumlahJamPelajaran: number,
  bebanMengajar: number = 24
): number {
  return (jumlahRombel * jumlahJamPelajaran) / bebanMengajar;
}

function hitungStatus(
  kebutuhan: number,
  tersedia: number
): "KURANG" | "LEBIH" | "SESUAI" {
  const selisih = kebutuhan - tersedia;
  if (selisih > 0) return "KURANG";
  if (selisih < 0) return "LEBIH";
  return "SESUAI";
}

// Prediksi linear regression sederhana
function hitungPrediksi(
  dataHistoris: { tahun: number; kebutuhan: number }[],
  tahunPrediksi: number = 5
): { tahun: string; prediksi: number }[] {
  if (dataHistoris.length < 2) return [];

  const n = dataHistoris.length;
  const sumX = dataHistoris.reduce((a, b) => a + b.tahun, 0);
  const sumY = dataHistoris.reduce((a, b) => a + b.kebutuhan, 0);
  const sumXY = dataHistoris.reduce((a, b) => a + b.tahun * b.kebutuhan, 0);
  const sumX2 = dataHistoris.reduce((a, b) => a + b.tahun * b.tahun, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastTahun = Math.max(...dataHistoris.map((d) => d.tahun));
  const result: { tahun: string; prediksi: number }[] = [];

  for (let i = 1; i <= tahunPrediksi; i++) {
    const tahun = lastTahun + i;
    const prediksi = parseFloat((slope * tahun + intercept).toFixed(2));
    result.push({ tahun: String(tahun), prediksi: Math.max(0, prediksi) });
  }

  return result;
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tahunAjaran = searchParams.get("tahunAjaran");

    const sekolahId =
      payload.role === "ADMIN_SEKOLAH"
        ? payload.sekolahId!
        : searchParams.get("sekolahId") || undefined;

    // ✅ Jalankan paralel: ambil perhitungan + hitung guru aktif terkini
    const [perhitungan, jumlahGuruAktif] = await Promise.all([
      prisma.perhitunganGuru.findMany({
        where: {
          ...(sekolahId ? { sekolahId } : {}),
          ...(tahunAjaran ? { tahunAjaran } : {}),
        },
        include: {
          sekolah: {
            select: { id: true, nama: true, jenisSekolah: true, kecamatan: true },
          },
        },
        orderBy: { tahunAjaran: "desc" },
      }),

      // ✅ Selalu hitung ulang dari DB agar sinkron dengan Data Guru
      sekolahId
        ? prisma.guru.count({ where: { sekolahId, aktif: true } })
        : Promise.resolve(null),
    ]);

    // ✅ Override jumlahGuruTersedia + hitung ulang status & selisih secara real-time
    const data = perhitungan.map((p) => {
      if (jumlahGuruAktif === null || p.kebutuhanGuru === null) return p;

      const selisih = p.kebutuhanGuru - jumlahGuruAktif;
      return {
        ...p,
        jumlahGuruTersedia: jumlahGuruAktif,
        kekuranganGuru: selisih > 0 ? Math.ceil(selisih) : 0,
        kelebihanGuru: selisih < 0 ? Math.abs(Math.floor(selisih)) : 0,
        statusKebutuhan: selisih > 0 ? "KURANG" : selisih < 0 ? "LEBIH" : "SESUAI",
      };
    });

    // ✅ Background sync ke DB (fire-and-forget) agar data tersimpan tetap konsisten
    if (sekolahId && jumlahGuruAktif !== null) {
      prisma.perhitunganGuru
        .updateMany({
          where: { sekolahId },
          data: { jumlahGuruTersedia: jumlahGuruAktif },
        })
        .catch((e) => console.error("[sync jumlahGuruTersedia]", e));
    }

    return NextResponse.json({ data, total: data.length });
  } catch (error) {
    console.error("[GET /api/perhitungan/kebutuhan]", error);
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
      sekolahId: bodySekolahId,
      tahunAjaran,
      jumlahRombel,
      jumlahJamPelajaran,
      bebanMengajar = 24,
      catatan,
    } = body;

    const sekolahId =
      payload.role === "ADMIN_SEKOLAH" ? payload.sekolahId! : bodySekolahId;

    if (!sekolahId || !tahunAjaran || !jumlahRombel || !jumlahJamPelajaran) {
      return NextResponse.json(
        {
          error:
            "sekolahId, tahunAjaran, jumlahRombel, dan jumlahJamPelajaran wajib diisi",
        },
        { status: 400 }
      );
    }

    // Validasi sekolah
    const sekolah = await prisma.sekolah.findUnique({ where: { id: sekolahId } });
    if (!sekolah) {
      return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
    }

    // ✅ Hitung jumlah guru tersedia terkini dari DB (selalu real-time saat POST)
    const guruList = await prisma.guru.findMany({
      where: { sekolahId, aktif: true },
    });
    const jumlahGuruTersedia = guruList.length;
    const jumlahGuruPNS = guruList.filter((g) => g.statusPegawai === "PNS").length;
    const jumlahGuruPPPK = guruList.filter((g) => g.statusPegawai === "PPPK").length;

    // Hitung kebutuhan
    const kebutuhanGuru = hitungKebutuhan(jumlahRombel, jumlahJamPelajaran, bebanMengajar);
    const selisih = kebutuhanGuru - jumlahGuruTersedia;
    const kekuranganGuru = selisih > 0 ? Math.ceil(selisih) : 0;
    const kelebihanGuru = selisih < 0 ? Math.abs(Math.floor(selisih)) : 0;
    const statusKebutuhan = hitungStatus(kebutuhanGuru, jumlahGuruTersedia);

    // Ambil data historis untuk prediksi
    const historis = await prisma.perhitunganGuru.findMany({
      where: { sekolahId },
      orderBy: { tahunAjaran: "asc" },
      select: { tahunAjaran: true, kebutuhanGuru: true },
    });

    const dataHistorisForPrediksi = historis
      .filter((h) => h.kebutuhanGuru !== null)
      .map((h) => ({
        tahun: parseInt(h.tahunAjaran.split("/")[0]),
        kebutuhan: h.kebutuhanGuru!,
      }));

    // Tambahkan data baru ke historis sebelum prediksi
    dataHistorisForPrediksi.push({
      tahun: parseInt(tahunAjaran.split("/")[0]),
      kebutuhan: kebutuhanGuru,
    });

    const prediksiData =
      dataHistorisForPrediksi.length >= 2
        ? hitungPrediksi(dataHistorisForPrediksi, 5)
        : [];

    // Upsert (update jika tahunAjaran sudah ada, insert jika belum)
    const result = await prisma.perhitunganGuru.upsert({
      where: {
        sekolahId_tahunAjaran: { sekolahId, tahunAjaran },
      },
      update: {
        jumlahRombel,
        jumlahJamPelajaran,
        bebanMengajar,
        jumlahGuruTersedia,
        jumlahGuruPNS,
        jumlahGuruPPPK,
        kebutuhanGuru: parseFloat(kebutuhanGuru.toFixed(2)),
        kekuranganGuru,
        kelebihanGuru,
        statusKebutuhan,
        prediksiData,
        catatan: catatan || null,
      },
      create: {
        sekolahId,
        tahunAjaran,
        jumlahRombel,
        jumlahJamPelajaran,
        bebanMengajar,
        jumlahGuruTersedia,
        jumlahGuruPNS,
        jumlahGuruPPPK,
        kebutuhanGuru: parseFloat(kebutuhanGuru.toFixed(2)),
        kekuranganGuru,
        kelebihanGuru,
        statusKebutuhan,
        prediksiData,
        catatan: catatan || null,
      },
      include: {
        sekolah: { select: { id: true, nama: true, jenisSekolah: true } },
      },
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/perhitungan/kebutuhan]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}