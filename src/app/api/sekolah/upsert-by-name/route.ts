// src/app/api/sekolah/upsert-by-name/route.ts
//
// POST /api/sekolah/upsert-by-name
//
// Membuat sekolah baru HANYA dari nama + jenisSekolah.
// Jika sekolah dengan nama yang sama (case-insensitive) sudah ada, kembalikan data yg ada.
// Dipakai saat admin mendaftarkan user baru tanpa harus memilih dari Dapodik/DB.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenPayload } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Hanya ADMIN_PUSAT yang boleh
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "ADMIN_PUSAT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      nama,
      jenisSekolah,
      kabupatenKota,
      kecamatan,
      alamat,
      npsn,
    } = body;

    if (!nama || !nama.trim()) {
      return NextResponse.json(
        { error: "Nama sekolah wajib diisi" },
        { status: 400 }
      );
    }

    const validJenis = ["SMA", "SMK", "SLB"];
    const jenis = (jenisSekolah || "SMA").toUpperCase();
    if (!validJenis.includes(jenis)) {
      return NextResponse.json(
        { error: "Jenis sekolah tidak valid (SMA / SMK / SLB)" },
        { status: 400 }
      );
    }

    const namaTrimmed = nama.trim();

    // Cek apakah sudah ada (by nama + jenisSekolah, case-insensitive)
    const existing = await prisma.sekolah.findFirst({
      where: {
        nama: { equals: namaTrimmed, mode: "insensitive" },
        jenisSekolah: jenis as any,
      },
    });

    if (existing) {
      return NextResponse.json({ data: existing, isNew: false });
    }

    // Buat sekolah baru
    const sekolahBaru = await prisma.sekolah.create({
      data: {
        nama: namaTrimmed,
        jenisSekolah: jenis as any,
        kabupatenKota: kabupatenKota?.trim() || null,
        kecamatan: kecamatan?.trim() || null,
        alamat: alamat?.trim() || null,
        npsn: npsn?.trim() || null,
        aktif: true,
      },
    });

    return NextResponse.json({ data: sekolahBaru, isNew: true }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/sekolah/upsert-by-name]", error);
    if (error.code === "P2002") {
      // Race condition: NPSN duplikat
      return NextResponse.json(
        { error: "NPSN sudah terdaftar di sistem" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}