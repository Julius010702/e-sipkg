// src/app/api/sekolah/register-from-dapodik/route.ts
//
// Endpoint khusus untuk mendaftarkan sekolah dari Dapodik ke database internal
// Dipanggil otomatis saat admin memilih sekolah dari picker (jika belum terdaftar)
//
// POST /api/sekolah/register-from-dapodik
// Body: { npsn, nama, jenisSekolah, kabupatenKota, kecamatan, alamat }
// → Cek apakah sudah ada di DB (by NPSN)
// → Jika belum, buat record baru
// → Return: { data: Sekolah, isNew: boolean }

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenPayload } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Auth check — hanya ADMIN_PUSAT yang boleh mendaftarkan sekolah baru
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "ADMIN_PUSAT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { npsn, nama, jenisSekolah, kabupatenKota, kecamatan, alamat } = body;

    if (!nama?.trim()) {
      return NextResponse.json({ error: "Nama sekolah wajib diisi" }, { status: 400 });
    }
    if (!jenisSekolah || !["SMA", "SMK", "SLB"].includes(jenisSekolah)) {
      return NextResponse.json({ error: "Jenis sekolah tidak valid" }, { status: 400 });
    }

    // Cek apakah sudah terdaftar by NPSN
    if (npsn?.trim()) {
      const existing = await prisma.sekolah.findUnique({ where: { npsn: npsn.trim() } });
      if (existing) {
        // Sudah ada — kembalikan data yang ada (bukan error)
        return NextResponse.json({ data: existing, isNew: false }, { status: 200 });
      }
    }

    // Cek by nama + jenis (fallback jika tidak ada NPSN)
    if (!npsn?.trim()) {
      const existingByNama = await prisma.sekolah.findFirst({
        where: {
          nama: { equals: nama.trim(), mode: "insensitive" },
          jenisSekolah: jenisSekolah as any,
        },
      });
      if (existingByNama) {
        return NextResponse.json({ data: existingByNama, isNew: false }, { status: 200 });
      }
    }

    // Belum ada → daftarkan sekolah baru dari data Dapodik
    const newSekolah = await prisma.sekolah.create({
      data: {
        npsn:          npsn?.trim() || null,
        nama:          nama.trim(),
        jenisSekolah:  jenisSekolah as any,
        kabupatenKota: kabupatenKota || null,
        kecamatan:     kecamatan    || null,
        alamat:        alamat       || null,
        provinsi:      "Nusa Tenggara Timur",
        aktif:         true,
        // opdId & unitOrganisasiId dibiarkan null dulu,
        // bisa dilengkapi admin nanti via menu Data Sekolah
      },
    });

    return NextResponse.json({ data: newSekolah, isNew: true }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/sekolah/register-from-dapodik]", error);
    if (error.code === "P2002") {
      // Race condition — NPSN sudah ada (inserted by concurrent request)
      const existing = await prisma.sekolah.findUnique({
        where: { npsn: (await req.json?.())?.npsn },
      }).catch(() => null);
      if (existing) {
        return NextResponse.json({ data: existing, isNew: false }, { status: 200 });
      }
    }
    return NextResponse.json({ error: "Gagal mendaftarkan sekolah" }, { status: 500 });
  }
}